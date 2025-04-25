import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import Sidebar from "@/components/sidebar";
import StatsOverview from "@/components/stats-overview";
import QuickAccess from "@/components/quick-access";
import ActiveSessions from "@/components/active-sessions";
import SecurityOverview from "@/components/security-overview";
import ConnectionDialog from "@/components/connection-dialog";
import RemoteDesktopView from "@/components/remote-desktop-view";
import { useQuery } from "@tanstack/react-query";
import { Connection, Session } from "@shared/schema";
import { useMobile } from "@/hooks/use-mobile";

export default function DashboardPage() {
  const { user, logoutMutation } = useAuth();
  const isMobile = useMobile();
  const [selectedConnection, setSelectedConnection] = useState<Connection | null>(null);
  const [isConnectionDialogOpen, setIsConnectionDialogOpen] = useState(false);
  const [isRemoteDesktopOpen, setIsRemoteDesktopOpen] = useState(false);
  
  const { data: connections = [] } = useQuery<Connection[]>({
    queryKey: ["/api/connections"],
  });
  
  const { data: sessions = [] } = useQuery<Session[]>({
    queryKey: ["/api/sessions"],
  });
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  const handleOpenConnectionDialog = (connection: Connection) => {
    setSelectedConnection(connection);
    setIsConnectionDialogOpen(true);
  };
  
  const handleCloseConnectionDialog = () => {
    setIsConnectionDialogOpen(false);
  };
  
  const handleStartConnection = () => {
    setIsConnectionDialogOpen(false);
    setIsRemoteDesktopOpen(true);
  };
  
  const handleCloseRemoteDesktop = () => {
    setIsRemoteDesktopOpen(false);
  };
  
  // Mobile navigation component
  const MobileNav = () => (
    <div className="md:hidden fixed bottom-0 left-0 right-0 border-t border-neutral-200 bg-white z-10">
      <div className="flex justify-around">
        <a href="#dashboard" className="py-3 px-4 flex flex-col items-center text-primary">
          <i className="ri-dashboard-line text-xl"></i>
          <span className="text-xs mt-1">Dashboard</span>
        </a>
        <a href="#connections" className="py-3 px-4 flex flex-col items-center text-neutral-400">
          <i className="ri-remote-control-line text-xl"></i>
          <span className="text-xs mt-1">Connections</span>
        </a>
        <a href="#sessions" className="py-3 px-4 flex flex-col items-center text-neutral-400">
          <i className="ri-computer-fill text-xl"></i>
          <span className="text-xs mt-1">Sessions</span>
        </a>
        <a href="#more" className="py-3 px-4 flex flex-col items-center text-neutral-400">
          <i className="ri-more-line text-xl"></i>
          <span className="text-xs mt-1">More</span>
        </a>
      </div>
    </div>
  );
  
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar user={user} onLogout={handleLogout} />
      
      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-neutral-100 pb-16 md:pb-0">
        {/* Header */}
        <header className="bg-white border-b border-neutral-200 py-4 px-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-neutral-500">Dashboard</h2>
            <p className="text-sm text-neutral-400">Monitor and manage your remote connections</p>
          </div>
          <div className="flex items-center space-x-4">
            <button className="text-neutral-400 hover:text-neutral-500">
              <i className="ri-notification-3-line text-xl"></i>
            </button>
            <button className="md:hidden text-neutral-400 hover:text-neutral-500">
              <i className="ri-menu-line text-xl"></i>
            </button>
            <button 
              onClick={() => { 
                setSelectedConnection({
                  id: 0,
                  userId: user?.id || 0,
                  name: "",
                  host: "",
                  port: 3389,
                  os: "Windows",
                  status: "offline",
                  lastAccessed: new Date().toISOString(),
                  credentials: null
                }); 
                setIsConnectionDialogOpen(true); 
              }}
              className="hidden md:flex items-center justify-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
            >
              <i className="ri-add-line mr-2"></i>
              <span>New Connection</span>
            </button>
          </div>
        </header>
        
        {/* Dashboard Content */}
        <div className="p-6">
          {/* Stats Overview */}
          <StatsOverview sessions={sessions} />
          
          {/* Quick Access */}
          <QuickAccess 
            connections={connections} 
            onConnect={handleOpenConnectionDialog} 
          />
          
          {/* Admin Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ActiveSessions sessions={sessions} className="lg:col-span-2" />
            <SecurityOverview />
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {isMobile && <MobileNav />}
      </main>
      
      {/* Connection Dialog */}
      {selectedConnection && (
        <ConnectionDialog 
          isOpen={isConnectionDialogOpen}
          connection={selectedConnection}
          onClose={handleCloseConnectionDialog}
          onConnect={handleStartConnection}
        />
      )}
      
      {/* Remote Desktop View */}
      {selectedConnection && (
        <RemoteDesktopView 
          isOpen={isRemoteDesktopOpen}
          connection={selectedConnection}
          onClose={handleCloseRemoteDesktop}
        />
      )}
    </div>
  );
}
