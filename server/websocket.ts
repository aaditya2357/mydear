import WebSocket, { WebSocketServer } from 'ws';
import { IStorage } from './storage';

interface WebSocketMessage {
  type: string;
  connectionId?: number;
  sessionId?: number;
  [key: string]: any;
}

interface Client {
  id: string;
  socket: WebSocket;
  userId?: number;
  connectionId?: number;
  sessionId?: number;
}

export function setupWebSocketServer(wss: WebSocketServer, storage: IStorage) {
  // Configure WebSocket server for production environments
  if (process.env.NODE_ENV === 'production') {
    console.log('WebSocket server configured for production environment');
    wss.options.clientTracking = true;
  }
  const clients: Client[] = [];
  
  // Generate a unique ID for each client
  const generateId = () => Math.random().toString(36).substring(2, 10);
  
  wss.on('connection', (socket) => {
    const clientId = generateId();
    const client: Client = { id: clientId, socket };
    clients.push(client);
    
    console.log(`New WebSocket client connected: ${clientId}`);
    
    // Handle messages from clients
    socket.on('message', async (message) => {
      try {
        const data: WebSocketMessage = JSON.parse(message.toString());
        console.log(`Received message from client ${clientId}:`, data.type);
        
        switch (data.type) {
          case 'connect': {
            // Handle connection request
            if (!data.connectionId) {
              sendError(socket, 'Missing connectionId');
              return;
            }
            
            const connection = await storage.getConnection(data.connectionId);
            if (!connection) {
              sendError(socket, 'Connection not found');
              return;
            }
            
            // Create a session for this connection
            const session = await storage.createSession({
              userId: connection.userId,
              connectionId: connection.id,
              status: 'active',
              startTime: new Date().toISOString(),
              protocol: 'WebSocket', // Example protocol
              clientInfo: {
                ip: '127.0.0.1', // In a real implementation, we would get the client IP
                userAgent: 'CloudConnect Web Client'
              }
            });
            
            // Update client information
            client.userId = connection.userId;
            client.connectionId = connection.id;
            client.sessionId = session.id;
            
            // Send connection confirmation
            socket.send(JSON.stringify({
              type: 'connected',
              connectionId: connection.id,
              sessionId: session.id
            }));
            
            // Start sending status updates periodically
            sendStatusUpdates(socket);
            
            // In a real implementation, we would establish the actual remote desktop connection here
            // and start streaming frames or input/output data
            break;
          }
          
          case 'disconnect': {
            // Handle disconnection request
            if (client.sessionId) {
              await storage.terminateSession(client.sessionId);
              console.log(`Client ${clientId} disconnected from session ${client.sessionId}`);
            }
            
            // Send disconnection confirmation
            socket.send(JSON.stringify({
              type: 'disconnected'
            }));
            
            socket.close();
            break;
          }
          
          case 'keyEvent':
          case 'mouseEvent':
          case 'touchEvent': {
            // Handle input events (keyboard, mouse, touch)
            // In a real implementation, we would forward these events to the remote desktop
            console.log(`Received ${data.type} from client ${clientId}`);
            
            // Acknowledge the event
            socket.send(JSON.stringify({
              type: `${data.type}Ack`,
              id: data.id
            }));
            break;
          }
          
          default:
            console.warn(`Unknown message type: ${data.type}`);
            sendError(socket, `Unknown message type: ${data.type}`);
        }
      } catch (error) {
        console.error('Error processing message:', error);
        sendError(socket, 'Error processing message');
      }
    });
    
    // Handle client disconnection
    socket.on('close', async () => {
      console.log(`WebSocket client disconnected: ${clientId}`);
      
      // Terminate the session if it exists
      if (client.sessionId) {
        await storage.terminateSession(client.sessionId);
        console.log(`Session ${client.sessionId} terminated due to client disconnection`);
      }
      
      // Remove the client from the clients array
      const index = clients.findIndex(c => c.id === clientId);
      if (index !== -1) {
        clients.splice(index, 1);
      }
    });
    
    // Send initial connection status
    socket.send(JSON.stringify({
      type: 'connectionStatus',
      status: 'connected',
      quality: 'Good',
      latency: 25
    }));
  });
  
  // Helper function to send error messages
  function sendError(socket: WebSocket, message: string) {
    socket.send(JSON.stringify({
      type: 'error',
      message
    }));
  }
  
  // Helper function to send periodic status updates (simulate connection quality)
  function sendStatusUpdates(socket: WebSocket) {
    // This is a simulation - in a real implementation we would measure actual network performance
    const qualities = ['Excellent', 'Good', 'Fair', 'Poor'];
    const interval = setInterval(() => {
      if (socket.readyState === WebSocket.OPEN) {
        const quality = qualities[Math.floor(Math.random() * qualities.length)];
        const latency = Math.floor(Math.random() * 50) + 10; // 10-60ms
        
        socket.send(JSON.stringify({
          type: 'connectionStatus',
          quality,
          latency
        }));
      } else {
        clearInterval(interval);
      }
    }, 5000);
    
    // Simulate frame updates (would be actual desktop frames in a real implementation)
    const frameInterval = setInterval(() => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
          type: 'frame',
          timestamp: Date.now()
          // In a real implementation, this would include frame data
          // encoded as base64 or binary data
        }));
      } else {
        clearInterval(frameInterval);
      }
    }, 1000 / 30); // 30 fps
  }
}
