
import { useEffect, useState } from 'react';
import { Clock, Users, Search, SlidersHorizontal, CheckCircle, AlertCircle, ChefHat, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, Button, Badge, Checkbox, RangeInput, Input } from './components';
import { smartSearch, getSearchStats, globalSearch, SmartRecipeMatch, SearchStats, GlobalSearchResult } from '../lib/api';

interface SmartSearchProps {
    onNavigate?: (view: string, params?: any) => void;
}

const CUISINES = ["Italian", "American", "Mexican", "Asian", "Mediterranean"];

export default function SmartSearchPage({ onNavigate }: SmartSearchProps) {
    const [recipes, setRecipes] = useState<SmartRecipeMatch[]>([]);
    const [stats, setStats] = useState<SearchStats | null>(null);
    const [globalResults, setGlobalResults] = useState<GlobalSearchResult | null>(null);
    const [mode, setMode] = useState<'smart' | 'global'>('smart');
    const [showFilters] = useState(false);
    const [loading, setLoading] = useState(true);

    // Filter State
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCuisine, setSelectedCuisine] = useState<string>("");
    const [maxMissing, setMaxMissing] = useState(3);
    const [includePantry, setIncludePantry] = useState(true);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [totalResults, setTotalResults] = useState(0);
    const pageSize = 24;

    const fetchData = async () => {
        setLoading(true);
        try {
            if (mode === 'smart') {
                const [response, currentStats] = await Promise.all([
                    smartSearch({
                        q: searchQuery,
                        cuisine: selectedCuisine || undefined,
                        max_missing: maxMissing,
                        pantry: includePantry,
                        limit: pageSize,
                        offset: (currentPage - 1) * pageSize
                    }),
                    getSearchStats()
                ]);
                setRecipes(response.items);
                setTotalResults(response.total);
                setStats(currentStats);
            } else {
                const results = await globalSearch(searchQuery);
                setGlobalResults(results);
            }
        } catch (err) {
            console.error('Failed to fetch search results:', err);
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
            setCurrentPage(1); // Reset to page 1 on filter change
            fetchData();
        }, 400);
        return () => clearTimeout(timer);
    }, [searchQuery, selectedCuisine, maxMissing, includePantry, mode]);

    // Handle page change
    useEffect(() => {
        if (currentPage > 1) fetchData();
    }, [currentPage]);

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

                    {/* Quick Mode Toggle for Mobile */}
                    <div className="lg:hidden flex bg-slate-100 p-1 rounded-xl mb-4">
                        <button
                            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${mode === 'smart' ? 'bg-white shadow-sm text-emerald-700' : 'text-slate-500'}`}
                            onClick={() => setMode('smart')}
                        >
                            Smart Match
                        </button>
                        <button
                            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${mode === 'global' ? 'bg-white shadow-sm text-emerald-700' : 'text-slate-500'}`}
                            onClick={() => setMode('global')}
                        >
                            Global Search
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 space-y-8">
                    {/* PC Mode Tabs */}
                    <div className="hidden lg:flex gap-8 border-b border-slate-100 mb-2">
                        <button
                            className={`pb-4 text-sm font-bold transition-all relative ${mode === 'smart' ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
                            onClick={() => setMode('smart')}
                        >
                            Match My Kitchen
                            {mode === 'smart' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500 rounded-full" />}
                        </button>
                        <button
                            className={`pb-4 text-sm font-bold transition-all relative ${mode === 'global' ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
                            onClick={() => setMode('global')}
                        >
                            Global Search
                            {mode === 'global' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500 rounded-full" />}
                        </button>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="bg-slate-100 rounded-3xl h-80 animate-pulse" />
                            ))}
                        </div>
                    ) : mode === 'smart' ? (
                        <>
                            {(recipes?.length ?? 0) === 0 ? (
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
                                                    <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-emerald-700 transition-colors line-clamp-1 flex items-center gap-2">
                                                        {recipe.title}
                                                        {recipe.is_gold_standard && (
                                                            <Star size={16} className="text-amber-400 fill-amber-400" />
                                                        )}
                                                    </h3>
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

                            {/* Pagination UI */}
                            {totalResults > pageSize && (
                                <div className="flex justify-center items-center gap-4 py-8 border-t border-slate-100">
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    >
                                        <ChevronLeft size={18} /> Previous
                                    </Button>
                                    <span className="text-sm font-medium text-slate-500">
                                        Page <span className="text-slate-900 font-bold">{currentPage}</span> of {Math.ceil(totalResults / pageSize)}
                                    </span>
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        disabled={currentPage >= Math.ceil(totalResults / pageSize)}
                                        onClick={() => setCurrentPage(p => p + 1)}
                                    >
                                        Next <ChevronRight size={18} />
                                    </Button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="space-y-12">
                            {/* Recipes Section */}
                            {(globalResults?.recipes?.length ?? 0) > 0 && (
                                <section className="space-y-6">
                                    <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-3">
                                        <ChefHat className="text-emerald-600" />
                                        Recipes Found
                                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100">{globalResults?.recipes.length}</Badge>
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                        {globalResults?.recipes.map(recipe => (
                                            <Card
                                                key={recipe.id}
                                                className="group cursor-pointer hover:shadow-xl transition-all"
                                                onClick={() => onNavigate && onNavigate('recipe-detail', { slug: recipe.slug })}
                                            >
                                                <div className="aspect-video relative overflow-hidden bg-slate-100">
                                                    <img src={recipe.image_url || '/placeholder-recipe.jpg'} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                                </div>
                                                <div className="p-4">
                                                    <h3 className="font-bold text-slate-800 line-clamp-1 group-hover:text-emerald-600 flex items-center gap-2">
                                                        {recipe.title}
                                                        {recipe.is_gold_standard && (
                                                            <Star size={14} className="text-amber-400 fill-amber-400" />
                                                        )}
                                                    </h3>
                                                    <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">{recipe.cuisine || 'International'}</p>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Ingredients / Packaged Foods Section */}
                            {(globalResults?.ingredients?.length ?? 0) > 0 && (
                                <section className="space-y-6">
                                    <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-3">
                                        <SlidersHorizontal className="text-blue-600" />
                                        Ingredients & Products
                                        <Badge className="bg-blue-50 text-blue-700 border-blue-100">{globalResults?.ingredients.length}</Badge>
                                    </h2>
                                    <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-4">
                                        {globalResults?.ingredients.map(ing => (
                                            <Card key={ing.id} className="p-4 flex flex-col items-center text-center hover:border-blue-300 transition-all cursor-pointer">
                                                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 mb-3">
                                                    <Search size={24} />
                                                </div>
                                                <h3 className="text-sm font-bold text-slate-800 line-clamp-2">{ing.name}</h3>
                                                {ing.is_pantry_staple && <Badge color="gray" className="mt-2 text-[8px]">Pantry Staple</Badge>}
                                            </Card>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Categories Section */}
                            {(globalResults?.categories?.length ?? 0) > 0 && (
                                <section className="space-y-6">
                                    <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-3">
                                        <SlidersHorizontal className="text-amber-600" />
                                        Food Categories
                                        <Badge className="bg-amber-50 text-amber-700 border-amber-100">{globalResults?.categories.length}</Badge>
                                    </h2>
                                    <div className="flex flex-wrap gap-3">
                                        {globalResults?.categories.map(cat => (
                                            <Badge key={cat.id} className="px-4 py-2 rounded-xl bg-amber-50 text-amber-800 border-amber-100 hover:bg-amber-100 cursor-pointer transition-all">
                                                {cat.name}
                                            </Badge>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {(!globalResults || (globalResults.recipes.length === 0 && globalResults.ingredients.length === 0 && globalResults.categories.length === 0)) && (
                                <div className="py-24 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                                    <Search size={64} className="mx-auto text-slate-200 mb-6" />
                                    <h3 className="text-xl font-bold text-slate-800">No results found</h3>
                                    <p className="text-slate-500 max-w-sm mx-auto mt-2">Try searching for ingredients like "Chicken", "Pasta", or general terms like "Dinner".</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
