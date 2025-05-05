import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

const Profile = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [initial, setInitial] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    age: "",
    phone: "",
    email: ""
  });
  const [form, setForm] = useState(initial);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        navigate("/signin");
        return;
      }
      // Try to fetch by id first, fallback to email
      let { data, error } = await supabase.from("users").select("first_name, middle_name, last_name, age, phone, email").eq("id", user.id).single();
      if (error || !data) {
        // fallback to email
        ({ data, error } = await supabase.from("users").select("first_name, middle_name, last_name, age, phone, email").eq("email", user.email).single());
      }
      if (data) {
        setInitial({
          first_name: data.first_name || "",
          middle_name: data.middle_name || "",
          last_name: data.last_name || "",
          age: data.age || "",
          phone: data.phone || "",
          email: data.email || user.email || ""
        });
        setForm({
          first_name: data.first_name || "",
          middle_name: data.middle_name || "",
          last_name: data.last_name || "",
          age: data.age || "",
          phone: data.phone || "",
          email: data.email || user.email || ""
        });
      } else {
        setInitial({
          first_name: "",
          middle_name: "",
          last_name: "",
          age: "",
          phone: "",
          email: user.email || ""
        });
        setForm({
          first_name: "",
          middle_name: "",
          last_name: "",
          age: "",
          phone: "",
          email: user.email || ""
        });
      }
      setLoading(false);
    };
    fetchProfile();
  }, [navigate]);

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: "Not authenticated", variant: "destructive" });
      setSaving(false);
      return;
    }
    // Upsert by email (or id if available)
    const { error } = await supabase.from("users").upsert([
      {
        email: form.email,
        first_name: form.first_name,
        middle_name: form.middle_name,
        last_name: form.last_name,
        age: form.age,
        phone: form.phone,
        id: user.id, // if id column is not PK, this is safe
        status: 'active',
      }
    ], { onConflict: "email" });
    setSaving(false);
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
    } else {
      setInitial(form);
      toast({ title: "Profile saved" });
    }
  };

  const handleCancel = () => {
    setForm(initial);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading profile...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={e => { e.preventDefault(); handleSave(); }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">First Name</label>
                <Input name="first_name" value={form.first_name} onChange={handleChange} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Middle Name</label>
                <Input name="middle_name" value={form.middle_name} onChange={handleChange} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Last Name</label>
                <Input name="last_name" value={form.last_name} onChange={handleChange} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Age</label>
                <Input name="age" type="date" value={form.age} onChange={handleChange} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Number</label>
                <Input name="phone" value={form.phone} onChange={handleChange} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input name="email" value={form.email} disabled />
              </div>
            </div>
            <div className="flex gap-4 justify-end mt-6">
              <Button type="button" variant="outline" onClick={handleCancel} disabled={saving}>Cancel</Button>
              <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile; 