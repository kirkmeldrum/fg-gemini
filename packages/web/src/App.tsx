import { Routes, Route } from 'react-router-dom';

// ---- Placeholder Home Page ----
function Home() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8">
            <div className="text-center max-w-2xl">
                <h1 className="text-5xl mb-4 text-primary-700">🍳 FoodGenie</h1>
                <p className="text-xl text-gray-600 mb-8">
                    Your AI-powered kitchen companion
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    {[
                        { icon: '🔍', label: 'Smart Search', desc: 'Find recipes by ingredients' },
                        { icon: '📋', label: 'My Kitchen', desc: 'Track your inventory' },
                        { icon: '📅', label: 'Meal Planner', desc: 'Plan your week' },
                        { icon: '🛒', label: 'Shopping List', desc: 'Never forget an item' },
                        { icon: '🤖', label: 'Recipe Clipper', desc: 'AI-powered parsing' },
                        { icon: '⚖️', label: 'Smart Scale', desc: 'BLE connected (coming)' },
                    ].map(({ icon, label, desc }) => (
                        <div
                            key={label}
                            className="bg-white rounded-lg border border-gray-200 p-4 hover:border-primary-400 hover:shadow-md transition-all"
                        >
                            <div className="text-2xl mb-2">{icon}</div>
                            <div className="font-semibold text-gray-900">{label}</div>
                            <div className="text-gray-500 text-xs mt-1">{desc}</div>
                        </div>
                    ))}
                </div>
                <div className="mt-10 p-4 bg-primary-50 border border-primary-200 rounded-lg text-sm text-primary-800">
                    <strong>Status:</strong> Monorepo bootstrapped. API on :3001, Web on :5173.
                    <br />
                    Next sprint: Authentication + User registration (Sprint 1.1).
                </div>
            </div>
        </div>
    );
}

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            {/* Sprint 1.1: Auth */}
            {/* <Route path="/login" element={<LoginPage />} /> */}
            {/* <Route path="/register" element={<RegisterPage />} /> */}
            {/* Sprint 1.3: Recipes */}
            {/* <Route path="/recipes" element={<RecipesPage />} /> */}
            {/* <Route path="/recipes/:slug" element={<RecipeDetailPage />} /> */}
            {/* Sprint 1.5: Inventory */}
            {/* <Route path="/kitchen" element={<MyKitchenPage />} /> */}
            {/* Sprint 1.6: Smart Search */}
            {/* <Route path="/search" element={<SmartSearchPage />} /> */}
            {/* Sprint 1.7: Recipe Clipper */}
            {/* <Route path="/clip" element={<RecipeClipperPage />} /> */}
            {/* Sprint 1.8: Meal Planner */}
            {/* <Route path="/planner" element={<MealPlannerPage />} /> */}
            {/* Sprint 1.9: Shopping */}
            {/* <Route path="/shopping" element={<ShoppingListPage />} /> */}
        </Routes>
    );
}
