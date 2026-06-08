import DashboardLayout from "../components/Layout";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";
import { Switch } from "../components/ui/switch";
import { Separator } from "../components/ui/separator";

export default function SettingsPage() {
  return (
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="font-heading text-2xl font-bold">Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your account and preferences</p>
        </div>

        {/* Profile */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-soft space-y-6">
          <h3 className="font-heading font-semibold">Profile</h3>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center text-xl font-bold text-primary-foreground">JD</div>
            <div>
              <Button variant="outline" size="sm">Change Avatar</Button>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" defaultValue="John" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" defaultValue="Doe" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="settingsEmail">Email</Label>
              <Input id="settingsEmail" type="email" defaultValue="john@example.com" />
            </div>
          </div>
          <Button className="gradient-primary border-0 text-primary-foreground">Save Changes</Button>
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
          <p className="text-sm text-muted-foreground">Permanently delete your account and all associated data. This action cannot be undone.</p>
          <Button variant="outline" className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground">
            Delete Account
          </Button>
        </div>
      </div>
  );
}