import { useEffect, useState } from 'react';
import { Clock, Users, Search, SlidersHorizontal, Plus, Zap } from 'lucide-react';
import { Card, Button, Badge, Checkbox, RangeInput, Input } from './components';
import { getRecipes, Recipe } from '../lib/api';

interface RecipesProps {
    onNavigate?: (view: string, params?: any) => void;
}

const CUISINES = ["Italian", "American", "Mexican", "Asian", "Mediterranean"];
const DIETS = ["Vegetarian", "Vegan", "Gluten Free", "Low Carb", "Healthy", "Breakfast"];

export default function Recipes({ onNavigate }: RecipesProps) {
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [showFilters, setShowFilters] = useState(false);
    const [loading, setLoading] = useState(true);

    // Filter State
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
    const [selectedDiets, setSelectedDiets] = useState<string[]>([]);
    const [maxTime, setMaxTime] = useState(60);

    const fetchRecipes = async () => {
        setLoading(true);
        try {
            const results = await getRecipes({
                query: searchQuery,
                cuisine: selectedCuisines.length === 1 ? selectedCuisines[0] : undefined,
                limit: 24,
            });
            setRecipes(results.items);
        } catch (err) {
            console.error('Failed to fetch recipes:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecipes();
    }, []);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchRecipes();
        }, 400);
        return () => clearTimeout(timer);
    }, [searchQuery, selectedCuisines, selectedDiets, maxTime]);

    const handleRecipeClick = (recipe: Recipe) => {
        if (onNavigate) {
            onNavigate('recipe-detail', { slug: recipe.slug });
        }
    };

    const toggleFilter = (list: string[], setList: (l: string[]) => void, item: string) => {
        if (list.includes(item)) setList(list.filter(i => i !== item));
        else setList([...list, item]);
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6">

            {/* Filter Sidebar */}
            <div className={`lg:w-64 flex-shrink-0 space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                <div className="flex items-center justify-between lg:hidden mb-4">
                    <h2 className="font-bold text-lg">Filters</h2>
                    <button onClick={() => setShowFilters(false)} className="text-slate-500">Close</button>
                </div>

                <div>
                    <h3 className="font-bold text-slate-800 mb-3 text-sm uppercase tracking-wide">Cuisine</h3>
                    <div className="space-y-2">
                        {CUISINES.map(c => (
                            <Checkbox
                                key={c}
                                label={c}
                                checked={selectedCuisines.includes(c)}
                                onChange={() => toggleFilter(selectedCuisines, setSelectedCuisines, c)}
                            />
                        ))}
                    </div>
                </div>

                <div className="border-t border-slate-100 pt-6">
                    <h3 className="font-bold text-slate-800 mb-3 text-sm uppercase tracking-wide">Dietary</h3>
                    <div className="space-y-2">
                        {DIETS.map(d => (
                            <Checkbox
                                key={d}
                                label={d}
                                checked={selectedDiets.includes(d)}
                                onChange={() => toggleFilter(selectedDiets, setSelectedDiets, d)}
                            />
                        ))}
                    </div>
                </div>

                <div className="border-t border-slate-100 pt-6">
                    <RangeInput
                        label="Max Prep Time"
                        value={maxTime}
                        min={10}
                        max={120}
                        unit="min"
                        onChange={setMaxTime}
                    />
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 space-y-6">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Browse Recipes</h1>
                        <p className="text-slate-500">Discover and explore thousands of delicious meals.</p>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <Input
                                placeholder="Search recipes..."
                                className="pl-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Button variant="secondary" className="lg:hidden" onClick={() => setShowFilters(!showFilters)}>
                            <SlidersHorizontal size={18} />
                        </Button>
                        {onNavigate && (
                            <div className="flex gap-2">
                                <Button variant="secondary" onClick={() => onNavigate('clipper')} className="whitespace-nowrap">
                                    <Zap size={18} className="text-amber-500 fill-amber-500" /> <span className="hidden md:inline">Import</span>
                                </Button>
                                <Button onClick={() => onNavigate('add-recipe')} className="whitespace-nowrap">
                                    <Plus size={18} /> <span className="hidden md:inline">Create</span>
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Active Filters Display */}
                {(selectedCuisines.length > 0 || selectedDiets.length > 0) && (
                    <div className="flex flex-wrap gap-2">
                        {[...selectedCuisines, ...selectedDiets].map(tag => (
                            <Badge key={tag} color="slate">
                                {tag} <button onClick={() => {
                                    if (selectedCuisines.includes(tag)) toggleFilter(selectedCuisines, setSelectedCuisines, tag);
                                    else toggleFilter(selectedDiets, setSelectedDiets, tag);
                                }} className="ml-1 hover:text-red-500">×</button>
                            </Badge>
                        ))}
                        <button
                            onClick={() => { setSelectedCuisines([]); setSelectedDiets([]); }}
                            className="text-xs text-emerald-600 hover:underline px-2"
                        >
                            Clear All
                        </button>
                    </div>
                )}

                {loading ? (
                    <div className="py-20 text-center text-slate-400">Loading recipes...</div>
                ) : recipes.length === 0 ? (
                    <div className="py-20 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        <Search size={48} className="mx-auto text-slate-300 mb-4" />
                        <h3 className="text-lg font-medium text-slate-900">No recipes found</h3>
                        <p className="text-slate-500">Try adjusting your filters or search terms.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {recipes.map((recipe: Recipe) => (
                            <Card key={recipe.id} className="group hover:border-emerald-200 transition-colors cursor-pointer flex flex-col" onClick={() => handleRecipeClick(recipe)}>
                                <div className="aspect-video w-full overflow-hidden bg-slate-100 relative">
                                    <img
                                        src={recipe.image_url || '/placeholder-recipe.jpg'}
                                        alt={recipe.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    {recipe.cuisine && (
                                        <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur px-2 py-1 rounded text-[10px] font-bold text-white uppercase tracking-wider">
                                            {recipe.cuisine}
                                        </div>
                                    )}
                                </div>
                                <div className="p-5 flex-1 flex flex-col">
                                    <h3 className="text-lg font-bold text-slate-800 mb-2 leading-tight">{recipe.title}</h3>

                                    <p className="text-sm text-slate-500 line-clamp-2 mb-4">
                                        {recipe.description || "No description available."}
                                    </p>

                                    <div className="flex items-center gap-4 text-xs text-slate-500 mt-auto pt-2 border-t border-slate-100">
                                        <div className="flex items-center gap-1"><Clock size={14} /> {recipe.prep_time + recipe.cook_time}m</div>
                                        <div className="flex items-center gap-1"><Users size={14} /> {recipe.servings}</div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
