import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
 const [error,setError] = useState(null);
 const navigate = useNavigate()
 const { login } = useAuth();
 const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const API_URL = import.meta.env.VITE_API_URL;

  async function handleLogin(){
    try{
     const response= await axios.post(`${API_URL}/api/auth/login`,{email,password});
     const {token,user} = response.data;
       login(token, user);
      navigate(`/dashboard`);
    }catch(err){
      if (err.response && err.response.status === 401) {
    setError("Wrong password!");
  } else if (err.response && err.response.status === 404) {
    setError("User not found!");
  } else {
    setError("Login failed. Please try again.");
  }
  console.log(error);
    }

  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 gradient-hero items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 30% 70%, hsl(243 75% 59% / 0.4) 0%, transparent 50%)" }} />
        <div className="relative z-10 max-w-md">
          <h1 className="font-heading text-4xl font-bold text-primary-foreground mb-4">Welcome back</h1>
          <p className="text-primary-foreground/60 text-lg">Sign in to access your dashboard and manage your business.</p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
          <Link to="/" className="font-heading text-xl font-bold tracking-tight mb-8 block">
            <span className="text-primary">Insight</span>Flow
          </Link>
          <h2 className="font-heading text-2xl font-bold mb-1">Sign in</h2>
          <p className="text-sm text-muted-foreground mb-8">
            Don't have an account? <Link to="/register" className="text-primary hover:underline">Create one</Link>
          </p>

          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="email" type="email" value={email} placeholder="you@example.com" className="pl-10" onChange={e => setEmail(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="password" type="password" value={password} placeholder="••••••••" className="pl-10" onChange={e => setPassword(e.target.value)}/>
              </div>
            </div>
            <div className="flex items-center justify-end">
              <a href="#" className="text-xs text-primary hover:underline">Forgot password?</a>
            </div>
              <Button className="w-full gradient-primary border-0 text-primary-foreground mt-2" onClick={handleLogin} >
                Sign In <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
  
          </form>

          <div className="mt-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">or continue with</span>
            <div className="flex-1 h-px bg-border" />
          </div>
          <div className="mt-4">
            <Button variant="outline" w-full size="sm" className="w-1/2"
            onClick={() => 
            { window.location.href ="http://localhost:5000/api/auth/google";}}>Google</Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}