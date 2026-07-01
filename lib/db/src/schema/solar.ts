import { pgTable, text, serial, timestamp, real, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const fluxReadingsTable = pgTable("flux_readings", {
  id: serial("id").primaryKey(),
  timeTag: timestamp("time_tag", { withTimezone: true }).notNull(),
  softXray: real("soft_xray"),
  hardXray: real("hard_xray"),
  channel: text("channel").notNull(),
  satellite: integer("satellite"),
  flareClass: text("flare_class"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertFluxReadingSchema = createInsertSchema(fluxReadingsTable).omit({ id: true, createdAt: true });
export type InsertFluxReading = z.infer<typeof insertFluxReadingSchema>;
export type FluxReading = typeof fluxReadingsTable.$inferSelect;

export const flareEventsTable = pgTable("flare_events", {
  id: serial("id").primaryKey(),
  timeTag: timestamp("time_tag", { withTimezone: true }).notNull(),
  flareClass: text("flare_class").notNull(),
  peakFlux: real("peak_flux").notNull(),
  confidence: real("confidence").notNull(),
  source: text("source").notNull(),
  duration: integer("duration"),
  status: text("status").notNull().default("detected"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertFlareEventSchema = createInsertSchema(flareEventsTable).omit({ id: true, createdAt: true });
export type InsertFlareEvent = z.infer<typeof insertFlareEventSchema>;
export type FlareEvent = typeof flareEventsTable.$inferSelect;

export const alertsTable = pgTable("alerts", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  severity: text("severity").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  flareClass: text("flare_class"),
  confidence: real("confidence"),
  timestamp: timestamp("timestamp", { withTimezone: true }).notNull().defaultNow(),
  isActive: boolean("is_active").notNull().default(true),
  countdown: integer("countdown"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertAlertSchema = createInsertSchema(alertsTable).omit({ id: true, createdAt: true });
export type InsertAlert = z.infer<typeof insertAlertSchema>;
export type Alert = typeof alertsTable.$inferSelect;

export const datasetsTable = pgTable("datasets", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  recordCount: integer("record_count").notNull().default(0),
  uploadedAt: timestamp("uploaded_at", { withTimezone: true }).notNull().defaultNow(),
  status: text("status").notNull().default("ready"),
  channelInfo: text("channel_info"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertDatasetSchema = createInsertSchema(datasetsTable).omit({ id: true, createdAt: true });
export type InsertDataset = z.infer<typeof insertDatasetSchema>;
export type Dataset = typeof datasetsTable.$inferSelect;
