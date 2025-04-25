import { pgTable, text, serial, integer, boolean, json, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  connections: many(connections),
  sessions: many(sessions),
}));

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Connections table
export const connections = pgTable("connections", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  host: text("host").notNull(),
  port: integer("port").default(3389),
  os: text("os").default("Windows"),
  status: text("status").default("offline"), // online, offline, away
  lastAccessed: text("last_accessed"), // ISO date string
  credentials: json("credentials").$type<{
    username?: string;
    password?: string;
    certificate?: string;
    rememberPassword?: boolean;
  }>(),
});

export const connectionsRelations = relations(connections, ({ one, many }) => ({
  user: one(users, {
    fields: [connections.userId],
    references: [users.id],
  }),
  sessions: many(sessions),
}));

export const insertConnectionSchema = createInsertSchema(connections);

export type InsertConnection = z.infer<typeof insertConnectionSchema>;
export type Connection = typeof connections.$inferSelect;

// Sessions table
export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  connectionId: integer("connection_id").references(() => connections.id).notNull(),
  status: text("status").notNull(), // active, idle, terminated
  startTime: text("start_time").notNull(), // ISO date string
  endTime: text("end_time"), // ISO date string
  duration: text("duration"), // Calculated duration as string (e.g., "2h 30m")
  protocol: text("protocol"), // RDP, VNC, SSH, etc.
  clientInfo: json("client_info").$type<{
    ip?: string;
    userAgent?: string;
    resolution?: string;
  }>(),
  connectedTime: text("connected_time"), // Time of day (e.g., "9:32 AM")
  connectedDate: text("connected_date"), // Date (e.g., "Today", "Yesterday")
});

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
  connection: one(connections, {
    fields: [sessions.connectionId],
    references: [connections.id],
  }),
}));

export const insertSessionSchema = createInsertSchema(sessions);

export type InsertSession = z.infer<typeof insertSessionSchema>;
export type SessionBase = typeof sessions.$inferSelect;

// Extended Session type with populated relations
export interface Session extends SessionBase {
  user: {
    id: number;
    username: string;
    name: string; // Display name
    email: string;
  };
  connection: Connection;
}
