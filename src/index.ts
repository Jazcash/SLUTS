import * as crypto from "crypto";
import * as dns from "dns";
import * as net from "net";
import * as os from "os";
import { clearInterval, setInterval } from "timers";

import { Signal } from "./signal";
import { SpringLobbyProtocol } from "./spring-lobby-protocol";
import { SpringLobbyProtocol as SpringLobbyProtocolCompiled } from "./spring-lobby-protocol-compiled";

type TIface = typeof SpringLobbyProtocolCompiled;

export type SLPRequestID = keyof SpringLobbyProtocol["Request"];
export type SLPResponseID = keyof SpringLobbyProtocol["Response"];
export type SLPRequestMessage<ID extends SLPRequestID> = SpringLobbyProtocol["Request"][ID];
export type SLPResponseMessage<ID extends SLPResponseID> = SpringLobbyProtocol["Response"][ID];
export type RequestData<ID extends keyof SpringLobbyProtocol["Request"]> = keyof SpringLobbyProtocol["Request"][ID] extends never ? [] : [SpringLobbyProtocol["Request"][ID]];
type MessageModel = { [key: string]: string | number | boolean | string[] | undefined; };

export interface SLPMessage {
    name: string;
    properties: SLPProperty[];
}

export interface SLPProperty {
    name: string;
    type: "string" | "number" | "boolean" | "stringArray";
    optional: boolean;
}

interface SpringLobbyProtocolClientConfig {
    /** Log all incoming and outgoing messages
     * @default false */
    verbose?: boolean;
}

export class SpringLobbyProtocolClient {
    protected config: SpringLobbyProtocolClientConfig;
    protected socket: net.Socket = new net.Socket();
    protected responseSignals: Map<SLPResponseID, Signal<any>> = new Map();
    protected requestInterfaces: SLPMessage[] = [];
    protected responseInterfaces: SLPMessage[] = [];
    protected requestComposers: { [key in keyof SpringLobbyProtocol["Request"]]?: (request: MessageModel) => string } = {};
    protected responseParsers: { [key in keyof SpringLobbyProtocol["Response"]]?: (response: string) => any } = {};
    protected keepAliveInterval?: NodeJS.Timeout;
    protected responseBuffer: string = "";

    constructor(config: SpringLobbyProtocolClientConfig = { verbose: false }) {
        this.config = config;

        this.requestInterfaces = this.generateMessageInterfaces((SpringLobbyProtocolCompiled.props[0].ttype as TIface));
        this.responseInterfaces = this.generateMessageInterfaces((SpringLobbyProtocolCompiled.props[1].ttype as TIface));

        for (const requestInterface of this.requestInterfaces) {
            this.requestComposers[requestInterface.name as keyof SpringLobbyProtocol["Request"]] = this.generateRequestComposer(requestInterface);
        }

        for (const responseInterface of this.responseInterfaces) {
            this.responseParsers[responseInterface.name as keyof SpringLobbyProtocol["Response"]] = this.generateResponseParser(responseInterface);
        }
    }

    public async connect(host: string, port: number) : Promise<SpringLobbyProtocol["Response"]["TASSERVER"]> {
        return new Promise(resolve => {
            this.socket.on("data", (data) => this.responseReceived(data.toString("utf8")));

            const onConnectBinding = this.onResponse("TASSERVER").add(data => {
                if (this.keepAliveInterval) {
                    clearInterval(this.keepAliveInterval);
                }
                this.keepAliveInterval = setInterval(() => {
                    this.request("PING");
                }, 30000);

                resolve(data);
            });

            for (const event of ["end", "timeout", "error"]) {
                this.socket.on(event, () => {
                    if (this.keepAliveInterval) {
                        clearInterval(this.keepAliveInterval);
                    }
                    onConnectBinding.destroy();
                });
            }

            this.socket.connect(port, host, () => {
                if (this.config.verbose) {
                    console.log(`Connected to ${host}:${port}`);
                }
            });
        });
    }

    public disconnect(reason: string = "Intentionally disconnected") : Promise<void> {
        return new Promise(resolve => {
            this.request("EXIT", { reason: reason });

            if (this.config.verbose) {
                console.log(`Disconnected from ${this.socket.remoteAddress}:${this.socket.remotePort}`);
            }

            this.socket.end(() => resolve());
        });
    }

    public request<ID extends SLPRequestID, Data extends RequestData<ID>>(requestId: ID, ...data: Data) {
        const requestComposer = this.requestComposers[requestId];
        if (requestComposer) {
            const requestString = data.length ? requestComposer(data[0] as MessageModel) : requestId;

            if (this.config.verbose) {
                console.log(`Request: ${requestString}`);
            }

            this.socket.write(requestString + "\r\n", "utf8");
            return;
        }

        throw Error(`Request composer error: ${requestId} - ${data}`);
    }

    public onResponse<ID extends SLPResponseID, Data = SpringLobbyProtocol["Response"][ID]>(responseId: ID) : Signal<Data> {
        if (!this.responseSignals.has(responseId)) {
            this.responseSignals.set(responseId, new Signal<Data>());
        }

        return this.responseSignals.get(responseId) as Signal<Data>;
    }

