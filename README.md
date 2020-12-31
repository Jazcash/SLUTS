# SLUTS
Spring Lobby User in TypeScript

## Usage

`npm i --save sluts`

```
import { SpringLobbyProtocolClient } from "sluts";

(async () => {
    const client = new SpringLobbyProtocolClient({
        host: "road-flag.bnr.la",
        port: 8200,
        username: "MyBot",
        password: "greatpassword",
        verbose: true
    });

    client.onResponse("SAIDPRIVATE").add(({username, message}) => {
        if (message.substr(0, 5) === "!say ") {
            client.request("SAYPRIVATE", { userName: username, message: message.slice(5) });
        }
    });

    await client.connect();
})();
```
