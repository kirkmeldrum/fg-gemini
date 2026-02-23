

import React, { useState, useEffect } from 'react';
import { ChevronLeft, Plus, Trash2, Camera, Upload } from 'lucide-react';
import { Card, Button, Input, TextArea, Label } from './components';
import { api, FoodNode, USERS, Recipe } from './data';

interface AddRecipeProps {
  onBack: () => void;
  initialData?: Partial<Recipe>;
}

export default function AddRecipe({ onBack, initialData }: AddRecipeProps) {
  const [ingredients, setIngredients] = useState<FoodNode[]>([]);
  const [recipeImage, setRecipeImage] = useState<string | null>(initialData?.image || null);
  
  // Form State
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [prepTime, setPrepTime] = useState(initialData?.prep_time?.toString() || "");
  const [cookTime, setCookTime] = useState(initialData?.cook_time?.toString() || "");
  const [servings, setServings] = useState(initialData?.servings?.toString() || "");
  const [calories, setCalories] = useState(initialData?.calories?.toString() || "");
  const [cuisine, setCuisine] = useState(initialData?.cuisine || "");
  const [tags, setTags] = useState(initialData?.tags?.join(", ") || "");
  
  const [recipeIngredients, setRecipeIngredients] = useState(
    initialData?.ingredients?.map(i => ({
        ingredientId: i.food_node_id.toString(),
        quantity: i.quantity.toString(),
        unit: i.unit
    })) || [{ ingredientId: "", quantity: "", unit: "" }]
  );

  const [instructions, setInstructions] = useState([""]);

  useEffect(() => {
    api.getFoodNodes().then(setIngredients);
  }, []);

  const handleAddIngredientRow = () => {
    setRecipeIngredients([...recipeIngredients, { ingredientId: "", quantity: "", unit: "" }]);
  };

  const handleRemoveIngredientRow = (index: number) => {
    setRecipeIngredients(recipeIngredients.filter((_, i) => i !== index));
  };

  const updateIngredientRow = (index: number, field: string, value: string) => {
    const updated = [...recipeIngredients];
    updated[index] = { ...updated[index], [field]: value };
    setRecipeIngredients(updated);
  };

  const handleAddInstruction = () => {
    setInstructions([...instructions, ""]);
  };

  const updateInstruction = (index: number, value: string) => {
    const updated = [...instructions];
    updated[index] = value;
    setInstructions(updated);
  };

  const handleRemoveInstruction = (index: number) => {
    setInstructions(instructions.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newRecipe = {
      title,
      description,
      image: recipeImage || "https://images.unsplash.com/photo-1495521821758-ee18ece6d638?auto=format&fit=crop&w=800&q=80",
      prep_time: parseInt(prepTime) || 0,
      cook_time: parseInt(cookTime) || 0,
      servings: parseInt(servings) || 1,
      calories: parseInt(calories) || 0,
      cuisine: cuisine,
      tags: tags.split(',').map(t => t.trim()).filter(t => t.length > 0),
      ingredients: recipeIngredients.map(ri => ({
        food_node_id: parseInt(ri.ingredientId),
        quantity: parseFloat(ri.quantity) || 0,
        unit: ri.unit
      })),
      author: USERS[0] // Simulate current user
    };

    await api.addRecipe(newRecipe);
    onBack();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack} className="p-2">
          <ChevronLeft size={24} />
        </Button>
        <h1 className="text-2xl font-bold text-slate-800">
            {initialData ? "Review & Publish Recipe" : "Add New Recipe"}
        </h1>
      </div>
      
      {initialData && (
        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex items-center gap-3 text-emerald-800 text-sm">
            <Camera size={20} />
            Data extracted from image. Please review accuracy before publishing.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info Card */}
        <Card className="p-6 space-y-6">
          <h2 className="text-lg font-semibold text-slate-800 border-b border-slate-100 pb-3">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <div>
                <Label htmlFor="title">Recipe Title</Label>
                <Input id="title" placeholder="e.g., Mom's Famous Lasagna" value={title} onChange={e => setTitle(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <TextArea id="description" rows={3} placeholder="Tell us a bit about this dish..." value={description} onChange={e => setDescription(e.target.value)} />
              </div>
            </div>
            
            <div className="md:col-span-1">
              <Label>Recipe Photo</Label>
              <div className="mt-1 border-2 border-dashed border-slate-300 rounded-xl h-40 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer text-slate-400 hover:text-emerald-600">
                {recipeImage ? (
                    <img src={recipeImage} className="w-full h-full object-cover rounded-lg" />
                ) : (
                    <>
                        <Camera size={32} className="mb-2" />
                        <span className="text-xs font-medium">Upload Photo</span>
                    </>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="prep">Prep Time (min)</Label>
              <Input id="prep" type="number" placeholder="15" value={prepTime} onChange={e => setPrepTime(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="cook">Cook Time (min)</Label>
              <Input id="cook" type="number" placeholder="30" value={cookTime} onChange={e => setCookTime(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="servings">Servings</Label>
              <Input id="servings" type="number" placeholder="4" value={servings} onChange={e => setServings(e.target.value)} required />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="calories">Calories (kcal)</Label>
              <Input id="calories" type="number" placeholder="450" value={calories} onChange={e => setCalories(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="cuisine">Cuisine</Label>
              <Input id="cuisine" placeholder="e.g. Italian" value={cuisine} onChange={e => setCuisine(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input id="tags" placeholder="Healthy, Spicy" value={tags} onChange={e => setTags(e.target.value)} />
            </div>
          </div>
        </Card>

        {/* Ingredients Card */}
        <Card className="p-6 space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h2 className="text-lg font-semibold text-slate-800">Ingredients</h2>
            <span className="text-xs text-slate-500">List all ingredients needed</span>
          </div>

          <div className="space-y-3">
            {recipeIngredients.map((row, idx) => (
              <div key={idx} className="flex gap-3 items-start">
                <div className="flex-1">
                  <select 
                    className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    value={row.ingredientId}
                    onChange={(e) => updateIngredientRow(idx, 'ingredientId', e.target.value)}
                    required
                  >
                    <option value="">Select Ingredient</option>
                    {ingredients.map(ing => (
                      <option key={ing.id} value={ing.id}>{ing.name}</option>
                    ))}
                  </select>
                </div>
                <div className="w-24">
                  <Input 
                    placeholder="Qty" 
                    type="number"
                    value={row.quantity}
                    onChange={(e) => updateIngredientRow(idx, 'quantity', e.target.value)}
                    required
                  />
                </div>
                <div className="w-24">
                  <Input 
                    placeholder="Unit" 
                    value={row.unit}
                    onChange={(e) => updateIngredientRow(idx, 'unit', e.target.value)}
                    required
                  />
                </div>
                {recipeIngredients.length > 1 && (
                  <button type="button" onClick={() => handleRemoveIngredientRow(idx)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>

          <Button type="button" variant="secondary" onClick={handleAddIngredientRow} className="w-full border-dashed">
            <Plus size={16} /> Add Ingredient
          </Button>
        </Card>

        {/* Instructions Card */}
        <Card className="p-6 space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h2 className="text-lg font-semibold text-slate-800">Instructions</h2>
            <span className="text-xs text-slate-500">Step-by-step guide</span>
          </div>

          <div className="space-y-4">
            {instructions.map((step, idx) => (
              <div key={idx} className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                  {idx + 1}
                </div>
                <TextArea 
                  rows={2} 
                  placeholder={`Step ${idx + 1}...`}
                  value={step}
                  onChange={(e) => updateInstruction(idx, e.target.value)}
                  required
                />
                {instructions.length > 1 && (
                  <button type="button" onClick={() => handleRemoveInstruction(idx)} className="p-2 text-slate-400 hover:text-red-500 transition-colors self-center">
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>

          <Button type="button" variant="secondary" onClick={handleAddInstruction} className="w-full border-dashed">
            <Plus size={16} /> Add Step
          </Button>
        </Card>

        <div className="flex gap-4 pt-4 justify-end">
          <Button type="button" variant="ghost" onClick={onBack}>Cancel</Button>
          <Button type="submit" className="px-8">Publish Recipe</Button>
        </div>
      </form>
    </div>
  );
}