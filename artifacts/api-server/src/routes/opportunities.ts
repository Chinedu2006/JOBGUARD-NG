import { Router, type IRouter } from "express";
import { and, asc, eq, ilike, or, sql } from "drizzle-orm";
import { db, opportunitiesTable } from "@workspace/db";
import {
  GetOpportunitySummaryResponse,
  ListOpportunitiesQueryParams,
  ListOpportunitiesResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/opportunities", async (req, res): Promise<void> => {
  const parsed = ListOpportunitiesQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { category, search } = parsed.data;
  const filters = [];
  if (category && category !== "All") filters.push(eq(opportunitiesTable.category, category));
  if (search) {
    const query = `%${search}%`;
    filters.push(
      or(
        ilike(opportunitiesTable.title, query),
        ilike(opportunitiesTable.organization, query),
        ilike(opportunitiesTable.description, query),
      ),
    );
  }

  const opportunities = await db
    .select()
    .from(opportunitiesTable)
    .where(filters.length ? and(...filters) : undefined)
    .orderBy(asc(opportunitiesTable.id));

  res.json(ListOpportunitiesResponse.parse(opportunities));
});

router.get("/opportunities/summary", async (_req, res): Promise<void> => {
  const rows = await db
    .select({
      category: opportunitiesTable.category,
      count: sql<number>`count(*)::int`,
    })
    .from(opportunitiesTable)
    .groupBy(opportunitiesTable.category)
    .orderBy(asc(opportunitiesTable.category));
  const total = rows.reduce((sum, row) => sum + row.count, 0);
  const categories = Object.fromEntries(rows.map((row) => [row.category, row.count]));
  res.json(GetOpportunitySummaryResponse.parse({ total, categories }));
});

export default router;