import { Router } from "express";
import { db, fluxReadingsTable, flareEventsTable } from "@workspace/db";
import { desc, gte, sql, eq } from "drizzle-orm";

const router = Router();

router.get("/daily", async (req, res) => {
  const days = Math.min(parseInt(req.query.days as string) || 30, 90);
  const since = new Date();
  since.setDate(since.getDate() - days);

  const events = await db
    .select()
    .from(flareEventsTable)
    .where(gte(flareEventsTable.timeTag, since))
    .orderBy(desc(flareEventsTable.timeTag));

  const fluxData = await db
    .select()
    .from(fluxReadingsTable)
    .where(gte(fluxReadingsTable.timeTag, since))
    .orderBy(fluxReadingsTable.timeTag);

  const dailyMap: Record<string, { eventCount: number; fluxes: number[]; xClass: number; mClass: number; cClass: number; bClass: number }> = {};

  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    dailyMap[key] = { eventCount: 0, fluxes: [], xClass: 0, mClass: 0, cClass: 0, bClass: 0 };
  }

  for (const evt of events) {
    const key = evt.timeTag.toISOString().split("T")[0];
    if (dailyMap[key]) {
      dailyMap[key].eventCount++;
      const cls = evt.flareClass[0];
      if (cls === "X") dailyMap[key].xClass++;
      else if (cls === "M") dailyMap[key].mClass++;
      else if (cls === "C") dailyMap[key].cClass++;
      else if (cls === "B") dailyMap[key].bClass++;
    }
  }

  for (const r of fluxData) {
    const key = r.timeTag.toISOString().split("T")[0];
    if (dailyMap[key] && r.softXray) dailyMap[key].fluxes.push(r.softXray);
  }

  const result = Object.entries(dailyMap)
    .map(([date, data]) => ({
      date,
      eventCount: data.eventCount,
      maxFlux: data.fluxes.length ? Math.max(...data.fluxes) : 1e-8,
      avgFlux: data.fluxes.length ? data.fluxes.reduce((a, b) => a + b, 0) / data.fluxes.length : 1e-8,
      xClassCount: data.xClass,
      mClassCount: data.mClass,
      cClassCount: data.cClass,
      bClassCount: data.bClass,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  res.json(result);
});

router.get("/heatmap", async (_req, res) => {
  const entries = [];
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      const value = Math.abs(Math.sin(day * 7 + hour) * 0.5 + Math.cos(hour * 0.8) * 0.3 + Math.random() * 0.3);
      entries.push({ hour, day, value: Math.round(value * 100) / 100, label: `${days[day]} ${hour}:00` });
    }
  }
  res.json(entries);
});

router.get("/class-distribution", async (_req, res) => {
  const events = await db.select().from(flareEventsTable);
  const counts: Record<string, number> = { X: 0, M: 0, C: 0, B: 0, A: 0 };
  for (const e of events) {
    const cls = e.flareClass[0];
    if (counts[cls] !== undefined) counts[cls]++;
  }
  const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
  const colors: Record<string, string> = { X: "#EF4444", M: "#FF8C00", C: "#F59E0B", B: "#22C55E", A: "#38BDF8" };
  res.json(
    Object.entries(counts).map(([flareClass, count]) => ({
      flareClass,
      count,
      percentage: Math.round((count / total) * 10000) / 100,
      color: colors[flareClass],
    }))
  );
});

export default router;
