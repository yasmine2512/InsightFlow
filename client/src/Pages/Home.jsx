import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, BarChart3, Shield, Zap, Globe, Users, CreditCard } from "lucide-react";
import { Button } from "../components/ui/button";
// import bg from "../assets/image1.jpg"
import vd from "../assets/vid1.mp4"

const features = [
  { icon: BarChart3, title: "Real-time Analytics", desc: "Track every metric that matters with live dashboards." },
  { icon: Shield, title: "Enterprise Security", desc: "SOC2 compliant with end-to-end encryption." },
  { icon: Zap, title: "Lightning Fast", desc: "Sub-100ms response times across all endpoints." },
  { icon: Globe, title: "Global CDN", desc: "Deploy to 200+ edge locations worldwide." },
  { icon: Users, title: "Team Management", desc: "Fine-grained roles and permissions for your team." },
  { icon: CreditCard, title: "Flexible Billing", desc: "Usage-based pricing that scales with you." },
];

const stats = [
  { value: "10K+", label: "Active Users" },
  { value: "99.9%", label: "Uptime" },
  { value: "50M+", label: "API Calls/Day" },
  { value: "150+", label: "Countries" },
];
const fade = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
    },
  }),
};

export default function Index() {
  return (
    <div className="min-h-screen relative w-full">
      {/* Nav */}
      <nav className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="container flex items-center justify-between h-16">
          <Link to="/" className="font-heading text-xl font-bold tracking-tight text-foreground">
            <span className="text-primary">Insight</span>Flow
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#stats" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Stats</a>
            <Link to="/login"><Button variant="ghost" size="sm">Sign in</Button></Link>
            <Link to="/register"><Button size="sm">Get Started</Button></Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="gradient-hero text-primary-foreground py-32 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" >
        <video autoPlay loop muted className="absolute inset-0 w-full h-full object-cover -z-20">
    <source src={vd} />
  </video>
        </div>
        <div className="container relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="max-w-3xl mx-auto text-center">
            <h1 className="font-heading text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
              Scale your business<br />
              <span>without limits</span>
            </h1>
            <p className="text-lg text-primary-forground/70 mb-10 max-w-xl mx-auto">
              The all-in-one platform for modern teams. Manage products, orders, and subscriptions with powerful analytics.
            </p>
            <div className="flex items-center gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" className="gradient-primary border-0 text-primary-foreground shadow-elevated hover:opacity-90 transition-opacity">
                  Start Free Trial <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button size="lg" variant="outline" className="border-primary-foreground/20 text-primary-foreground bg-transparent hover:bg-primary-foreground/10">
                  View Demo
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section id="stats" className="py-16 border-b border-border">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <motion.div key={s.label} custom={i} variants={fade} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center">
                <div className="font-heading text-3xl md:text-4xl font-bold ">{s.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">Everything you need</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">Powerful tools designed to help you manage and grow your business efficiently.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div key={f.title} custom={i} variants={fade} initial="hidden" whileInView="visible" viewport={{ once: true }}
                className="p-6 rounded-xl bg-card border border-border shadow-card hover:shadow-elevated transition-shadow group">
                <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <f.icon className="w-5 h-5 text-primary-foreground" />
                </div>
                <h3 className="font-heading font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 gradient-hero text-primary-foreground">
        <div className="container text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-primary-foreground/70 mb-8 max-w-md mx-auto">Join thousands of teams already using InsightFlow to scale their operations.</p>
          <Link to="/register">
            <Button size="lg" className="gradient-accent border-0 text-accent-foreground font-semibold hover:opacity-90">
              Start Free Trial <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-heading font-bold"><span className="text-primary">Insight</span>Flow</span>
          <p className="text-sm text-muted-foreground">© 2026 InsightFlow. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
