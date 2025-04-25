import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Connection } from "@shared/schema";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface QuickAccessProps {
  connections: Connection[];
  onConnect: (connection: Connection) => void;
}

export default function QuickAccess({ connections, onConnect }: QuickAccessProps) {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newConnection, setNewConnection] = useState({
    name: "",
    host: "",
    os: "Windows",
    port: 3389
  });
  
  const createConnectionMutation = useMutation({
    mutationFn: async (connection: Omit<Connection, "id">) => {
      const res = await apiRequest("POST", "/api/connections", connection);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/connections"] });
      setIsAddDialogOpen(false);
      setNewConnection({ name: "", host: "", os: "Windows", port: 3389 });
      toast({
        title: "Connection created",
        description: "Your new connection has been added successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create connection",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const deleteConnectionMutation = useMutation({
    mutationFn: async (connectionId: number) => {
      await apiRequest("DELETE", `/api/connections/${connectionId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/connections"] });
      toast({
        title: "Connection deleted",
        description: "The connection has been removed successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete connection",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const handleAddConnection = () => {
    createConnectionMutation.mutate(newConnection);
  };
  
  const handleDeleteConnection = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteConnectionMutation.mutate(id);
  };
  
  const handleEditConnection = (connection: Connection, e: React.MouseEvent) => {
    e.stopPropagation();
    // Implement edit functionality here
    toast({
      title: "Edit connection",
      description: `Editing ${connection.name}`,
    });
  };
  
  const getStatusIndicator = (status: string) => {
    if (status === "online") {
      return (
        <div className="absolute top-2 right-2 bg-white/90 rounded-full px-2 py-1 text-xs font-medium text-[hsl(var(--status-success))] flex items-center">
          <span className="w-2 h-2 rounded-full bg-[hsl(var(--status-success))] mr-1"></span>
          Online
        </div>
      );
    } else if (status === "away") {
      return (
        <div className="absolute top-2 right-2 bg-white/90 rounded-full px-2 py-1 text-xs font-medium text-[hsl(var(--status-warning))] flex items-center">
          <span className="w-2 h-2 rounded-full bg-[hsl(var(--status-warning))] mr-1"></span>
          Away
        </div>
      );
    } else {
      return (
        <div className="absolute top-2 right-2 bg-white/90 rounded-full px-2 py-1 text-xs font-medium text-[hsl(var(--status-error))] flex items-center">
          <span className="w-2 h-2 rounded-full bg-[hsl(var(--status-error))] mr-1"></span>
          Offline
        </div>
      );
    }
  };
  
  // Function to get a background color based on OS type
  const getBackgroundByOs = (os: string) => {
    if (os === "Windows") return "bg-blue-100";
    if (os === "Linux") return "bg-orange-100";
    if (os === "MacOS") return "bg-gray-100";
    return "bg-neutral-100";
  };
  
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-neutral-500">Quick Access</h3>
        <a href="#connections" className="text-primary text-sm font-medium hover:underline">View all</a>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {connections.map((connection) => (
          <div 
            key={connection.id}
            className="bg-white rounded-lg shadow-sm overflow-hidden connection-card cursor-pointer"
            onClick={() => onConnect(connection)}
          >
            <div className="relative h-32 bg-neutral-200">
              <div className={`w-full h-full ${getBackgroundByOs(connection.os)} flex items-center justify-center`}>
                <i className={`ri-${connection.os.toLowerCase()}-fill text-5xl opacity-20`}></i>
              </div>
              {getStatusIndicator(connection.status)}
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-neutral-500">{connection.name}</h4>
                <span className="text-xs text-neutral-400">{connection.os}</span>
              </div>
              <p className="text-sm text-neutral-400 mt-1">{connection.host}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-neutral-400">Last accessed: {connection.lastAccessed}</span>
                <div className="connection-actions flex space-x-1">
                  <button 
                    className="p-1 text-neutral-400 hover:text-primary"
                    onClick={(e) => handleEditConnection(connection, e)}
                  >
                    <i className="ri-pencil-line"></i>
                  </button>
                  <button 
                    className="p-1 text-neutral-400 hover:text-[hsl(var(--status-error))]"
                    onClick={(e) => handleDeleteConnection(connection.id, e)}
                  >
                    <i className="ri-delete-bin-line"></i>
                  </button>
                </div>
              </div>
            </div>
            <button className="w-full bg-primary text-white py-3 font-medium hover:bg-primary-dark transition-colors">
              Connect
            </button>
          </div>
        ))}
        
        <div 
          className="bg-white rounded-lg shadow-sm overflow-hidden border-2 border-dashed border-neutral-300 flex flex-col items-center justify-center h-[294px] cursor-pointer"
          onClick={() => setIsAddDialogOpen(true)}
        >
          <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mb-2">
            <i className="ri-add-line text-xl text-primary"></i>
          </div>
          <p className="text-neutral-400 font-medium">Add New Connection</p>
          <p className="text-xs text-neutral-300 mt-1">Connect to a remote desktop</p>
        </div>
      </div>

      {/* Add Connection Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Connection</DialogTitle>
            <DialogDescription>
              Enter the details for the remote desktop you want to connect to.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={newConnection.name}
                onChange={(e) => setNewConnection({...newConnection, name: e.target.value})}
                className="col-span-3"
                placeholder="My Workstation"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="host" className="text-right">
                Host
              </Label>
              <Input
                id="host"
                value={newConnection.host}
                onChange={(e) => setNewConnection({...newConnection, host: e.target.value})}
                className="col-span-3"
                placeholder="192.168.1.100"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="os" className="text-right">
                OS
              </Label>
              <Select 
                value={newConnection.os}
                onValueChange={(value) => setNewConnection({...newConnection, os: value})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select an operating system" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Windows">Windows</SelectItem>
                  <SelectItem value="Linux">Linux</SelectItem>
                  <SelectItem value="MacOS">MacOS</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="port" className="text-right">
                Port
              </Label>
              <Input
                id="port"
                type="number"
                value={newConnection.port.toString()}
                onChange={(e) => setNewConnection({...newConnection, port: parseInt(e.target.value)})}
                className="col-span-3"
                placeholder="3389"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddConnection} disabled={createConnectionMutation.isPending}>
              {createConnectionMutation.isPending ? "Creating..." : "Add Connection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
