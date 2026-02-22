
import React, { useState, useEffect } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, PlusCircle, MoreHorizontal, X, Trash2 } from 'lucide-react';
import { Button, Card, Badge, Modal, Label, Input, TextArea } from './components';
import { api, MealPlanItem, Recipe, RECIPES } from './data';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const SLOTS = ['breakfast', 'lunch', 'dinner'];

export default function MealPlanner() {
  const [plan, setPlan] = useState<MealPlanItem[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeSlot, setActiveSlot] = useState<{day: string, slot: string} | null>(null);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>("");
  const [customNote, setCustomNote] = useState("");
  const [editingItemId, setEditingItemId] = useState<number | null>(null);

  useEffect(() => {
    loadPlan();
    api.getRecipes().then(setRecipes);
  }, []);

  const loadPlan = async () => {
    const data = await api.getMealPlan();
    setPlan(data);
  };

  const getMealForSlot = (day: string, slot: string) => {
    return plan.find(p => p.day === day && p.slot === slot);
  };

  const getRecipe = (id: number | null) => {
    if (!id) return null;
    return recipes.find(r => r.id === id);
  };

  const handleSlotClick = (day: string, slot: string) => {
    const existingItem = getMealForSlot(day, slot);
    setActiveSlot({ day, slot });
    
    if (existingItem) {
      setEditingItemId(existingItem.id);
      setSelectedRecipeId(existingItem.recipe_id ? existingItem.recipe_id.toString() : "");
      setCustomNote(existingItem.note || "");
    } else {
      setEditingItemId(null);
      setSelectedRecipeId("");
      setCustomNote("");
    }
    
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!activeSlot) return;

    // Validate: Need either a recipe or a note
    if (!selectedRecipeId && !customNote) return;

    await api.addToMealPlan({
      day: activeSlot.day,
      slot: activeSlot.slot as 'breakfast' | 'lunch' | 'dinner',
      recipe_id: selectedRecipeId ? parseInt(selectedRecipeId) : null,
      note: customNote
    });

    setIsModalOpen(false);
    loadPlan();
  };

  const handleDelete = async () => {
    if (editingItemId) {
      await api.removeFromMealPlan(editingItemId);
      setIsModalOpen(false);
      loadPlan();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Meal Planner</h1>
          <p className="text-slate-500">Plan your week to save time and reduce waste.</p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg p-1">
            <button className="p-2 hover:bg-slate-100 rounded-md text-slate-500"><ChevronLeft size={20}/></button>
            <span className="px-4 font-semibold text-slate-700">Oct 23 - Oct 29</span>
            <button className="p-2 hover:bg-slate-100 rounded-md text-slate-500"><ChevronRight size={20}/></button>
        </div>
      </div>

      {/* Desktop Calendar View */}
      <div className="hidden lg:grid grid-cols-8 gap-px bg-slate-200 border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        {/* Header Row */}
        <div className="bg-slate-50 p-4 font-semibold text-slate-400 text-xs uppercase tracking-wider text-center">
            Meal
        </div>
        {DAYS.map(day => (
            <div key={day} className="bg-white p-4 font-semibold text-slate-700 text-center border-b-2 border-transparent hover:border-emerald-500 transition-colors cursor-pointer">
                {day.substring(0, 3)}
            </div>
        ))}

        {/* Meal Rows */}
        {SLOTS.map(slot => (
            <React.Fragment key={slot}>
                <div className="bg-slate-50 p-4 font-medium text-slate-600 capitalize text-sm flex items-center justify-center">
                    {slot}
                </div>
                {DAYS.map(day => {
                    const item = getMealForSlot(day, slot);
                    const recipe = getRecipe(item?.recipe_id || null);
                    
                    return (
                        <div 
                            key={`${day}-${slot}`} 
                            onClick={() => handleSlotClick(day, slot)}
                            className="bg-white min-h-[140px] p-2 hover:bg-slate-50 transition-colors relative group cursor-pointer"
                        >
                            {item ? (
                                <div className="h-full flex flex-col gap-2">
                                    {recipe ? (
                                        <div className="flex-1">
                                            <img src={recipe.image} className="w-full h-20 object-cover rounded-md mb-2" />
                                            <p className="text-sm font-semibold text-slate-800 leading-tight line-clamp-2">{recipe.title}</p>
                                            <div className="flex gap-1 mt-1">
                                                <Badge color="emerald">{recipe.prep_time + recipe.cook_time}m</Badge>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="h-full p-3 bg-amber-50 rounded-lg border border-amber-100 text-amber-800 text-sm">
                                            <span className="font-semibold block mb-1">Note:</span>
                                            {item.note}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <button className="w-full h-full border-2 border-dashed border-slate-100 rounded-lg flex items-center justify-center text-slate-300 hover:text-emerald-500 hover:border-emerald-200 transition-colors">
                                    <PlusCircle size={24} />
                                </button>
                            )}
                        </div>
                    );
                })}
            </React.Fragment>
        ))}
      </div>

      {/* Mobile Agenda View */}
      <div className="lg:hidden space-y-4">
        {DAYS.map(day => (
            <Card key={day} className="p-4">
                <h3 className="font-bold text-lg mb-3 text-slate-800">{day}</h3>
                <div className="space-y-3">
                    {SLOTS.map(slot => {
                        const item = getMealForSlot(day, slot);
                        const recipe = getRecipe(item?.recipe_id || null);
                        return (
                            <div 
                                key={slot} 
                                onClick={() => handleSlotClick(day, slot)}
                                className="flex gap-4 items-start pb-3 border-b last:border-0 last:pb-0 border-slate-100 cursor-pointer hover:bg-slate-50 p-2 -mx-2 rounded transition-colors"
                            >
                                <div className="w-20 text-xs font-semibold uppercase text-slate-400 pt-1">{slot}</div>
                                <div className="flex-1">
                                    {item ? (
                                        recipe ? (
                                            <div className="flex gap-3">
                                                <img src={recipe.image} className="w-16 h-16 rounded-lg object-cover" />
                                                <div>
                                                    <p className="font-semibold text-slate-800">{recipe.title}</p>
                                                    <p className="text-xs text-slate-500 mt-1">{recipe.prep_time} mins prep</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-sm bg-amber-50 p-2 rounded text-amber-800">{item.note}</p>
                                        )
                                    ) : (
                                        <button className="text-sm text-emerald-600 font-medium flex items-center gap-1">
                                            <PlusCircle size={14}/> Plan Meal
                                        </button>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </Card>
        ))}
      </div>

      {/* Edit Meal Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={activeSlot ? `Plan ${activeSlot.slot} for ${activeSlot.day}` : 'Plan Meal'}
      >
        <div className="space-y-6">
            <div>
                <Label>Choose a Recipe</Label>
                <select 
                    className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    value={selectedRecipeId}
                    onChange={(e) => {
                        setSelectedRecipeId(e.target.value);
                        if(e.target.value) setCustomNote(""); // Clear note if recipe selected
                    }}
                >
                    <option value="">-- Select from Recipes --</option>
                    {recipes.map(r => (
                        <option key={r.id} value={r.id}>{r.title}</option>
                    ))}
                </select>
            </div>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-slate-500">OR</span>
                </div>
            </div>

            <div>
                <Label>Add a Note (e.g. Leftovers, Dining Out)</Label>
                <Input 
                    placeholder="Enter custom meal description..." 
                    value={customNote}
                    onChange={(e) => {
                        setCustomNote(e.target.value);
                        if(e.target.value) setSelectedRecipeId(""); // Clear recipe if note entered
                    }}
                />
            </div>

            <div className="flex gap-3 pt-4">
                <Button className="flex-1" onClick={handleSave}>Save Meal</Button>
                {editingItemId && (
                    <Button variant="danger" onClick={handleDelete}>
                        <Trash2 size={18} />
                    </Button>
                )}
            </div>
        </div>
      </Modal>
    </div>
  );
}
