import { Router } from "express";
import { db, fluxReadingsTable } from "@workspace/db";
import { desc, eq } from "drizzle-orm";

const router = Router();

function classifyFlux(flux: number): string {
  if (flux >= 1e-4) return "X";
  if (flux >= 1e-5) return "M";
  if (flux >= 1e-6) return "C";
  if (flux >= 1e-7) return "B";
  return "A";
}

router.get("/", async (_req, res) => {
  const readings = await db
    .select()
    .from(fluxReadingsTable)
    .where(eq(fluxReadingsTable.channel, "soft"))
    .orderBy(desc(fluxReadingsTable.timeTag))
    .limit(60);

  const latestFlux = readings[0]?.softXray ?? 1.5e-7;
  const trend = readings.length > 10
    ? (latestFlux > (readings[10]?.softXray ?? latestFlux) ? "rising" : "falling")
    : "stable";

  const baseProb = classifyFlux(latestFlux) === "A" ? 0.08 : classifyFlux(latestFlux) === "B" ? 0.18 : classifyFlux(latestFlux) === "C" ? 0.35 : classifyFlux(latestFlux) === "M" ? 0.62 : 0.88;

  const horizons = [5, 15, 30, 60];
  const forecasts = horizons.map((horizon) => {
    const decay = 1 - (horizon / 120) * 0.3;
    const noise = (Math.random() - 0.5) * 0.08;
    const prob = Math.max(0.05, Math.min(0.95, baseProb * decay + noise));
    const expectedFlux = latestFlux * (1 + (trend === "rising" ? 0.1 : -0.05) * (horizon / 60));
    const expectedClass = classifyFlux(expectedFlux);

    const peakTime = new Date(Date.now() + horizon * 60 * 1000);

    return {
      horizonMinutes: horizon,
      probability: Math.round(prob * 1000) / 1000,
      confidence: Math.round((0.82 - horizon * 0.003) * 1000) / 1000,
      expectedClass,
      estimatedPeak: peakTime.toISOString(),
      leadTime: horizon,
      trend,
    };
  });

  res.json(forecasts);
});

export default router;
