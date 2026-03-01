
import React, { useState, useEffect, useMemo } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, PlusCircle, Trash2, Save, CookingPot, Utensils, Info } from 'lucide-react';
import { Button, Card, Badge, Modal, Label, Input } from './components';
import * as api from '../lib/api';

const SLOTS = ['breakfast', 'lunch', 'dinner', 'snack'] as const;

type SlotType = typeof SLOTS[number];

const getMonday = (d: Date) => {
    const date = new Date(d);
    const day = date.getDay();
    // Adjust to Monday: if Sunday (0), go back 6. Otherwise go back to Monday (1).
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(date.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
};

const formatDate = (date: Date) => date.toISOString().split('T')[0];

const getDaysOfWeek = (startDate: Date) => {
    const days = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(startDate);
        d.setDate(startDate.getDate() + i);
        days.push(d);
    }
    return days;
};

export default function MealPlanner() {
    const [currentWeekStart, setCurrentWeekStart] = useState(getMonday(new Date()));
    const [plan, setPlan] = useState<api.MealPlanItem[]>([]);
    const [recipes, setRecipes] = useState<api.Recipe[]>([]);
    const [nutrition, setNutrition] = useState<api.NutritionSummary | null>(null);
    const [, setIsLoading] = useState(true);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeSlot, setActiveSlot] = useState<{ date: string, slot: SlotType } | null>(null);
    const [selectedRecipeId, setSelectedRecipeId] = useState<string>("");
    const [customNote, setCustomNote] = useState("");
    const [servings, setServings] = useState<number>(1);
    const [editingItemId, setEditingItemId] = useState<number | null>(null);

    const daysOfWeek = useMemo(() => getDaysOfWeek(currentWeekStart), [currentWeekStart]);

    useEffect(() => {
        loadData();
        api.getRecipes({ limit: 100 }).then(res => setRecipes(res.items));
    }, [currentWeekStart]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const startDate = formatDate(daysOfWeek[0]);
            const endDate = formatDate(daysOfWeek[6]);

            const [planData, nutritionData] = await Promise.all([
                api.getMealPlan(startDate, endDate),
                api.getMealPlanNutrition(startDate, endDate).catch(() => null)
            ]);

            setPlan(planData || []);
            setNutrition(nutritionData);
        } catch (err) {
            console.error('Failed to load meal plan:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const getMealForSlot = (date: string, slot: SlotType) => {
        return plan.find(p => p.plan_date.startsWith(date) && p.meal_type === slot);
    };

    const getRecipe = (id: number | null) => {
        if (!id) return null;
        return recipes.find(r => r.id === id);
    };

    const handleSlotClick = (date: Date, slot: SlotType) => {
        const dateStr = formatDate(date);
        const existingItem = getMealForSlot(dateStr, slot);
        setActiveSlot({ date: dateStr, slot });

        if (existingItem) {
            setEditingItemId(existingItem.id);
            setSelectedRecipeId(existingItem.recipe_id ? existingItem.recipe_id.toString() : "");
            setCustomNote(existingItem.notes || "");
            setServings(existingItem.servings || 1);
        } else {
            setEditingItemId(null);
            setSelectedRecipeId("");
            setCustomNote("");
            setServings(1);
        }

        setIsModalOpen(true);
    };

    const handleSave = async () => {
        if (!activeSlot) return;

        try {
            const payload = {
                plan_date: activeSlot.date,
                meal_type: activeSlot.slot,
                recipe_id: selectedRecipeId ? parseInt(selectedRecipeId) : null,
                notes: customNote,
                servings: servings
            };

            if (editingItemId) {
                await api.updateMealPlan(editingItemId, payload);
            } else {
                await api.addToMealPlan(payload);
            }

            setIsModalOpen(false);
            loadData();
        } catch (err) {
            console.error('Failed to save meal:', err);
        }
    };

    const handleDelete = async () => {
        if (editingItemId) {
            try {
                await api.removeFromMealPlan(editingItemId);
                setIsModalOpen(false);
                loadData();
            } catch (err) {
                console.error('Failed to delete meal:', err);
            }
        }
    };

    const toggleCooked = async (item: api.MealPlanItem) => {
        try {
            await api.updateMealPlan(item.id, { is_cooked: !item.is_cooked });
            loadData();
        } catch (err) {
            console.error('Failed to toggle cooked status:', err);
        }
    };

    const navigateWeek = (direction: number) => {
        const newStart = new Date(currentWeekStart);
        newStart.setDate(currentWeekStart.getDate() + (direction * 7));
        setCurrentWeekStart(newStart);
    };

    const handleGenerateShopping = async () => {
        try {
            const startDate = formatDate(daysOfWeek[0]);
            const endDate = formatDate(daysOfWeek[6]);
            const { count } = await api.generateShoppingFromPlan(startDate, endDate);
            alert(`Successfully added ${count} items to your shopping list!`);
        } catch (err) {
            console.error('Failed to generate shopping list:', err);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Meal Planner</h1>
                    <p className="text-slate-500">Plan your week, track nutrition, and reduce waste.</p>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                    <Button variant="outline" onClick={handleGenerateShopping} className="text-sm shadow-sm group">
                        <PlusCircle size={16} className="mr-2 text-emerald-500 group-hover:scale-110 transition-transform" />
                        Generate Shopping List
                    </Button>
                    <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
                        <button
                            onClick={() => navigateWeek(-1)}
                            className="p-2 hover:bg-slate-100 rounded-md text-slate-500 transition-colors"
                            title="Previous Week"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <span className="px-4 font-semibold text-slate-700 min-w-[200px] text-center">
                            {formatDate(daysOfWeek[0])} — {formatDate(daysOfWeek[6])}
                        </span>
                        <button
                            onClick={() => navigateWeek(1)}
                            className="p-2 hover:bg-slate-100 rounded-md text-slate-500 transition-colors"
                            title="Next Week"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Nutrition Summary Bar */}
            {nutrition && (
                <Card className="p-4 bg-emerald-50 border-emerald-100">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="flex flex-col">
                            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Weekly Calories</span>
                            <span className="text-xl font-bold text-emerald-900">{Math.round(nutrition.total_calories || 0)} kcal</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Protein</span>
                            <span className="text-xl font-bold text-emerald-900">{Math.round(nutrition.total_protein || 0)}g</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Carbs</span>
                            <span className="text-xl font-bold text-emerald-900">{Math.round(nutrition.total_carbs || 0)}g</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Fat</span>
                            <span className="text-xl font-bold text-emerald-900">{Math.round(nutrition.total_fat || 0)}g</span>
                        </div>
                    </div>
                </Card>
            )}

            {/* Desktop Calendar View */}
            <div className="hidden lg:grid grid-cols-8 gap-px bg-slate-200 border border-slate-200 rounded-xl overflow-hidden shadow-md">
                {/* Header Row */}
                <div className="bg-slate-50 p-4 font-semibold text-slate-400 text-xs uppercase tracking-wider text-center flex items-center justify-center">
                    <CalendarDays size={18} className="mr-2" /> Meal
                </div>
                {daysOfWeek.map(day => (
                    <div key={day.toISOString()} className="bg-white p-4 font-semibold text-slate-700 text-center">
                        <div className="text-xs text-slate-400 uppercase">{day.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                        <div className="text-lg">{day.getDate()}</div>
                    </div>
                ))}

                {/* Meal Rows */}
                {SLOTS.map(slot => (
                    <React.Fragment key={slot}>
                        <div className="bg-slate-50 p-4 font-medium text-slate-600 capitalize text-sm flex items-center justify-center border-t border-slate-200">
                            {slot === 'breakfast' && <Utensils size={14} className="mr-2 text-orange-400" />}
                            {slot === 'lunch' && <Utensils size={14} className="mr-2 text-emerald-400" />}
                            {slot === 'dinner' && <CookingPot size={14} className="mr-2 text-indigo-400" />}
                            {slot === 'snack' && <Info size={14} className="mr-2 text-amber-400" />}
                            {slot}
                        </div>
                        {daysOfWeek.map(day => {
                            const dateStr = formatDate(day);
                            const item = getMealForSlot(dateStr, slot);
                            const recipe = getRecipe(item?.recipe_id || null);

                            return (
                                <div
                                    key={`${dateStr}-${slot}`}
                                    onClick={() => handleSlotClick(day, slot)}
                                    className={`bg-white min-h-[160px] p-2 hover:bg-slate-50 transition-all relative group cursor-pointer border-t border-slate-100 ${item?.is_cooked ? 'bg-slate-50/50' : ''}`}
                                >
                                    {item ? (
                                        <div className={`h-full flex flex-col gap-2 ${item.is_cooked ? 'opacity-60' : ''}`}>
                                            {recipe ? (
                                                <div className="flex-1">
                                                    {recipe.image_url && <img src={recipe.image_url} className="w-full h-24 object-cover rounded-lg mb-2 shadow-sm" />}
                                                    <p className="text-sm font-bold text-slate-800 leading-tight line-clamp-2 mb-1">{recipe.title}</p>
                                                    <div className="flex flex-wrap gap-1">
                                                        <Badge color="blue">{item.servings} svg</Badge>
                                                        {item.is_cooked && <Badge color="emerald">Cooked</Badge>}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="h-full p-3 bg-amber-50/50 rounded-lg border border-amber-100/50 text-amber-800 text-sm italic">
                                                    {item.notes}
                                                    <div className="mt-2 text-[10px] uppercase font-bold text-amber-600">{item.servings} Servings</div>
                                                </div>
                                            )}

                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleCooked(item);
                                                }}
                                                className={`absolute top-2 right-2 p-1 rounded-full shadow-sm transition-colors ${item.is_cooked ? 'bg-emerald-500 text-white' : 'bg-white text-slate-300 opacity-0 group-hover:opacity-100'}`}
                                            >
                                                <Save size={14} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="w-full h-full border-2 border-dashed border-slate-50 rounded-xl flex items-center justify-center text-slate-200 group-hover:text-emerald-300 group-hover:border-emerald-100 transition-all">
                                            <PlusCircle size={24} />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </React.Fragment>
                ))}
            </div>

            {/* Mobile Agenda View */}
            <div className="lg:hidden space-y-4">
                {daysOfWeek.map(day => {
                    const dateStr = formatDate(day);
                    return (
                        <Card key={dateStr} className="overflow-hidden border-slate-200">
                            <div className="bg-slate-50 px-4 py-2 border-b border-slate-100 flex justify-between items-center">
                                <h3 className="font-bold text-slate-800">
                                    {day.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                                </h3>
                            </div>
                            <div className="divide-y divide-slate-50">
                                {SLOTS.map(slot => {
                                    const item = getMealForSlot(dateStr, slot);
                                    const recipe = getRecipe(item?.recipe_id || null);
                                    return (
                                        <div
                                            key={slot}
                                            onClick={() => handleSlotClick(day, slot)}
                                            className={`flex gap-4 items-start p-4 cursor-pointer hover:bg-slate-50 transition-colors ${item?.is_cooked ? 'bg-slate-50/50' : ''}`}
                                        >
                                            <div className="w-20 pt-1">
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">{slot}</span>
                                            </div>
                                            <div className="flex-1">
                                                {item ? (
                                                    recipe ? (
                                                        <div className="flex gap-3">
                                                            {recipe.image_url && <img src={recipe.image_url} className="w-16 h-16 rounded-xl object-cover shadow-sm" />}
                                                            <div className={item.is_cooked ? 'opacity-50' : ''}>
                                                                <p className="font-bold text-slate-800">{recipe.title}</p>
                                                                <div className="flex gap-2 mt-1">
                                                                    <span className="text-xs text-slate-500">{item.servings} servings</span>
                                                                    {item.is_cooked && <span className="text-xs text-emerald-600 font-bold">✓ Cooked</span>}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <p className="text-sm bg-amber-50/50 p-3 rounded-xl text-amber-800 italic border border-amber-100/50">
                                                            {item.notes}
                                                        </p>
                                                    )
                                                ) : (
                                                    <div className="text-sm text-slate-300 font-medium flex items-center gap-1 py-1">
                                                        <PlusCircle size={14} /> Plan Meal
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </Card>
                    )
                })}
            </div>

            {/* Edit Meal Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={activeSlot ? `Plan ${activeSlot.slot} for ${activeSlot.date}` : 'Plan Meal'}
            >
                <div className="space-y-6">
                    <div>
                        <Label>Choose a Recipe</Label>
                        <select
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-sm"
                            value={selectedRecipeId}
                            onChange={(e) => {
                                setSelectedRecipeId(e.target.value);
                                if (e.target.value) setCustomNote("");
                            }}
                        >
                            <option value="">-- Custom Meal / Note --</option>
                            {recipes.map(r => (
                                <option key={r.id} value={r.id}>{r.title}</option>
                            ))}
                        </select>
                    </div>

                    {!selectedRecipeId && (
                        <div>
                            <Label>Custom Meal Description</Label>
                            <Input
                                placeholder="e.g. Leftovers, Takeout, Dining Out..."
                                value={customNote}
                                onChange={(e) => setCustomNote(e.target.value)}
                                className="py-3"
                            />
                        </div>
                    )}

                    <div>
                        <Label>Servings</Label>
                        <div className="flex items-center gap-4">
                            <input
                                type="range"
                                min="1"
                                max="12"
                                value={servings}
                                onChange={(e) => setServings(parseInt(e.target.value))}
                                className="flex-1 accent-emerald-500"
                            />
                            <span className="text-lg font-bold text-slate-700 w-8 text-center">{servings}</span>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button className="flex-1 py-3 h-auto text-base" onClick={handleSave}>
                            {editingItemId ? 'Update Plan' : 'Add to Plan'}
                        </Button>
                        {editingItemId && (
                            <Button variant="danger" onClick={handleDelete} className="px-4">
                                <Trash2 size={20} />
                            </Button>
                        )}
                    </div>
                </div>
            </Modal>
        </div>
    );
}
