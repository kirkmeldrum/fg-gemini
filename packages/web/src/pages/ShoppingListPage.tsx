import { useState, useEffect } from 'react';
import { ShoppingBag, Check, Plus, Trash2, ArrowRightCircle, ListChecks, Search } from 'lucide-react';
import { Button, Card, Badge, Modal, Input } from '../components/ui';
import {
  getShoppingList,
  addShoppingItem,
  toggleShoppingItemCheck,
  deleteShoppingItem,
  addInventoryItem,
  ShoppingItem
} from '../lib/api';

export default function ShoppingListPage() {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Add Item Form State
  const [newItemName, setNewItemName] = useState("");
  const [newItemQty, setNewItemQty] = useState("1");
  const [newItemUnit, setNewItemUnit] = useState("pc");

  const loadItems = async () => {
    setLoading(true);
    try {
      const data = await getShoppingList();
      setItems(data);
    } catch (err) {
      console.error('Failed to load shopping list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleToggleItem = async (id: number, currentChecked: boolean) => {
    try {
      await toggleShoppingItemCheck(id, !currentChecked);
      loadItems();
    } catch (err) {
      console.error('Failed to toggle item:', err);
    }
  };

  const handleDeleteItem = async (id: number) => {
    try {
      await deleteShoppingItem(id);
      loadItems();
    } catch (err) {
      console.error('Failed to delete item:', err);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addShoppingItem({
        name_display: newItemName,
        quantity: parseFloat(newItemQty),
        unit: newItemUnit,
      });
      setShowAddModal(false);
      setNewItemName("");
      setNewItemQty("1");
      loadItems();
    } catch (err) {
      console.error('Failed to add item:', err);
    }
  };

  const handleMoveToPantry = async () => {
    const checkedItems = items.filter(i => i.is_checked);
    try {
      for (const item of checkedItems) {
        await addInventoryItem({
          ingredient_id: item.ingredient_id || 0, // Fallback if not linked
          product_name: item.name_display,
          quantity: item.quantity || 1,
          unit: item.unit || 'pcs',
          storage_location: 'pantry'
        });
        await deleteShoppingItem(item.id);
      }
      setShowMoveModal(false);
      loadItems();
    } catch (err) {
      console.error('Failed to move items to pantry:', err);
    }
  };

  const checkedCount = items.filter(i => i.is_checked).length;

  const filteredItems = items.filter(item =>
    item.name_display.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.source_label?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Shopping List</h1>
          <p className="text-slate-500 mt-1">Smart, categorized, and synced with your kitchen inventory.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input
              placeholder="Search your list..."
              className="pl-10 h-10 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={() => setShowAddModal(true)} className="shadow-blue-100 shadow-lg bg-blue-600 hover:bg-blue-700">
            <Plus size={18} />
            <span className="hidden sm:inline">Add Item</span>
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400 font-medium">Updating list...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="py-24 text-center bg-white border-2 border-dashed border-slate-200 rounded-3xl animate-in zoom-in duration-300">
          <ShoppingBag size={64} className="mx-auto text-slate-200 mb-6 drop-shadow-sm" />
          <h3 className="text-xl font-bold text-slate-900">Your list is clean!</h3>
          <p className="text-slate-500 max-w-sm mx-auto mt-2">Add items manually or from your planned recipes to keep your kitchen stocked.</p>
          <Button variant="secondary" className="mt-8 rounded-xl" onClick={() => setShowAddModal(true)}>
            Add Items Now
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center px-2">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-widest">
              <ListChecks size={16} />
              {items.length} Items
            </div>
            {checkedCount > 0 && (
              <Button
                size="sm"
                onClick={() => setShowMoveModal(true)}
                className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200 border text-xs h-8 px-4 font-black"
              >
                <ArrowRightCircle size={14} className="mr-1.5" /> MOVE {checkedCount} TO PANTRY
              </Button>
            )}
          </div>

          <Card className="divide-y divide-slate-100 shadow-xl shadow-slate-200/40 p-0 overflow-hidden border-none rounded-2xl">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className={`p-4 flex items-center justify-between group transition-all duration-300 ${item.is_checked ? 'bg-slate-50/50' : 'hover:bg-blue-50/30'}`}
              >
                <div className="flex items-center gap-4 cursor-pointer flex-1" onClick={() => handleToggleItem(item.id, item.is_checked)}>
                  <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${item.is_checked ? 'bg-blue-500 border-blue-500 text-white scale-110 shadow-md shadow-blue-100' : 'border-slate-200 bg-white group-hover:border-blue-400'
                    }`}>
                    {item.is_checked && <Check size={14} strokeWidth={4} />}
                  </div>
                  <div>
                    <p className={`text-lg font-bold transition-all duration-300 ${item.is_checked ? 'text-slate-300 line-through italic' : 'text-slate-700'}`}>
                      {item.name_display}
                    </p>
                    <div className="flex items-center gap-3">
                      <p className={`text-xs font-black uppercase tracking-tighter ${item.is_checked ? 'text-slate-300' : 'text-slate-400'}`}>
                        {item.quantity} {item.unit}
                      </p>
                      {item.source_label && (
                        <Badge color="blue" className="text-[10px] py-0 px-1.5 opacity-60">
                          {item.source_label}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteItem(item.id)}
                  className="text-slate-200 hover:text-red-500 hover:bg-red-50 p-2.5 rounded-xl transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </Card>
        </div>
      )}

      {/* Add Item Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add to Shopping List">
        <form onSubmit={handleAddItem} className="space-y-5 py-2">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Item Name</label>
            <Input
              placeholder="e.g. Fresh Cilantro, Greek Yogurt..."
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              autoFocus
              required
              className="bg-slate-50 text-lg font-bold"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Quantity</label>
              <Input
                type="number"
                step="0.1"
                value={newItemQty}
                onChange={(e) => setNewItemQty(e.target.value)}
                required
                className="bg-slate-50 font-black text-xl"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Unit</label>
              <Input
                placeholder="e.g. bunch, kg, packet"
                value={newItemUnit}
                onChange={(e) => setNewItemUnit(e.target.value)}
                className="bg-slate-50 font-bold"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-6">
            <Button variant="secondary" className="flex-1 rounded-xl" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button type="submit" className="flex-1 rounded-xl shadow-lg shadow-blue-100 bg-blue-600 hover:bg-blue-700">Add to List</Button>
          </div>
        </form>
      </Modal>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showMoveModal}
        onClose={() => setShowMoveModal(false)}
        title="Sync with Kitchen"
      >
        <div className="space-y-5">
          <p className="text-slate-600 leading-relaxed font-medium">
            You've checked <strong>{checkedCount} items</strong> today.
            Ready to restock your digital kitchen?
          </p>
          <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 flex gap-4 items-start">
            <div className="bg-emerald-500 rounded-full p-1 text-white mt-0.5">
              <Check size={16} strokeWidth={4} />
            </div>
            <p className="text-sm text-emerald-800 font-bold">
              Items will be added to your <span className="underline italic">Pantry</span> and removed from your shopping list automatically.
            </p>
          </div>
          <div className="flex gap-3 pt-4">
            <Button className="flex-2 rounded-xl h-12 text-lg" onClick={handleMoveToPantry}>Restock My Kitchen</Button>
            <Button variant="secondary" className="flex-1 rounded-xl h-12" onClick={() => setShowMoveModal(false)}>Wait</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
