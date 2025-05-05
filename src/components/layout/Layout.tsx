
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { SidebarProvider } from "./SidebarProvider";
import { cn } from "@/lib/utils";

const TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/users": "User Management",
  "/products": "Product Management",
  "/subscriptions": "Subscription Management",
  "/sms-notifications": "SMS Notifications",
  "/push-notifications": "Push Notifications",
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const title = TITLES[location.pathname] || "Not Found";

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background">
        <Sidebar />
        <div className="flex flex-col">
          <Header title={title} />
          <main
            className={cn(
              "flex-1 transition-all duration-300 p-4 md:p-6",
              "lg:ml-16"
            )}
          >
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
