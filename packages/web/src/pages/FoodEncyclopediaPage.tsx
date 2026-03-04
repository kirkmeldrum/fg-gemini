import React, { useState, useEffect, useCallback } from 'react';
import { ChevronRight, Folder, Tag, ShoppingCart, Plus, Search, CheckCircle2, Utensils, Zap, Activity, Clock, ChefHat } from 'lucide-react';
import { Card, Button, Badge, Checkbox } from '../components/ui';
import * as api from '../lib/api';

interface FoodEncyclopediaProps {
    initialFoodId?: number;
    onNavigate?: (view: string, params?: any) => void;
}

export default function FoodEncyclopedia({ initialFoodId, onNavigate }: FoodEncyclopediaProps) {
    const [currentNode, setCurrentNode] = useState<api.FoodCategory | api.FoodIngredient | null>(null);
    const [nodeType, setNodeType] = useState<'category' | 'ingredient'>('category');
    const [categories, setCategories] = useState<api.FoodCategory[]>([]);
    const [ingredients, setIngredients] = useState<api.FoodIngredient[]>([]);
    const [ancestry, setAncestry] = useState<api.FoodCategory[]>([]);
    const [relatedRecipes, setRelatedRecipes] = useState<api.Recipe[]>([]);
    const [inventoryItem, setInventoryItem] = useState<api.InventoryItem | null>(null);
    const [loading, setLoading] = useState(true);

    // Search & Filter State
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<{ categories: api.FoodCategory[], ingredients: api.FoodIngredient[] }>({ categories: [], ingredients: [] });
    const [showCategories, setShowCategories] = useState(true);
    const [showIngredients, setShowIngredients] = useState(true);

    const loadTopLevel = useCallback(async () => {
        setLoading(true);
        try {
            const top = await api.getTopCategories();
            setCategories(top);
            setIngredients([]);
            setCurrentNode(null);
            setAncestry([]);
        } catch (error) {
            console.error('Failed to load top categories:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const loadCategory = async (id: number) => {
        setLoading(true);
        try {
            const detail = await api.getCategoryDetail(id);
            setCurrentNode(detail);
            setNodeType('category');
            setCategories(detail.categories);
            setIngredients(detail.ingredients);
            setAncestry(detail.ancestry);

            // For categories, we don't necessarily show direct related recipes yet
            // unless we want to search by category. Skipping for now to simplify.
            setRelatedRecipes([]);
            setInventoryItem(null);
        } catch (error) {
            console.error('Failed to load category:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadIngredient = async (id: number) => {
        setLoading(true);
        try {
            const detail = await api.getIngredientDetail(id);
            setCurrentNode(detail);
            setNodeType('ingredient');
            setCategories([]);
            setIngredients([]);
            setAncestry(detail.ancestry);

            // Load related recipes
            const recipes = await api.getRecipes({ query: detail.name });
            setRelatedRecipes(recipes.items);

            // Check inventory (naive check by ingredient_id)
            const inventory = await api.getInventory();
            const matched = inventory.find(i => i.ingredient_id === id);
            setInventoryItem(matched || null);
        } catch (error) {
            console.error('Failed to load ingredient:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (initialFoodId) {
            // How do we know if it's a category or ingredient? 
            // In a real app we might encode this in ID or try both.
            // For now, let's try category first.
            loadCategory(initialFoodId);
        } else {
            loadTopLevel();
        }
    }, [initialFoodId, loadTopLevel]);

    // Debounced Search
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchQuery.length > 1) {
                const results = await api.searchFood(searchQuery);
                setSearchResults(results);
            } else {
                setSearchResults({ categories: [], ingredients: [] });
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleAddToList = async (ing: api.FoodIngredient) => {
        try {
            await api.addShoppingItem({
                ingredient_id: ing.id,
                name_display: ing.name,
                quantity: 1,
                unit: 'pcs'
            });
            alert(`${ing.name} added to shopping list!`);
        } catch (error) {
            console.error('Failed to add to list:', error);
        }
    };

    const handleAddToPantry = async (ing: api.FoodIngredient) => {
        try {
            await api.addInventoryItem({
                ingredient_id: ing.id,
                product_name: ing.name,
                quantity: 1,
                unit: 'pcs',
                storage_location: 'pantry'
            });
            const matched = (await api.getInventory()).find(i => i.ingredient_id === ing.id);
            setInventoryItem(matched || null);
            alert(`${ing.name} added to your kitchen!`);
        } catch (error) {
            console.error('Failed to add to pantry:', error);
        }
    };

    if (loading && !currentNode && categories.length === 0) return (
        <div className="flex flex-col items-center justify-center py-20 animate-pulse bg-slate-50 min-h-screen">
            <div className="w-24 h-24 bg-emerald-100 rounded-3xl flex items-center justify-center text-emerald-600 mb-6 shadow-xl shadow-emerald-100">
                <ChefHat size={48} className="animate-bounce" />
            </div>
            <p className="text-slate-500 font-black uppercase tracking-widest text-sm">Summoning the Food Encyclopedia...</p>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Enhanced Search Header */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                <div className="relative mb-3">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-lg leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                        placeholder="Search ingredients, products, brands..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex gap-4">
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider py-1">Filters:</div>
                    <Checkbox label="Categories" checked={showCategories} onChange={setShowCategories} />
                    <Checkbox label="Ingredients" checked={showIngredients} onChange={setShowIngredients} />
                </div>

                {/* Search Results Dropdown */}
                {(searchResults.categories.length > 0 || searchResults.ingredients.length > 0) && (
                    <div className="absolute z-20 left-0 right-0 mt-2 mx-0 bg-white rounded-2xl shadow-2xl border border-slate-100 max-h-96 overflow-auto animate-in slide-in-from-top-4 duration-200">
                        {showCategories && searchResults.categories.map(cat => (
                            <button
                                key={`cat-${cat.id}`}
                                onClick={() => { loadCategory(cat.id); setSearchQuery(""); }}
                                className="w-full text-left px-6 py-4 hover:bg-emerald-50 text-sm text-slate-700 flex justify-between items-center border-b border-slate-50 last:border-0 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-2.5 bg-slate-100 rounded-xl text-slate-500 group-hover:bg-white transition-all">
                                        <Folder size={18} />
                                    </div>
                                    <span className="font-bold text-slate-800">{cat.name}</span>
                                </div>
                                <Badge color="blue">Category</Badge>
                            </button>
                        ))}
                        {showIngredients && searchResults.ingredients.map(ing => (
                            <button
                                key={`ing-${ing.id}`}
                                onClick={() => { loadIngredient(ing.id); setSearchQuery(""); }}
                                className="w-full text-left px-6 py-4 hover:bg-orange-50 text-sm text-slate-700 flex justify-between items-center border-b border-slate-50 last:border-0 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-2.5 bg-slate-100 rounded-xl text-slate-500 transition-all">
                                        <Tag size={18} />
                                    </div>
                                    <span className="font-bold text-slate-800">{ing.name}</span>
                                </div>
                                <Badge color="orange">Ingredient</Badge>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Breadcrumbs */}
            <nav className="flex items-center text-sm text-slate-500 overflow-x-auto whitespace-nowrap pb-2 scrollbar-hide">
                <button onClick={loadTopLevel} className="hover:text-emerald-600 transition-colors">Food</button>
                <ChevronRight size={14} className="mx-2 flex-shrink-0 text-slate-300" />
                {ancestry.map((parent) => (
                    <React.Fragment key={parent.id}>
                        <button onClick={() => loadCategory(parent.id)} className="hover:text-emerald-600 transition-colors">
                            {parent.name}
                        </button>
                        <ChevronRight size={14} className="mx-2 flex-shrink-0 text-slate-300" />
                    </React.Fragment>
                ))}
                {currentNode && <span className="font-bold text-slate-800 px-3 py-1 bg-slate-100 rounded-full">{currentNode.name}</span>}
            </nav>

            {!currentNode ? (
                /* Top Level Grid */
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <Folder className="text-emerald-500" size={28} />
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Main Food Categories</h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {categories.map(cat => (
                            <Card
                                key={cat.id}
                                className="hover:border-emerald-400 hover:shadow-xl hover:shadow-emerald-50/50 transition-all cursor-pointer group border-slate-200 h-32 flex flex-col items-center justify-center p-4 bg-white/50 backdrop-blur-sm"
                                onClick={() => loadCategory(cat.id)}
                            >
                                <div className="w-12 h-12 rounded-2xl bg-slate-50 group-hover:bg-emerald-50 flex items-center justify-center mb-2 transition-colors">
                                    <Folder size={24} className="text-slate-400 group-hover:text-emerald-500" />
                                </div>
                                <span className="font-bold text-slate-800 text-center text-sm line-clamp-1">{cat.name}</span>
                            </Card>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-10">

                        {/* Node Header */}
                        <div className="flex flex-col md:flex-row gap-8 items-start">
                            <div className="w-full md:w-56 aspect-square rounded-[2rem] bg-white border border-slate-100 p-3 shadow-xl shadow-slate-200/50 flex-shrink-0 flex items-center justify-center overflow-hidden relative group">
                                {(currentNode as any).image_url ? (
                                    <img src={(currentNode as any).image_url} alt={currentNode.name} className="w-full h-full object-cover rounded-[1.5rem] group-hover:scale-110 transition-transform duration-700" />
                                ) : (
                                    <div className="w-full h-full bg-slate-50 rounded-[1.5rem] flex items-center justify-center text-emerald-100">
                                        {nodeType === 'category' ? <Folder size={80} /> : <Tag size={80} />}
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 pt-2">
                                <div className="flex items-center gap-3 mb-4 flex-wrap">
                                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">{currentNode.name}</h1>
                                    <Badge color={nodeType === 'category' ? 'blue' : 'orange'} className="px-4 py-1.5 rounded-full text-[10px] uppercase font-black tracking-widest">
                                        {nodeType}
                                    </Badge>
                                    {nodeType === 'ingredient' && (
                                        inventoryItem ? (
                                            <Badge color="emerald" className="px-4 py-1.5 rounded-full text-[10px] uppercase font-black tracking-widest">
                                                <CheckCircle2 size={12} className="mr-1.5" /> In Kitchen
                                            </Badge>
                                        ) : (
                                            <Badge color="slate" className="px-4 py-1.5 rounded-full text-[10px] uppercase font-black tracking-widest">Stock Empty</Badge>
                                        )
                                    )}
                                </div>
                                <p className="text-slate-500 mb-8 leading-relaxed text-lg font-medium italic">
                                    {(currentNode as any).description || `Discover the world of ${currentNode.name}. Explore subcategories, related items, and culinary applications.`}
                                </p>

                                {nodeType === 'ingredient' && (
                                    <div className="flex gap-4">
                                        <Button onClick={() => handleAddToList(currentNode as api.FoodIngredient)} className="rounded-2xl h-12 px-8 font-black text-xs tracking-widest bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-100">
                                            <Plus size={18} /> ADD TO LIST
                                        </Button>
                                        <Button
                                            variant="secondary"
                                            onClick={() => handleAddToPantry(currentNode as api.FoodIngredient)}
                                            className="rounded-2xl h-12 px-8 font-black text-xs tracking-widest border-2"
                                        >
                                            <ShoppingCart size={18} /> INVENTORY
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Node Sections (Children for Categories, Recipes for Ingredients) */}
                        {nodeType === 'category' ? (
                            <div className="space-y-12">
                                {categories.length > 0 && (
                                    <section>
                                        <div className="flex items-center justify-between mb-6">
                                            <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
                                                <Folder size={24} className="text-blue-500" /> Subcategories
                                            </h2>
                                            <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                                                {categories.length} GROUPS
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                            {categories.map(cat => (
                                                <Card
                                                    key={cat.id}
                                                    className="hover:border-blue-300 hover:shadow-xl transition-all cursor-pointer group border-slate-100 p-6 bg-white/50"
                                                    onClick={() => loadCategory(cat.id)}
                                                >
                                                    <div className="flex flex-col items-center text-center">
                                                        <div className="w-16 h-16 rounded-2xl bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center mb-4 transition-colors">
                                                            <Folder size={28} className="text-blue-400 group-hover:text-blue-600" />
                                                        </div>
                                                        <h3 className="font-bold text-slate-800 group-hover:text-blue-700 transition-colors">{cat.name}</h3>
                                                    </div>
                                                </Card>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {ingredients.length > 0 && (
                                    <section>
                                        <div className="flex items-center justify-between mb-6">
                                            <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
                                                <Tag size={24} className="text-orange-500" /> Ingredients & Products
                                            </h2>
                                            <span className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                                                {ingredients.length} ITEMS
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                            {ingredients.map(ing => (
                                                <Card
                                                    key={ing.id}
                                                    className="hover:border-orange-300 hover:shadow-xl transition-all cursor-pointer group border-slate-100 p-6 bg-white/50"
                                                    onClick={() => loadIngredient(ing.id)}
                                                >
                                                    <div className="flex flex-col items-center text-center">
                                                        <div className="w-16 h-16 rounded-2xl bg-orange-50 group-hover:bg-orange-100 flex items-center justify-center mb-4 transition-colors">
                                                            <Tag size={28} className="text-orange-400 group-hover:text-orange-600" />
                                                        </div>
                                                        <h3 className="font-bold text-slate-800 group-hover:text-orange-700 transition-colors line-clamp-2">{ing.name}</h3>
                                                        {(ing as any).brand && <span className="text-[10px] text-slate-400 font-black mt-1 uppercase">{(ing as any).brand}</span>}
                                                    </div>
                                                </Card>
                                            ))}
                                        </div>
                                    </section>
                                )}
                            </div>
                        ) : (
                            /* Ingredient Detail View */
                            <div className="space-y-12">
                                {/* Nutritional / Pairings Grid (Placeholder for real data) */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <Card className="p-8 border-l-8 border-l-emerald-500 bg-white/50 backdrop-blur-sm">
                                        <h3 className="font-black text-slate-900 mb-6 flex items-center gap-3 tracking-tight">
                                            <Activity size={24} className="text-emerald-500" /> Nutrition Facts
                                        </h3>
                                        <div className="space-y-4">
                                            {[
                                                { label: 'Energy', val: '42 kcal' },
                                                { label: 'Protein', val: '3.4g' },
                                                { label: 'Fat', val: '1.0g' },
                                                { label: 'Carbs', val: '5.0g' }
                                            ].map(stat => (
                                                <div key={stat.label} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0 hover:bg-emerald-50/30 transition-colors px-2 rounded-lg">
                                                    <span className="text-slate-500 font-bold text-xs uppercase tracking-wider">{stat.label}</span>
                                                    <span className="font-black text-slate-900">{stat.val}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </Card>

                                    <Card className="p-8 border-l-8 border-l-orange-500 bg-white/50 backdrop-blur-sm">
                                        <h3 className="font-black text-slate-900 mb-6 flex items-center gap-3 tracking-tight">
                                            <Utensils size={24} className="text-orange-500" /> Culinary Pairings
                                        </h3>
                                        <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-4">Complements well with:</p>
                                        <div className="flex flex-wrap gap-2.5">
                                            {['Garlic', 'Lemon', 'Black Pepper', 'Olive Oil', 'Thyme'].map(item => (
                                                <Badge key={item} color="orange" className="px-4 py-2 rounded-xl text-xs font-black shadow-sm border-0">
                                                    {item}
                                                </Badge>
                                            ))}
                                        </div>
                                    </Card>
                                </div>

                                {/* Related Recipes */}
                                <section>
                                    <div className="flex items-center justify-between mb-8">
                                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Recipes Featuring {currentNode.name}</h2>
                                        <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-widest">
                                            {relatedRecipes.length} MATCHES
                                        </span>
                                    </div>

                                    {relatedRecipes.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {relatedRecipes.map(recipe => (
                                                <Card
                                                    key={recipe.id}
                                                    className="p-0 overflow-hidden group hover:shadow-2xl transition-all duration-500 border-slate-100 cursor-pointer"
                                                    onClick={() => onNavigate && onNavigate('recipe-detail', { slug: recipe.slug })}
                                                >
                                                    <div className="h-40 bg-slate-200 relative overflow-hidden">
                                                        <img src={recipe.image_url || '/placeholder.jpg'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                                                        <div className="absolute bottom-4 left-4">
                                                            <div className="flex items-center gap-2 text-[10px] text-white/90 font-black uppercase tracking-widest mb-1">
                                                                <Clock size={12} /> {recipe.prep_time + recipe.cook_time} MIN
                                                            </div>
                                                            <h3 className="text-lg font-bold text-white tracking-tight">{recipe.title}</h3>
                                                        </div>
                                                    </div>
                                                </Card>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="bg-slate-50 rounded-[2rem] p-16 text-center border-2 border-dashed border-slate-200">
                                            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-slate-200/50 text-slate-200">
                                                <ChefHat size={40} />
                                            </div>
                                            <h3 className="text-xl font-bold text-slate-800">No recipes yet</h3>
                                            <p className="text-slate-400 mt-2 font-medium">Be the first to create a recipe with this ingredient!</p>
                                            <Button variant="secondary" className="mt-8 rounded-2xl px-8 h-12 font-black text-xs tracking-widest">CREATE RECIPE</Button>
                                        </div>
                                    )}
                                </section>
                            </div>
                        )}
                    </div>

                    {/* Sidebar Stats */}
                    <div className="space-y-8">
                        {nodeType === 'ingredient' && (
                            <Card className="p-8 rounded-[2rem] border-slate-100 shadow-xl shadow-slate-200/40 bg-white overflow-hidden relative">
                                <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-50 rounded-full blur-3xl opacity-50" />
                                <h3 className="font-black text-slate-900 mb-6 flex items-center gap-3 relative z-10">
                                    <ShoppingCart size={24} className="text-emerald-500" /> Kitchen Presence
                                </h3>
                                {inventoryItem ? (
                                    <div className="space-y-6 relative z-10">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Available Supply</span>
                                            <span className="text-2xl font-black text-emerald-600">{inventoryItem.quantity} {inventoryItem.unit}</span>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Storage Location</span>
                                            <span className="text-lg font-bold text-slate-700 capitalize">{inventoryItem.storage_location}</span>
                                        </div>
                                        {inventoryItem.expiration_date && (
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Best Before</span>
                                                <span className="text-lg font-bold text-red-500">{new Date(inventoryItem.expiration_date).toLocaleDateString()}</span>
                                            </div>
                                        )}
                                        <Button variant="secondary" className="w-full rounded-2xl h-12 font-black text-xs tracking-widest border-2">
                                            UPDATE STOCK
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="text-center py-8 relative z-10">
                                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner text-slate-200">
                                            <ShoppingCart size={32} />
                                        </div>
                                        <p className="text-slate-500 font-bold mb-6 italic">Not in your kitchen.</p>
                                        <Button
                                            onClick={() => handleAddToList(currentNode as api.FoodIngredient)}
                                            className="w-full rounded-2xl h-12 font-black text-xs tracking-widest bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-100"
                                        >
                                            BUY FOR KITCHEN
                                        </Button>
                                    </div>
                                )}
                            </Card>
                        )}

                        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] -mr-32 -mt-32" />
                            <h4 className="text-emerald-400 font-black text-[10px] uppercase tracking-[0.2em] mb-4">GURU INSIGHT</h4>
                            <p className="text-xl font-bold leading-tight mb-8">Ingredients are classified using a <span className="text-emerald-400">multi-tier taxonomy</span>. This ensures substitutes are always nearby!</p>
                            <div className="pt-8 border-t border-white/10 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-emerald-400">
                                    <Zap size={24} />
                                </div>
                                <div>
                                    <p className="text-xs font-black uppercase tracking-widest opacity-60">Smart Indexing</p>
                                    <p className="font-bold text-sm">94% Accuracy</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
