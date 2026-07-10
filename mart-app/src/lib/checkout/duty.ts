import { getDutyConfig } from "./repository";
import type { DutyEstimate } from "./types";

/**
 * 关税预估。
 * 从 DB 读取税率，计算 duty = subtotal × rate。
 * 无 DutyConfig 或 active=false 则免税。
 */
export async function calculateDuty(
  countryCode: string,
  subtotalCNY: number,
  subtotalUSD: number,
): Promise<DutyEstimate> {
  const config = await getDutyConfig(countryCode);
  if (!config || !config.active) {
    return { rate: 0, amountCNY: 0, amountUSD: 0, exempt: true };
  }

  return {
    rate: config.rate,
    amountCNY: Math.round(subtotalCNY * config.rate * 100) / 100,
    amountUSD: Math.round(subtotalUSD * config.rate * 100) / 100,
    exempt: false,
  };
}
