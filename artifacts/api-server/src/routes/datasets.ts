import { Router } from "express";
import { db, datasetsTable } from "@workspace/db";
import { desc } from "drizzle-orm";

const router = Router();

router.get("/", async (_req, res) => {
  const datasets = await db
    .select()
    .from(datasetsTable)
    .orderBy(desc(datasetsTable.uploadedAt));

  res.json(datasets.map((d) => ({
    id: d.id,
    name: d.name,
    type: d.type,
    recordCount: d.recordCount,
    uploadedAt: d.uploadedAt.toISOString(),
    status: d.status,
    channelInfo: d.channelInfo,
  })));
});

export default router;
