import { useState, useEffect } from "react";
import DashboardLayout from "../components/Layout";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";
import { Switch } from "../components/ui/switch";
import { Separator } from "../components/ui/separator";
import axios from "axios";
export default function SettingsPage() {
  const [name, setFullname] = useState("");
  const [orgname, setOrganization] = useState("");
  const [initials, setInitials] = useState("??");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL;
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");
    async function fetchdata(){
      if (!userId) return;
     try{
      const response= await axios.get(`${API_URL}/api/auth/profile/${userId}`,{
          headers: { Authorization: `Bearer ${token}` },
        });
      console.log(response.data.name,response.data.orgname);
      const parts = (response.data.name || "").trim().split(" ");
        const ini = parts.length >= 2
          ? parts[0][0] + parts[parts.length - 1][0]
          : (parts[0]?.[0] ?? "?");
        setInitials(ini.toUpperCase());
        setFullname(response.data.name);
        setOrganization(response.data.organizationName);
     }
      catch(err){ setMessage({ type: "error", text: "Failed to load profile." })}
      finally{ setLoading(false);}}
    fetchdata();

  }, []);

  async function handleSave(){
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");
    if (!userId) return;
    setSaving(true);
    setMessage(null);
    try {
     const response= await axios.put(`${API_URL}/api/auth/profile/${userId}`,{name,orgname},{
          headers: { Authorization: `Bearer ${token}` },
        });

      const parts = response.data.name.trim().split(" ");
      const ini = parts.length >= 2
        ? parts[0][0] + parts[parts.length - 1][0]
        : (parts[0]?.[0] ?? "?");
      setInitials(ini.toUpperCase());
      setFullname(response.data.name);
      setOrganization(response.data.organizationName);
      setMessage({ type: "success", text: "Profile updated successfully." });
    } catch {
      setMessage({ type: "error", text: "Failed to save changes." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w">
      <div>
        <h1 className="font-heading text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account and preferences</p>
      </div>

      {/* Profile */}
      <div className="bg-card rounded-xl border border-border p-6 shadow-soft space-y-6">
        <h3 className="font-heading font-semibold">Profile</h3>

        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center text-xl font-bold text-primary-foreground">
            {initials}
          </div>
          <div>
            <Button variant="outline" size="sm">Change Avatar</Button>
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading profile…</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setFullname(e.target.value)}
                placeholder="Your full name"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="orgname">Organization</Label>
              <Input
                id="orgname"
                value={orgname}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="Your organization"
              />
            </div>
          </div>
        )}

        {message && (
          <p className={`text-sm ${message.type === "success" ? "text-green-600" : "text-destructive"}`}>
            {message.text}
          </p>
        )}

        <Button
          className="gradient-primary border-0 text-primary-foreground"
          onClick={handleSave}
          disabled={saving || loading}
        >
          {saving ? "Saving…" : "Save Changes"}
        </Button>
      </div>

      <Separator />

      {/* Notifications */}
      <div className="bg-card rounded-xl border border-border p-6 shadow-soft space-y-4">
        <h3 className="font-heading font-semibold">Notifications</h3>
        {[
          { label: "Email notifications", desc: "Receive updates about your orders", defaultChecked: true },
          { label: "Push notifications", desc: "Browser push notifications", defaultChecked: false },
          { label: "Marketing emails", desc: "Receive tips and product updates", defaultChecked: true },
          { label: "Security alerts", desc: "Important security notifications", defaultChecked: true },
        ].map((item) => (
          <div key={item.label} className="flex items-center justify-between py-2">
            <div>
              <div className="text-sm font-medium">{item.label}</div>
              <div className="text-xs text-muted-foreground">{item.desc}</div>
            </div>
            <Switch defaultChecked={item.defaultChecked} />
          </div>
        ))}
      </div>

      <Separator />

      {/* Danger Zone */}
      <div className="bg-card rounded-xl border border-destructive/30 p-6 shadow-soft space-y-4">
        <h3 className="font-heading font-semibold text-destructive">Danger Zone</h3>
        <p className="text-sm text-muted-foreground">
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>
        <Button variant="outline" className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground">
          Delete Account
        </Button>
      </div>
    </div>
  );
}