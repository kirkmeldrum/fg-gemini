
import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, Check } from 'lucide-react';
import { Button, Input, Label, FacebookIcon, Card } from './components';

interface AuthProps {
  onLogin: () => void;
}

export default function Auth({ onLogin }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      setIsLoading(false);
      // In a real app, validation and API call here
      // For mock: just verify email isn't empty
      if (email.length > 3) {
        localStorage.setItem('foodgenie_token', 'mock_token_123');
        onLogin();
      } else {
        alert("Please enter a valid email");
      }
    }, 1000);
  };

  const handleFacebookLogin = () => {
    // Simulate Facebook Connect
    setIsLoading(true);
    setTimeout(() => {
      localStorage.setItem('foodgenie_token', 'fb_mock_token_456');
      onLogin();
    }, 800);
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      
      {/* Left Column: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-md space-y-8 animate-in slide-in-from-left-4 duration-700">
          
          <div className="text-center">
            <div className="inline-flex items-center gap-2 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-lime-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-emerald-500/30">
                F
                </div>
                <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-lime-600">
                FoodGenie
                </span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              {isLogin ? 'Welcome back, Chef!' : 'Join the Kitchen'}
            </h1>
            <p className="text-slate-500">
              {isLogin 
                ? 'Enter your details to access your recipes.' 
                : 'Create an account to start sharing your food.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-1">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <Input 
                    id="name" 
                    type="text" 
                    placeholder="Gordon Ramsay" 
                    className="pl-10" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="chef@example.com" 
                  className="pl-10" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <Label htmlFor="password">Password</Label>
                {isLogin && <a href="#" className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">Forgot password?</a>}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••" 
                  className="pl-10" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button className="w-full py-3 text-base shadow-lg shadow-emerald-900/10" disabled={isLoading}>
              {isLoading ? 'Processing...' : (
                <span className="flex items-center gap-2">
                  {isLogin ? 'Sign In' : 'Create Account'} <ArrowRight size={18} />
                </span>
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-slate-50 text-slate-500">Or continue with</span>
            </div>
          </div>

          <Button 
            variant="facebook" 
            className="w-full py-3" 
            onClick={handleFacebookLogin}
            disabled={isLoading}
          >
            <FacebookIcon className="mr-2" /> 
            {isLogin ? 'Log in with Facebook' : 'Sign up with Facebook'}
          </Button>

          <p className="text-center text-sm text-slate-600">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              onClick={() => setIsLogin(!isLogin)} 
              className="text-emerald-600 font-semibold hover:underline focus:outline-none"
            >
              {isLogin ? 'Sign up' : 'Log in'}
            </button>
          </p>
        </div>
      </div>

      {/* Right Column: Visuals (Hidden on mobile) */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 opacity-40">
            <img 
              src="https://images.unsplash.com/photo-1556910103-1c02745a30bf?auto=format&fit=crop&w=1600&q=80" 
              className="w-full h-full object-cover" 
              alt="Cooking Background"
            />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/90 to-slate-900/90"></div>
        
        <div className="relative z-10 max-w-lg p-12 text-white">
            <h2 className="text-4xl font-bold mb-6 leading-tight">
                Manage your kitchen,<br/>
                <span className="text-emerald-400">master your meals.</span>
            </h2>
            <div className="space-y-6">
                {[
                    "Track your pantry inventory automatically",
                    "Generate recipes based on what you have",
                    "Plan meals and automate shopping lists",
                    "Connect with other chefs in your network"
                ].map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                            <Check size={16} className="text-emerald-400" />
                        </div>
                        <p className="text-lg text-slate-200">{feature}</p>
                    </div>
                ))}
            </div>
            
            <div className="mt-12 flex items-center gap-4">
                <div className="flex -space-x-4">
                    {[1,2,3,4].map(i => (
                        <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-700 overflow-hidden">
                            <img src={`https://i.pravatar.cc/100?img=${i + 10}`} className="w-full h-full object-cover" />
                        </div>
                    ))}
                </div>
                <div className="text-sm">
                    <p className="font-bold">Join 10,000+ Chefs</p>
                    <p className="text-slate-400">Cooking smarter every day</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
