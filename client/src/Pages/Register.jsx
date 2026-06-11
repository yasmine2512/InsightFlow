import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, User, ArrowRight } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";

export default function Register() {
  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 gradient-hero items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 70% 30%, hsl(172 66% 50% / 0.4) 0%, transparent 50%)" }} />
        <div className="relative z-10 max-w-md">
          <h1 className="font-heading text-4xl font-bold text-primary-foreground mb-4">Start your journey</h1>
          <p className="text-primary-foreground/60 text-lg">Create an account and get access to all features with a 14-day free trial.</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
          <Link to="/" className="font-heading text-xl font-bold tracking-tight mb-8 block">
            <span className="text-primary">Insight</span>Flow
          </Link>
          <h2 className="font-heading text-2xl font-bold mb-1">Create account</h2>
          <p className="text-sm text-muted-foreground mb-8">
            Already have an account? <Link to="/login" className="text-primary hover:underline">Sign in</Link>
          </p>

          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="name" placeholder="John Doe" className="pl-10" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="email" type="email" placeholder="you@example.com" className="pl-10" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="password" type="password" placeholder="••••••••" className="pl-10" />
              </div>
            </div>
            <Link to="/dashboard">
              <Button className="w-full gradient-primary border-0 text-primary-foreground mt-2">
                Create Account <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </form>

          <p className="text-xs text-muted-foreground mt-6 text-center">
            By signing up, you agree to our Terms of Service and Privacy Policy.
          </p>
        </motion.div>
      </div>
    </div>
  );
}