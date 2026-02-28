
import { useEffect, useState } from 'react';
import { Clock, Users, Search, SlidersHorizontal, CheckCircle, AlertCircle, ChefHat } from 'lucide-react';
import { Card, Button, Badge, Checkbox, RangeInput, Input } from './components';
import { smartSearch, getSearchStats, SmartRecipeMatch, SearchStats } from '../lib/api';

interface SmartSearchProps {
    onNavigate?: (view: string, params?: any) => void;
}

const CUISINES = ["Italian", "American", "Mexican", "Asian", "Mediterranean"];

export default function SmartSearchPage({ onNavigate }: SmartSearchProps) {
    const [recipes, setRecipes] = useState<SmartRecipeMatch[]>([]);
    const [stats, setStats] = useState<SearchStats | null>(null);
    const [showFilters] = useState(false);
    const [loading, setLoading] = useState(true);

    // Filter State
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCuisine, setSelectedCuisine] = useState<string>("");
    const [maxMissing, setMaxMissing] = useState(3);
    const [includePantry, setIncludePantry] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [results, currentStats] = await Promise.all([
                smartSearch({
                    q: searchQuery,
                    cuisine: selectedCuisine || undefined,
                    max_missing: maxMissing,
                    pantry: includePantry
                }),
                getSearchStats()
            ]);
            setRecipes(results);
            setStats(currentStats);
        } catch (err) {
            console.error('Failed to fetch smart search results:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchData();
        }, 400);
        return () => clearTimeout(timer);
    }, [searchQuery, selectedCuisine, maxMissing, includePantry]);

    const handleRecipeClick = (recipe: SmartRecipeMatch) => {
        if (onNavigate) {
            onNavigate('recipe-detail', { slug: recipe.slug });
        }
    };

    return (
        <div className="space-y-8">
            {/* Header with Stats */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-8 text-white shadow-xl overflow-hidden relative">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="space-y-2 text-center md:text-left">
                        <h1 className="text-3xl font-extrabold flex items-center justify-center md:justify-start gap-3">
                            <ChefHat size={32} />
                            What Can I Cook?
                        </h1>
                        <p className="text-emerald-50/80 max-w-md">
                            Smart search matches your kitchen inventory with our library of 48,000+ recipes.
                        </p>
                    </div>

                    <div className="flex gap-4 sm:gap-6 flex-wrap justify-center">
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center min-w-[100px]">
                            <div className="text-2xl font-bold">{stats?.fully_matched ?? 0}</div>
                            <div className="text-[10px] uppercase tracking-wider opacity-80">100% Match</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center min-w-[100px]">
                            <div className="text-2xl font-bold">{stats?.almost_there ?? 0}</div>
                            <div className="text-[10px] uppercase tracking-wider opacity-80">Almost There</div>
                        </div>
                    </div>
                </div>
                {/* Visual flair */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-400/10 rounded-full translate-y-1/2 -translate-x-1/4 blur-2xl pointer-events-none" />
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Filter Sidebar */}
                <div className={`lg:w-72 flex-shrink-0 space-y-8 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-8">
                        <div>
                            <h3 className="font-bold text-slate-800 mb-4 text-xs uppercase tracking-widest flex items-center gap-2">
                                <SlidersHorizontal size={14} className="text-emerald-600" />
                                Search Filters
                            </h3>
                            <Input
                                placeholder="Search by name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-slate-50 border-transparent focus:bg-white mb-4"
                            />
                        </div>

                        <div className="space-y-4">
                            <RangeInput
                                label="Max Missing Ingredients"
                                value={maxMissing}
                                min={0}
                                max={10}
                                unit=""
                                onChange={setMaxMissing}
                            />
                            <p className="text-[10px] text-slate-400 -mt-2">
                                {maxMissing === 0 ? "Only exact matches" : `Up to ${maxMissing} missing items`}
                            </p>
                        </div>

                        <div className="pt-4 border-t border-slate-50">
                            <h4 className="text-sm font-semibold text-slate-700 mb-3">Kitchen Settings</h4>
                            <div className="space-y-3">
                                <Checkbox
                                    label="Assume Pantry Staples"
                                    checked={includePantry}
                                    onChange={() => setIncludePantry(!includePantry)}
                                />
                                <p className="text-[10px] text-slate-400 ml-7 leading-relaxed">
                                    Include salt, pepper, oil, and eggs in your inventory by default.
                                </p>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-50">
                            <h4 className="text-sm font-semibold text-slate-700 mb-3">Cuisine</h4>
                            <select
                                className="w-full bg-slate-50 border-transparent rounded-xl px-4 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                                value={selectedCuisine}
                                onChange={(e) => setSelectedCuisine(e.target.value)}
                            >
                                <option value="">All Cuisines</option>
                                {CUISINES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 space-y-6">
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="bg-slate-100 rounded-3xl h-80 animate-pulse" />
                            ))}
                        </div>
                    ) : (recipes?.length ?? 0) === 0 ? (
                        <div className="py-24 text-center bg-white rounded-3xl border border-dashed border-slate-200 shadow-sm">
                            <Search size={64} className="mx-auto text-slate-200 mb-6" />
                            <h3 className="text-xl font-bold text-slate-800 mb-2">No matching recipes</h3>
                            <p className="text-slate-500 max-w-sm mx-auto">
                                We couldn't find any recipes within your current inventory and filter settings. Try increasing the "Max Missing" slider.
                            </p>
                            <Button variant="secondary" className="mt-8" onClick={() => setMaxMissing(5)}>
                                Expand Search Range
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {(recipes || []).map((recipe) => (
                                <Card
                                    key={recipe.id}
                                    className="group hover:border-emerald-300 transition-all duration-300 cursor-pointer flex flex-col hover:shadow-xl hover:-translate-y-1 overflow-hidden"
                                    onClick={() => handleRecipeClick(recipe)}
                                >
                                    <div className="aspect-[4/3] w-full overflow-hidden bg-slate-100 relative">
                                        <img
                                            src={recipe.image_url || '/placeholder-recipe.jpg'}
                                            alt={recipe.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                        />

                                        {/* Coverage Badge */}
                                        <div className={`absolute top-4 right-4 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold shadow-lg border flex items-center gap-1.5 
                                            ${recipe.coverage_percentage === 100
                                                ? 'bg-emerald-500/90 text-white border-emerald-400'
                                                : recipe.coverage_percentage >= 80
                                                    ? 'bg-amber-500/90 text-white border-amber-400'
                                                    : 'bg-white/90 text-slate-800 border-white/50'}`}
                                        >
                                            {recipe.coverage_percentage === 100 ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                                            {recipe.coverage_percentage}% Match
                                        </div>

                                        {recipe.cuisine && (
                                            <div className="absolute bottom-4 left-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded-lg text-[10px] font-bold text-white uppercase tracking-wider border border-white/10">
                                                {recipe.cuisine}
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-6 flex-1 flex flex-col space-y-4">
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-emerald-700 transition-colors line-clamp-1">{recipe.title}</h3>
                                            <div className="flex items-center gap-3 text-[10px] font-medium text-slate-400 uppercase tracking-tighter">
                                                <span className="flex items-center gap-1"><Clock size={12} /> {(recipe.prep_time || 0) + (recipe.cook_time || 0)} min</span>
                                                <span className="flex items-center gap-1"><Users size={12} /> {recipe.servings || 0} serving</span>
                                            </div>
                                        </div>

                                        <div className="flex-1">
                                            {recipe.coverage_percentage === 100 ? (
                                                <p className="text-emerald-600 text-sm font-medium flex items-center gap-2">
                                                    <CheckCircle size={16} /> Ready to cook now!
                                                </p>
                                            ) : (
                                                <div className="space-y-2">
                                                    <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Missing Ingredients:</p>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {(recipe.missing_ingredients || []).slice(0, 3).map((ing, idx) => (
                                                            <Badge key={idx} color="red" className="text-[10px]">
                                                                {ing}
                                                            </Badge>
                                                        ))}
                                                        {(recipe.missing_ingredients || []).length > 3 && (
                                                            <span className="text-[10px] text-slate-400 font-medium pl-1">
                                                                +{(recipe.missing_ingredients || []).length - 3} more
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <Button
                                            variant={recipe.coverage_percentage === 100 ? 'primary' : 'outline'}
                                            size="sm"
                                            className="w-full mt-2"
                                        >
                                            {recipe.coverage_percentage === 100 ? 'Cook Now' : 'View Recipe'}
                                        </Button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
