import { useState, useEffect } from 'react';
import {
    ChevronLeft, Clock, Users, Star, Printer, Share2,
    Heart, Calendar, ShoppingCart, CheckCircle2
} from 'lucide-react';
import { Card, Button } from './components';
import { getRecipeBySlug, addFromRecipe, RecipeDetail as IRecipeDetail } from '../lib/api';

interface RecipeDetailProps {
    slug: string;
    onBack: () => void;
}

export default function RecipeDetail({ slug, onBack }: RecipeDetailProps) {
    const [recipe, setRecipe] = useState<IRecipeDetail | null>(null);
    const [loading, setLoading] = useState(true);

    // Interactive State
    const [checkedIngredients, setCheckedIngredients] = useState<number[]>([]);
    const [checkedSteps, setCheckedSteps] = useState<number[]>([]);
    const [isShopping, setIsShopping] = useState(false);
    const [shoppingSuccess, setShoppingSuccess] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const r = await getRecipeBySlug(slug);
                setRecipe(r);
            } catch (err) {
                console.error('Failed to load recipe detail:', err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [slug]);

    const handleShopIngredients = async () => {
        if (!recipe) return;
        setIsShopping(true);
        try {
            await addFromRecipe(recipe.id);
            setShoppingSuccess(true);
            setTimeout(() => setShoppingSuccess(false), 3000);
        } catch (err) {
            console.error('Failed to add ingredients to shop:', err);
        } finally {
            setIsShopping(false);
        }
    };

    if (loading) return <div className="p-12 text-center text-slate-400">Loading Recipe...</div>;
    if (!recipe) return <div className="p-12 text-center">Recipe not found</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Header & Actions */}
            <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/3">
                    <button
                        onClick={onBack}
                        className="mb-4 text-sm text-slate-500 hover:text-emerald-600 flex items-center gap-1 transition-colors"
                    >
                        <ChevronLeft size={16} /> Back to Recipes
                    </button>
                    <div className="aspect-square rounded-2xl overflow-hidden shadow-lg bg-slate-100">
                        <img src={recipe.image_url || '/placeholder-recipe.jpg'} className="w-full h-full object-cover" alt={recipe.title} />
                    </div>
                </div>

                <div className="md:w-2/3 flex flex-col justify-end">
                    <div className="flex justify-between items-start mb-4">
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">{recipe.title}</h1>
                        <div className="flex gap-2">
                            <button className="p-2 text-slate-400 hover:text-red-500 transition-colors bg-white rounded-full shadow-sm border border-slate-100">
                                <Heart size={20} />
                            </button>
                            <button className="p-2 text-slate-400 hover:text-blue-500 transition-colors bg-white rounded-full shadow-sm border border-slate-100">
                                <Share2 size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 mb-6">
                        <div className="flex">
                            {[1, 2, 3, 4, 5].map(s => (
                                <Star key={s} size={16} className="fill-yellow-400 text-yellow-400" />
                            ))}
                        </div>
                        <span className="text-sm text-slate-500">(0 reviews)</span>
                        <span className="text-slate-300 mx-2">|</span>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                            by Admin
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                            <Clock size={20} className="mx-auto text-emerald-500 mb-1" />
                            <span className="block text-sm font-bold text-slate-700">{recipe.prep_time + recipe.cook_time}m</span>
                            <span className="text-xs text-slate-400">Total Time</span>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                            <Users size={20} className="mx-auto text-blue-500 mb-1" />
                            <span className="block text-sm font-bold text-slate-700">{recipe.servings}</span>
                            <span className="text-xs text-slate-400">Servings</span>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                            <Star size={20} className="mx-auto text-orange-500 mb-1" />
                            <span className="block text-sm font-bold text-slate-700">{recipe.cuisine || "Any"}</span>
                            <span className="text-xs text-slate-400">Cuisine</span>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Button className="flex-1">
                            <Calendar size={18} className="mr-2" /> Plan Meal
                        </Button>
                        <Button
                            variant="secondary"
                            className="flex-1"
                            onClick={handleShopIngredients}
                            disabled={isShopping}
                        >
                            {isShopping ? (
                                <div className="w-5 h-5 border-2 border-slate-200 border-t-emerald-500 rounded-full animate-spin" />
                            ) : shoppingSuccess ? (
                                <CheckCircle2 size={18} className="text-emerald-500 mr-2" />
                            ) : (
                                <ShoppingCart size={18} className="mr-2" />
                            )}
                            {shoppingSuccess ? 'Added!' : 'Shop Ingredients'}
                        </Button>
                        <Button variant="ghost">
                            <Printer size={18} />
                        </Button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                {/* Left Col: Ingredients */}
                <div className="md:col-span-1 space-y-6">
                    <Card className="p-6">
                        <h3 className="font-bold text-lg text-slate-800 mb-4 border-b border-slate-100 pb-2">Ingredients</h3>
                        <div className="space-y-3">
                            {recipe.ingredients.map((ing) => {
                                const isChecked = checkedIngredients.includes(ing.id);

                                return (
                                    <div
                                        key={ing.id}
                                        className={`flex items-start gap-3 p-2 rounded-lg transition-all cursor-pointer group ${isChecked ? 'opacity-50' : ''}`}
                                        onClick={() => {
                                            if (isChecked) setCheckedIngredients(checkedIngredients.filter(i => i !== ing.id));
                                            else setCheckedIngredients([...checkedIngredients, ing.id]);
                                        }}
                                    >
                                        <div className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${isChecked ? 'bg-slate-400 border-slate-400' : 'border-slate-300 group-hover:border-emerald-400'}`}>
                                            {isChecked && <CheckCircle2 size={14} className="text-white" />}
                                        </div>

                                        <div className="flex-1">
                                            <p className={`text-sm font-medium transition-all ${isChecked ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                                                {ing.quantity} {ing.unit} {ing.name_display}
                                            </p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </Card>
                </div>

                {/* Right Col: Instructions */}
                <div className="md:col-span-2 space-y-8">

                    <Card className="p-6">
                        <h3 className="font-bold text-lg text-slate-800 mb-4 border-b border-slate-100 pb-2">Instructions</h3>
                        <div className="space-y-6">
                            {recipe.steps.map((step) => {
                                const isChecked = checkedSteps.includes(step.id);
                                return (
                                    <div
                                        key={step.id}
                                        className={`flex gap-4 cursor-pointer group transition-opacity ${isChecked ? 'opacity-50' : ''}`}
                                        onClick={() => {
                                            if (isChecked) setCheckedSteps(checkedSteps.filter(i => i !== step.id));
                                            else setCheckedSteps([...checkedSteps, step.id]);
                                        }}
                                    >
                                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${isChecked ? 'bg-slate-200 text-slate-500' : 'bg-emerald-100 text-emerald-700 group-hover:bg-emerald-200'}`}>
                                            {isChecked ? <CheckCircle2 size={18} /> : step.step_number}
                                        </div>
                                        <p className={`text-slate-600 leading-relaxed transition-all ${isChecked ? 'line-through' : ''}`}>
                                            {step.instruction}
                                        </p>
                                    </div>
                                )
                            })}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
