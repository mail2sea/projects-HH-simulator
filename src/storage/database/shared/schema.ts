import { pgTable, serial, timestamp, index, pgPolicy, varchar, text, integer } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const healthCheck = pgTable("health_check", {
	id: serial().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

export const blogPosts = pgTable("blog_posts", {
	id: serial().primaryKey().notNull(),
	title: varchar({ length: 200 }).notNull(),
	summary: text().notNull(),
	content: text().notNull(),
	tags: text(),
	readTime: integer("read_time").default(3).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("blog_posts_created_at_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamptz_ops")),
	pgPolicy("blog_posts_允许服务端删除", { as: "permissive", for: "delete", to: ["public"], using: sql`true` }),
	pgPolicy("blog_posts_允许服务端更新", { as: "permissive", for: "update", to: ["public"] }),
	pgPolicy("blog_posts_允许服务端写入", { as: "permissive", for: "insert", to: ["public"] }),
	pgPolicy("blog_posts_允许公开读取", { as: "permissive", for: "select", to: ["public"] }),
]);

// 用户表
export const users = pgTable("users", {
	id: serial().primaryKey().notNull(),
	username: varchar("username", { length: 50 }).notNull().unique(),
	password: text("password").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("users_username_idx").on(table.username), // 为用户名创建索引
]);

// 游戏记录表
export const gameRecords = pgTable("game_records", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
	scenario: varchar("scenario", { length: 255 }).notNull(),
	finalScore: integer("final_score").notNull(),
	result: varchar("result", { length: 50 }).notNull(), // 'victory' 或 'defeat'
	playedAt: timestamp("played_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("game_records_user_id_idx").on(table.userId),
	index("game_records_played_at_idx").on(table.playedAt),
]);
