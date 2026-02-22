
import React, { useState, useEffect } from 'react';
import { ShoppingCart, Check, Plus, Trash2, ArrowRightCircle, CheckSquare } from 'lucide-react';
import { Button, Card, Badge, Modal, Label, Input } from './components';
import { api, ShoppingItem } from './data';

const CATEGORIES = ["Produce", "Dairy", "Meat", "Pantry", "Frozen", "Household", "Other"];

export default function ShoppingList() {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Add Item Form State
  const [newItemName, setNewItemName] = useState("");
  const [newItemQty, setNewItemQty] = useState("1");
  const [newItemUnit, setNewItemUnit] = useState("pc");
  const [newItemCat, setNewItemCat] = useState("Produce");

  const loadItems = async () => {
    const data = await api.getShoppingList();
    setItems(data);
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleToggleItem = async (id: number) => {
    await api.toggleShoppingItem(id);
    loadItems();
  };

  const handleDeleteItem = async (id: number) => {
    await api.deleteShoppingItem(id);
    loadItems();
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.addShoppingItem({
      name: newItemName,
      quantity: parseFloat(newItemQty),
      unit: newItemUnit,
      category: newItemCat,
      food_node_id: null
    });
    setShowAddModal(false);
    setNewItemName("");
    setNewItemQty("1");
    loadItems();
  };

  const handleClearCompleted = async () => {
    await api.clearCompletedShoppingItems();
    loadItems();
  };

  const handleMoveToPantry = async () => {
    const checkedItems = items.filter(i => i.checked);
    for (const item of checkedItems) {
      await api.addToPantry({
        food_node_id: item.food_node_id || 0, // 0 indicates unknown ingredient link
        quantity: item.quantity,
        unit: item.unit,
        location: 'pantry',
        expiration_date: null
      });
    }
    await api.clearCompletedShoppingItems();
    setShowMoveModal(false);
    loadItems();
  };

  const checkedCount = items.filter(i => i.checked).length;

  // Group items by category
  const groupedItems = items.reduce((groups, item) => {
    const category = item.category || "Other";
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(item);
    return groups;
  }, {} as Record<string, ShoppingItem[]>);

  const sortedCategories = Object.keys(groupedItems).sort();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Shopping List</h1>
          <p className="text-slate-500">Categorized for a faster shopping trip.</p>
        </div>
        <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => setShowAddModal(true)}>
                <Plus size={18} /> Add Item
            </Button>
            {checkedCount > 0 && (
                <>
                    <Button variant="secondary" onClick={handleClearCompleted} className="text-slate-600">
                        <Trash2 size={18} /> Clear {checkedCount} Done
                    </Button>
                    <Button onClick={() => setShowMoveModal(true)}>
                        <ArrowRightCircle size={18} /> Move to Pantry
                    </Button>
                </>
            )}
        </div>
      </div>

      {items.length === 0 ? (
        <Card className="p-12 text-center text-slate-400 border-dashed">
            <ShoppingCart size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium text-slate-600">Your list is empty</p>
            <p>Add items to get started.</p>
            <Button variant="secondary" className="mt-4 mx-auto" onClick={() => setShowAddModal(true)}>
                Add First Item
            </Button>
        </Card>
      ) : (
        <div className="space-y-6">
            {sortedCategories.map(category => (
                <div key={category}>
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 px-1">{category}</h3>
                    <Card className="divide-y divide-slate-100 overflow-hidden">
                        {groupedItems[category].map((item) => (
                            <div 
                                key={item.id} 
                                className={`p-3 flex items-center justify-between group transition-colors ${item.checked ? 'bg-slate-50' : 'hover:bg-slate-50'}`}
                            >
                                <div className="flex items-center gap-4 cursor-pointer flex-1" onClick={() => handleToggleItem(item.id)}>
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                                        item.checked ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 bg-white'
                                    }`}>
                                        {item.checked && <Check size={12} strokeWidth={3} />}
                                    </div>
                                    <div>
                                        <p className={`font-medium ${item.checked ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                                            {item.name}
                                        </p>
                                        <p className="text-xs text-slate-400">{item.quantity} {item.unit}</p>
                                    </div>
                                </div>
                                
                                <button 
                                    onClick={() => handleDeleteItem(item.id)}
                                    className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-2"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </Card>
                </div>
            ))}
        </div>
      )}

      {/* Add Item Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add to Shopping List">
        <form onSubmit={handleAddItem} className="space-y-4">
            <div>
                <Label>Item Name</Label>
                <Input 
                    placeholder="e.g. Bananas" 
                    value={newItemName} 
                    onChange={(e) => setNewItemName(e.target.value)} 
                    autoFocus
                    required 
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label>Quantity</Label>
                    <Input type="number" step="0.1" value={newItemQty} onChange={(e) => setNewItemQty(e.target.value)} required />
                </div>
                <div>
                    <Label>Unit</Label>
                    <Input placeholder="e.g. bunch" value={newItemUnit} onChange={(e) => setNewItemUnit(e.target.value)} />
                </div>
            </div>
            <div>
                <Label>Category</Label>
                <select 
                    className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    value={newItemCat}
                    onChange={(e) => setNewItemCat(e.target.value)}
                >
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
            </div>
            <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1">Add Item</Button>
            </div>
        </form>
      </Modal>

      {/* Confirmation Modal */}
      <Modal 
        isOpen={showMoveModal} 
        onClose={() => setShowMoveModal(false)} 
        title="Update Inventory?"
      >
        <div className="space-y-4">
            <p className="text-slate-600">
                You have marked <strong>{checkedCount} items</strong> as purchased. 
                Would you like to move them to your <strong>My Kitchen</strong> inventory?
            </p>
            <div className="bg-emerald-50 p-3 rounded-lg text-sm text-emerald-800">
                Items will be added to the default "Pantry" location.
            </div>
            <div className="flex gap-3 pt-2">
                <Button className="flex-1" onClick={handleMoveToPantry}>Yes, Move Items</Button>
                <Button variant="secondary" onClick={() => setShowMoveModal(false)}>Cancel</Button>
            </div>
        </div>
      </Modal>
    </div>
  );
}
