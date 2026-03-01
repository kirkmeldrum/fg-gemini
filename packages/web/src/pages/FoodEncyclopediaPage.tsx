
import React, { useState, useEffect } from 'react';
import { ChevronRight, Folder, Tag, ShoppingCart, Plus, Search, CheckCircle2, Info, Thermometer, Utensils, Zap, Activity } from 'lucide-react';
import { Card, Button, Badge, Checkbox } from './components';
import { api, FoodNode, Recipe, PantryItem } from './data';

interface FoodEncyclopediaProps {
    initialFoodId?: number;
    onNavigate?: (view: string, params?: any) => void;
}

export default function FoodEncyclopedia({ initialFoodId, onNavigate }: FoodEncyclopediaProps) {
    const [currentNode, setCurrentNode] = useState<FoodNode | null>(null);
    const [children, setChildren] = useState<FoodNode[]>([]);
    const [parents, setParents] = useState<FoodNode[]>([]);
    const [relatedRecipes, setRelatedRecipes] = useState<Recipe[]>([]);
    const [pantryStatus, setPantryStatus] = useState<PantryItem | null>(null);
    const [loading, setLoading] = useState(true);

    // Search & Filter State
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<FoodNode[]>([]);
    const [showCategories, setShowCategories] = useState(true);
    const [showProducts, setShowProducts] = useState(true);

    useEffect(() => {
        loadNode(initialFoodId || 1); // Default to Root (ID 1)
    }, [initialFoodId]);

    const loadNode = async (id: number) => {
        setLoading(true);
        const node = await api.getFoodNode(id);
        if (node) {
            setCurrentNode(node);
            const kids = await api.getFoodNodeChildren(id);
            setChildren(kids);
            const ancestry = await api.getFoodNodeParents(id);
            setParents(ancestry);

            // Find related recipes (using fuzzy matching logic logic implicitly)
            const allRecipes = await api.getRecipes();
            const allNodes = await api.getFoodNodes();

            const related = allRecipes.filter(r =>
                r.ingredients.some(i => {
                    const ingredientNode = allNodes.find(n => n.id === i.food_node_id);
                    return ingredientNode?.id === id || ingredientNode?.path.startsWith(node.path);
                })
            );
            setRelatedRecipes(related);

            const pantry = await api.getPantry();
            const item = pantry.find((p: PantryItem) => {
                const pNode = allNodes.find(n => n.id === p.food_node_id);
                return pNode && pNode.path.startsWith(node.path);
            });
            setPantryStatus(item || null);
        }
        setLoading(false);
    };

    // Debounced Search with Filtering
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchQuery.length > 1) {
                const results = await api.searchNodes(searchQuery);
                // Filter results based on checkboxes
                const filtered = results.filter(n => {
                    if (!showCategories && n.type === 'category') return false;
                    if (!showProducts && (n.type === 'generic_food' || n.type === 'branded_product')) return false;
                    return true;
                });
                setSearchResults(filtered);
            } else {
                setSearchResults([]);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery, showCategories, showProducts]);

    const navigateTo = (id: number) => {
        setSearchQuery("");
        setSearchResults([]);
        loadNode(id);
    };

    if (loading && !currentNode) return <div className="p-8 text-center text-slate-400">Loading Encyclopedia...</div>;
    if (!currentNode) return <div className="p-8 text-center">Item not found</div>;

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
                    <Checkbox label="Foods & Products" checked={showProducts} onChange={setShowProducts} />
                </div>

                {/* Search Results Dropdown/Overlay */}
                {searchResults.length > 0 && (
                    <div className="absolute z-20 left-0 right-0 mt-2 mx-4 md:mx-8 bg-white rounded-xl shadow-2xl border border-slate-100 max-h-96 overflow-auto">
                        {searchResults.map(result => (
                            <button
                                key={result.id}
                                onClick={() => navigateTo(result.id)}
                                className="w-full text-left px-6 py-3 hover:bg-slate-50 text-sm text-slate-700 flex justify-between items-center border-b border-slate-50 last:border-0"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                                        {result.type === 'category' ? <Folder size={16} /> : <Tag size={16} />}
                                    </div>
                                    <div>
                                        <span className="font-bold text-slate-800 block">{result.name}</span>
                                        {result.description && <span className="text-xs text-slate-400 line-clamp-1">{result.description}</span>}
                                    </div>
                                </div>
                                <Badge color={result.type === 'category' ? 'blue' : 'orange'}>
                                    {result.type.replace('_', ' ')}
                                </Badge>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Breadcrumbs */}
            <nav className="flex items-center text-sm text-slate-500 overflow-x-auto whitespace-nowrap pb-2 scrollbar-hide">
                {parents.map((parent, idx) => (
                    <React.Fragment key={parent.id}>
                        <button onClick={() => navigateTo(parent.id)} className="hover:text-emerald-600 transition-colors">
                            {parent.name}
                        </button>
                        <ChevronRight size={14} className="mx-2 flex-shrink-0 text-slate-300" />
                    </React.Fragment>
                ))}
                <span className="font-bold text-slate-800 px-2 py-1 bg-slate-100 rounded-md">{currentNode.name}</span>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Header Card */}
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                        <div className="w-full md:w-48 aspect-square rounded-2xl bg-white border border-slate-200 p-2 shadow-sm flex-shrink-0 flex items-center justify-center overflow-hidden">
                            {currentNode.image ? (
                                <img src={currentNode.image} alt={currentNode.name} className="w-full h-full object-cover rounded-xl" />
                            ) : (
                                <Folder size={64} className="text-emerald-100" />
                            )}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                                <h1 className="text-3xl font-bold text-slate-800">{currentNode.name}</h1>
                                {pantryStatus ? (
                                    <Badge color="emerald"><CheckCircle2 size={12} className="mr-1" /> In Stock</Badge>
                                ) : (
                                    <Badge color="slate">Not in Stock</Badge>
                                )}
                                <Badge color="orange">{currentNode.type.replace('_', ' ')}</Badge>
                            </div>
                            <p className="text-slate-600 mb-6 leading-relaxed text-lg">
                                {currentNode.description || `Browse information, related products, and recipes featuring ${currentNode.name}.`}
                            </p>
                            <div className="flex gap-3">
                                <Button onClick={() => { }} variant="secondary">
                                    <Plus size={16} /> Add to List
                                </Button>
                                {!pantryStatus && (
                                    <Button onClick={() => { }}>
                                        <Plus size={16} /> Add to Pantry
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Rich Data Grid */}
                    {(currentNode.nutrition || currentNode.pairings || currentNode.storage) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Nutrition Card */}
                            {currentNode.nutrition && (
                                <Card className="p-5 border-l-4 border-l-emerald-500">
                                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                        <Activity size={18} className="text-emerald-500" /> Nutrition <span className="text-xs font-normal text-slate-400">(per 100g)</span>
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                                            <span className="text-slate-500">Calories</span>
                                            <span className="font-bold text-slate-800">{currentNode.nutrition.calories} kcal</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-500">Protein</span>
                                            <span>{currentNode.nutrition.protein}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-500">Fat</span>
                                            <span>{currentNode.nutrition.fat}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-500">Carbs</span>
                                            <span>{currentNode.nutrition.carbs}</span>
                                        </div>
                                    </div>
                                </Card>
                            )}

                            {/* Flavor & Pairings */}
                            {currentNode.pairings && (
                                <Card className="p-5 border-l-4 border-l-orange-500">
                                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                        <Utensils size={18} className="text-orange-500" /> Flavor Profile
                                    </h3>
                                    <p className="text-sm text-slate-500 mb-3">Commonly paired with:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {currentNode.pairings.map(pair => (
                                            <span key={pair} className="bg-orange-50 text-orange-700 px-3 py-1 rounded-full text-sm font-medium">
                                                {pair}
                                            </span>
                                        ))}
                                    </div>
                                </Card>
                            )}

                            {/* Storage Tips */}
                            {currentNode.storage && (
                                <Card className="p-5 border-l-4 border-l-blue-500 md:col-span-2">
                                    <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                                        <Thermometer size={18} className="text-blue-500" /> Storage Tips
                                    </h3>
                                    <p className="text-slate-600 leading-relaxed">
                                        {currentNode.storage}
                                    </p>
                                </Card>
                            )}
                        </div>
                    )}

                    {/* Children / Varieties Browser */}
                    {children.length > 0 && (
                        <section>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                    {currentNode.type === 'category' ? <Folder size={24} className="text-emerald-500" /> : <Tag size={24} className="text-emerald-500" />}
                                    {currentNode.type === 'category' ? 'Subcategories & Varieties' : 'Brands & Specifics'}
                                </h2>
                                <span className="text-sm text-slate-500 bg-slate-100 px-2 py-1 rounded-full">{children.length} items</span>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {children.map(child => (
                                    <Card
                                        key={child.id}
                                        className="hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group h-full border border-slate-200"
                                        onClick={() => navigateTo(child.id)}
                                    >
                                        <div className="p-4 flex flex-col h-full">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-emerald-50 transition-colors">
                                                    {child.type === 'category' ? <Folder size={20} className="text-slate-400 group-hover:text-emerald-500" /> : <Tag size={20} className="text-slate-400 group-hover:text-emerald-500" />}
                                                </div>
                                            </div>
                                            <h3 className="font-semibold text-slate-700 group-hover:text-emerald-700 mb-1 leading-tight">{child.name}</h3>
                                            {child.description && (
                                                <p className="text-xs text-slate-400 line-clamp-2 mt-auto">{child.description}</p>
                                            )}
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Related Recipes */}
                    <section>
                        <h2 className="text-xl font-bold text-slate-800 mb-4">Used In These Recipes</h2>
                        {relatedRecipes.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {relatedRecipes.map(recipe => (
                                    <Card key={recipe.id} className="flex gap-4 p-3 hover:bg-slate-50 transition-colors cursor-pointer group" onClick={() => onNavigate && onNavigate('recipe-detail', { slug: recipe.slug })}>
                                        <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 relative">
                                            <img src={recipe.image_url || '/placeholder-recipe.jpg'} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                        </div>
                                        <div className="py-1 flex-1">
                                            <h3 className="font-bold text-slate-800 text-sm mb-1 group-hover:text-emerald-600">{recipe.title}</h3>
                                            <p className="text-xs text-slate-500 line-clamp-2 mb-2">{recipe.description || 'No description available.'}</p>
                                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                                <ClockIcon /> {(recipe.prep_time || 0) + (recipe.cook_time || 0)}m
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-slate-50 rounded-xl p-8 text-center text-slate-500 border border-dashed border-slate-200">
                                No recipes found using {currentNode.name} directly.
                            </div>
                        )}
                    </section>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <Card className="p-5">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Info size={18} className="text-blue-500" /> Inventory Status
                        </h3>
                        {pantryStatus ? (
                            <div className="space-y-4 bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                                <div className="flex justify-between text-sm">
                                    <span className="text-emerald-700">Quantity</span>
                                    <span className="font-bold text-emerald-900">{pantryStatus.quantity} {pantryStatus.unit}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-emerald-700">Location</span>
                                    <span className="font-bold text-emerald-900 capitalize">{pantryStatus.location}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-emerald-700">Expires</span>
                                    <span className={`font-bold ${pantryStatus.expiration_date ? 'text-red-600' : 'text-emerald-900'}`}>
                                        {pantryStatus.expiration_date || 'N/A'}
                                    </span>
                                </div>
                                <Button variant="secondary" className="w-full text-xs bg-white h-8">Update Inventory</Button>
                            </div>
                        ) : (
                            <div className="text-center py-6 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm text-slate-300">
                                    <ShoppingCart size={24} />
                                </div>
                                <p className="text-sm text-slate-500 mb-4">You don't have this item.</p>
                                <Button className="w-full text-sm">Add to Shopping List</Button>
                            </div>
                        )}
                    </Card>

                    <Card className="p-5 bg-gradient-to-br from-indigo-900 to-slate-900 text-white border-none overflow-hidden relative">
                        <div className="relative z-10">
                            <h3 className="font-bold mb-2 flex items-center gap-2">
                                <Zap size={16} className="text-yellow-400" /> FoodGenie Fact
                            </h3>
                            <p className="text-sm text-slate-300 leading-relaxed">
                                FoodGenie uses a <strong>hierarchical indexing system</strong>. This means if a recipe calls for "Pork",
                                your "Oscar Mayer Bacon" (a child of Pork) will automatically be detected as a match!
                            </p>
                        </div>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
                    </Card>
                </div>
            </div >
        </div >
    );
}

// Helpers
const ClockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>;
