import { useState, useEffect } from 'react';
import { Package, Plus, Trash2, Snowflake, Thermometer, Box, AlertTriangle, CheckCircle2, Search } from 'lucide-react';
import { Button, Card, Badge, Modal, Input } from '../components/ui';
import {
  getInventory,
  addInventoryItem,
  deleteInventoryItem,
  getIngredients,
  InventoryItem,
  FoodIngredient
} from '../lib/api';

const LocationIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'fridge': return <Thermometer size={16} className="text-blue-500" />;
    case 'freezer': return <Snowflake size={16} className="text-sky-400" />;
    case 'pantry': return <Box size={16} className="text-amber-600" />;
    case 'spice_rack': return <Package size={16} className="text-purple-500" />;
    default: return <Package size={16} className="text-slate-400" />;
  }
};

export default function MyKitchen() {
  const [activeTab, setActiveTab] = useState<'all' | 'fridge' | 'pantry' | 'freezer' | 'spice_rack'>('all');
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [taxonomy, setTaxonomy] = useState<FoodIngredient[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [selectedIngredientId, setSelectedIngredientId] = useState<number | null>(null);
  const [productName, setProductName] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [unit, setUnit] = useState("pcs");
  const [location, setLocation] = useState<any>("pantry");
  const [expiresAt, setExpiresAt] = useState("");

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const data = await getInventory();
      setInventory(data);
    } catch (err) {
      console.error('Failed to fetch inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTaxonomy = async () => {
    try {
      const data = await getIngredients();
      setTaxonomy(data);
    } catch (err) {
      console.error('Failed to fetch ingredients taxonomy:', err);
    }
  };

  useEffect(() => {
    fetchInventory();
    fetchTaxonomy();
  }, []);

  const handleAddItem = async () => {
    if (!selectedIngredientId) return;

    try {
      await addInventoryItem({
        ingredient_id: selectedIngredientId,
        product_name: productName || null,
        quantity: parseFloat(quantity),
        unit,
        storage_location: location,
        expiration_date: expiresAt || null
      });

      setIsAddModalOpen(false);
      fetchInventory();

      // Reset form
      setQuantity("1");
      setSelectedIngredientId(null);
      setProductName("");
      setExpiresAt("");
    } catch (err) {
      console.error('Failed to add item:', err);
    }
  };

  const handleRemove = async (id: number) => {
    try {
      await deleteInventoryItem(id);
      fetchInventory();
    } catch (err) {
      console.error('Failed to remove item:', err);
    }
  };

  const filteredItems = inventory.filter(item => {
    const matchTab = activeTab === 'all' || item.storage_location === activeTab;
    const matchSearch = item.ingredient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.product_name?.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchTab && matchSearch;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">My Kitchen</h1>
          <p className="text-slate-500 mt-1">Manage your pantry and fridge to unlock personalized recipe matches.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input
              placeholder="Search your inventory..."
              className="pl-10 h-10 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={() => setIsAddModalOpen(true)} className="shadow-emerald-100 shadow-lg">
            <Plus size={18} />
            <span className="hidden sm:inline">Add Item</span>
          </Button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {['all', 'pantry', 'fridge', 'freezer', 'spice_rack'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold capitalize whitespace-nowrap transition-all border ${activeTab === tab
                ? 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-100'
                : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-200 hover:text-emerald-600'
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-emerald-100 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400 font-medium">Scanning your shelves...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredItems.map((item) => {
            const isExpiringSoon = item.expiration_date && (new Date(item.expiration_date).getTime() - Date.now() < 3 * 24 * 60 * 60 * 1000);

            return (
              <Card key={item.id} className="group hover:border-emerald-200 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 overflow-hidden flex flex-col p-0">
                <div className="p-5 flex-1 w-full">
                  <div className="flex justify-between items-start mb-3">
                    <div className={`p-2.5 rounded-xl ${item.storage_location === 'fridge' ? 'bg-blue-50 text-blue-600' :
                        item.storage_location === 'freezer' ? 'bg-sky-50 text-sky-500' :
                          item.storage_location === 'spice_rack' ? 'bg-purple-50 text-purple-600' : 'bg-amber-50 text-amber-700'
                      }`}>
                      <LocationIcon type={item.storage_location} />
                    </div>
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="text-slate-300 hover:text-red-500 p-1 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <h3 className="font-bold text-slate-800 text-lg leading-tight mb-1 group-hover:text-emerald-700 transition-colors">
                    {item.ingredient_name}
                  </h3>
                  {item.product_name && (
                    <p className="text-xs text-slate-400 italic mb-2">{item.product_name}</p>
                  )}

                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-xl font-black text-slate-700">{item.quantity}</span>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{item.unit}</span>
                  </div>
                </div>

                <div className="px-5 py-3 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center">
                  <Badge color={
                    item.storage_location === 'fridge' ? 'slate' :
                      item.storage_location === 'freezer' ? 'slate' : 'orange'
                  } className="text-[10px] uppercase tracking-tighter">
                    {item.storage_location}
                  </Badge>

                  {item.expiration_date ? (
                    <div className={`flex items-center gap-1 text-[11px] font-bold ${isExpiringSoon ? 'text-red-500' : 'text-slate-400'}`}>
                      {isExpiringSoon && <AlertTriangle size={12} />}
                      Exp: {new Date(item.expiration_date).toLocaleDateString()}
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-500/60">
                      <CheckCircle2 size={12} /> Stable
                    </div>
                  )}
                </div>
              </Card>
            );
          })}

          {filteredItems.length === 0 && (
            <div className="col-span-full py-20 text-center bg-white border-2 border-dashed border-slate-200 rounded-3xl animate-in zoom-in duration-300">
              <Package size={64} className="mx-auto text-slate-200 mb-6 drop-shadow-sm" />
              <h3 className="text-xl font-bold text-slate-900">Your {activeTab === 'all' ? 'kitchen' : activeTab} is empty</h3>
              <p className="text-slate-500 max-w-sm mx-auto mt-2">Start adding ingredients to see what you can cook today.</p>
              <Button variant="secondary" onClick={() => setIsAddModalOpen(true)} className="mt-8">
                <Plus size={18} /> Add First Item
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Add Item Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add to Inventory">
        <div className="space-y-5 py-2">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Ingredient</label>
            <div className="relative">
              <select
                className="w-full bg-slate-50 border-slate-200 rounded-xl shadow-sm focus:border-emerald-500 focus:ring-emerald-500 p-3 border appearance-none text-slate-800 font-medium"
                value={selectedIngredientId || ""}
                onChange={(e) => setSelectedIngredientId(parseInt(e.target.value))}
              >
                <option value="">Search taxonomy...</option>
                {taxonomy.map(ing => (
                  <option key={ing.id} value={ing.id}>{ing.name} {ing.is_pantry_staple ? '⭐' : ''}</option>
                ))}
              </select>
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Product/Brand (Optional)</label>
            <Input
              placeholder="e.g. Kerrygold, Organic..."
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="bg-slate-50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Quantity</label>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="bg-slate-50 font-bold text-lg"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Unit</label>
              <select
                className="w-full bg-slate-50 border-slate-200 rounded-xl shadow-sm focus:border-emerald-500 focus:ring-emerald-500 p-3 border font-medium h-[46px]"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
              >
                <option value="pcs">Pieces</option>
                <option value="kg">Kg</option>
                <option value="g">Grams</option>
                <option value="ml">ml</option>
                <option value="l">Liters</option>
                <option value="oz">oz</option>
                <option value="tsp">tsp</option>
                <option value="tbsp">tbsp</option>
                <option value="cup">Cups</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Location</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'pantry', icon: Box },
                { id: 'fridge', icon: Thermometer },
                { id: 'freezer', icon: Snowflake },
                { id: 'spice_rack', icon: Package }
              ].map(loc => {
                const Icon = loc.icon;
                return (
                  <button
                    key={loc.id}
                    onClick={() => setLocation(loc.id)}
                    className={`p-3 border rounded-xl flex flex-col items-center gap-1 transition-all ${location === loc.id
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm'
                        : 'border-slate-100 bg-slate-50/50 text-slate-500 hover:border-slate-300'
                      }`}
                  >
                    <Icon size={18} />
                    <span className="text-[10px] uppercase font-black tracking-tighter">{loc.id.replace('_', ' ')}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Expiration (Optional)</label>
            <Input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="bg-slate-50"
            />
          </div>

          <div className="pt-6 flex gap-3">
            <Button variant="secondary" className="flex-1 rounded-xl" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button className="flex-1 rounded-xl shadow-lg shadow-emerald-100" onClick={handleAddItem}>Save to Kitchen</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
