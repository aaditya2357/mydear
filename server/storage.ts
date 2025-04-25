import { db } from "@db";
import * as schema from "@shared/schema";
import { eq, and } from "drizzle-orm";
import connectPg from "connect-pg-simple";
import session from "express-session";
import { pool } from "@db";

// Custom user session store with PostgreSQL
const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<schema.User>;
  getUserByUsername(username: string): Promise<schema.User | undefined>;
  createUser(user: schema.InsertUser): Promise<schema.User>;
  
  // Connection operations
  getConnection(id: number): Promise<schema.Connection | undefined>;
  getConnectionsByUser(userId: number): Promise<schema.Connection[]>;
  createConnection(connection: schema.InsertConnection): Promise<schema.Connection>;
  updateConnection(id: number, connection: Partial<schema.Connection>): Promise<schema.Connection>;
  deleteConnection(id: number): Promise<void>;
  
  // Session operations
  getSession(id: number): Promise<schema.Session | undefined>;
  getSessionsByUser(userId: number): Promise<schema.Session[]>;
  getActiveSessions(): Promise<schema.Session[]>;
  createSession(session: schema.InsertSession): Promise<schema.Session>;
  updateSession(id: number, session: Partial<schema.Session>): Promise<schema.Session>;
  terminateSession(id: number): Promise<void>;
  
  // Session store for authentication
  sessionStore: session.SessionStore;
}

class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;
  
  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true
    });
  }
  
  // User operations
  async getUser(id: number): Promise<schema.User> {
    const users = await db.select().from(schema.users).where(eq(schema.users.id, id));
    if (users.length === 0) {
      throw new Error("User not found");
    }
    return users[0];
  }
  
  async getUserByUsername(username: string): Promise<schema.User | undefined> {
    const users = await db.select().from(schema.users).where(eq(schema.users.username, username));
    return users[0];
  }
  
  async createUser(user: schema.InsertUser): Promise<schema.User> {
    const result = await db.insert(schema.users).values(user).returning();
    return result[0];
  }
  
  // Connection operations
  async getConnection(id: number): Promise<schema.Connection | undefined> {
    const connections = await db.select().from(schema.connections).where(eq(schema.connections.id, id));
    return connections[0];
  }
  
  async getConnectionsByUser(userId: number): Promise<schema.Connection[]> {
    return await db.select().from(schema.connections).where(eq(schema.connections.userId, userId));
  }
  
  async createConnection(connection: schema.InsertConnection): Promise<schema.Connection> {
    const result = await db.insert(schema.connections).values(connection).returning();
    return result[0];
  }
  
  async updateConnection(id: number, connection: Partial<schema.Connection>): Promise<schema.Connection> {
    const result = await db
      .update(schema.connections)
      .set(connection)
      .where(eq(schema.connections.id, id))
      .returning();
    return result[0];
  }
  
  async deleteConnection(id: number): Promise<void> {
    await db.delete(schema.connections).where(eq(schema.connections.id, id));
  }
  
  // Session operations
  async getSession(id: number): Promise<schema.Session | undefined> {
    const sessions = await db.select().from(schema.sessions).where(eq(schema.sessions.id, id));
    return sessions[0];
  }
  
  async getSessionsByUser(userId: number): Promise<schema.Session[]> {
    const sessions = await db.select().from(schema.sessions).where(eq(schema.sessions.userId, userId));
    
    // Fetch related data
    const result: schema.Session[] = [];
    for (const session of sessions) {
      const user = await this.getUser(session.userId);
      const connection = await this.getConnection(session.connectionId);
      if (connection) {
        result.push({
          ...session,
          user: {
            id: user.id,
            username: user.username,
            name: user.username, // Use username as name for simplicity
            email: `${user.username}@example.com` // Demo email
          },
          connection: connection
        });
      }
    }
    
    return result;
  }
  
  async getActiveSessions(): Promise<schema.Session[]> {
    const sessions = await db
      .select()
      .from(schema.sessions)
      .where(eq(schema.sessions.status, "active"));
    
    // Fetch related data (same as getSessionsByUser)
    const result: schema.Session[] = [];
    for (const session of sessions) {
      const user = await this.getUser(session.userId);
      const connection = await this.getConnection(session.connectionId);
      if (connection) {
        result.push({
          ...session,
          user: {
            id: user.id,
            username: user.username,
            name: user.username,
            email: `${user.username}@example.com`
          },
          connection: connection
        });
      }
    }
    
    return result;
  }
  
  async createSession(session: schema.InsertSession): Promise<schema.Session> {
    const result = await db.insert(schema.sessions).values(session).returning();
    const createdSession = result[0];
    
    // Update the connection status to online
    await this.updateConnection(session.connectionId, { status: "online" });
    
    // Return the session with related data
    const user = await this.getUser(createdSession.userId);
    const connection = await this.getConnection(createdSession.connectionId);
    
    if (!connection) {
      throw new Error("Connection not found");
    }
    
    return {
      ...createdSession,
      user: {
        id: user.id,
        username: user.username,
        name: user.username,
        email: `${user.username}@example.com`
      },
      connection: connection
    };
  }
  
  async updateSession(id: number, session: Partial<schema.Session>): Promise<schema.Session> {
    const result = await db
      .update(schema.sessions)
      .set(session)
      .where(eq(schema.sessions.id, id))
      .returning();
    return result[0];
  }
  
  async terminateSession(id: number): Promise<void> {
    const session = await this.getSession(id);
    if (!session) return;
    
    // Update the session status to terminated
    await db
      .update(schema.sessions)
      .set({
        status: "terminated",
        endTime: new Date().toISOString()
      })
      .where(eq(schema.sessions.id, id));
    
    // Update the connection status to offline
    await this.updateConnection(session.connectionId, { status: "offline" });
  }
}

export const storage = new DatabaseStorage();
