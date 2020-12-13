# SLUTS
Spring Lobby User in TypeScript

## Usage

```
import { SpringLobbyProtocolClient } from "sluts";

(async () => {
    const client = new SpringLobbyProtocolClient({ verbose: false });

    const serverInfo = await client.connect("road-flag.bnr.la", 8200);

    const loginResponse = await client.login("MyBotUsername", "mybotpassword");
    if (!loginResponse.success) {
        console.log(loginResponse.error);
        return;
    }

    client.request("SAYPRIVATE", { userName: "[Fx]Jazcash", message: "Hello world!" });
})();
```
