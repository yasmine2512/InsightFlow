import DashboardLayout from "../components/Layout";
import { CreditCard, TrendingUp, Users, RefreshCw } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const stats = [
  { label: "Active Subscriptions", value: "2,845", icon: CreditCard, change: "+5.2%" },
  { label: "Monthly Recurring", value: "$86,400", icon: TrendingUp, change: "+12.1%" },
  { label: "Churn Rate", value: "2.3%", icon: RefreshCw, change: "-0.5%" },
  { label: "Avg Revenue/User", value: "$30.36", icon: Users, change: "+3.8%" },
];

const planData = [
  { name: "Starter Kit", value: 1200, color: "hsl(172 66% 50%)" },
  { name: "Pro Plan", value: 980, color: "hsl(243 75% 59%)" },
  { name: "Enterprise", value: 420, color: "hsl(280 72% 55%)" },
  { name: "API Access", value: 245, color: "hsl(38 92% 50%)" },
];

const subscribers = [
  { name: "Acme Corp", plan: "Enterprise", mrr: "$199", since: "Jan 2025", status: "Active" },
  { name: "TechStart Inc", plan: "Pro Plan", mrr: "$49", since: "Mar 2025", status: "Active" },
  { name: "Design Studio", plan: "Starter Kit", mrr: "$29", since: "Jun 2025", status: "Active" },
  { name: "DataFlow LLC", plan: "Enterprise", mrr: "$199", since: "Aug 2025", status: "Active" },
  { name: "CloudBase", plan: "Pro Plan", mrr: "$49", since: "Oct 2025", status: "Cancelling" },
  { name: "InnovateCo", plan: "Starter Kit", mrr: "$29", since: "Dec 2025", status: "Active" },
];

const statusColor = {
  Active: "bg-success/10 text-success",
  Cancelling: "bg-warning/10 text-warning",
};

export default function Subscriptions() {
  return (
      <div className="space-y-6">
        <div>
          <h1 className="font-heading text-2xl font-bold">Subscriptions</h1>
          <p className="text-sm text-muted-foreground">Monitor recurring revenue and subscriber health</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-card rounded-xl border border-border p-5 shadow-soft">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                  <s.icon className="w-4 h-4 text-muted-foreground" />
                </div>
                <span className="text-sm text-muted-foreground">{s.label}</span>
              </div>
              <div className="font-heading text-2xl font-bold">{s.value}</div>
              <span className="text-xs text-success">{s.change}</span>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="bg-card rounded-xl border border-border p-5 shadow-soft">
            <h3 className="font-heading font-semibold mb-4">Plan Distribution</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={planData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={4}>
                  {planData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-3 mt-2 justify-center">
              {planData.map((p) => (
                <div key={p.name} className="flex items-center gap-1.5 text-xs">
                  <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                  {p.name}
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 bg-card rounded-xl border border-border shadow-soft overflow-hidden">
            <div className="p-5 border-b border-border">
              <h3 className="font-heading font-semibold">Top Subscribers</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 font-medium text-muted-foreground">Company</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Plan</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">MRR</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Since</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {subscribers.map((s) => (
                    <tr key={s.name} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="p-4 font-medium">{s.name}</td>
                      <td className="p-4">{s.plan}</td>
                      <td className="p-4 font-medium">{s.mrr}</td>
                      <td className="p-4 text-muted-foreground">{s.since}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor[s.status]}`}>{s.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
  );
}