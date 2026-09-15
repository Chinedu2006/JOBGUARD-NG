import { createInsertSchema } from "drizzle-zod";
import { pgTable, serial, text, boolean } from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const opportunitiesTable = pgTable("opportunities", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  organization: text("organization").notNull(),
  category: text("category").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  deadline: text("deadline").notNull(),
  url: text("url").notNull(),
  sourceStatus: text("source_status").notNull(),
  demo: boolean("demo").notNull().default(true),
});

export const insertOpportunitySchema = createInsertSchema(opportunitiesTable).omit({
  id: true,
});
export type InsertOpportunity = z.infer<typeof insertOpportunitySchema>;
export type Opportunity = typeof opportunitiesTable.$inferSelect;