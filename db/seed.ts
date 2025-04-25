import { db } from "./index";
import * as schema from "@shared/schema";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function seed() {
  try {
    // Create demo user
    const existingUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.username, "demo")
    });

    if (!existingUser) {
      const hashedPassword = await hashPassword("password");
      const [user] = await db.insert(schema.users).values({
        username: "demo",
        password: hashedPassword
      }).returning();
      
      console.log("Created demo user:", user);

      // Create demo connections
      const connections = [
        {
          userId: user.id,
          name: "Development Workstation",
          host: "192.168.1.100",
          port: 3389,
          os: "Windows",
          status: "online",
          lastAccessed: "2 hours ago"
        },
        {
          userId: user.id,
          name: "Production Server",
          host: "10.0.0.15",
          port: 22,
          os: "Linux",
          status: "online",
          lastAccessed: "1 day ago"
        },
        {
          userId: user.id,
          name: "Design Workstation",
          host: "192.168.1.105",
          port: 5900,
          os: "MacOS",
          status: "away",
          lastAccessed: "3 days ago"
        }
      ];

      const createdConnections = await db.insert(schema.connections).values(connections).returning();
      console.log("Created demo connections:", createdConnections);

      // Create demo sessions
      const now = new Date();
      const sessions = [
        {
          userId: user.id,
          connectionId: createdConnections[0].id,
          status: "active",
          startTime: new Date(now.getTime() - (1 * 60 * 60 * 1000)).toISOString(), // 1 hour ago
          duration: "1h 24m",
          protocol: "RDP",
          connectedTime: "9:32 AM",
          connectedDate: "Today"
        },
        {
          userId: user.id,
          connectionId: createdConnections[1].id,
          status: "active",
          startTime: new Date(now.getTime() - (45 * 60 * 1000)).toISOString(), // 45 minutes ago
          duration: "45m",
          protocol: "SSH",
          connectedTime: "10:12 AM",
          connectedDate: "Today"
        },
        {
          userId: user.id,
          connectionId: createdConnections[2].id,
          status: "idle",
          startTime: new Date(now.getTime() - (2 * 60 * 60 * 1000)).toISOString(), // 2 hours ago
          duration: "2h 11m",
          protocol: "VNC",
          connectedTime: "8:45 AM",
          connectedDate: "Today"
        }
      ];

      const createdSessions = await db.insert(schema.sessions).values(sessions).returning();
      console.log("Created demo sessions:", createdSessions);
    } else {
      console.log("Demo user already exists, skipping seed");
    }
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seed();
