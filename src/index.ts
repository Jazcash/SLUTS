import * as crypto from "crypto";
import * as dns from "dns";
import getmac from "getmac";
import { Optionals, Signal, SignalBinding } from "jaz-ts-utils";
import * as net from "net";
import * as os from "os";
import { clearInterval, setInterval } from "timers";

import { PlayerStatus as MyPlayerStatus, SLPTypes, SpringLobbyProtocol } from "./spring-lobby-protocol";
import { SpringLobbyProtocol as SpringLobbyProtocolCompiled } from "./spring-lobby-protocol-compiled";
const crc32 = require("crc32");

type TIface = typeof SpringLobbyProtocolCompiled;

export type SLPRequestID = keyof SpringLobbyProtocol["Request"];
export type SLPResponseID = keyof SpringLobbyProtocol["Response"];
export type SLPRequestMessage<ID extends SLPRequestID> = SpringLobbyProtocol["Request"][ID];
export type SLPResponseMessage<ID extends SLPResponseID> = SpringLobbyProtocol["Response"][ID];
export type RequestData<ID extends keyof SpringLobbyProtocol["Request"]> = keyof SpringLobbyProtocol["Request"][ID] extends never ? [] : [SpringLobbyProtocol["Request"][ID]];
type MessageModel = { [key: string]: SLPTypes };

export interface PlayerStatus extends MyPlayerStatus{};

export interface SLPMessage {
    name: string;
    properties: SLPProperty[];
}

export interface SLPProperty {
    name: string;
    type: "string" | "number" | "boolean" | "stringArray" | "PlayerStatus";
    optional: boolean;
}

export interface SpringLobbyProtocolClientConfig {
    host: string;
    port: number;
    username: string;
    password: string;
    /** Name of this lobby client
     * @default "SLUTS" */
    lobbySignature?: string;
    /** Log all incoming and outgoing messages
     * @default false */
    /** If true, will attempt to reconnect after being disconnected for whatever reason
     * @default true */
    stayConnected?: boolean;
    verbose?: boolean;
    logger?: (...data: any[]) => any;
}

const defaultConfig: Optionals<SpringLobbyProtocolClientConfig> = {
    lobbySignature: "SLTS Client",
    verbose: false,
    stayConnected: true,
    logger: console.log
};
export class SpringLobbyProtocolClient {
    public onLogin: Signal = new Signal();
    public onDisconnect: Signal = new Signal();
    public socket!: net.Socket;

    protected config: Required<SpringLobbyProtocolClientConfig>;
    protected responseSignals: Map<SLPResponseID, Signal<any>> = new Map();
    protected requestInterfaces: SLPMessage[] = [];
    protected responseInterfaces: SLPMessage[] = [];
    protected requestComposers: { [key in keyof SpringLobbyProtocol["Request"]]?: (request: MessageModel) => string } = {};
    protected responseParsers: { [key in keyof SpringLobbyProtocol["Response"]]?: (response: string) => any } = {};
    protected keepAliveInterval?: NodeJS.Timeout;
    protected responseBuffer: string = "";
    protected onConnectBinding?: SignalBinding<any>;

    constructor(config: SpringLobbyProtocolClientConfig) {
        this.config = Object.assign({}, defaultConfig, config) as Required<SpringLobbyProtocolClientConfig>;

        this.requestInterfaces = this.generateMessageInterfaces((SpringLobbyProtocolCompiled.props[0].ttype as TIface));
        this.responseInterfaces = this.generateMessageInterfaces((SpringLobbyProtocolCompiled.props[1].ttype as TIface));

        for (const requestInterface of this.requestInterfaces) {
            this.requestComposers[requestInterface.name as keyof SpringLobbyProtocol["Request"]] = this.generateRequestComposer(requestInterface);
        }

        for (const responseInterface of this.responseInterfaces) {
            this.responseParsers[responseInterface.name as keyof SpringLobbyProtocol["Response"]] = this.generateResponseParser(responseInterface);
        }
    }

    public async connect(autoLogin: boolean = true) : Promise<SpringLobbyProtocol["Response"]["TASSERVER"] | void> {
        return new Promise(resolve => {
            this.socket = new net.Socket();

            this.socket.on("data", (data) => this.responseReceived(data.toString("utf8")));

            this.onConnectBinding = this.onResponse("TASSERVER").add(data => {
                this.keepAliveInterval = setInterval(() => {
                    this.request("PING");
                }, 30000);

                resolve(data);
            });

            this.socket.connect(this.config.port, this.config.host, async () => {
                if (this.config.verbose) {
                    this.config.logger(`Connected to ${this.config.host}:${this.config.port}`);
                    if (autoLogin) {
                        this.config.logger("Attempting login...");
                    }
                }

                if (autoLogin) {
                    const { success } = await this.login();
                    if (!success && this.config.stayConnected) {
                        this.attemptReconnect();
                    } else {
                        this.onLogin.dispatch();
                    }
                }
            });

            for (const event of ["end", "timeout", "error", "close"]) {
                this.socket.on(event, async () => {
                    if (this.config.verbose) {
                        this.config.logger(`Disconnected (${event})`);
                    }

                    this.onDisconnect.dispatch();

                    this.cleanupSocket();

                    if (this.config.stayConnected) {
                        this.attemptReconnect();
                    }
                });
            }
        });
    }

