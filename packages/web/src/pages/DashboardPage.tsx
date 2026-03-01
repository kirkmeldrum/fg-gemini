import { useState, useEffect } from 'react';
import { Card, Badge } from './components';
import {
    ChefHat, CalendarDays, ShoppingBag, ArrowRight, Star,
    Flame, TrendingUp, Users, Clock, AlertTriangle,
    Sparkles, Leaf
} from 'lucide-react';
import {
    getRecipes,
    smartSearch,
    getInventory,
    getSearchStats,
    Recipe,
    SmartRecipeMatch,
    SearchStats,
    InventoryItem,
    getSocialFeed,
    Activity
} from '../lib/api';

const Dashboard = ({ onChangeView }: { onChangeView: (view: string, params?: any) => void }) => {
    const [highMatchRecipes, setHighMatchRecipes] = useState<SmartRecipeMatch[]>([]);
    const [trendingRecipes, setTrendingRecipes] = useState<Recipe[]>([]);
    const [newArrivals, setNewArrivals] = useState<Recipe[]>([]);
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [searchStats, setSearchStats] = useState<SearchStats | null>(null);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadDashboardData = async () => {
            setLoading(true);
            try {
                const [
                    smartResults,
                    allRecipes,
                    invData,
                    statsData,
                    feedData
                ] = await Promise.all([
                    smartSearch({ max_missing: 3 }),
                    getRecipes({ limit: 6 }),
                    getInventory(),
                    getSearchStats(),
                    getSocialFeed().catch(() => []) // Optional
                ]);

                setHighMatchRecipes(smartResults.slice(0, 2));
                setTrendingRecipes(allRecipes.items.slice(0, 3));
                setNewArrivals(allRecipes.items.slice(3, 6));
                setInventory(invData);
                setSearchStats(statsData);
                setActivities(feedData.slice(0, 2));
            } catch (err) {
                console.error('Failed to load dashboard data:', err);
            } finally {
                setLoading(false);
            }
        };

        loadDashboardData();
    }, []);

    // Derived stats
    const expiringCount = inventory.filter(i => {
        if (!i.expiration_date) return false;
        const expiry = new Date(i.expiration_date);
        const soon = new Date();
        soon.setDate(soon.getDate() + 3);
        return expiry <= soon;
    }).length;

    const shoppingCount = 0; // Will be implemented with REQ-009

    if (loading) {
        return (
            <div className="py-20 text-center text-slate-400 animate-pulse flex flex-col items-center gap-4">
                <ChefHat size={48} className="text-slate-200" />
                <span>Preparing your kitchen…</span>
            </div>
        );
    }

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
                        You have <span className="text-white font-semibold">{inventory.length} ingredients</span> in your pantry.
                        You can make <span className="text-white font-semibold">{searchStats?.fully_matched ?? 0} recipes</span> right now.
                    </p>
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={() => onChangeView('smart-search')}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 shadow-lg shadow-emerald-900/20"
                        >
                            <ChefHat size={20} /> Smart Search
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
                        <p className="text-xl font-bold text-slate-800">Check Your Plan</p>
                        <p className="text-sm text-slate-500 mt-1 capitalize">Keep your week organized</p>
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
                        {expiringCount > 0 && <Badge color="red">Action Needed</Badge>}
                    </div>
                    <h3 className="text-slate-500 font-medium text-sm">My Kitchen</h3>
                    <div className="mt-1">
                        <p className="text-xl font-bold text-slate-800">{inventory.length} items tracked</p>
                        <p className="text-sm text-slate-500 mt-1">{expiringCount} items expiring soon</p>
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
                            <button onClick={() => onChangeView('smart-search')} className="text-sm text-emerald-600 font-medium hover:underline">View All Matches</button>
                        </div>
                        {highMatchRecipes.length === 0 ? (
                            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                <p className="text-slate-500 text-sm">Add more items to your kitchen to see matches!</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {highMatchRecipes.map(recipe => (
                                    <Card key={recipe.id} className="flex flex-row overflow-hidden hover:shadow-md transition-shadow cursor-pointer group" onClick={() => onChangeView('recipe-detail', { slug: recipe.slug })}>
                                        <div className="w-1/3 relative">
                                            <img src={recipe.image_url || '/placeholder-recipe.jpg'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            <div className="absolute top-2 left-2">
                                                <Badge color="emerald">{recipe.coverage_percentage}% Match</Badge>
                                            </div>
                                        </div>
                                        <div className="w-2/3 p-4 flex flex-col justify-between">
                                            <div>
                                                <h3 className="font-bold text-slate-800 mb-1 line-clamp-1">{recipe.title}</h3>
                                                <div className="flex items-center gap-3 text-xs text-slate-500 mb-2">
                                                    <span className="flex items-center gap-1"><Clock size={12} /> {(recipe.prep_time || 0) + (recipe.cook_time || 0)}m</span>
                                                    <span className="flex items-center gap-1"><Users size={12} /> {recipe.servings || 0}</span>
                                                </div>
                                                <p className="text-xs text-slate-500 line-clamp-2">{recipe.description || 'No description available.'}</p>
                                            </div>
                                            <div className="mt-3 flex items-center text-xs text-slate-400">
                                                Missing: {recipe.missing_ingredients.length} ingredients
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Trending / Popular */}
                    <section>
                        <div className="flex items-center gap-2 mb-4">
                            <Flame className="text-orange-500" size={24} />
                            <h2 className="text-xl font-bold text-slate-800">Trending Now</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {trendingRecipes.map(recipe => (
                                <div key={recipe.id} className="group cursor-pointer" onClick={() => onChangeView('recipe-detail', { slug: recipe.slug })}>
                                    <div className="rounded-xl overflow-hidden mb-3 relative aspect-[4/3]">
                                        <img src={recipe.image_url || '/placeholder-recipe.jpg'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 pt-8">
                                            <div className="flex items-center gap-1 text-white text-xs">
                                                <Star size={12} className="fill-yellow-400 text-yellow-400" /> 4.9
                                            </div>
                                        </div>
                                    </div>
                                    <h3 className="font-bold text-slate-800 text-sm mb-1 group-hover:text-emerald-600 transition-colors">{recipe.title}</h3>
                                    <p className="text-xs text-slate-500">by Admin</p>
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
                            {activities.length === 0 ? (
                                <div className="p-8 text-center text-slate-500 text-sm italic">
                                    No recent activity to show. Connect with friends!
                                </div>
                            ) : (
                                activities.map((activity) => (
                                    <div key={activity.id} className="p-4 flex gap-4">
                                        <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
                                            {activity.avatar_url ? (
                                                <img src={activity.avatar_url} alt={activity.username} />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-emerald-100 text-emerald-600 font-bold uppercase">
                                                    {activity.username[0]}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-800">
                                                <span className="font-bold">@{activity.username}</span> {activity.action.replace('_', ' ')}
                                            </p>
                                            <p className="text-xs text-slate-500 mt-1">
                                                {new Date(activity.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
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

                    {/* Fresh Recipes */}
                    <section>
                        <div className="flex items-center gap-2 mb-4">
                            <TrendingUp className="text-purple-500" size={20} />
                            <h2 className="text-lg font-bold text-slate-800">New Arrivals</h2>
                        </div>
                        <div className="space-y-4">
                            {newArrivals.map(recipe => (
                                <div key={recipe.id} className="flex gap-3 group cursor-pointer" onClick={() => onChangeView('recipe-detail', { slug: recipe.slug })}>
                                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100">
                                        <img src={recipe.image_url || '/placeholder-recipe.jpg'} className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-800 line-clamp-1 group-hover:text-purple-600 transition-colors">{recipe.title}</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs text-slate-500">{recipe.cuisine || 'Global'}</span>
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

export default Dashboard;