    public async login(username: string, password: string, clientName = "SLP Client") : Promise<{ success: boolean, error?: string }> {
        const localIp = await (await dns.promises.lookup(os.hostname())).address ?? "*";

        return new Promise(resolve => {
            const acceptedBinding = this.onResponse("ACCEPTED").add(() => {
                acceptedBinding.destroy();
                deniedBinding.destroy();
                resolve({ success: true });
            });

            const deniedBinding = this.onResponse("DENIED").add((data) => {
                acceptedBinding.destroy();
                deniedBinding.destroy();
                resolve({ success: false, error: data.reason });
            });

            this.request("LOGIN", {
                userName: username,
                password: crypto.createHash("md5").update(password).digest("base64"),
                cpu: 0,
                localIP: localIp,
                lobbyNameAndVersion: clientName
            });
        });
    }

    public async say(userName: string, message: string) : Promise<void> {
        return new Promise(resolve => {
            const binding = this.onResponse("SAYPRIVATE").add((data) => {
                if (data.userName === data.userName && data.message === message) {
                    binding.destroy();
                    resolve();
                }
            });
    
            this.request("SAYPRIVATE", { userName, message });
        });
    }

    protected responseReceived(responseStr: string) {
        const fullResponseStr = JSON.stringify(responseStr);
        const responseFinished = fullResponseStr.slice(fullResponseStr.length - 3, fullResponseStr.length - 1) === "\\n";
        if (!responseFinished) {
            this.responseBuffer += responseStr;
            return;
        } else {
            this.responseBuffer += responseStr;
        }

        const responseMessages = this.responseBuffer.split("\n").filter(Boolean);
        this.responseBuffer = "";
        for (const responseMessage of responseMessages) {
            if (this.config.verbose) {
                console.log(`Response: ${responseMessage}`);
            }

            const index = responseMessage.indexOf(" ");
            const [command, args] = [responseMessage.slice(0, index), responseMessage.slice(index + 1)];

            const signal = this.responseSignals.get(command as SLPResponseID);
            if (signal) {
                const data = this.parseResponse(responseMessage);
                signal.dispatch(data);
            }
        }
    }

    protected parseResponse<ResponseID extends SLPResponseID | undefined, ResponseType = ResponseID extends SLPResponseID ? SLPResponseMessage<ResponseID> : any>(response: string, responseType?: ResponseID) : ResponseType | never {
        const index = response.indexOf(" ");
        const [command, args] = [response.slice(0, index), response.slice(index + 1)];
        const parser = this.responseParsers[command as keyof SpringLobbyProtocol["Response"]];
        if (parser) {
            const obj = parser(args);
            return obj as ResponseType;
        }

        throw Error(`Response parser error: ${response}`);
    }

    protected generateResponseParser(messageInterface: SLPMessage): (response: string) => object {
        return (response: string) => {
            const responseObject: MessageModel = {};

            const props = messageInterface.properties;
            if (props.length === 0) {
                return {};
            }

            const parts = [];
            const tabParts = response.split("\t");

            if (props.length === 1) {
                parts.push(tabParts.shift());
            } else {
                parts.push(...tabParts.shift()!.split(" "));

                if (tabParts.length > 1) {
                    parts.push(...tabParts);
                } else if (parts.length > props.length) {
                    const sentence = parts.splice(props.length-1);
                    parts.push(sentence.join(" "));
                }
            }

            for (let i=0; i<props.length; i++) {
                const prop = props[i];
                const stringValue = parts[i]!;
                let value: string | number | boolean | string[];

                if (prop.type === "number") {
                    value = Number(stringValue);
                } else if (prop.type === "boolean") {
                    value = stringValue === "1";
                } else if (prop.type === "stringArray") {
                    value = stringValue!.split(" ");
                } else {
                    value = stringValue;
                }

                responseObject[prop.name] = value;
            }

            return responseObject;
        };
    }

    protected splitResponse(response: string, wordCount: number): string[] {
        const parts = response.split(" ");
        const words = parts.splice(0, wordCount);
        const sentences = parts.join(" ").split("\t").filter(Boolean);
        return words.concat(sentences);
    }

    protected generateMessageInterfaces(messageModel: TIface) {
        const messages: SLPMessage[] = [];

        for (const messageType of messageModel.props) {
            const propertyTypes = (messageType.ttype as TIface).props;
            const propertyModel: SLPProperty[] = [];
            for (const propertyType of propertyTypes) {
                propertyModel.push({
                    name: propertyType.name,
                    type: (propertyType.ttype as any).name ?? "stringArray",
                    optional: propertyType.isOpt
                });
            }
            messages.push({
                name: messageType.name,
                properties: propertyModel
            });
        }

        return messages;
    }

    protected generateRequestComposer(requestModel: SLPMessage) : (request: MessageModel) => string {
        return (request) => {
            let requestString = requestModel.name;
            for (const prop of requestModel.properties) {
                const value = request[prop.name];
                let stringValue: string;
                if (value === undefined) {
                    stringValue = "";
                } else if (typeof value === "number") {
                    stringValue = value.toString();
                } else if (typeof value === "boolean") {
                    stringValue = Number(value).toString();
                } else if (typeof value === "object") {
                    stringValue = value.join(" ");
                } else {
                    stringValue = value;
                }

                requestString += " " + stringValue;
            }

            return requestString;
        };
    }
}