import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/ui';
import MyKitchen from './pages/MyKitchenPage';
import Recipes from './pages/RecipesPage';
import RecipeDetail from './pages/RecipeDetailPage';
import MealPlanner from './pages/MealPlannerPage';
import ShoppingList from './pages/ShoppingListPage';
import SocialNetwork from './pages/SocialNetworkPage';
import AddRecipe from './pages/AddRecipePage';
import FoodEncyclopedia from './pages/FoodEncyclopediaPage';
import Profile from './pages/ProfilePage';
import Auth from './pages/AuthPage';
import SmartScanner from './pages/SmartScannerPage';
import RecipeIndexer from './pages/RecipeIndexerPage';
import DashboardPage from './pages/DashboardPage';
import SmartSearch from './pages/SmartSearchPage';

// ─── Inner app (has access to AuthContext) ───────────────────────────────────
function AppInner() {
    const { user, isLoading, logout } = useAuth();
    const [currentView, setCurrentView] = useState('dashboard');
    const [routeParams, setRouteParams] = useState<any>({});

    const navigate = (view: string, params?: any) => {
        setCurrentView(view);
        setRouteParams(params || {});
        // Update URL for better DX/UX
        const path = view === 'dashboard' ? '/' : `/${view}`;
        window.history.pushState({ view, params }, '', path);
    };

    // Handle back/forward buttons
    useEffect(() => {
        const handlePopState = (e: PopStateEvent) => {
            if (e.state) {
                setCurrentView(e.state.view);
                setRouteParams(e.state.params || {});
            } else {
                // Default to dashboard for root or unknown
                setCurrentView('dashboard');
                setRouteParams({});
            }
        };
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    // Initial sync with URL (experimental)
    useEffect(() => {
        const path = window.location.pathname.slice(1);
        if (path && path !== 'dashboard') {
            setCurrentView(path);
        }
    }, []);

    // Splash while checking session cookie
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4 text-slate-500">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-lime-500 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg animate-pulse">
                        F
                    </div>
                    <span className="text-sm">Loading…</span>
                </div>
            </div>
        );
    }

    // Not logged in — show auth page with forgot/reset support
    if (!user) {
        return <Auth />;
    }

    const renderView = () => {
        switch (currentView) {
            case 'dashboard': return <DashboardPage onChangeView={navigate} />;
            case 'kitchen': return <MyKitchen />;
            case 'recipes': return <Recipes onNavigate={navigate} />;
            case 'recipe-detail': return <RecipeDetail slug={routeParams.slug} onBack={() => navigate('recipes')} />;
            case 'add-recipe': return <AddRecipe onBack={() => navigate('recipes')} initialData={routeParams.initialData} />;
            case 'planner': return <MealPlanner />;
            case 'shopping': return <ShoppingList />;
            case 'social': return <SocialNetwork />;
            case 'encyclopedia': return <FoodEncyclopedia initialFoodId={routeParams.id} onNavigate={navigate} />;
            case 'profile': return <Profile />;
            case 'smart-search': return <SmartSearch onNavigate={navigate} />;
            case 'smart-scan': return <SmartScanner onNavigate={navigate} />;
            case 'recipe-indexer': return <RecipeIndexer onScanComplete={(data: any) => navigate('add-recipe', { initialData: data })} onCancel={() => navigate('recipes')} />;
            default: return <DashboardPage onChangeView={navigate} />;
        }
    };

    if (currentView === 'smart-scan' || currentView === 'recipe-indexer') {
        return renderView();
    }

    return (
        <Layout currentView={currentView} onViewChange={navigate} onLogout={logout}>
            {renderView()}
        </Layout>
    );
}

// ─── Root (provides AuthContext) ──────────────────────────────────────────────
const App = () => (
    <AuthProvider>
        <AppInner />
    </AuthProvider>
);

export default App;
