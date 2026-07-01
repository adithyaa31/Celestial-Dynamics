import { Router } from "express";
import { db, alertsTable } from "@workspace/db";
import { desc, eq } from "drizzle-orm";

const router = Router();

router.get("/", async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
  const alerts = await db
    .select()
    .from(alertsTable)
    .orderBy(desc(alertsTable.timestamp))
    .limit(limit);

  res.json(alerts.map((a) => ({
    id: a.id,
    type: a.type,
    severity: a.severity,
    title: a.title,
    description: a.description,
    flareClass: a.flareClass,
    confidence: a.confidence,
    timestamp: a.timestamp.toISOString(),
    isActive: a.isActive,
    countdown: a.countdown,
  })));
});

router.get("/active", async (_req, res) => {
  const alerts = await db
    .select()
    .from(alertsTable)
    .where(eq(alertsTable.isActive, true))
    .orderBy(desc(alertsTable.timestamp));

  res.json(alerts.map((a) => ({
    id: a.id,
    type: a.type,
    severity: a.severity,
    title: a.title,
    description: a.description,
    flareClass: a.flareClass,
    confidence: a.confidence,
    timestamp: a.timestamp.toISOString(),
    isActive: a.isActive,
    countdown: a.countdown,
  })));
});

export default router;
