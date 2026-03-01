
import { useState, useEffect } from 'react';
import {
    Link as LinkIcon,
    FileText,
    Zap,
    History,
    ChevronRight,
    Loader2,
    AlertCircle,
    CheckCircle2,
    Search
} from 'lucide-react';
import { Card, Button, Input, TextArea, Badge } from './components';
import { parseUrl, parseText, getParseHistory, ParseHistoryItem, ExtractedRecipe } from '../lib/api';

interface ClipperProps {
    onNavigate: (view: string, params?: any) => void;
}

export default function ClipperPage({ onNavigate }: ClipperProps) {
    const [activeTab, setActiveTab] = useState<'url' | 'text' | 'history'>('url');
    const [inputValue, setInputValue] = useState('');
    const [isParsing, setIsParsing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [history, setHistory] = useState<ParseHistoryItem[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);

    useEffect(() => {
        if (activeTab === 'history') {
            loadHistory();
        }
    }, [activeTab]);

    const loadHistory = async () => {
        setIsLoadingHistory(true);
        try {
            const data = await getParseHistory();
            setHistory(data);
        } catch (err: unknown) {
            console.error('Failed to load history:', err);
        } finally {
            setIsLoadingHistory(false);
        }
    };

    const handleImport = async () => {
        if (!inputValue.trim()) return;

        setIsParsing(true);
        setError(null);

        try {
            let result: ExtractedRecipe;
            if (activeTab === 'url') {
                result = await parseUrl(inputValue);
            } else {
                result = await parseText(inputValue);
            }

            // Successfully parsed! Navigate to Add Recipe with the data
            onNavigate('add-recipe', {
                initialData: {
                    title: result.title,
                    description: result.description,
                    image: result.image,
                    prep_time: result.prepTime,
                    cook_time: result.cookTime,
                    servings: result.servings,
                    cuisine: result.cuisine,
                    // Map raw strings to the structure expected by AddRecipe
                    ingredients: result.ingredients.map(ing => ({
                        name_display: ing,
                        // AddRecipePage currently expects fuel_node_id, this will need a fix there
                        // or we change AddRecipe to handle raw ingredient strings during review.
                    })),
                    instructions: result.steps
                }
            });
        } catch (err: unknown) { // Fixed implicit any
            setError((err as Error).message || 'An unexpected error occurred during extraction.');
        } finally {
            setIsParsing(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-extrabold text-slate-800 flex items-center justify-center gap-3">
                    <Zap className="text-amber-500 fill-amber-500" />
                    AI Recipe Clipper
                </h1>
                <p className="text-slate-500 max-w-lg mx-auto">
                    Save recipes from anywhere on the web using AI magic. Just paste a URL or raw text.
                </p>
            </div>

            {/* Tab Selector */}
            <div className="flex justify-center">
                <div className="bg-slate-100 p-1 rounded-xl flex gap-1">
                    <button
                        onClick={() => setActiveTab('url')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'url' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <LinkIcon size={16} /> URL
                    </button>
                    <button
                        onClick={() => setActiveTab('text')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'text' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <FileText size={16} /> Raw Text
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'history' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <History size={16} /> History
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="min-h-[400px]">
                {activeTab !== 'history' ? (
                    <Card className="p-8 space-y-6">
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-slate-800">
                                {activeTab === 'url' ? 'Paste Recipe URL' : 'Paste Recipe Text'}
                            </h3>

                            {activeTab === 'url' ? (
                                <Input
                                    placeholder="https://example.com/recipe/lasagna"
                                    className="text-lg py-6"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    disabled={isParsing}
                                />
                            ) : (
                                <TextArea
                                    placeholder="Paste the full recipe text here, including ingredients and instructions..."
                                    className="min-h-[200px] text-sm leading-relaxed"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    disabled={isParsing}
                                />
                            )}

                            {error && (
                                <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-start gap-3 text-red-800 text-sm animate-in fade-in slide-in-from-top-1">
                                    <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-bold">Extraction Failed</p>
                                        <p className="opacity-80">{error}</p>
                                    </div>
                                </div>
                            )}

                            <Button
                                onClick={handleImport}
                                disabled={isParsing || !inputValue.trim()}
                                className="w-full py-6 text-lg"
                            >
                                {isParsing ? (
                                    <>
                                        <Loader2 className="animate-spin mr-2" />
                                        Analyzing with AI...
                                    </>
                                ) : (
                                    <>Import Recipe</>
                                )}
                            </Button>
                        </div>

                        {/* Help / Tips */}
                        <div className="pt-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <div className="w-8 h-8 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center">
                                    <Zap size={18} />
                                </div>
                                <h4 className="font-bold text-sm">Super Fast</h4>
                                <p className="text-xs text-slate-400">Structured extraction from top recipe sites is nearly instant.</p>
                            </div>
                            <div className="space-y-2">
                                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                                    <Search size={18} />
                                </div>
                                <h4 className="font-bold text-sm">Smart Parsing</h4>
                                <p className="text-xs text-slate-400">Our AI identifies ingredients even in messy, raw text formats.</p>
                            </div>
                            <div className="space-y-2">
                                <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center">
                                    <CheckCircle2 size={18} />
                                </div>
                                <h4 className="font-bold text-sm">Review & Save</h4>
                                <p className="text-xs text-slate-400">Always review and edit the parsed data before it's saved.</p>
                            </div>
                        </div>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {isLoadingHistory ? (
                            <div className="py-20 text-center text-slate-400">Loading history...</div>
                        ) : history.length === 0 ? (
                            <Card className="py-20 text-center bg-slate-50 border-dashed">
                                <History size={48} className="mx-auto text-slate-200 mb-4" />
                                <h3 className="text-lg font-bold text-slate-800">No History Yet</h3>
                                <p className="text-slate-500 max-w-xs mx-auto">Start importing recipes from URLs or text to see them here.</p>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {history.map(item => (
                                    <Card key={item.id} className="p-4 hover:border-emerald-200 transition-colors group">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-4">
                                                <div className={`p-3 rounded-xl ${item.status === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                                    {item.source_type === 'url' ? <LinkIcon size={20} /> : <FileText size={20} />}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-800 truncate max-w-sm">
                                                        {item.source_url || 'Pasted Text'}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-slate-400">
                                                        <span>{new Date(item.created_at).toLocaleDateString()}</span>
                                                        <span>•</span>
                                                        <span>{item.extraction_method?.toUpperCase() || 'UNKNOWN'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <Badge color={item.status === 'success' ? 'emerald' : 'red'}>
                                                    {item.status}
                                                </Badge>
                                                <ChevronRight className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
