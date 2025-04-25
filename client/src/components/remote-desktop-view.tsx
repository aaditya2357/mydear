import { useEffect, useRef, useState } from "react";
import { Connection } from "@shared/schema";

interface RemoteDesktopViewProps {
  isOpen: boolean;
  connection: Connection;
  onClose: () => void;
}

export default function RemoteDesktopView({ 
  isOpen, 
  connection, 
  onClose 
}: RemoteDesktopViewProps) {
  const [connectionQuality, setConnectionQuality] = useState({ quality: "Good", latency: 25 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const remoteDesktopRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const socketRef = useRef<WebSocket | null>(null);
  
  // Setup WebSocket connection for remote desktop access
  useEffect(() => {
    if (!isOpen) return;
    
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;
    
    socket.onopen = () => {
      console.log("WebSocket connection established");
      socket.send(JSON.stringify({
        type: "connect",
        connectionId: connection.id
      }));
    };
    
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === "frame") {
        // Handle frame updates
        // In a real implementation, we would render the received frame to the canvas
        console.log("Received frame update");
      } else if (data.type === "connectionStatus") {
        setConnectionQuality({
          quality: data.quality,
          latency: data.latency
        });
      }
    };
    
    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
    
    socket.onclose = () => {
      console.log("WebSocket connection closed");
    };
    
    return () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, [isOpen, connection.id]);
  
  const toggleFullscreen = () => {
    if (!remoteDesktopRef.current) return;
    
    if (!document.fullscreenElement) {
      remoteDesktopRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  };
  
  const handleDisconnect = () => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: "disconnect",
        connectionId: connection.id
      }));
      socketRef.current.close();
    }
    onClose();
  };
  
  if (!isOpen) return null;
  
  return (
    <div 
      ref={remoteDesktopRef}
      className="fixed inset-0 bg-neutral-800 z-50 flex flex-col"
    >
      <div className="bg-neutral-900 py-3 px-4 flex items-center justify-between">
        <div className="flex items-center">
          <button 
            className="text-white hover:text-neutral-300 mr-4"
            onClick={onClose}
          >
            <i className="ri-arrow-left-line text-xl"></i>
          </button>
          <h3 className="text-white font-medium">{connection.name}</h3>
          <span className="ml-2 px-2 py-0.5 bg-[hsl(var(--status-success))] text-white text-xs rounded-full">Connected</span>
        </div>
        <div className="flex items-center space-x-3">
          <button className="text-white hover:text-neutral-300 p-2" title="Clipboard">
            <i className="ri-clipboard-line"></i>
          </button>
          <button className="text-white hover:text-neutral-300 p-2" title="File Transfer">
            <i className="ri-folder-transfer-line"></i>
          </button>
          <button className="text-white hover:text-neutral-300 p-2" title="Settings">
            <i className="ri-settings-line"></i>
          </button>
          <button 
            className="text-white hover:text-neutral-300 p-2" 
            title="Fullscreen"
            onClick={toggleFullscreen}
          >
            <i className={`ri-${isFullscreen ? 'fullscreen-exit' : 'fullscreen'}-line`}></i>
          </button>
          <button 
            className="text-white hover:text-neutral-300 p-2" 
            title="Disconnect"
            onClick={handleDisconnect}
          >
            <i className="ri-shut-down-line"></i>
          </button>
        </div>
      </div>
      
      <div className="flex-1 flex items-center justify-center relative overflow-hidden bg-neutral-900">
        <canvas 
          ref={canvasRef}
          className="max-w-full max-h-full object-contain"
          width={800}
          height={600}
        ></canvas>
        
        {/* Connection quality indicator */}
        <div className="absolute bottom-4 right-4 bg-black/70 text-white rounded-full px-3 py-1.5 flex items-center text-sm">
          <i className="ri-wifi-line mr-2"></i>
          <span>Connection: {connectionQuality.quality} ({connectionQuality.latency}ms)</span>
        </div>
      </div>
    </div>
  );
}
