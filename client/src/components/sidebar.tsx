import { useLocation } from "wouter";
import { User } from "@shared/schema";

interface SidebarProps {
  user: User | null;
  onLogout: () => void;
}

export default function Sidebar({ user, onLogout }: SidebarProps) {
  const [location] = useLocation();
  
  const getInitials = (username: string) => {
    return username.substring(0, 2).toUpperCase();
  };
  
  const NavItem = ({ href, icon, label, active = false }: { 
    href: string; 
    icon: string; 
    label: string; 
    active?: boolean 
  }) => (
    <li>
      <a 
        href={href} 
        className={`flex items-center px-4 py-3 font-medium ${
          active 
            ? "text-primary bg-primary/10" 
            : "text-neutral-400 hover:bg-neutral-100"
        }`}
      >
        <i className={`${icon} mr-3 text-lg`}></i>
        <span>{label}</span>
      </a>
    </li>
  );
  
  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-neutral-200 h-full">
      <div className="p-4 border-b border-neutral-200 flex items-center">
        <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center mr-3">
          <i className="ri-computer-line text-white text-xl"></i>
        </div>
        <h1 className="text-lg font-semibold text-neutral-500">CloudConnect</h1>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1">
          <NavItem 
            href="#dashboard" 
            icon="ri-dashboard-line" 
            label="Dashboard" 
            active={true} 
          />
          <NavItem 
            href="#connections" 
            icon="ri-remote-control-line" 
            label="My Connections" 
          />
          <NavItem 
            href="#sessions" 
            icon="ri-computer-fill" 
            label="Active Sessions" 
          />
          <NavItem 
            href="#security" 
            icon="ri-shield-check-line" 
            label="Security" 
          />
          <NavItem 
            href="#settings" 
            icon="ri-settings-3-line" 
            label="Settings" 
          />
        </ul>
      </nav>
      
      {user && (
        <div className="p-4 border-t border-neutral-200">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-neutral-200 flex items-center justify-center mr-3">
              <span className="text-neutral-500 font-medium">{getInitials(user.username)}</span>
            </div>
            <div>
              <p className="font-medium text-neutral-500">{user.username}</p>
              <p className="text-sm text-neutral-400">Administrator</p>
            </div>
            <button 
              onClick={onLogout}
              className="ml-auto text-neutral-400 hover:text-neutral-500"
            >
              <i className="ri-logout-box-line"></i>
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