    protected cleanupSocket() {
        if (this.keepAliveInterval) {
            clearInterval(this.keepAliveInterval);
        }
        if (this.onConnectBinding) {
            this.onConnectBinding.destroy();
        }
        this.socket.removeAllListeners();
        this.socket.destroy();
    }

    protected async attemptReconnect() {
        this.cleanupSocket();

        if (this.config.verbose) {
            this.config.logger("Attempting reconnect in 10s...");
        }

        await this.delay(10000);

        if (this.config.verbose) {
            this.config.logger("Reconnecting...");
        }

        this.connect();
    }

    public disconnect(graceful = false, reason: string = "Intentionally disconnected") : Promise<void> {
        return new Promise(resolve => {
            if (graceful) {
                this.request("EXIT", { reason: reason });
            }

            if (this.config.verbose) {
                this.config.logger(`Disconnected from ${this.socket.remoteAddress}:${this.socket.remotePort}`);
            }

            if (this.socket) {
                this.socket.end(() => resolve());
            } else {
                resolve();
            }
        });
    }

    public request<ID extends SLPRequestID, Data extends RequestData<ID>>(requestId: ID, ...data: Data) {
        const requestComposer = this.requestComposers[requestId];
        if (requestComposer) {
            const requestString = data.length ? requestComposer(data[0] as MessageModel) : requestId;

            if (this.config.verbose) {
                this.config.logger(`Request: ${requestString}`);
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

    public async login() : Promise<{ success: boolean, error?: string }> {
        const localIp = (await dns.promises.lookup(os.hostname())).address ?? "*";

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

            const macaddress = getmac();
            const userId = crc32(macaddress);

            this.request("LOGIN", {
                userName: this.config.username,
                password: crypto.createHash("md5").update(this.config.password).digest("base64"),
                cpu: 0,
                localIP: localIp,
                lobbyNameAndVersion: this.config.lobbySignature!,
                userID: userId,
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
                this.config.logger(`Response: ${responseMessage}`);
            }

            const index = responseMessage.indexOf(" ");
            const [command, args] = [responseMessage.slice(0, index), responseMessage.slice(index + 1)];

            const data = this.parseResponse(responseMessage);

            const anySignal = this.responseSignals.get("ANY");
            if (anySignal) {
                anySignal.dispatch(data);
            }

            const signal = this.responseSignals.get(command as SLPResponseID);
            if (signal) {
                signal.dispatch(data);
            }
        }
    }

    protected parseResponse<ResponseID extends SLPResponseID | undefined, ResponseType = ResponseID extends SLPResponseID ? SLPResponseMessage<ResponseID> : any>(response: string, responseType?: ResponseID) : ResponseType | null {
        const index = response.indexOf(" ");
        let [command, args] = [response.slice(0, index), response.slice(index + 1)];
        if (index === -1) {
            command = response;
        }
        const parser = this.responseParsers[command as keyof SpringLobbyProtocol["Response"]];
        if (parser) {
            const obj = parser(args);
            return obj as ResponseType;
        }

        this.config.logger(`Unhandled response parser for: '${response}'`);

        return null;
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
                let value: SLPTypes;

                if (prop.type === "number") {
                    value = Number(stringValue);
                } else if (prop.type === "boolean") {
                    value = stringValue === "1";
                } else if (prop.type === "stringArray") {
                    value = stringValue!.split(" ");
                } else if (prop.type === "PlayerStatus") {
                    value = this.parsePlayerStatus(Number(stringValue));
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
            const propertyTypes = (messageType.ttype as TIface).props || [];
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
                } else if (value instanceof Array) {
                    stringValue = (value as any[]).join(" ");
                } else if (typeof value === "object" && this.isPlayerStatus(value)) {
                    stringValue = this.composePlayerStatus(value).toString();
                } else {
                    stringValue = value;
                }

                requestString += " " + stringValue;
            }

            return requestString;
        };
    }

    protected parsePlayerStatus(integer: number) : PlayerStatus {
        return {
            ingame: (integer & 1) !== 0,
            away: (integer & 2) !== 0,
            rank: (integer & 0b00011100) >> 2,
            moderator: (integer & 32) !== 0,
            bot: (integer & 64) !== 0,
        };
    }

    protected composePlayerStatus(status: PlayerStatus) : number {
        return +status.ingame & 1 | +status.away & 2 | +status.rank << 2 | +status.moderator & 32 | +status.bot & 64;
    }

    protected isPlayerStatus(arg: any) : arg is PlayerStatus {
        return arg.ingame !== undefined && arg.away !== undefined && arg.rank !== undefined && arg.moderator !== undefined && arg.bot !== undefined;
    }

    protected delay(ms: number) : Promise<void> {
        return new Promise(resolve => {
            setTimeout(() => resolve(), ms);
        });
    }
}