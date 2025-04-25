import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SecurityOverview() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Security Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-neutral-500">Gateway Status</h4>
              <span className="text-[hsl(var(--status-success))] font-medium text-sm">Secure</span>
            </div>
            <div className="bg-neutral-100 rounded-full h-2 w-full">
              <div className="bg-[hsl(var(--status-success))] h-2 rounded-full" style={{ width: "100%" }}></div>
            </div>
            <p className="text-xs text-neutral-400 mt-2">All connections encrypted with TLS 1.3</p>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-neutral-500">Auth Status</h4>
              <span className="text-[hsl(var(--status-success))] font-medium text-sm">Active</span>
            </div>
            <div className="bg-neutral-100 rounded-full h-2 w-full">
              <div className="bg-[hsl(var(--status-success))] h-2 rounded-full" style={{ width: "100%" }}></div>
            </div>
            <p className="text-xs text-neutral-400 mt-2">MFA enabled for all users</p>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-neutral-500">Threat Detection</h4>
              <span className="text-[hsl(var(--status-success))] font-medium text-sm">No Threats</span>
            </div>
            <div className="bg-neutral-100 rounded-full h-2 w-full">
              <div className="bg-[hsl(var(--status-success))] h-2 rounded-full" style={{ width: "100%" }}></div>
            </div>
            <p className="text-xs text-neutral-400 mt-2">Last scan completed 2 hours ago</p>
          </div>
          
          <div className="p-4 bg-neutral-50 rounded-lg">
            <h4 className="font-medium text-neutral-500 mb-2">Recent Security Events</h4>
            <ul className="space-y-3">
              <li className="flex items-start">
                <i className="ri-shield-check-line text-[hsl(var(--status-success))] mt-0.5 mr-2"></i>
                <div>
                  <p className="text-sm text-neutral-500">Session audit log backup completed</p>
                  <p className="text-xs text-neutral-400">Today, 10:15 AM</p>
                </div>
              </li>
              <li className="flex items-start">
                <i className="ri-user-follow-line text-primary mt-0.5 mr-2"></i>
                <div>
                  <p className="text-sm text-neutral-500">New user account verified</p>
                  <p className="text-xs text-neutral-400">Today, 9:30 AM</p>
                </div>
              </li>
              <li className="flex items-start">
                <i className="ri-error-warning-line text-[hsl(var(--status-warning))] mt-0.5 mr-2"></i>
                <div>
                  <p className="text-sm text-neutral-500">Failed login attempt detected</p>
                  <p className="text-xs text-neutral-400">Yesterday, 4:45 PM</p>
                </div>
              </li>
            </ul>
            <a href="#security" className="block text-center text-primary text-sm font-medium mt-4 hover:underline">
              View All Events
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
