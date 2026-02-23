

import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Layout, Card, Button, Badge } from './components';
import MyKitchen from './MyKitchen';
import Recipes from './Recipes';
import RecipeDetail from './RecipeDetail';
import MealPlanner from './MealPlanner';
import ShoppingList from './ShoppingList';
import SocialNetwork from './SocialNetwork';
import AddRecipe from './AddRecipe';
import FoodEncyclopedia from './FoodEncyclopedia';
import Profile from './Profile';
import Auth from './Auth';
import SmartScanner from './SmartScanner';
import RecipeIndexer from './RecipeIndexer';
import { 
  ChefHat, CalendarDays, ShoppingBag, ArrowRight, Star, 
  Flame, TrendingUp, Users, Clock, AlertTriangle, ExternalLink,
  Sparkles, Leaf, BookOpen
} from 'lucide-react';
import { RECIPES, INITIAL_PANTRY, INITIAL_SHOPPING_LIST, INITIAL_MEAL_PLAN, Recipe, PantryItem, USERS, api } from './data';

const Dashboard = ({ onChangeView }: { onChangeView: (view: string, params?: any) => void }) => {
  
  // --- Smart Logic Calculation ---

  // 1. Calculate Recipe Matches based on Inventory
  const checkInventory = (foodId: number) => {
    return INITIAL_PANTRY.some(item => item.food_node_id === foodId);
  };

  const getRecipeMatchScore = (recipe: Recipe) => {
    if (recipe.ingredients.length === 0) return 0;
    const have = recipe.ingredients.filter(ing => checkInventory(ing.food_node_id)).length;
    return Math.round((have / recipe.ingredients.length) * 100);
  };

  const highMatchRecipes = [...RECIPES]
    .map(r => ({ ...r, score: getRecipeMatchScore(r) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 2);

  // 2. Kitchen Stats
  const expiringCount = INITIAL_PANTRY.filter(i => i.expiration_date).length; 
  const staleCount = 1; 

  // 3. Shopping Stats
  const shoppingCount = INITIAL_SHOPPING_LIST.filter(i => !i.checked).length;

  // 4. Meal Plan Logic (Next Meal)
  const nextMealItem = INITIAL_MEAL_PLAN[0]; 
  const nextMealRecipe = nextMealItem?.recipe_id ? RECIPES.find(r => r.id === nextMealItem.recipe_id) : null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Hero Welcome Section */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-900 text-white shadow-xl">
        <div className="absolute inset-0 opacity-40">
            <img src="https://images.unsplash.com/photo-1556910103-1c02745a30bf?auto=format&fit=crop&w=1600&q=80" className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent"></div>
        <div className="relative p-8 md:p-12 max-w-2xl">
          <div className="flex items-center gap-2 text-emerald-400 mb-2 font-semibold tracking-wide uppercase text-sm">
            <Sparkles size={16} /> Chef's Dashboard
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            Ready to cook something <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-lime-400">amazing?</span>
          </h1>
          <p className="text-slate-300 text-lg mb-8">
            You have <span className="text-white font-semibold">{expiringCount} ingredients</span> to use up. 
            We've found <span className="text-white font-semibold">{highMatchRecipes.length} recipes</span> matching your inventory.
          </p>
          <div className="flex flex-wrap gap-3">
            <button 
                onClick={() => onChangeView('recipes')}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 shadow-lg shadow-emerald-900/20"
            >
                <ChefHat size={20} /> Browse Recipes
            </button>
            <button 
                onClick={() => onChangeView('kitchen')}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 px-6 py-3 rounded-xl font-semibold transition-all"
            >
                Check Pantry
            </button>
          </div>
        </div>
      </section>

      {/* Actionable Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Meal Plan Highlight */}
        <div 
            onClick={() => onChangeView('planner')}
            className="group bg-gradient-to-br from-orange-50 to-white p-6 rounded-2xl border border-orange-100 shadow-sm hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <CalendarDays size={80} className="text-orange-500" />
            </div>
            <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                    <CalendarDays size={24} />
                </div>
                <Badge color="orange">Up Next</Badge>
            </div>
            <h3 className="text-slate-500 font-medium text-sm">Meal Plan</h3>
            <div className="mt-1">
                {nextMealRecipe ? (
                    <>
                        <p className="text-xl font-bold text-slate-800 line-clamp-1">{nextMealRecipe.title}</p>
                        <p className="text-sm text-slate-500 mt-1 capitalize">{nextMealItem.day} • {nextMealItem.slot}</p>
                    </>
                ) : (
                    <p className="text-xl font-bold text-slate-800">Nothing planned</p>
                )}
            </div>
            <div className="mt-4 text-orange-600 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                View Schedule <ArrowRight size={16} />
            </div>
        </div>

        {/* Shopping List Highlight */}
        <div 
            onClick={() => onChangeView('shopping')}
            className="group bg-gradient-to-br from-blue-50 to-white p-6 rounded-2xl border border-blue-100 shadow-sm hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <ShoppingBag size={80} className="text-blue-500" />
            </div>
            <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                    <ShoppingBag size={24} />
                </div>
                {shoppingCount > 0 && <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">{shoppingCount}</span>}
            </div>
            <h3 className="text-slate-500 font-medium text-sm">Shopping List</h3>
            <div className="mt-1">
                <p className="text-xl font-bold text-slate-800">{shoppingCount} items needed</p>
                <p className="text-sm text-slate-500 mt-1">Ready for your next trip</p>
            </div>
            <div className="mt-4 text-blue-600 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                View List <ArrowRight size={16} />
            </div>
        </div>

        {/* Kitchen/Inventory Highlight */}
        <div 
            onClick={() => onChangeView('kitchen')}
            className="group bg-gradient-to-br from-red-50 to-white p-6 rounded-2xl border border-red-100 shadow-sm hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <AlertTriangle size={80} className="text-red-500" />
            </div>
            <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                    <AlertTriangle size={24} />
                </div>
                <Badge color="red">Action Needed</Badge>
            </div>
            <h3 className="text-slate-500 font-medium text-sm">My Kitchen</h3>
            <div className="mt-1">
                <p className="text-xl font-bold text-slate-800">{expiringCount} expiring soon</p>
                <p className="text-sm text-slate-500 mt-1">{staleCount} items likely stale</p>
            </div>
            <div className="mt-4 text-red-600 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                Check Inventory <ArrowRight size={16} />
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Main Content Area (2/3 width on large screens) */}
        <div className="xl:col-span-2 space-y-8">
            
            {/* High Match / Cook What You Have */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Leaf className="text-emerald-500" size={24} />
                        <h2 className="text-xl font-bold text-slate-800">Cook What You Have</h2>
                    </div>
                    <button onClick={() => onChangeView('recipes')} className="text-sm text-emerald-600 font-medium hover:underline">View All</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {highMatchRecipes.map(recipe => (
                        <Card key={recipe.id} className="flex flex-row overflow-hidden hover:shadow-md transition-shadow cursor-pointer group" onClick={() => onChangeView('recipe-detail', { id: recipe.id })}>
                            <div className="w-1/3 relative">
                                <img src={recipe.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                <div className="absolute top-2 left-2">
                                    <Badge color="emerald">{recipe.score}% Match</Badge>
                                </div>
                            </div>
                            <div className="w-2/3 p-4 flex flex-col justify-between">
                                <div>
                                    <h3 className="font-bold text-slate-800 mb-1 line-clamp-1">{recipe.title}</h3>
                                    <div className="flex items-center gap-3 text-xs text-slate-500 mb-2">
                                        <span className="flex items-center gap-1"><Clock size={12}/> {recipe.prep_time}m</span>
                                        <span className="flex items-center gap-1"><Users size={12}/> {recipe.servings}</span>
                                    </div>
                                    <p className="text-xs text-slate-500 line-clamp-2">{recipe.description}</p>
                                </div>
                                <div className="mt-3 flex items-center text-xs text-slate-400">
                                    Missing: {recipe.ingredients.length - Math.round((recipe.score / 100) * recipe.ingredients.length)} ingredients
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </section>

            {/* Trending / Popular */}
            <section>
                <div className="flex items-center gap-2 mb-4">
                    <Flame className="text-orange-500" size={24} />
                    <h2 className="text-xl font-bold text-slate-800">Trending Now</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {RECIPES.slice(0, 3).map(recipe => (
                        <div key={recipe.id} className="group cursor-pointer" onClick={() => onChangeView('recipe-detail', { id: recipe.id })}>
                            <div className="rounded-xl overflow-hidden mb-3 relative aspect-[4/3]">
                                <img src={recipe.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 pt-8">
                                    <div className="flex items-center gap-1 text-white text-xs">
                                        <Star size={12} className="fill-yellow-400 text-yellow-400" /> 4.9
                                    </div>
                                </div>
                            </div>
                            <h3 className="font-bold text-slate-800 text-sm mb-1 group-hover:text-emerald-600 transition-colors">{recipe.title}</h3>
                            <p className="text-xs text-slate-500">by {recipe.author.name}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Network Activity */}
            <section>
                <div className="flex items-center gap-2 mb-4">
                    <Users className="text-blue-500" size={24} />
                    <h2 className="text-xl font-bold text-slate-800">From Your Network</h2>
                </div>
                <Card className="divide-y divide-slate-100">
                    {[1, 2].map((i) => (
                        <div key={i} className="p-4 flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
                                <img src={USERS[i].avatar} alt={USERS[i].name} />
                            </div>
                            <div>
                                <p className="text-sm text-slate-800">
                                    <span className="font-bold">{USERS[i].name}</span> cooked <span className="font-semibold text-emerald-600">Homemade Pancakes</span>
                                </p>
                                <p className="text-xs text-slate-500 mt-1">2 hours ago • 12 likes</p>
                            </div>
                        </div>
                    ))}
                    <button 
                        onClick={() => onChangeView('social')}
                        className="w-full py-3 text-sm text-slate-500 font-medium hover:bg-slate-50 transition-colors"
                    >
                        View Social Feed
                    </button>
                </Card>
            </section>

        </div>

        {/* Sidebar (Right Column) */}
        <div className="space-y-8">
            
            {/* Sponsored Content */}
            <section>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Sponsored</div>
                <Card className="overflow-hidden border-orange-100">
                    <div className="h-40 relative">
                        <img src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80" className="w-full h-full object-cover" />
                        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-0.5 rounded text-[10px] font-bold text-slate-500 uppercase tracking-wide">Ad</div>
                    </div>
                    <div className="p-4">
                        <h3 className="font-bold text-slate-800 mb-1">Perfect Pizza Night</h3>
                        <p className="text-xs text-slate-500 mb-3">Try the new Artisan Dough from Baker's Best. Crispy, airy, and delicious.</p>
                        <button className="w-full py-2 bg-orange-50 text-orange-700 rounded-lg text-sm font-semibold hover:bg-orange-100 transition-colors flex items-center justify-center gap-2">
                            Get Recipe <ExternalLink size={14} />
                        </button>
                    </div>
                </Card>
            </section>

            {/* Fresh Recipes */}
            <section>
                <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="text-purple-500" size={20} />
                    <h2 className="text-lg font-bold text-slate-800">New Arrivals</h2>
                </div>
                <div className="space-y-4">
                    {RECIPES.slice(1, 4).map(recipe => (
                        <div key={recipe.id} className="flex gap-3 group cursor-pointer" onClick={() => onChangeView('recipe-detail', { id: recipe.id })}>
                            <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                                <img src={recipe.image} className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-slate-800 line-clamp-1 group-hover:text-purple-600 transition-colors">{recipe.title}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="w-5 h-5 rounded-full bg-slate-200 overflow-hidden">
                                        <img src={recipe.author.avatar} />
                                    </div>
                                    <span className="text-xs text-slate-500">{recipe.author.name}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Quick Tips */}
            <Card className="bg-slate-900 text-white p-6 relative overflow-hidden">
                <div className="relative z-10">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mb-4 text-2xl">💡</div>
                    <h3 className="font-bold text-lg mb-2">Chef's Tip</h3>
                    <p className="text-sm text-slate-300">To keep herbs fresh longer, treat them like flowers! Trim the stems and place them in a glass of water in the fridge.</p>
                </div>
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-emerald-500 rounded-full blur-3xl opacity-20"></div>
                <div className="absolute -top-10 -left-10 w-32 h-32 bg-blue-500 rounded-full blur-3xl opacity-20"></div>
            </Card>

        </div>
      </div>
    </div>
  );
};

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [routeParams, setRouteParams] = useState<any>({});

  // Check for existing token
  useEffect(() => {
    const token = localStorage.getItem('foodgenie_token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('foodgenie_token');
    setIsAuthenticated(false);
    setCurrentView('dashboard');
  };

  const navigate = (view: string, params?: any) => {
    setCurrentView(view);
    setRouteParams(params || {});
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard onChangeView={navigate} />;
      case 'kitchen': return <MyKitchen />;
      case 'recipes': return <Recipes onNavigate={navigate} />;
      case 'recipe-detail': return <RecipeDetail recipeId={routeParams.id} onBack={() => navigate('recipes')} />;
      case 'add-recipe': return <AddRecipe onBack={() => navigate('recipes')} initialData={routeParams.initialData} />;
      case 'planner': return <MealPlanner />;
      case 'shopping': return <ShoppingList />;
      case 'social': return <SocialNetwork />;
      case 'encyclopedia': return <FoodEncyclopedia initialFoodId={routeParams.id} onNavigate={navigate} />;
      case 'profile': return <Profile />;
      case 'smart-scan': return <SmartScanner onNavigate={navigate} />;
      case 'recipe-indexer': return <RecipeIndexer onScanComplete={(data) => navigate('add-recipe', { initialData: data })} onCancel={() => navigate('recipes')} />;
      default: return <Dashboard onChangeView={navigate} />;
    }
  };

  if (!isAuthenticated) {
    return <Auth onLogin={handleLogin} />;
  }

  // Smart Scanner and Recipe Indexer take over the full screen, bypassing the main layout
  if (currentView === 'smart-scan' || currentView === 'recipe-indexer') {
      return renderView();
  }

  return (
    <Layout currentView={currentView} onViewChange={navigate}>
      {renderView()}
    </Layout>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);