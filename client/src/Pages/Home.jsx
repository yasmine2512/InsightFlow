import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Package,
  ShoppingCart,
  Users,
  CreditCard,
  TrendingUp,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { useEffect, useState } from "react";
import vd from "../assets/vid1.mp4";

const API_URL = import.meta.env.VITE_API_URL;

const features = [
  {
    icon: BarChart3,
    title: "Business Analytics",
    desc: "Turn your business data into clear insights with revenue, sales, and performance analytics.",
  },
  {
    icon: ShoppingCart,
    title: "Order Management",
    desc: "Create, track, and manage orders from one centralized dashboard.",
  },
  {
    icon: Package,
    title: "Product & Inventory",
    desc: "Keep your products organized and monitor stock levels to avoid inventory problems.",
  },
  {
    icon: Users,
    title: "Customer Management",
    desc: "Manage customer information and keep your business relationships organized.",
  },
  {
    icon: CreditCard,
    title: "Subscriptions",
    desc: "Manage premium plans and subscriptions with integrated Stripe payments.",
  },
  {
    icon: TrendingUp,
    title: "Growth Insights",
    desc: "Understand revenue trends and business performance to make better decisions.",
  },
];

const stats = [
  { value: "Orders", label: "Centralized management" },
  { value: "Products", label: "Inventory tracking" },
  { value: "Customers", label: "Customer management" },
  { value: "Analytics", label: "Business insights" },
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
  const [backendReady, setBackendReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const wakeBackend = async () => {
      try {
        const response = await fetch(`${API_URL}/health`);

        if (response.ok && !cancelled) {
          setBackendReady(true);
        }
      } catch (error) {
        console.log("Backend is starting...");
      }
    };

    wakeBackend();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen relative w-full">
      {/* Backend status */}
      {!backendReady && (
        <div className="fixed bottom-5 right-5 z-[100] flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-3 shadow-elevated">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">
            Starting services...
          </span>
        </div>
      )}

      {backendReady && (
        <div className="fixed bottom-5 right-5 z-[100] flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-3 shadow-elevated">
          <CheckCircle2 className="w-4 h-4 text-green-500" />
          <span className="text-sm text-muted-foreground">
            All services ready
          </span>
        </div>
      )}

      {/* Nav */}
      <nav className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="container flex items-center justify-between h-16">
          <Link
            to="/"
            className="font-heading text-xl font-bold tracking-tight text-foreground"
          >
            <span className="text-primary">Insight</span>Flow
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </a>

            <a
              href="#overview"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Overview
            </a>

            <Link to="/login">
              <Button variant="ghost" size="sm">
                Sign in
              </Button>
            </Link>

            <Link to="/register">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="gradient-hero text-primary-foreground py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover -z-20"
          >
            <source src={vd} type="video/mp4" />
          </video>
        </div>

        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-4 py-2 mb-6">
              <BarChart3 className="w-4 h-4" />
              <span className="text-sm">
                Business management made simpler
              </span>
            </div>

            <h1 className="font-heading text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
              Run your business
              <br />
              <span>from one place</span>
            </h1>

            <p className="text-lg text-primary-foreground/70 mb-10 max-w-2xl mx-auto">
              InsightFlow helps businesses manage products, orders, customers,
              subscriptions, and analytics through one powerful dashboard.
            </p>

            <div className="flex items-center gap-4 justify-center">
              <Link to="/register">
                <Button
                  size="lg"
                  className="gradient-primary border-0 text-primary-foreground shadow-elevated hover:opacity-90 transition-opacity"
                >
                  Get Started
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>

              <Link to="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-primary-foreground/20 text-primary-foreground bg-transparent hover:bg-primary-foreground/10"
                >
                  Sign In
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Overview */}
      <section id="overview" className="py-16 border-b border-border">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                custom={i}
                variants={fade}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="font-heading text-2xl md:text-3xl font-bold">
                  {s.value}
                </div>

                <div className="text-sm text-muted-foreground mt-2">
                  {s.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24">
        <div className="container">
          <div className="text-center mb-16">
            <p className="text-primary font-medium mb-3">
              Everything in one dashboard
            </p>

            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
              Tools built for your business
            </h2>

            <p className="text-muted-foreground max-w-lg mx-auto">
              Manage your daily operations while getting the insights you need
              to understand how your business is performing.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                custom={i}
                variants={fade}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="p-6 rounded-xl bg-card border border-border shadow-card hover:shadow-elevated transition-shadow group"
              >
                <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <f.icon className="w-5 h-5 text-primary-foreground" />
                </div>

                <h3 className="font-heading font-semibold text-lg mb-2">
                  {f.title}
                </h3>

                <p className="text-sm text-muted-foreground leading-relaxed">
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 gradient-hero text-primary-foreground">
        <div className="container text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
            Ready to take control of your business?
          </h2>

          <p className="text-primary-foreground/70 mb-8 max-w-md mx-auto">
            Bring your products, orders, customers, and business analytics
            together with InsightFlow.
          </p>

          <Link to="/register">
            <Button
              size="lg"
              className="gradient-accent border-0 text-accent-foreground font-semibold hover:opacity-90"
            >
              Create Your Account
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-heading font-bold">
            <span className="text-primary">Insight</span>Flow
          </span>

          <p className="text-sm text-muted-foreground">
            © 2026 InsightFlow. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}