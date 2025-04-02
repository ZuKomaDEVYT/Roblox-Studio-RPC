import { Client, type User } from "discord-rpc";
import http from "node:http";
import chalk from "chalk";

const SERVER_PORT = 4455;
const CLIENT_ID = "1355259672013177043"; //1028311936854675458

async function login(client: Client) {
  let user: User | undefined;

  try {
    user = (
      await client.login({
        clientId: CLIENT_ID,
      })
    ).user;
  } finally {
    if (!user) {
      console.error(
        chalk.red("StudioPresence failed to start (Is Discord open?)")
      );
    } else {
        console.log(chalk.green("StudioPresence started! \n\n"));
        console.log("Modified by ZuKomaDEV \n --[[Original by iArxic]]-- \n\n\n\n");
        console.log(chalk.red("Note: \nDon't Close this windows it cause the Presence get disabled"));
    }
  }
}

(async () => {
  const client = new Client({ transport: "ipc" });

  let lastTesting = 0;

  login(client);

  http
    .createServer((req, res) => {
      let data: any = "";

      req.on("data", (additionalData) => {
        data += additionalData;
      });

      req.on("end", () => {
        try {
          let passThrough = true;

          try {
            data = JSON.parse(data).activity;
          } catch (ignored) {
            data = undefined;
          }

          if (!data) {
            client.clearActivity();
          } else {
            if (data.details === "Testing") {
              lastTesting = Date.now();
            } else if (Date.now() - lastTesting < 3000) {
              // i wish i could just use a return here
              passThrough = false;
            }
            if (passThrough) {
              if (data.buttons)

                client.setActivity({
                  details: data.details,
                  startTimestamp: data.timestamps.start,
                  state: data.state,
                  largeImageText: data.assets.large_text,
                  largeImageKey: data.assets.large_image,
                  smallImageText: data.assets.small_text,
                  smallImageKey: data.assets.small_image,
                  buttons: [{label : data.buttons.button1.label , url : data.buttons.button1.url}],
                });

              else
              client.setActivity({
                details: data.details,
                startTimestamp: data.timestamps.start,
                state: data.state,
                largeImageText: data.assets.large_text,
                largeImageKey: data.assets.large_image,
                smallImageText: data.assets.small_text,
                smallImageKey: data.assets.small_image,
              });

              if (data.updateType === "CLOSE")
                client.clearActivity().catch(() => null);
            }
          }

          res.writeHead(200, { "Content-Type": "text/plain" });
          res.end("SET Activity");
        } catch (err: any) {
          console.error(err);

          client
            .clearActivity()
            .catch(() => console.error(chalk.red("Failed to clear activity")));
        }
      });
    })
    .listen(SERVER_PORT);
})();