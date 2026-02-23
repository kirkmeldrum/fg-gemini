

import React from 'react';
import { LucideIcon, Menu, Home, Utensils, Calendar, ShoppingCart, Users, Search, X, Check, BookOpen, Scan, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

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
    slate: "bg-slate-100 text-slate-800",
    blue: "bg-blue-100 text-blue-800"
  };
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

// New: Checkbox Component
export const Checkbox = ({ label, checked, onChange }: { label: string, checked: boolean, onChange: (checked: boolean) => void }) => (
  <label className="flex items-center gap-2 cursor-pointer group">
    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${checked ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 bg-white group-hover:border-emerald-300'
      }`}>
      {checked && <Check size={12} strokeWidth={3} />}
    </div>
    <span className={`text-sm ${checked ? 'text-slate-900 font-medium' : 'text-slate-600'}`}>{label}</span>
    <input type="checkbox" className="hidden" checked={checked} onChange={e => onChange(e.target.checked)} />
  </label>
);

// New: Range Input Component
export const RangeInput = ({ label, value, min, max, unit, onChange }: { label: string, value: number, min: number, max: number, unit: string, onChange: (val: number) => void }) => (
  <div>
    <div className="flex justify-between items-center mb-1">
      <Label className="mb-0">{label}</Label>
      <span className="text-sm font-medium text-emerald-600">{value} {unit}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      value={value}
      onChange={e => onChange(parseInt(e.target.value))}
      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
    />
  </div>
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

export const FacebookIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047v-2.66c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
  </svg>
);

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

export const Layout = ({ children, currentView, onViewChange, onLogout }: any) => {
  const { user } = useAuth();
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
          <SidebarItem icon={Search} label="Browse Recipes" active={currentView === 'recipes' || currentView === 'add-recipe' || currentView === 'recipe-detail' || currentView === 'recipe-indexer'} onClick={() => onViewChange('recipes')} />
          <SidebarItem icon={Calendar} label="Meal Planner" active={currentView === 'planner'} onClick={() => onViewChange('planner')} />
          <SidebarItem icon={ShoppingCart} label="Shopping List" active={currentView === 'shopping'} onClick={() => onViewChange('shopping')} />
          <SidebarItem icon={Users} label="Social Network" active={currentView === 'social'} onClick={() => onViewChange('social')} />
          <SidebarItem icon={BookOpen} label="Food Encyclopedia" active={currentView === 'encyclopedia'} onClick={() => onViewChange('encyclopedia')} />

          <div className="pt-4 mt-4 border-t border-slate-100">
            <SidebarItem icon={Scan} label="Smart Scan" active={currentView === 'smart-scan'} onClick={() => onViewChange('smart-scan')} />
          </div>
        </nav>

        <div className="p-4 border-t border-slate-100 space-y-1">
          <button
            onClick={() => onViewChange('profile')}
            className={`flex items-center gap-3 w-full p-2 rounded-lg transition-colors ${currentView === 'profile' ? 'bg-emerald-50' : 'hover:bg-slate-50'}`}
          >
            <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
              {user?.avatarUrl
                ? <img src={user.avatarUrl} alt={user.firstName} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs font-bold bg-emerald-100 text-emerald-700">{user?.firstName?.[0]}{user?.lastName?.[0]}</div>
              }
            </div>
            <div className="text-left min-w-0">
              <p className="text-sm font-medium text-slate-700 truncate">{user ? `${user.firstName} ${user.lastName}` : '…'}</p>
              <p className="text-xs text-slate-500 capitalize">{user?.role ?? 'user'}</p>
            </div>
          </button>
          {onLogout && (
            <button
              onClick={onLogout}
              className="flex items-center gap-3 w-full px-2 py-1.5 rounded-lg text-sm text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <LogOut size={16} /> Sign out
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 mb-16 md:mb-0">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-20 px-6 py-4 flex justify-between items-center md:hidden">
          <div className="font-bold text-emerald-600">FoodGenie</div>
          <Button variant="ghost" className="p-1"><Menu size={24} /></Button>
        </header>
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around p-2 z-50">
        <button onClick={() => onViewChange('dashboard')} className={`p-2 flex flex-col items-center text-xs ${currentView === 'dashboard' ? 'text-emerald-600' : 'text-slate-400'}`}>
          <Home size={20} /> Home
        </button>
        <button onClick={() => onViewChange('kitchen')} className={`p-2 flex flex-col items-center text-xs ${currentView === 'kitchen' ? 'text-emerald-600' : 'text-slate-400'}`}>
          <Utensils size={20} /> Kitchen
        </button>
        <button onClick={() => onViewChange('smart-scan')} className="p-2 -mt-8 flex flex-col items-center">
          <div className="w-14 h-14 bg-emerald-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-600/30 border-4 border-slate-50">
            <Scan size={24} />
          </div>
        </button>
        <button onClick={() => onViewChange('recipes')} className={`p-2 flex flex-col items-center text-xs ${currentView === 'recipes' ? 'text-emerald-600' : 'text-slate-400'}`}>
          <Search size={20} /> Recipes
        </button>
        <button onClick={() => onViewChange('profile')} className={`p-2 flex flex-col items-center text-xs ${currentView === 'profile' ? 'text-emerald-600' : 'text-slate-400'}`}>
          <Users size={20} /> Profile
        </button>
      </div>
    </div>
  );
};