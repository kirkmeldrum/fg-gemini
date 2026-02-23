
import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, Clock, Users, Star, Printer, Share2, 
  Heart, Calendar, ShoppingCart, CheckCircle2, XCircle,
  MessageCircle, Send
} from 'lucide-react';
import { Card, Button, Badge, Label, TextArea } from './components';
import { api, Recipe, PantryItem, FoodNode, Review, USERS } from './data';

interface RecipeDetailProps {
  recipeId: number;
  onBack: () => void;
}

export default function RecipeDetail({ recipeId, onBack }: RecipeDetailProps) {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [pantry, setPantry] = useState<PantryItem[]>([]);
  const [foodNodes, setFoodNodes] = useState<FoodNode[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Interactive State
  const [checkedIngredients, setCheckedIngredients] = useState<number[]>([]);
  const [checkedSteps, setCheckedSteps] = useState<number[]>([]);
  const [newComment, setNewComment] = useState("");
  const [newRating, setNewRating] = useState(5);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const [r, p, f, rev] = await Promise.all([
        api.getRecipe(recipeId),
        api.getPantry(),
        api.getFoodNodes(),
        api.getRecipeReviews(recipeId)
      ]);
      
      setRecipe(r || null);
      setPantry(p);
      setFoodNodes(f);
      setReviews(rev);
      setLoading(false);
    };
    loadData();
  }, [recipeId]);

  const getFoodName = (id: number) => foodNodes.find(i => i.id === id)?.name || "Unknown";

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !recipe) return;

    const review = await api.addReview({
      recipe_id: recipe.id,
      user: USERS[0], // Current User
      rating: newRating,
      comment: newComment
    });

    setReviews([review, ...reviews]);
    setNewComment("");
  };

  const handleAddMissingToShopping = async () => {
    if (!recipe) return;
    const missing = recipe.ingredients.filter(ing => !api.checkInventoryMatch(ing.food_node_id, pantry));
    
    for (const ing of missing) {
      await api.addShoppingItem({
        name: getFoodName(ing.food_node_id),
        quantity: ing.quantity,
        unit: ing.unit,
        category: "Recipe Item",
        food_node_id: ing.food_node_id
      });
    }
    alert(`Added ${missing.length} missing ingredients to shopping list.`);
  };

  if (loading) return <div className="p-12 text-center text-slate-400">Loading Recipe...</div>;
  if (!recipe) return <div className="p-12 text-center">Recipe not found</div>;

  // Placeholder instructions (since not in data model yet)
  const instructions = [
    "Prepare all ingredients as listed above.",
    "Heat a large pan over medium-high heat.",
    "Combine ingredients in a large bowl and mix thoroughly.",
    "Cook for 10-15 minutes or until golden brown.",
    "Serve immediately and enjoy!"
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/3">
            <button 
                onClick={onBack} 
                className="mb-4 text-sm text-slate-500 hover:text-emerald-600 flex items-center gap-1 transition-colors"
            >
                <ChevronLeft size={16}/> Back to Recipes
            </button>
            <div className="aspect-square rounded-2xl overflow-hidden shadow-lg">
                <img src={recipe.image} className="w-full h-full object-cover" alt={recipe.title} />
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
                <div className="flex -space-x-2">
                    {[1,2,3,4,5].map(s => (
                        <Star key={s} size={16} className={`${s <= 4 ? "fill-yellow-400 text-yellow-400" : "text-slate-300"}`} />
                    ))}
                </div>
                <span className="text-sm text-slate-500">({reviews.length} reviews)</span>
                <span className="text-slate-300 mx-2">|</span>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                    <div className="w-6 h-6 rounded-full bg-slate-200 overflow-hidden">
                        <img src={recipe.author.avatar} alt={recipe.author.name} />
                    </div>
                    by {recipe.author.name}
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
                    <span className="block text-sm font-bold text-slate-700">Easy</span>
                    <span className="text-xs text-slate-400">Difficulty</span>
                </div>
            </div>

            <div className="flex flex-wrap gap-3">
                <Button className="flex-1">
                    <Calendar size={18} className="mr-2"/> Plan Meal
                </Button>
                <Button variant="secondary" className="flex-1" onClick={handleAddMissingToShopping}>
                    <ShoppingCart size={18} className="mr-2"/> Shop Ingredients
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
                    {recipe.ingredients.map((ing, idx) => {
                        const inStock = api.checkInventoryMatch(ing.food_node_id, pantry);
                        const isChecked = checkedIngredients.includes(idx);
                        
                        return (
                            <div 
                                key={idx} 
                                className={`flex items-start gap-3 p-2 rounded-lg transition-all cursor-pointer group ${isChecked ? 'opacity-50' : ''}`}
                                onClick={() => {
                                    if (isChecked) setCheckedIngredients(checkedIngredients.filter(i => i !== idx));
                                    else setCheckedIngredients([...checkedIngredients, idx]);
                                }}
                            >
                                <div className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${isChecked ? 'bg-slate-400 border-slate-400' : 'border-slate-300 group-hover:border-emerald-400'}`}>
                                    {isChecked && <CheckCircle2 size={14} className="text-white" />}
                                </div>
                                
                                <div className="flex-1">
                                    <p className={`text-sm font-medium transition-all ${isChecked ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                                        {ing.quantity} {ing.unit} {getFoodName(ing.food_node_id)}
                                    </p>
                                    
                                    {!isChecked && (
                                        <div className="flex items-center gap-1 mt-1">
                                            {inStock ? (
                                                <Badge color="emerald" ><CheckCircle2 size={10} className="mr-1"/> In Pantry</Badge>
                                            ) : (
                                                <Badge color="red" ><XCircle size={10} className="mr-1"/> Missing</Badge>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </Card>
        </div>

        {/* Right Col: Instructions & Reviews */}
        <div className="md:col-span-2 space-y-8">
            
            {/* Instructions */}
            <Card className="p-6">
                <h3 className="font-bold text-lg text-slate-800 mb-4 border-b border-slate-100 pb-2">Instructions</h3>
                <div className="space-y-6">
                    {instructions.map((step, idx) => {
                        const isChecked = checkedSteps.includes(idx);
                        return (
                            <div 
                                key={idx} 
                                className={`flex gap-4 cursor-pointer group transition-opacity ${isChecked ? 'opacity-50' : ''}`}
                                onClick={() => {
                                    if (isChecked) setCheckedSteps(checkedSteps.filter(i => i !== idx));
                                    else setCheckedSteps([...checkedSteps, idx]);
                                }}
                            >
                                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${isChecked ? 'bg-slate-200 text-slate-500' : 'bg-emerald-100 text-emerald-700 group-hover:bg-emerald-200'}`}>
                                    {isChecked ? <CheckCircle2 size={18}/> : idx + 1}
                                </div>
                                <p className={`text-slate-600 leading-relaxed transition-all ${isChecked ? 'line-through' : ''}`}>
                                    {step}
                                </p>
                            </div>
                        )
                    })}
                </div>
            </Card>

            {/* Reviews */}
            <section>
                <h3 className="font-bold text-lg text-slate-800 mb-6 flex items-center gap-2">
                    <MessageCircle size={20} className="text-emerald-500"/> 
                    Reviews ({reviews.length})
                </h3>

                {/* Add Review */}
                <Card className="p-4 mb-6 bg-slate-50 border-slate-200">
                    <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
                            <img src={USERS[0].avatar} alt={USERS[0].name} />
                        </div>
                        <form className="flex-1" onSubmit={handleAddReview}>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm font-medium text-slate-700">Your Rating:</span>
                                <div className="flex">
                                    {[1,2,3,4,5].map(star => (
                                        <button 
                                            key={star} 
                                            type="button"
                                            onClick={() => setNewRating(star)}
                                            className="focus:outline-none"
                                        >
                                            <Star 
                                                size={16} 
                                                className={`${star <= newRating ? "fill-yellow-400 text-yellow-400" : "text-slate-300 hover:text-yellow-300"}`} 
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <TextArea 
                                placeholder="Share your experience..." 
                                className="mb-3 bg-white" 
                                rows={2}
                                value={newComment}
                                onChange={e => setNewComment(e.target.value)}
                            />
                            <div className="flex justify-end">
                                <Button type="submit" size="sm">
                                    <Send size={14} className="mr-2"/> Post Review
                                </Button>
                            </div>
                        </form>
                    </div>
                </Card>

                {/* Reviews List */}
                <div className="space-y-4">
                    {reviews.map(review => (
                        <Card key={review.id} className="p-5">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden">
                                        <img src={review.user.avatar} alt={review.user.name} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-slate-900">{review.user.name}</p>
                                        <p className="text-xs text-slate-400">{review.date}</p>
                                    </div>
                                </div>
                                <div className="flex">
                                    {[1,2,3,4,5].map(s => (
                                        <Star key={s} size={14} className={`${s <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-slate-200"}`} />
                                    ))}
                                </div>
                            </div>
                            <p className="text-slate-600 text-sm pl-13 ml-12">{review.comment}</p>
                        </Card>
                    ))}
                </div>
            </section>

        </div>
      </div>
    </div>
  );
}
