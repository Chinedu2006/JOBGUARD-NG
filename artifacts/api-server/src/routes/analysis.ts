import { Router, type IRouter } from "express";
import { AnalyzeOpportunityBody, AnalyzeOpportunityResponse } from "@workspace/api-zod";
import { analyzeOpportunity } from "../lib/risk-engine";

const router: IRouter = Router();

router.post("/analysis", async (req, res): Promise<void> => {
  const parsed = AnalyzeOpportunityBody.safeParse(req.body);
  if (!parsed.success || !parsed.data.text.trim()) {
    res.status(400).json({ error: "Paste an opportunity first." });
    return;
  }

  const analysis = analyzeOpportunity(parsed.data.text, parsed.data.url);
  res.json(AnalyzeOpportunityResponse.parse(analysis));
});

export default router;