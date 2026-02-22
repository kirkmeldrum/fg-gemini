
import React from 'react';
import { LucideIcon, Menu, Home, Utensils, Calendar, ShoppingCart, Users, UserCircle, Search, Plus, X, Check, BookOpen } from 'lucide-react';

// --- UI Primitives ---

export const Button = ({ children, onClick, variant = 'primary', className = '', ...props }: any) => {
  const baseStyle = "px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 justify-center";
  const variants = {
    primary: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed",
    secondary: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100 disabled:opacity-50",
    danger: "bg-red-50 text-red-600 hover:bg-red-100",
    facebook: "bg-[#1877F2] text-white hover:bg-[#166fe5] shadow-sm"
  };
  return (
    <button className={`${baseStyle} ${variants[variant as keyof typeof variants]} ${className}`} onClick={onClick} {...props}>
      {children}
    </button>
  );
};

export const Card: React.FC<{ children?: React.ReactNode; className?: string; onClick?: () => void }> = ({ children, className = '', onClick }) => (
  <div onClick={onClick} className={`bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden ${className}`}>
    {children}
  </div>
);

export const Badge: React.FC<{ children?: React.ReactNode; color?: string }> = ({ children, color = 'emerald' }) => {
  const colors: Record<string, string> = {
    emerald: "bg-emerald-100 text-emerald-800",
    orange: "bg-orange-100 text-orange-800",
    red: "bg-red-100 text-red-800",
    slate: "bg-slate-100 text-slate-800"
  };
  // Fallback for custom colors or missing keys
  const colorClass = colors[color] || colors.emerald;
  
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${colorClass}`}>
      {children}
    </span>
  );
};

export const Label = ({ children, className = "", htmlFor }: { children?: React.ReactNode, className?: string, htmlFor?: string }) => (
  <label htmlFor={htmlFor} className={`block text-sm font-medium text-slate-700 mb-1 ${className}`}>
    {children}
  </label>
);

export const Input = ({ className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input 
    className={`w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-shadow ${className}`}
    {...props}
  />
);

export const TextArea = ({ className = "", ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea 
    className={`w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-shadow ${className}`}
    {...props}
  />
);

export const Modal = ({ isOpen, onClose, title, children }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white z-10">
          <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
};

// --- Custom Icons ---

export const FacebookIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047v-2.66c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
  </svg>
);

// --- Layout Components ---

const SidebarItem = ({ icon: Icon, label, active, onClick }: { icon: LucideIcon, label: string, active: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
      ${active ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
    `}
  >
    <Icon size={20} />
    {label}
  </button>
);

export const Layout = ({ children, currentView, onViewChange }: any) => {
  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col fixed h-full z-10">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-lime-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">
              F
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-lime-600">
              FoodGenie
            </span>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <SidebarItem icon={Home} label="Dashboard" active={currentView === 'dashboard'} onClick={() => onViewChange('dashboard')} />
          <SidebarItem icon={Utensils} label="My Kitchen" active={currentView === 'kitchen'} onClick={() => onViewChange('kitchen')} />
          <SidebarItem icon={Search} label="Browse Recipes" active={currentView === 'recipes' || currentView === 'add-recipe' || currentView === 'recipe-detail'} onClick={() => onViewChange('recipes')} />
          <SidebarItem icon={Calendar} label="Meal Planner" active={currentView === 'planner'} onClick={() => onViewChange('planner')} />
          <SidebarItem icon={ShoppingCart} label="Shopping List" active={currentView === 'shopping'} onClick={() => onViewChange('shopping')} />
          <SidebarItem icon={Users} label="Social Network" active={currentView === 'social'} onClick={() => onViewChange('social')} />
          <SidebarItem icon={BookOpen} label="Food Encyclopedia" active={currentView === 'encyclopedia'} onClick={() => onViewChange('encyclopedia')} />
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={() => onViewChange('profile')}
            className={`flex items-center gap-3 w-full p-2 rounded-lg transition-colors ${currentView === 'profile' ? 'bg-emerald-50' : 'hover:bg-slate-50'}`}
          >
            <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden">
                <img src="https://i.pravatar.cc/150?u=a042581f4e29026024d" alt="User" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-slate-700">Julia Wysocki</p>
              <p className="text-xs text-slate-500">Premium Member</p>
            </div>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-20 px-6 py-4 flex justify-between items-center md:hidden">
           <div className="font-bold text-emerald-600">FoodGenie</div>
           <Button variant="ghost" className="p-1"><Menu size={24}/></Button>
        </header>
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};
