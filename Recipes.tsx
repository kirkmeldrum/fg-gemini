
import React, { useEffect, useState } from 'react';
import { Clock, Users, ChevronRight, CheckCircle2, XCircle, Filter, Plus, BookOpen } from 'lucide-react';
import { Card, Button, Badge } from './components';
import { api, Recipe, PantryItem, FoodNode } from './data';

interface RecipesProps {
  onNavigate?: (view: string, params?: any) => void;
}

export default function Recipes({ onNavigate }: RecipesProps) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [pantry, setPantry] = useState<PantryItem[]>([]);
  const [foodNodes, setFoodNodes] = useState<FoodNode[]>([]);

  useEffect(() => {
    api.getRecipes().then(setRecipes);
    api.getPantry().then(setPantry);
    api.getFoodNodes().then(setFoodNodes);
  }, []);

  const getFoodName = (id: number) => foodNodes.find(i => i.id === id)?.name || "Unknown";

  const calculateStockPercentage = (recipe: Recipe) => {
    if (recipe.ingredients.length === 0) return 0;
    // Use the new fuzzy match logic from API
    const have = recipe.ingredients.filter(ing => api.checkInventoryMatch(ing.food_node_id, pantry)).length;
    return Math.round((have / recipe.ingredients.length) * 100);
  };

  const handleRecipeClick = (recipe: Recipe) => {
    if (onNavigate) {
        onNavigate('recipe-detail', { id: recipe.id });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Browse Recipes</h1>
          <p className="text-slate-500">Find meals based on what you have in your kitchen.</p>
        </div>
        <div className="flex gap-2">
            <Button variant="secondary" className="hidden md:flex">
                <Filter size={18} /> Filters
            </Button>
            {onNavigate && (
                <Button onClick={() => onNavigate('add-recipe')}>
                    <Plus size={18} /> Create Recipe
                </Button>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {recipes.map(recipe => {
          const stockPct = calculateStockPercentage(recipe);
          return (
            <Card key={recipe.id} className="group hover:border-emerald-200 transition-colors cursor-pointer" onClick={() => handleRecipeClick(recipe)}>
              <div className="aspect-video w-full overflow-hidden bg-slate-100 relative">
                <img 
                  src={recipe.image} 
                  alt={recipe.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-xs font-bold shadow-sm">
                    {stockPct}% Match
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-slate-800 mb-2">{recipe.title}</h3>
                <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                  <div className="flex items-center gap-1"><Clock size={14}/> {recipe.prep_time + recipe.cook_time} min</div>
                  <div className="flex items-center gap-1"><Users size={14}/> {recipe.servings} ppl</div>
                </div>
                
                <div className="space-y-2 mb-4">
                    {recipe.ingredients.slice(0, 3).map((ing, idx) => {
                        const hasItem = api.checkInventoryMatch(ing.food_node_id, pantry);
                        return (
                            <div key={idx} className="flex items-center gap-2 text-sm">
                                {hasItem ? (
                                    <CheckCircle2 size={14} className="text-emerald-500" />
                                ) : (
                                    <XCircle size={14} className="text-red-400" />
                                )}
                                <span className="text-slate-600">{getFoodName(ing.food_node_id)}</span>
                            </div>
                        )
                    })}
                    {recipe.ingredients.length > 3 && (
                        <p className="text-xs text-slate-400 pl-6">+ {recipe.ingredients.length - 3} more ingredients</p>
                    )}
                </div>

                <Button className="w-full justify-center" variant="secondary">
                  View Recipe
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
