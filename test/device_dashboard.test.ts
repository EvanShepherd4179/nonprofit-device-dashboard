import assert from "node:assert/strict";
import { statusEvent } from "../src/device_dashboard.ts";

assert.equal(statusEvent({ deviceId: "x", online: true, batteryPct: 80, checkedAt: "2026-01-01T00:00:00Z" }), "device.online");
assert.equal(statusEvent({ deviceId: "x", online: false, batteryPct: 0, checkedAt: "2026-01-01T00:00:00Z" }), "device.offline");
console.log("status event decision: ok");
