import { InfraiClient } from "./infra_client.ts";
import { z } from "zod";

export type DeviceStatus = { deviceId: string; online: boolean; batteryPct: number; checkedAt: string };
export const deviceStatusSchema = z.object({ deviceId: z.string().min(1), online: z.boolean(), batteryPct: z.number().min(0).max(100), checkedAt: z.string().datetime() });

export function statusEvent(status: DeviceStatus): "device.online" | "device.offline" {
  return status.online ? "device.online" : "device.offline";
}

export async function streamStatus(status: DeviceStatus, client = new InfraiClient()) {
  deviceStatusSchema.parse(status);
  const channel = process.env.INFRAI_CHANNEL;
  if (!channel) throw new Error("INFRAI_CHANNEL must name a provisioned realtime channel");
  return client.publishStatus({
    channel,
    event: statusEvent(status),
    data: status,
    account_id: process.env.INFRAI_ACCOUNT_ID ?? "nonprofit-demo"
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const status: DeviceStatus = { deviceId: process.env.DEVICE_ID ?? "shelter-router-01", online: true, batteryPct: 87, checkedAt: new Date().toISOString() };
  await streamStatus(status);
  console.log(JSON.stringify({ event: statusEvent(status), device: status.deviceId }));
}
