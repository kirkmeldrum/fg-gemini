import React, { useState, useEffect } from 'react';
import { MapPin, Calendar, Edit2, Settings, ChefHat, Users, Bookmark, Save, Plus } from 'lucide-react';
import { Card, Button, Badge, Label, Input, TextArea } from './components';
import { api, User, Recipe } from './data';

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [userRecipes, setUserRecipes] = useState<Recipe[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'recipes' | 'settings'>('overview');
  
  // Settings Form State
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [diets, setDiets] = useState<string[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [allergyInput, setAllergyInput] = useState("");

  useEffect(() => {
    // Simulate fetching logged in user (ID 1)
    api.getUserProfile(1).then(userData => {
      setUser(userData);
      setBio(userData.bio || "");
      setLocation(userData.location || "");
      setDiets(userData.preferences?.diets || []);
      setAllergies(userData.preferences?.allergies || []);
    });

    api.getRecipes().then(allRecipes => {
      // Filter recipes authored by user ID 1
      setUserRecipes(allRecipes.filter(r => r.author.id === 1));
    });
  }, []);

  const handleSaveSettings = async () => {
    if (!user) return;
    
    const updatedUser = await api.updateProfile(user.id, {
      bio,
      location,
      preferences: {
        ...user.preferences,
        diets,
        allergies,
        dislikes: user.preferences?.dislikes || []
      }
    });
    
    setUser(updatedUser);
    alert("Profile Updated!");
  };

  const toggleDiet = (diet: string) => {
    if (diets.includes(diet)) {
      setDiets(diets.filter(d => d !== diet));
    } else {
      setDiets([...diets, diet]);
    }
  };

  const addAllergy = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && allergyInput.trim()) {
      e.preventDefault();
      if (!allergies.includes(allergyInput.trim())) {
        setAllergies([...allergies, allergyInput.trim()]);
      }
      setAllergyInput("");
    }
  };

  const removeAllergy = (allergy: string) => {
    setAllergies(allergies.filter(a => a !== allergy));
  };

  if (!user) return <div className="p-8 text-center">Loading Profile...</div>;

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="relative rounded-2xl overflow-hidden bg-white shadow-sm border border-slate-200">
        <div className="h-48 bg-gradient-to-r from-emerald-600 to-teal-500 relative">
            <div className="absolute inset-0 bg-black/10"></div>
        </div>
        <div className="px-8 pb-6 relative">
            <div className="flex flex-col md:flex-row justify-between items-end -mt-12 mb-4 gap-4">
                <div className="flex items-end gap-6">
                    <div className="w-32 h-32 rounded-2xl border-4 border-white overflow-hidden bg-slate-200 shadow-md">
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="mb-1">
                        <h1 className="text-2xl font-bold text-slate-800">{user.name}</h1>
                        <p className="text-slate-500 font-medium">@{user.name.toLowerCase().replace(' ', '')}</p>
                    </div>
                </div>
                <div className="flex gap-3 mb-1">
                    <Button variant="secondary" onClick={() => setActiveTab('settings')}>
                        <Edit2 size={16} /> Edit Profile
                    </Button>
                </div>
            </div>
            
            <p className="text-slate-600 max-w-2xl mb-6 leading-relaxed">
                {user.bio || "No bio yet."}
            </p>

            <div className="flex flex-wrap gap-6 text-sm text-slate-500 border-t border-slate-100 pt-6">
                {user.location && (
                    <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-slate-400" />
                        {user.location}
                    </div>
                )}
                <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-slate-400" />
                    {user.joined_date}
                </div>
                
                <div className="flex gap-6 ml-auto">
                    <div className="text-center">
                        <span className="block font-bold text-slate-800 text-lg">{user.stats?.recipes || 0}</span>
                        <span className="text-xs uppercase tracking-wider">Recipes</span>
                    </div>
                    <div className="text-center">
                        <span className="block font-bold text-slate-800 text-lg">{user.stats?.followers || 0}</span>
                        <span className="text-xs uppercase tracking-wider">Followers</span>
                    </div>
                    <div className="text-center">
                        <span className="block font-bold text-slate-800 text-lg">{user.stats?.following || 0}</span>
                        <span className="text-xs uppercase tracking-wider">Following</span>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        {[
            { id: 'overview', label: 'Overview', icon: UserCircle },
            { id: 'recipes', label: 'My Recipes', icon: ChefHat },
            { id: 'settings', label: 'Settings', icon: Settings },
        ].map(tab => {
            const Icon = tab.icon;
            return (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === tab.id 
                        ? 'border-emerald-500 text-emerald-600' 
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                >
                    {/* Note: UserCircle is missing from imports, replaced with generic div for now or import it */}
                    {tab.label}
                </button>
            )
        })}
      </div>

      {/* Tab Content */}
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
        {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 md:col-span-2">
                    <h3 className="font-bold text-slate-800 mb-4">Badges & Achievements</h3>
                    <div className="flex gap-4">
                        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center text-2xl" title="Early Adopter">🌟</div>
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-2xl" title="Recipe Master">👨‍🍳</div>
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-2xl" title="Health Nut">🥗</div>
                    </div>
                </Card>
                <Card className="p-6">
                    <h3 className="font-bold text-slate-800 mb-4">Dietary Profile</h3>
                    <div className="flex flex-wrap gap-2">
                        {user.preferences?.diets.map(d => <Badge key={d} color="emerald">{d}</Badge>)}
                        {user.preferences?.allergies.map(a => <Badge key={a} color="red">No {a}</Badge>)}
                        {(!user.preferences?.diets.length && !user.preferences?.allergies.length) && <span className="text-slate-400 text-sm">No preferences set</span>}
                    </div>
                </Card>
            </div>
        )}

        {activeTab === 'recipes' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userRecipes.map(recipe => (
                    <Card key={recipe.id} className="overflow-hidden group cursor-pointer hover:shadow-md transition-all">
                        <div className="h-40 overflow-hidden relative">
                            <img src={recipe.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        </div>
                        <div className="p-4">
                            <h3 className="font-bold text-slate-800 mb-1">{recipe.title}</h3>
                            <p className="text-xs text-slate-500 line-clamp-2">{recipe.description}</p>
                        </div>
                    </Card>
                ))}
                <div 
                    className="border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center p-8 text-slate-400 hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50 transition-all cursor-pointer min-h-[200px]"
                >
                    <Plus size={32} className="mb-2"/>
                    <span className="font-medium">Create New Recipe</span>
                </div>
            </div>
        )}

        {activeTab === 'settings' && (
            <Card className="max-w-2xl mx-auto p-8">
                <form onSubmit={(e) => { e.preventDefault(); handleSaveSettings(); }} className="space-y-8">
                    
                    {/* Personal Info */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-lg text-slate-800 border-b border-slate-100 pb-2">Public Profile</h3>
                        <div>
                            <Label>Bio</Label>
                            <TextArea 
                                rows={3} 
                                value={bio} 
                                onChange={(e) => setBio(e.target.value)} 
                                placeholder="Tell us about your cooking style..."
                            />
                        </div>
                        <div>
                            <Label>Location</Label>
                            <Input 
                                value={location} 
                                onChange={(e) => setLocation(e.target.value)} 
                                placeholder="City, State"
                            />
                        </div>
                    </div>

                    {/* Dietary Preferences */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-lg text-slate-800 border-b border-slate-100 pb-2">Dietary Preferences</h3>
                        <p className="text-sm text-slate-500">Select diets to improve recipe recommendations.</p>
                        <div className="grid grid-cols-2 gap-3">
                            {["Vegetarian", "Vegan", "Keto", "Paleo", "Gluten Free", "Dairy Free"].map(diet => (
                                <label key={diet} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${diets.includes(diet) ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:bg-slate-50'}`}>
                                    <input 
                                        type="checkbox" 
                                        className="rounded text-emerald-600 focus:ring-emerald-500"
                                        checked={diets.includes(diet)}
                                        onChange={() => toggleDiet(diet)}
                                    />
                                    <span className={`text-sm font-medium ${diets.includes(diet) ? 'text-emerald-900' : 'text-slate-700'}`}>{diet}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Allergies */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-lg text-slate-800 border-b border-slate-100 pb-2">Allergies & Restrictions</h3>
                        <div>
                            <Label>Add Allergy (Press Enter)</Label>
                            <Input 
                                value={allergyInput}
                                onChange={(e) => setAllergyInput(e.target.value)}
                                onKeyDown={addAllergy}
                                placeholder="e.g. Peanuts, Shellfish..."
                            />
                            <div className="flex flex-wrap gap-2 mt-3">
                                {allergies.map(allergy => (
                                    <span key={allergy} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm font-medium">
                                        {allergy}
                                        <button type="button" onClick={() => removeAllergy(allergy)} className="hover:text-red-900"><X size={14}/></button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <Button type="submit" className="px-8">
                            <Save size={18} /> Save Changes
                        </Button>
                    </div>
                </form>
            </Card>
        )}
      </div>
    </div>
  );
}

// Helper icon for tab
function UserCircle(props: any) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="10" r="3"/><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"/></svg>
    )
}

// Helper icon for X
function X(props: any) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
    )
}
