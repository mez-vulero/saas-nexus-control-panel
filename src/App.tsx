import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Products from "./pages/Products";
import Subscriptions from "./pages/Subscriptions";
import SMSNotifications from "./pages/SMSNotifications";
import PushNotifications from "./pages/PushNotifications";
import NotFound from "./pages/NotFound";
import Roles from './pages/Roles';
import Organizations from './pages/Organizations';
import Invoices from './pages/Invoices';
import NotificationDeliveries from './pages/NotificationDeliveries';
import ProductUsage from './pages/ProductUsage';
import AuditLogs from './pages/AuditLogs';
import SignIn from './pages/SignIn';
import Profile from './pages/Profile';
import { supabase } from "@/lib/supabaseClient";

// Update the title in the document
document.title = "Vulero - SaaS Management Platform";

const queryClient = new QueryClient();

function RequireAuth({ children }: { children: JSX.Element }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const getSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      setSession(data.session);
      setLoading(false);
    };
    getSession();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  if (!session) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }
  return children;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/signin" element={<SignIn />} />
          <Route
            path="/*"
            element={
              <RequireAuth>
                <Layout>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/users" element={<Users />} />
                    <Route path="/roles" element={<Roles />} />
                    <Route path="/organizations" element={<Organizations />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/subscriptions" element={<Subscriptions />} />
                    <Route path="/invoices" element={<Invoices />} />
                    <Route path="/notification-deliveries" element={<NotificationDeliveries />} />
                    <Route path="/product-usage" element={<ProductUsage />} />
                    <Route path="/audit-logs" element={<AuditLogs />} />
                    <Route path="/sms-notifications" element={<SMSNotifications />} />
                    <Route path="/push-notifications" element={<PushNotifications />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Layout>
              </RequireAuth>
            }
          />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
