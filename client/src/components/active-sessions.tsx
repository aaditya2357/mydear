import { useState } from "react";
import { Session } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ActiveSessionsProps {
  sessions: Session[];
  className?: string;
}

export default function ActiveSessions({ sessions, className = "" }: ActiveSessionsProps) {
  const { toast } = useToast();
  const [timeRange, setTimeRange] = useState("24h");
  
  const terminateSessionMutation = useMutation({
    mutationFn: async (sessionId: number) => {
      await apiRequest("DELETE", `/api/sessions/${sessionId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
      toast({
        title: "Session terminated",
        description: "The session has been terminated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to terminate session",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const handleTerminateSession = (sessionId: number) => {
    terminateSessionMutation.mutate(sessionId);
  };
  
  const getStatusBadge = (status: string) => {
    if (status === "active") {
      return (
        <span className="px-2 py-1 text-xs font-medium bg-[hsl(var(--status-success))]/10 text-[hsl(var(--status-success))] rounded-full">
          Active
        </span>
      );
    } else if (status === "idle") {
      return (
        <span className="px-2 py-1 text-xs font-medium bg-[hsl(var(--status-warning))]/10 text-[hsl(var(--status-warning))] rounded-full">
          Idle
        </span>
      );
    } else {
      return (
        <span className="px-2 py-1 text-xs font-medium bg-[hsl(var(--status-error))]/10 text-[hsl(var(--status-error))] rounded-full">
          Disconnected
        </span>
      );
    }
  };
  
  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase();
  };
  
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">Active Sessions</CardTitle>
        <div className="flex space-x-2">
          <Select 
            value={timeRange} 
            onValueChange={setTimeRange}
          >
            <SelectTrigger className="h-8 text-xs w-[130px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
          <button className="text-neutral-400 hover:text-neutral-500 p-1.5">
            <i className="ri-refresh-line"></i>
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="active-sessions-chart bg-neutral-50 rounded-md p-4 mb-6">
          {/* Chart visualization */}
          <svg width="100%" height="140" className="overflow-visible">
            {/* Grid lines */}
            <line x1="0" y1="0" x2="100%" y2="0" stroke="#e5e5e5" strokeWidth="1" />
            <line x1="0" y1="35" x2="100%" y2="35" stroke="#e5e5e5" strokeWidth="1" />
            <line x1="0" y1="70" x2="100%" y2="70" stroke="#e5e5e5" strokeWidth="1" />
            <line x1="0" y1="105" x2="100%" y2="105" stroke="#e5e5e5" strokeWidth="1" />
            <line x1="0" y1="140" x2="100%" y2="140" stroke="#e5e5e5" strokeWidth="1" />
            
            {/* Chart data */}
            <path 
              d="M0,105 L60,88 L120,75 L180,92 L240,70 L300,60 L360,50 L420,65 L480,45 L540,30 L600,42 L660,35 L720,50" 
              fill="none" 
              stroke="hsl(var(--primary))" 
              strokeWidth="2" 
            />
            <path 
              d="M0,105 L60,88 L120,75 L180,92 L240,70 L300,60 L360,50 L420,65 L480,45 L540,30 L600,42 L660,35 L720,50" 
              fill="url(#gradient)" 
              fillOpacity="0.2" 
            />
            
            {/* Session dots */}
            <circle cx="240" cy="70" r="4" fill="hsl(var(--primary))" className="session-dot" />
            <circle cx="420" cy="65" r="4" fill="hsl(var(--primary))" className="session-dot" />
            <circle cx="540" cy="30" r="4" fill="hsl(var(--primary))" className="session-dot" />
            <circle cx="660" cy="35" r="4" fill="hsl(var(--primary))" className="session-dot" />
            
            {/* Tooltips */}
            <g className="session-tooltip" transform="translate(240, 40)">
              <rect x="-60" y="-25" width="120" height="50" rx="4" fill="white" stroke="#e5e5e5" />
              <text x="0" y="-5" textAnchor="middle" fill="#323130" fontSize="12">User: alex@company.com</text>
              <text x="0" y="15" textAnchor="middle" fill="#605e5c" fontSize="11">Duration: 1h 24min</text>
            </g>
            
            {/* Gradient definition */}
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.5" />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
          
          {/* X-axis labels */}
          <div className="flex justify-between text-xs text-neutral-400 mt-2">
            <span>12 AM</span>
            <span>4 AM</span>
            <span>8 AM</span>
            <span>12 PM</span>
            <span>4 PM</span>
            <span>8 PM</span>
            <span>12 AM</span>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-neutral-50 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Destination</th>
                <th className="px-4 py-3">Connected</th>
                <th className="px-4 py-3">Duration</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {sessions.map((session) => (
                <tr key={session.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                        <span className="text-primary text-xs font-medium">{getInitials(session.user.name)}</span>
                      </div>
                      <div>
                        <p className="font-medium text-neutral-500">{session.user.name}</p>
                        <p className="text-xs text-neutral-400">{session.user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <p className="text-neutral-500">{session.connection.name}</p>
                    <p className="text-xs text-neutral-400">{session.connection.host}</p>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-neutral-500">
                    <p>{session.connectedTime}</p>
                    <p className="text-xs text-neutral-400">{session.connectedDate}</p>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-neutral-500">{session.duration}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {getStatusBadge(session.status)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <button 
                      className="text-neutral-400 hover:text-[hsl(var(--status-error))]"
                      onClick={() => handleTerminateSession(session.id)}
                      disabled={terminateSessionMutation.isPending}
                    >
                      <i className="ri-close-circle-line"></i>
                    </button>
                  </td>
                </tr>
              ))}
              
              {sessions.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-neutral-400">
                    No active sessions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
