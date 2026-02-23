
import React, { useState, useEffect } from 'react';
import { Package, Plus, Trash2, Search, Snowflake, Thermometer, Box } from 'lucide-react';
import { Button, Card, Badge, Modal } from './components';
import { api, PantryItem, FoodNode } from './data';

const LocationIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'fridge': return <Thermometer size={16} className="text-blue-500" />;
    case 'freezer': return <Snowflake size={16} className="text-sky-300" />;
    case 'pantry': return <Box size={16} className="text-amber-600" />;
    default: return <Package size={16} className="text-slate-500" />;
  }
};

export default function MyKitchen() {
  const [activeTab, setActiveTab] = useState<'all' | 'fridge' | 'pantry' | 'freezer'>('all');
  const [inventory, setInventory] = useState<PantryItem[]>([]);
  const [ingredients, setIngredients] = useState<FoodNode[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form State
  const [selectedIngredient, setSelectedIngredient] = useState<string>("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("pcs");
  const [location, setLocation] = useState("pantry");

  const refreshInventory = async () => {
    setLoading(true);
    const data = await api.getPantry();
    setInventory(data);
    setLoading(false);
  };

  useEffect(() => {
    refreshInventory();
    api.getFoodNodes().then(setIngredients);
  }, []);

  const handleAddItem = async () => {
    if (!selectedIngredient || !quantity) return;
    
    await api.addToPantry({
        food_node_id: parseInt(selectedIngredient),
        quantity: parseFloat(quantity),
        unit,
        location: location as any,
        expiration_date: null
    });
    
    setIsAddModalOpen(false);
    refreshInventory();
    
    // Reset form
    setQuantity("");
    setSelectedIngredient("");
  };

  const handleRemove = async (id: number) => {
    await api.removeFromPantry(id);
    refreshInventory();
  };

  const filteredItems = activeTab === 'all' 
    ? inventory 
    : inventory.filter(item => item.location === activeTab);

  const getIngredientName = (id: number) => ingredients.find(i => i.id === id)?.name || "Unknown";

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Kitchen</h1>
          <p className="text-slate-500">Manage your inventory to get better recipe suggestions.</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus size={18} />
          Add Item
        </Button>
      </div>

      <div className="bg-white p-1 rounded-lg border border-slate-200 inline-flex shadow-sm">
        {['all', 'fridge', 'pantry', 'freezer'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-all ${
              activeTab === tab 
                ? 'bg-emerald-100 text-emerald-800' 
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading your pantry...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <Card key={item.id} className="p-4 hover:shadow-md transition-shadow group relative">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    item.location === 'fridge' ? 'bg-blue-50' : 
                    item.location === 'freezer' ? 'bg-sky-50' : 'bg-amber-50'
                  }`}>
                    <LocationIcon type={item.location} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">{getIngredientName(item.food_node_id)}</h3>
                    <p className="text-sm text-slate-500">{item.quantity} {item.unit}</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleRemove(item.id)}
                  className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              <div className="mt-3 flex gap-2">
                <Badge color={item.location === 'fridge' ? 'slate' : 'orange'}>
                  {item.location}
                </Badge>
                {item.expiration_date && (
                   <Badge color="red">Exp: {item.expiration_date}</Badge> 
                )}
              </div>
            </Card>
          ))}
          
          {filteredItems.length === 0 && (
            <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-200 rounded-xl">
              <Package size={48} className="mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-medium text-slate-900">Your {activeTab} is empty</h3>
              <p className="text-slate-500">Add items to start tracking your inventory.</p>
            </div>
          )}
        </div>
      )}

      {/* Add Item Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add to Inventory">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Ingredient</label>
            <select 
              className="w-full border-slate-200 rounded-lg shadow-sm focus:border-emerald-500 focus:ring-emerald-500 p-2 border"
              value={selectedIngredient}
              onChange={(e) => setSelectedIngredient(e.target.value)}
            >
              <option value="">Select an ingredient...</option>
              {ingredients.map(ing => (
                <option key={ing.id} value={ing.id}>{ing.name}</option>
              ))}
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
              <input 
                type="number" 
                className="w-full border-slate-200 rounded-lg shadow-sm focus:border-emerald-500 focus:ring-emerald-500 p-2 border"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Unit</label>
              <select 
                className="w-full border-slate-200 rounded-lg shadow-sm focus:border-emerald-500 focus:ring-emerald-500 p-2 border"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
              >
                <option value="pcs">Pieces</option>
                <option value="kg">Kg</option>
                <option value="g">Grams</option>
                <option value="l">Liters</option>
                <option value="cup">Cups</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
            <div className="grid grid-cols-3 gap-2">
                {['pantry', 'fridge', 'freezer'].map(loc => (
                    <button 
                        key={loc}
                        onClick={() => setLocation(loc)}
                        className={`p-2 border rounded-lg text-sm capitalize ${
                            location === loc ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 hover:border-slate-300'
                        }`}
                    >
                        {loc}
                    </button>
                ))}
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <Button className="flex-1" onClick={handleAddItem}>Save Item</Button>
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
