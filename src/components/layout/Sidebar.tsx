
import { Link, useLocation } from "react-router-dom";
import { useSidebar } from "./SidebarProvider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Mail, Package, Bell, Users, Package2, BarChart3 } from "lucide-react";

const NAV_ITEMS = [
  { name: "Dashboard", path: "/", icon: BarChart3 },
  { name: "Users", path: "/users", icon: Users },
  { name: "Products", path: "/products", icon: Package },
  { name: "Subscriptions", path: "/subscriptions", icon: Package2 },
  { name: "SMS Notifications", path: "/sms-notifications", icon: Mail },
  { name: "Push Notifications", path: "/push-notifications", icon: Bell },
];

const Sidebar = () => {
  const { collapsed, toggleSidebar } = useSidebar();
  const location = useLocation();

  return (
    <div
      className={cn(
        "h-screen bg-sidebar fixed left-0 top-0 z-40 flex flex-col border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        {!collapsed && (
          <div className="text-xl font-bold text-sidebar-foreground">
            SaaS Nexus
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground ml-auto"
        >
          {collapsed ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          )}
        </Button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-2 px-2">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <li key={item.path}>
                <Link to={item.path}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-3",
                      isActive
                        ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}
                  >
                    <Icon size={20} />
                    {!collapsed && <span>{item.name}</span>}
                  </Button>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start gap-3 bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            collapsed && "justify-center"
          )}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          {!collapsed && <span>Logout</span>}
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
