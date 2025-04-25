import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from "ws";
import { setupAuth } from "./auth";
import { setupWebSocketServer } from "./websocket";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create HTTP server
  const httpServer = createServer(app);
  
  // Setup WebSocket server for remote desktop access
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  setupWebSocketServer(wss, storage);
  
  // Setup authentication routes
  setupAuth(app);
  
  // API routes
  // Connections
  app.get("/api/connections", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const connections = await storage.getConnectionsByUser(req.user.id);
    res.json(connections);
  });
  
  app.post("/api/connections", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const connection = await storage.createConnection({
        ...req.body,
        userId: req.user.id,
        status: "offline",
        lastAccessed: new Date().toISOString()
      });
      res.status(201).json(connection);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  app.get("/api/connections/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const connection = await storage.getConnection(parseInt(req.params.id));
      if (!connection) {
        return res.status(404).json({ message: "Connection not found" });
      }
      if (connection.userId !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized access to connection" });
      }
      res.json(connection);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  app.delete("/api/connections/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const connection = await storage.getConnection(parseInt(req.params.id));
      if (!connection) {
        return res.status(404).json({ message: "Connection not found" });
      }
      if (connection.userId !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized access to connection" });
      }
      await storage.deleteConnection(parseInt(req.params.id));
      res.sendStatus(204);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  // Sessions
  app.get("/api/sessions", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const sessions = await storage.getSessionsByUser(req.user.id);
    res.json(sessions);
  });
  
  app.post("/api/sessions", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const session = await storage.createSession({
        ...req.body,
        userId: req.user.id,
        status: "active",
        startTime: new Date().toISOString()
      });
      res.status(201).json(session);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  app.delete("/api/sessions/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      await storage.terminateSession(parseInt(req.params.id));
      res.sendStatus(204);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  return httpServer;
}
