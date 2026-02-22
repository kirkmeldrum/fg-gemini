

import React, { useState, useEffect, useRef } from 'react';
import { 
    Camera, X, Scan, Zap, ShoppingCart, Info, 
    Utensils, FileText, CheckCircle2, Plus, 
    Maximize, Search, ChevronRight, AlertCircle, ArrowRight 
} from 'lucide-react';
import { Button, Badge, Modal, Card } from './components';
import { api, FoodNode, PantryItem, ShoppingItem } from './data';

type ScannerMode = 'pantry' | 'item' | 'shopping' | 'info' | 'receipt';

interface DetectedObject {
    id: string; // unique scan id
    node: FoodNode;
    coords: { x: number, y: number }; // Percentage
    timestamp: number;
}

export default function SmartScanner({ onNavigate }: { onNavigate: (view: string, params?: any) => void }) {
  const [mode, setMode] = useState<ScannerMode>('pantry');
  const [isScanning, setIsScanning] = useState(true);
  const [detectedItems, setDetectedItems] = useState<DetectedObject[]>([]);
  const [receiptResult, setReceiptResult] = useState<ShoppingItem[] | null>(null);
  const [showInfoModal, setShowInfoModal] = useState<FoodNode | null>(null);
  const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null);

  // Simulation Interval
  useEffect(() => {
    let interval: any;

    if (isScanning && (mode === 'pantry' || mode === 'item' || mode === 'shopping' || mode === 'info')) {
        interval = setInterval(async () => {
            // Simulate detection event
            if (Math.random() > 0.6) {
                const node = await api.detectFoodObject();
                const newItem = {
                    id: Date.now().toString(),
                    node,
                    coords: { x: Math.random() * 60 + 20, y: Math.random() * 60 + 20 },
                    timestamp: Date.now()
                };

                // For 'item' mode, we only want one focus item
                if (mode === 'item' || mode === 'info') {
                    setDetectedItems([newItem]);
                } else {
                    // For pantry/shopping, accumulate items, max 5 on screen
                    setDetectedItems(prev => [...prev.slice(-4), newItem]);
                }
            }
        }, 1500);
    }

    return () => clearInterval(interval);
  }, [isScanning, mode]);

  const handleCapture = async () => {
    // Shutter Action
    if (mode === 'receipt') {
        setIsScanning(false);
        const items = await api.parseReceipt(null);
        setReceiptResult(items);
    } else if (mode === 'info' && detectedItems.length > 0) {
        setShowInfoModal(detectedItems[0].node);
    } else if (mode === 'shopping') {
         // Batch add detected to shopping list
         detectedItems.forEach(item => {
             api.addShoppingItem({
                 name: item.node.name,
                 quantity: 1,
                 unit: 'pc',
                 category: 'Scanned',
                 food_node_id: item.node.id
             });
         });
         alert(`Added ${detectedItems.length} items to Shopping List`);
         setDetectedItems([]);
    }
  };

  const handleAddToPantry = (node: FoodNode) => {
      api.addToPantry({
          food_node_id: node.id,
          quantity: 1,
          unit: 'pc',
          location: 'pantry',
          expiration_date: null
      });
      // Remove from visual list
      setDetectedItems(prev => prev.filter(i => i.node.id !== node.id));
  };

  const confirmReceiptItems = async (itemsToKeep: ShoppingItem[]) => {
      // 1. Add to Pantry
      for(const item of itemsToKeep) {
          await api.addToPantry({
              food_node_id: item.food_node_id || 0,
              quantity: item.quantity,
              unit: item.unit,
              location: 'pantry',
              expiration_date: null
          });
      }

      // 2. Ask to remove matching from Shopping List
      const shoppingList = await api.getShoppingList();
      const matches = shoppingList.filter(sl => 
          itemsToKeep.some(k => k.name.toLowerCase() === sl.name.toLowerCase())
      );

      if (matches.length > 0) {
          if(confirm(`Found ${matches.length} matching items on your active Shopping List. Mark them as done?`)) {
              for(const match of matches) {
                  await api.toggleShoppingItem(match.id);
              }
          }
      }
      
      onNavigate('kitchen');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Top Controls */}
      <div className="absolute top-0 left-0 right-0 p-4 z-20 flex justify-between items-center bg-gradient-to-b from-black/60 to-transparent">
        <button onClick={() => onNavigate('dashboard')} className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white">
            <X size={24} />
        </button>
        <div className="bg-black/50 backdrop-blur-md px-4 py-1 rounded-full text-white font-medium text-sm border border-white/10">
            {mode === 'pantry' && 'Scan Pantry Shelves'}
            {mode === 'item' && 'Scan Single Item'}
            {mode === 'shopping' && 'Scan to Shopping List'}
            {mode === 'info' && 'Nutrition Scanner'}
            {mode === 'receipt' && 'Scan Receipt'}
        </div>
        <button className="p-2 text-white">
            <Zap size={24} className="opacity-50" />
        </button>
      </div>

      {/* Camera Viewfinder */}
      <div className="flex-1 relative overflow-hidden bg-slate-800">
          
          {/* Simulated Camera Feed */}
          <div className="absolute inset-0 opacity-40">
               {/* Using a generic 'shelf' or 'food' image as placeholder for video feed */}
               <img 
                 src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80" 
                 className="w-full h-full object-cover"
               />
          </div>

          {/* AR Overlays (Scanning Lines / Bounding Boxes) */}
          {isScanning && mode !== 'receipt' && (
            <div className="absolute inset-0">
                <div className="absolute top-1/4 left-1/4 right-1/4 bottom-1/4 border border-white/30 rounded-lg">
                    <div className="w-full h-0.5 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-[scan_2s_infinite]"></div>
                </div>
            </div>
          )}

          {/* Receipt Guide */}
          {mode === 'receipt' && (
              <div className="absolute inset-8 border-2 border-dashed border-emerald-400 rounded-lg bg-black/20 flex items-center justify-center">
                  <span className="text-white font-medium bg-black/50 px-3 py-1 rounded">Align Receipt Edge</span>
              </div>
          )}

          {/* Detected Objects Overlay */}
          {detectedItems.map(item => (
              <div 
                key={item.id}
                className="absolute flex flex-col items-center animate-in zoom-in duration-300"
                style={{ top: `${item.coords.y}%`, left: `${item.coords.x}%` }}
              >
                  <div className="w-16 h-16 border-2 border-emerald-500 rounded-lg relative mb-2 shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                     <div className="absolute -top-1 -left-1 w-2 h-2 bg-emerald-500"></div>
                     <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500"></div>
                     <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-emerald-500"></div>
                     <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-emerald-500"></div>
                  </div>
                  
                  {/* Quick Action Bubble */}
                  <div className="bg-white rounded-lg shadow-lg p-2 flex flex-col items-center gap-1 min-w-[120px] animate-in slide-in-from-bottom-2">
                      <span className="text-xs font-bold text-slate-800">{item.node.name}</span>
                      {mode === 'pantry' && (
                          <button 
                            onClick={() => handleAddToPantry(item.node)}
                            className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-1 rounded w-full flex items-center justify-center gap-1"
                          >
                              <Plus size={10} /> Add
                          </button>
                      )}
                      {mode === 'shopping' && (
                          <span className="text-[10px] text-emerald-600 font-medium">Ready to Add</span>
                      )}
                      {mode === 'info' && (
                          <button 
                             onClick={() => setShowInfoModal(item.node)}
                             className="text-emerald-600 text-[10px] font-bold flex items-center gap-1"
                          >
                              View Info <ChevronRight size={10} />
                          </button>
                      )}
                  </div>
              </div>
          ))}
      </div>

      {/* Bottom Mode Selector */}
      <div className="bg-black/90 pt-6 pb-8 px-4 rounded-t-2xl border-t border-white/10 z-20">
          
          {/* Shutter Button Area */}
          <div className="flex justify-center items-center gap-8 mb-6">
               {/* Gallery Thumbnail */}
               <div className="w-10 h-10 rounded-lg bg-slate-700 overflow-hidden border border-slate-500">
                    <img src="https://images.unsplash.com/photo-1495521821758-ee18ece6d638?auto=format&fit=crop&w=100&q=80" className="w-full h-full object-cover opacity-60" />
               </div>

               {/* Shutter */}
               <button 
                 onClick={handleCapture}
                 className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center active:scale-95 transition-transform"
               >
                   <div className="w-12 h-12 bg-white rounded-full"></div>
               </button>

                {/* Flip Camera */}
               <button className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white/80">
                   <Scan size={20} />
               </button>
          </div>

          {/* Mode Slider */}
          <div className="flex justify-between items-center text-xs font-medium text-slate-400 px-2 overflow-x-auto whitespace-nowrap gap-6 no-scrollbar">
              <button onClick={() => setMode('pantry')} className={mode === 'pantry' ? 'text-emerald-400 font-bold' : ''}>PANTRY</button>
              <button onClick={() => setMode('item')} className={mode === 'item' ? 'text-emerald-400 font-bold' : ''}>ITEM</button>
              <button onClick={() => setMode('shopping')} className={mode === 'shopping' ? 'text-emerald-400 font-bold' : ''}>SHOPPING</button>
              <button onClick={() => setMode('receipt')} className={mode === 'receipt' ? 'text-emerald-400 font-bold' : ''}>RECEIPT</button>
              <button onClick={() => setMode('info')} className={mode === 'info' ? 'text-emerald-400 font-bold' : ''}>INFO</button>
          </div>
      </div>

      {/* Info Modal Overlay */}
      <Modal isOpen={!!showInfoModal} onClose={() => setShowInfoModal(null)} title="Nutrition Facts">
        {showInfoModal && (
            <div className="space-y-4">
                <div className="flex gap-4">
                    {showInfoModal.image && <img src={showInfoModal.image} className="w-20 h-20 rounded-lg object-cover" />}
                    <div>
                        <h3 className="font-bold text-lg">{showInfoModal.name}</h3>
                        <p className="text-sm text-slate-500">{showInfoModal.description}</p>
                    </div>
                </div>
                {showInfoModal.nutrition && (
                    <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg">
                        <div>
                            <span className="block text-xs text-slate-500">Calories</span>
                            <span className="font-bold">{showInfoModal.nutrition.calories}</span>
                        </div>
                        <div>
                            <span className="block text-xs text-slate-500">Protein</span>
                            <span className="font-bold">{showInfoModal.nutrition.protein}</span>
                        </div>
                        <div>
                            <span className="block text-xs text-slate-500">Carbs</span>
                            <span className="font-bold">{showInfoModal.nutrition.carbs}</span>
                        </div>
                        <div>
                            <span className="block text-xs text-slate-500">Fat</span>
                            <span className="font-bold">{showInfoModal.nutrition.fat}</span>
                        </div>
                    </div>
                )}
                <div className="flex gap-2">
                    <Button className="flex-1" onClick={() => { handleAddToPantry(showInfoModal); setShowInfoModal(null); }}>Add to Pantry</Button>
                    <Button variant="secondary" onClick={() => setShowInfoModal(null)}>Close</Button>
                </div>
            </div>
        )}
      </Modal>

      {/* Receipt Results Modal */}
      <Modal isOpen={!!receiptResult} onClose={() => setReceiptResult(null)} title="Receipt Scanned">
          {receiptResult && (
              <div className="space-y-4">
                  <div className="bg-emerald-50 text-emerald-800 p-3 rounded-lg text-sm flex items-center gap-2">
                      <CheckCircle2 size={16} /> Found {receiptResult.length} items from receipt.
                  </div>
                  <div className="max-h-60 overflow-y-auto space-y-2">
                      {receiptResult.map(item => (
                          <div key={item.id} className="flex justify-between items-center p-2 border border-slate-100 rounded">
                              <span className="font-medium text-sm">{item.name}</span>
                              <span className="text-xs text-slate-500">{item.quantity} {item.unit}</span>
                          </div>
                      ))}
                  </div>
                  <p className="text-xs text-slate-500">These items will be added to your pantry. We'll also check if they are on your shopping list.</p>
                  <Button onClick={() => confirmReceiptItems(receiptResult)} className="w-full">
                      Confirm & Update Inventory
                  </Button>
              </div>
          )}
      </Modal>
    </div>
  );
}
