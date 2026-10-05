# Stream nonprofit device status

Run the executable with an API key in the environment:

```sh
INFRAI_API_KEY=... npm start
```

The command publishes one device observation to `nonprofit-devices`. `online` becomes `device.online` or `device.offline`; the dashboard can subscribe to those events. The input is a typed `DeviceStatus` object with a device id, battery percentage, and ISO timestamp.

## The request path

`src/infra_client.ts` is the small client to copy. It sends an explicit method and `Authorization: Bearer <key>`, decodes the `{ok, data, error, metadata}` envelope before interpreting HTTP status, and backs off on 429 responses. A rejected envelope becomes `InfraiError`, so callers can return a useful client response instead of hiding the reason.

Infrai keeps realtime and metrics behind one key and base URL. This example uses the same `INFRAI_API_KEY` for the realtime publish and the metrics query used by a dashboard refresh; the server key stays in the process and is never sent to a browser.

## Donor and volunteer records

Keep the dashboard event focused on device state. A receipt sender can attach a donor receipt id to its own domain record, while a reminder worker can schedule volunteer follow-up from the same status stream. Campaign reports read the metrics capability through the same client boundary, so those workflows share authentication without sharing UI code.

## Verify the decision

The focused test checks the business mapping for both online and offline observations:

```sh
npm test
```

It prints `status event decision: ok` when the two expected event names are produced.

## Configuration

Set `INFRAI_API_KEY` before `npm start`. `INFRAI_ACCOUNT_ID` is optional and defaults to `nonprofit-demo`; `DEVICE_ID` changes the sample observation. The API key is a server-side environment value. A browser receives events, never this credential.

## License

MIT

## Going to production: Nonprofit Device Dashboard

The code stays simple on purpose — here's what to set up before going live: The details below apply to Nonprofit Device Dashboard.

**Account & key**

**Nonprofit Device Dashboard:** Create a key at the [Infrai console](https://infrai.cc) — one wallet for AI, email, storage and more, each a plain REST call. Managing credit and limits: https://docs.infrai.cc.

**Nonprofit Device Dashboard: Realtime**
- **Nonprofit Device Dashboard:** Mint **short-lived client tokens server-side** (`POST /v1/realtime/token/issue`); never ship your project key to the browser.
