import {nanoid} from "nanoid"
import {sqliteTable, text} from "drizzle-orm/sqlite-core";
import {sql} from "drizzle-orm";

export const place = sqliteTable("places", {
    id: text("id").$defaultFn(() => nanoid()).primaryKey(),
    name: text("name").notNull(),
    createdAt: text("createdAt").default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: text("updatedAt")
})
