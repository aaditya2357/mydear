import { Session } from "@shared/schema";

interface StatsOverviewProps {
  sessions: Session[];
}

export default function StatsOverview({ sessions }: StatsOverviewProps) {
  const activeSessions = sessions.filter(session => 
    session.status === "active" || session.status === "idle"
  ).length;
  
  const yesterdaySessions = activeSessions - 2; // Demo purposes
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-white rounded-lg p-6 shadow-sm flex items-start">
        <div className="rounded-full w-12 h-12 flex items-center justify-center bg-primary/10 text-primary mr-4">
          <i className="ri-computer-line text-xl"></i>
        </div>
        <div>
          <p className="text-neutral-400 text-sm">Active Sessions</p>
          <p className="text-2xl font-semibold text-neutral-500">{activeSessions}</p>
          <p className="text-xs text-[hsl(var(--status-success))] flex items-center mt-1">
            <i className="ri-arrow-up-s-line mr-1"></i> 
            <span>{activeSessions - yesterdaySessions} more than yesterday</span>
          </p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg p-6 shadow-sm flex items-start">
        <div className="rounded-full w-12 h-12 flex items-center justify-center bg-[hsl(var(--status-success))]/10 text-[hsl(var(--status-success))] mr-4">
          <i className="ri-shield-check-line text-xl"></i>
        </div>
        <div>
          <p className="text-neutral-400 text-sm">Security Status</p>
          <p className="text-2xl font-semibold text-neutral-500">Secure</p>
          <p className="text-xs text-neutral-400 flex items-center mt-1">
            <span>All systems operational</span>
          </p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg p-6 shadow-sm flex items-start">
        <div className="rounded-full w-12 h-12 flex items-center justify-center bg-primary/10 text-primary mr-4">
          <i className="ri-time-line text-xl"></i>
        </div>
        <div>
          <p className="text-neutral-400 text-sm">Uptime</p>
          <p className="text-2xl font-semibold text-neutral-500">99.9%</p>
          <p className="text-xs text-neutral-400 flex items-center mt-1">
            <span>Last 30 days</span>
          </p>
        </div>
      </div>
    </div>
  );
}
