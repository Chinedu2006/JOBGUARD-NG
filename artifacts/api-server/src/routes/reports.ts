import { Router, type IRouter } from "express";
import { CreateReportBody, CreateReportResponse } from "@workspace/api-zod";
import { db, reportsTable } from "@workspace/db";

const router: IRouter = Router();

router.post("/reports", async (req, res): Promise<void> => {
  const parsed = CreateReportBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [report] = await db
    .insert(reportsTable)
    .values({
      opportunityName: parsed.data.opportunityName.trim(),
      organization: parsed.data.organization.trim(),
      details: parsed.data.details.trim(),
      url: parsed.data.url?.trim() || null,
      outcome: parsed.data.outcome.trim(),
    })
    .returning();

  res.status(201).json(
    CreateReportResponse.parse({
      ...report,
      createdAt: report.createdAt.toISOString(),
    }),
  );
});

export default router;