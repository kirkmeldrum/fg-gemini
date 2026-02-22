
import React, { useEffect, useState } from 'react';
import { Clock, Users, ChevronRight, CheckCircle2, XCircle, Filter, Plus, Search, Flame, SlidersHorizontal } from 'lucide-react';
import { Card, Button, Badge, Checkbox, RangeInput, Input } from './components';
import { api, Recipe, PantryItem, FoodNode } from './data';

interface RecipesProps {
  onNavigate?: (view: string, params?: any) => void;
}

const CUISINES = ["Italian", "American", "Mexican", "Asian", "Mediterranean"];
const DIETS = ["Vegetarian", "Vegan", "Gluten Free", "Low Carb", "Healthy", "Breakfast"];

export default function Recipes({ onNavigate }: RecipesProps) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [pantry, setPantry] = useState<PantryItem[]>([]);
  const [foodNodes, setFoodNodes] = useState<FoodNode[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);

  // Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [selectedDiets, setSelectedDiets] = useState<string[]>([]);
  const [maxTime, setMaxTime] = useState(60);
  const [maxCalories, setMaxCalories] = useState(1000);

  const fetchRecipes = async () => {
    setLoading(true);
    const filterParams = {
        cuisine: selectedCuisines.length === 1 ? selectedCuisines[0] : undefined, // Simple single selection logic for mock
        dietary: selectedDiets,
        maxTime,
        maxCalories
    };
    const results = await api.searchRecipes(searchQuery, filterParams);
    setRecipes(results);
    setLoading(false);
  };

  useEffect(() => {
    api.getPantry().then(setPantry);
    api.getFoodNodes().then(setFoodNodes);
    fetchRecipes();
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
        fetchRecipes();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedDiets, maxTime, maxCalories]);

  const getFoodName = (id: number) => foodNodes.find(i => i.id === id)?.name || "Unknown";

  const calculateStockPercentage = (recipe: Recipe) => {
    if (recipe.ingredients.length === 0) return 0;
    const have = recipe.ingredients.filter(ing => api.checkInventoryMatch(ing.food_node_id, pantry)).length;
    return Math.round((have / recipe.ingredients.length) * 100);
  };

  const handleRecipeClick = (recipe: Recipe) => {
    if (onNavigate) {
        onNavigate('recipe-detail', { id: recipe.id });
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

        <div className="border-t border-slate-100 pt-6">
            <RangeInput 
                label="Max Calories" 
                value={maxCalories} 
                min={100} 
                max={1500} 
                unit="kcal" 
                onChange={setMaxCalories} 
            />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 space-y-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Browse Recipes</h1>
                <p className="text-slate-500">Find meals based on what you have.</p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <Input 
                        placeholder="Search by name, ingredient..." 
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Button variant="secondary" className="lg:hidden" onClick={() => setShowFilters(!showFilters)}>
                    <SlidersHorizontal size={18} />
                </Button>
                {onNavigate && (
                    <Button onClick={() => onNavigate('add-recipe')} className="whitespace-nowrap">
                        <Plus size={18} /> <span className="hidden md:inline">Create</span>
                    </Button>
                )}
            </div>
        </div>

        {/* Active Filters Display */}
        {(selectedCuisines.length > 0 || selectedDiets.length > 0) && (
            <div className="flex flex-wrap gap-2">
                {[...selectedCuisines, ...selectedDiets].map(tag => (
                    <Badge key={tag} color="slate">
                        {tag} <button onClick={() => {
                            if(selectedCuisines.includes(tag)) toggleFilter(selectedCuisines, setSelectedCuisines, tag);
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
                {recipes.map(recipe => {
                const stockPct = calculateStockPercentage(recipe);
                return (
                    <Card key={recipe.id} className="group hover:border-emerald-200 transition-colors cursor-pointer flex flex-col" onClick={() => handleRecipeClick(recipe)}>
                        <div className="aspect-video w-full overflow-hidden bg-slate-100 relative">
                            <img 
                            src={recipe.image} 
                            alt={recipe.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-xs font-bold shadow-sm text-emerald-700 flex items-center gap-1">
                                <Flame size={12} className="fill-emerald-500 text-emerald-500"/> {stockPct}% Match
                            </div>
                            {recipe.cuisine && (
                                <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur px-2 py-1 rounded text-[10px] font-bold text-white uppercase tracking-wider">
                                    {recipe.cuisine}
                                </div>
                            )}
                        </div>
                        <div className="p-5 flex-1 flex flex-col">
                            <h3 className="text-lg font-bold text-slate-800 mb-1 leading-tight">{recipe.title}</h3>
                            
                            <div className="flex flex-wrap gap-1 mb-3">
                                {recipe.tags.slice(0, 3).map(tag => (
                                    <span key={tag} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{tag}</span>
                                ))}
                            </div>

                            <div className="flex items-center gap-4 text-xs text-slate-500 mb-4 mt-auto pt-2">
                                <div className="flex items-center gap-1"><Clock size={14}/> {recipe.prep_time + recipe.cook_time}m</div>
                                <div className="flex items-center gap-1"><Users size={14}/> {recipe.servings}</div>
                                <div className="flex items-center gap-1 ml-auto font-medium text-orange-600">{recipe.calories} kcal</div>
                            </div>
                            
                            <div className="space-y-1.5 border-t border-slate-100 pt-3">
                                {recipe.ingredients.slice(0, 2).map((ing, idx) => {
                                    const hasItem = api.checkInventoryMatch(ing.food_node_id, pantry);
                                    return (
                                        <div key={idx} className="flex items-center gap-2 text-xs">
                                            {hasItem ? (
                                                <CheckCircle2 size={12} className="text-emerald-500 flex-shrink-0" />
                                            ) : (
                                                <XCircle size={12} className="text-red-400 flex-shrink-0" />
                                            )}
                                            <span className={`truncate ${hasItem ? 'text-slate-600' : 'text-slate-400'}`}>
                                                {getFoodName(ing.food_node_id)}
                                            </span>
                                        </div>
                                    )
                                })}
                                {recipe.ingredients.length > 2 && (
                                    <p className="text-[10px] text-slate-400 pl-5">+ {recipe.ingredients.length - 2} more ingredients</p>
                                )}
                            </div>
                        </div>
                    </Card>
                );
                })}
            </div>
        )}
      </div>
    </div>
  );
}
