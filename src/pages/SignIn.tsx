import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Lock, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/components/ui/use-toast";

const SignIn = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSignUp, setShowSignUp] = useState(false);

  // Check if there are any users in the database
  useEffect(() => {
    const checkUsers = async () => {
      const { data, error } = await supabase.from("users").select("id").limit(1);
      if (error) return;
      setShowSignUp(!data || data.length === 0);
    };
    checkUsers();
  }, []);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      toast({ title: "Sign In Failed", description: error.message, variant: "destructive" });
    } else {
      window.location.href = "/";
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      toast({ title: "Sign Up Failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Sign Up Success", description: "Check your email to confirm your account." });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">Vulero Admin Panel</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignIn} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="pl-8"
                  placeholder="you@company.com"
                  disabled={loading}
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="pl-8"
                  placeholder="Password"
                  disabled={loading}
                />
              </div>
            </div>
            {error && <div className="text-red-500 text-sm text-center">{error}</div>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
              Sign In
            </Button>
            {showSignUp && (
              <Button type="button" variant="outline" className="w-full" onClick={handleSignUp} disabled={loading}>
                {loading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
                Sign Up
              </Button>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignIn; 