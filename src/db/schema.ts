import { nanoid } from "nanoid";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";

export const places = sqliteTable("places", {
  id: text("id")
    .$defaultFn(() => nanoid())
    .primaryKey(),
  name: text("name").notNull(),
  createdAt: text("createdAt")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: text("updatedAt"),
  mapLink: text("map_link").notNull(),
  frameLink: text("frame_link").default(""),
  description: text("description"),
});

export const placesRelations = relations(places, ({ many }) => ({
  photos: many(photos),
}));

export const photos = sqliteTable("photos", {
  id: text("id")
    .$defaultFn(() => nanoid())
    .primaryKey(),
  url: text("url").notNull(),
  createdAt: text("createdAt")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: text("updatedAt"),
  placeId: text("place_id"),
});

export const photosRelations = relations(photos, ({ one }) => ({
  place: one(places, {
    fields: [photos.placeId],
    references: [places.id],
  }),
}));

export const applications = sqliteTable("applications", {
  id: text("id")
    .$defaultFn(() => nanoid())
    .primaryKey(),
  createdAt: text("createdAt")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  message: text("message").notNull(),
  updatedAt: text("updatedAt"),
  timeStart: text("time_start"),
  timeEnd: text("time_end"),
  user: text("user_id").references(() => users.id),
  approval: text("approval_id").references(() => applicationApprovals.id),
});

export const applicationApprovals = sqliteTable("application_approvals", {
  id: text("id")
    .$defaultFn(() => nanoid())
    .primaryKey(),
  createdAt: text("createdAt")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  approved: integer("approved", { mode: "boolean" }).notNull().default(false),
  message: text("message").notNull(),
  admin: text("admin_id").references(() => admins.id),
});

export const users = sqliteTable("users", {
  id: text("id")
    .$defaultFn(() => nanoid())
    .primaryKey(),
  createdAt: text("createdAt")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  phone: text("phone").notNull(),
});

export const admins = sqliteTable("admins", {
  id: text("id")
    .$defaultFn(() => nanoid())
    .primaryKey(),
  createdAt: text("createdAt")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  name: text("name"),
});
