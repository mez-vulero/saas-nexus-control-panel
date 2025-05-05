import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { SidebarProvider, useSidebar } from "./SidebarProvider";
import { cn } from "@/lib/utils";

const TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/users": "User Management",
  "/products": "Product Management",
  "/subscriptions": "Subscription Management",
  "/sms-notifications": "SMS Notifications",
  "/push-notifications": "Push Notifications",
};

const LayoutContent = ({ children }: { children: React.ReactNode }) => {
  const { collapsed, isMobile } = useSidebar();
  const location = useLocation();
  const title = TITLES[location.pathname] || "Not Found";

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return (
    <div className="min-h-screen bg-background flex flex-col lg:block">
      <Sidebar />
      <div className="flex flex-col">
        <Header title={title} />
        <main
          className={cn(
            "flex-1 transition-all duration-300 p-2 sm:p-4 md:p-6",
            isMobile ? "ml-0" : (collapsed ? "lg:ml-16" : "lg:ml-64")
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

const Layout = ({ children }: { children: React.ReactNode }) => (
  <SidebarProvider>
    <LayoutContent>{children}</LayoutContent>
  </SidebarProvider>
);

export default Layout;
