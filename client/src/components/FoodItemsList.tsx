import React, { useState } from 'react';
import { FoodItem } from '../types';
import { Utensils, Plus, Trash2, CheckCircle, AlertCircle, HelpCircle, Flame, Sparkles } from 'lucide-react';

interface FoodItemsListProps {
  foods: FoodItem[];
  onUpdateQuantity: (index: number, newQty: number) => void;
  onRemoveItem: (index: number) => void;
  onAddItem: (newItem: FoodItem) => void;
}

export const FoodItemsList: React.FC<FoodItemsListProps> = ({
  foods,
  onUpdateQuantity,
  onRemoveItem,
  onAddItem,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState(1);
  const [newItemServing, setNewItemServing] = useState('1 portion');
  const [newItemCategory, setNewItemCategory] = useState('grain');
  const [newItemCals, setNewItemCals] = useState(150);
  const [newItemProtein, setNewItemProtein] = useState(5);
  const [newItemCarbs, setNewItemCarbs] = useState(20);
  const [newItemFat, setNewItemFat] = useState(4);
  const [newItemFiber, setNewItemFiber] = useState(2);
  const [newItemSugar, setNewItemSugar] = useState(1);
  const [newItemIsAcc, setNewItemIsAcc] = useState(false);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const item: FoodItem = {
      id: `custom-${Date.now()}`,
      name: newItemName.trim(),
      quantity: Number(newItemQty),
      servingSize: newItemServing || '1 portion',
      confidence: 1.0,
      category: newItemCategory,
      calories: Number(newItemCals),
      protein: Number(newItemProtein),
      carbs: Number(newItemCarbs),
      fat: Number(newItemFat),
      fiber: Number(newItemFiber),
      sugar: Number(newItemSugar),
      isAccompaniment: newItemIsAcc,
    };

    onAddItem(item);
    setShowAddModal(false);
    // Reset form
    setNewItemName('');
    setNewItemCals(150);
    setNewItemProtein(5);
    setNewItemCarbs(20);
    setNewItemFat(4);
  };

  // Category Color Badges
  const getCategoryBadgeClass = (category: string) => {
    const lower = category.toLowerCase();
    if (lower.includes('meat') || lower.includes('poultry') || lower.includes('seafood'))
      return 'bg-red-50 text-red-700 border-red-200';
    if (lower.includes('vegetable') || lower.includes('salad') || lower.includes('fruit'))
      return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    if (lower.includes('grain') || lower.includes('bread') || lower.includes('rice'))
      return 'bg-amber-50 text-amber-800 border-amber-200';
    if (lower.includes('dairy') || lower.includes('cheese'))
      return 'bg-yellow-50 text-yellow-800 border-yellow-200';
    if (lower.includes('beverage') || lower.includes('drink'))
      return 'bg-sky-50 text-sky-800 border-sky-200';
    if (lower.includes('condiment') || lower.includes('sauce') || lower.includes('dip'))
      return 'bg-purple-50 text-purple-800 border-purple-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm my-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Utensils className="w-5 h-5 text-emerald-600" />
            Detected Food Items & Accompaniments ({foods.length})
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Individual nutritional breakdown. You can adjust quantities or add missing items.
          </p>
        </div>

        <button
          id="btn-add-item-modal"
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 rounded-lg text-xs font-semibold transition-all shadow-sm"
        >
          <Plus className="w-4 h-4 text-emerald-600" />
          <span>Add Custom Item</span>
        </button>
      </div>

      {foods.length === 0 ? (
        <div className="bg-slate-50 rounded-xl p-8 text-center border border-slate-200">
          <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">No items detected</p>
          <p className="text-xs text-slate-500 mt-1">Try uploading a clearer food image or add items manually.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {foods.map((food, idx) => {
            const confidencePct = Math.round(food.confidence * 100);

            return (
              <div
                key={food.id || idx}
                className="bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl p-3.5 transition-all shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Item Left Info */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h4 className="text-sm font-bold text-slate-800">{food.name}</h4>
                      
                      {food.isAccompaniment && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5" /> Accompaniment / Side
                        </span>
                      )}

                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getCategoryBadgeClass(food.category)}`}>
                        {food.category}
                      </span>

                      <span className="text-[10px] text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded font-medium">
                        {food.servingSize}
                      </span>

                      <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        {confidencePct}% confidence
                      </span>
                    </div>

                    {/* Macro Breakdown Pills */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 mt-2">
                      <span className="font-extrabold text-slate-800 flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        {food.calories * food.quantity} kcal
                      </span>
                      <span>
                        <strong className="text-blue-600 font-bold">P:</strong> {(food.protein * food.quantity).toFixed(1)}g
                      </span>
                      <span>
                        <strong className="text-orange-600 font-bold">C:</strong> {(food.carbs * food.quantity).toFixed(1)}g
                      </span>
                      <span>
                        <strong className="text-yellow-600 font-bold">F:</strong> {(food.fat * food.quantity).toFixed(1)}g
                      </span>
                      {food.fiber > 0 && (
                        <span>
                          <strong className="text-emerald-700 font-bold">Fiber:</strong> {(food.fiber * food.quantity).toFixed(1)}g
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Item Quantity Controller & Remove */}
                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
                      <button
                        onClick={() => onUpdateQuantity(idx, Math.max(1, food.quantity - 1))}
                        disabled={food.quantity <= 1}
                        className="w-7 h-7 rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-slate-800 font-bold flex items-center justify-center transition-colors text-sm"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-slate-800">
                        {food.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(idx, food.quantity + 1)}
                        className="w-7 h-7 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold flex items-center justify-center transition-colors text-sm"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => onRemoveItem(idx)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Remove Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Custom Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <h3 className="text-lg font-bold text-slate-800 mb-1">Add Custom Food Item</h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter details for any item you wish to include in this meal analysis.
            </p>

            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Item Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Garlic Naan, Mint Chutney, Lemonade"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={newItemQty}
                    onChange={(e) => setNewItemQty(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Serving Size</label>
                  <input
                    type="text"
                    value={newItemServing}
                    onChange={(e) => setNewItemServing(e.target.value)}
                    placeholder="e.g. 1 slice, 1 bowl"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Calories (kcal)</label>
                  <input
                    type="number"
                    min="0"
                    value={newItemCals}
                    onChange={(e) => setNewItemCals(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-600"
                  >
                    <option value="grain">Grain / Bread</option>
                    <option value="meat">Meat / Protein</option>
                    <option value="vegetable">Vegetable / Salad</option>
                    <option value="dairy">Dairy / Cheese</option>
                    <option value="condiment">Sauce / Dip / Garnish</option>
                    <option value="beverage">Beverage</option>
                    <option value="fruit">Fruit</option>
                    <option value="fast food">Fast Food</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1">
                <div>
                  <label className="block text-[10px] text-slate-500 mb-1">Protein (g)</label>
                  <input
                    type="number"
                    value={newItemProtein}
                    onChange={(e) => setNewItemProtein(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 mb-1">Carbs (g)</label>
                  <input
                    type="number"
                    value={newItemCarbs}
                    onChange={(e) => setNewItemCarbs(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 mb-1">Fat (g)</label>
                  <input
                    type="number"
                    value={newItemFat}
                    onChange={(e) => setNewItemFat(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 text-xs text-slate-800"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="acc-check"
                  checked={newItemIsAcc}
                  onChange={(e) => setNewItemIsAcc(e.target.checked)}
                  className="rounded border-slate-300 bg-slate-50 text-emerald-600 focus:ring-emerald-600"
                />
                <label htmlFor="acc-check" className="text-xs text-slate-700">
                  Mark as Accompaniment / Side dish / Sauce
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold shadow-sm"
                >
                  Add Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
