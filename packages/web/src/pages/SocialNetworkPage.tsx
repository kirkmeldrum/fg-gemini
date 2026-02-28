
import { useState, useEffect } from 'react';
import {
    Users, UserPlus, Heart, MessageCircle, Share2,
    MoreHorizontal, ChefHat, Search, Bell, Check, X, User as UserIcon
} from 'lucide-react';
import {
    Card, Button, Badge,
} from '../components/ui';
import * as api from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function SocialNetwork() {
    const { user: currentUser } = useAuth();
    const [friends, setFriends] = useState<api.SocialFriend[]>([]);
    const [requests, setRequests] = useState<api.FriendRequest[]>([]);
    const [activities, setActivities] = useState<api.Activity[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Invite Modal State
    const [isInviteOpen, setIsInviteOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<api.ApiUser[]>([]);
    const [sentRequests, setSentRequests] = useState<number[]>([]);

    useEffect(() => {
        loadSocialData();
    }, []);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery.trim()) {
                handleSearch();
            } else {
                setSearchResults([]);
            }
        }, 400);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const loadSocialData = async () => {
        setIsLoading(true);
        try {
            const [friendsData, requestsData, feedData] = await Promise.all([
                api.getFriends(),
                api.getPendingRequests(),
                api.getSocialFeed()
            ]);
            setFriends(friendsData);
            setRequests(requestsData);
            setActivities(feedData);
        } catch (error) {
            console.error('Failed to load social data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        try {
            const results = await api.searchUsers(searchQuery);
            // Filter out current user and existing friends
            const friendIds = friends.map(f => f.id);
            const filtered = results.filter(u => u.id !== currentUser?.id && !friendIds.includes(u.id));
            setSearchResults(filtered);
        } catch (error) {
            console.error('Search failed:', error);
        }
    };

    const handleSendRequest = async (userId: number) => {
        try {
            await api.sendFriendRequest(userId);
            setSentRequests([...sentRequests, userId]);
        } catch (error) {
            console.error('Failed to send request:', error);
        }
    };

    const handleAcceptRequest = async (friendId: number) => {
        try {
            await api.acceptFriendRequest(friendId);
            loadSocialData();
        } catch (error) {
            console.error('Failed to accept request:', error);
        }
    };

    const mapActionToText = (activity: api.Activity) => {
        const name = `${activity.first_name || activity.username}`;
        switch (activity.action) {
            case 'posted_recipe':
                return <span><strong>{name}</strong> shared a new recipe</span>;
            case 'rated_recipe':
                return <span><strong>{name}</strong> rated a recipe</span>;
            case 'cooked_meal':
                return <span><strong>{name}</strong> cooked a delicious meal</span>;
            case 'followed_user':
                return <span><strong>{name}</strong> started following someone</span>;
            default:
                return <span><strong>{name}</strong> did something interesting</span>;
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Social Network</h1>
                    <p className="text-slate-500 mt-1 text-lg">See what your kitchen community is cooking up.</p>
                </div>

                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        className="rounded-full shadow-sm hover:shadow-md transition-all flex items-center gap-2"
                        onClick={loadSocialData}
                    >
                        <Bell size={18} />
                        {requests.length > 0 && (
                            <span className="bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full animate-pulse">
                                {requests.length}
                            </span>
                        )}
                        Notifications
                    </Button>
                    <Button
                        className="bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white shadow-lg shadow-emerald-200 rounded-full px-6 transition-all transform hover:-translate-y-0.5"
                        onClick={() => setIsInviteOpen(true)}
                    >
                        <UserPlus size={18} className="mr-2" />
                        Find Chefs
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Feed (8 cols) */}
                <div className="lg:col-span-8 space-y-6">

                    {/* Share Block */}
                    <Card className="p-6 bg-white/50 backdrop-blur-sm border-emerald-50 shadow-sm transition-all hover:shadow-md">
                        <div className="flex gap-4">
                            <div className="w-12 h-12 rounded-full overflow-hidden bg-emerald-100 flex-shrink-0 ring-2 ring-white shadow-sm">
                                {currentUser?.avatarUrl ? (
                                    <img src={currentUser.avatarUrl} alt={currentUser.username} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-emerald-600 font-bold bg-emerald-50">
                                        {currentUser?.username?.[0].toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <div className="flex-1">
                                <textarea
                                    placeholder="Share your latest culinary triumph..."
                                    className="w-full bg-slate-50/50 border-0 focus:ring-0 rounded-xl p-4 text-slate-800 placeholder:text-slate-400 min-h-[100px] resize-none text-sm transition-all shadow-inner"
                                />
                                <div className="mt-2 flex justify-between items-center bg-white p-2 rounded-lg border border-slate-100 shadow-sm">
                                    <div className="flex gap-2">
                                        <button className="p-2 text-slate-500 hover:text-emerald-600 transition-colors rounded-lg hover:bg-emerald-50">
                                            <ChefHat size={18} />
                                        </button>
                                        <button className="p-2 text-slate-500 hover:text-emerald-600 transition-colors rounded-lg hover:bg-emerald-50">
                                            <Share2 size={18} />
                                        </button>
                                    </div>
                                    <Button className="px-6 rounded-full text-sm font-semibold">Post</Button>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Feed Content */}
                    <div className="space-y-6">
                        {isLoading ? (
                            Array(3).fill(0).map((_, i) => (
                                <Card key={i} className="p-6 animate-pulse border-slate-100">
                                    <div className="flex gap-4 mb-4">
                                        <div className="w-10 h-10 bg-slate-200 rounded-full" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 bg-slate-200 rounded w-1/4" />
                                            <div className="h-3 bg-slate-100 rounded w-1/6" />
                                        </div>
                                    </div>
                                    <div className="h-20 bg-slate-50 rounded-xl mb-4" />
                                </Card>
                            ))
                        ) : activities.length > 0 ? (
                            activities.map(activity => (
                                <Card key={activity.id} className="p-0 overflow-hidden border-slate-100/50 shadow-sm hover:shadow-lg transition-all duration-300 group">
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-11 h-11 rounded-full overflow-hidden bg-slate-100 ring-2 ring-white shadow-sm group-hover:ring-emerald-100 transition-all">
                                                    {activity.avatar_url ? (
                                                        <img src={activity.avatar_url} alt={activity.username} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-emerald-50 text-emerald-600 text-sm font-bold">
                                                            {activity.username[0].toUpperCase()}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 hover:text-emerald-700 transition-colors cursor-pointer">
                                                        {activity.first_name || activity.username}
                                                    </p>
                                                    <div className="flex items-center gap-2 text-xs text-slate-400">
                                                        <span>{new Date(activity.created_at).toLocaleDateString()}</span>
                                                        <span>•</span>
                                                        <span className="capitalize">{activity.action.replace('_', ' ')}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <Button variant="ghost" className="p-2 h-9 w-9 rounded-full text-slate-400">
                                                <MoreHorizontal size={18} />
                                            </Button>
                                        </div>

                                        <div className="mb-5 pl-1">
                                            <div className="text-slate-800 leading-relaxed text-[15px]">
                                                {mapActionToText(activity)}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6 pt-4 border-t border-slate-100">
                                            <button className="flex items-center gap-1.5 text-slate-500 hover:text-red-500 transition-colors text-xs font-semibold uppercase tracking-wider">
                                                <Heart size={16} /> Like
                                            </button>
                                            <button className="flex items-center gap-1.5 text-slate-500 hover:text-emerald-600 transition-colors text-xs font-semibold uppercase tracking-wider">
                                                <MessageCircle size={16} /> Comment
                                            </button>
                                            <button className="ml-auto flex items-center gap-1.5 text-slate-500 hover:text-emerald-600 transition-colors text-xs font-semibold uppercase tracking-wider">
                                                <Share2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </Card>
                            ))
                        ) : (
                            <div className="text-center py-20 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200">
                                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                                    <Users size={32} />
                                </div>
                                <h3 className="text-lg font-bold text-slate-700">No activity yet</h3>
                                <p className="text-slate-400 max-w-xs mx-auto mt-2 text-sm">Follow your friends to see what they're cooking up and share your own recipes!</p>
                                <Button
                                    variant="secondary"
                                    className="mt-6 rounded-full"
                                    onClick={() => setIsInviteOpen(true)}
                                >
                                    Find People to Follow
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Sidebar (4 cols) */}
                <div className="lg:col-span-4 space-y-8">

                    {/* Incoming Requests */}
                    {requests.length > 0 && (
                        <div className="rounded-3xl bg-amber-50/70 border border-amber-100 p-6 shadow-sm overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                                <Bell size={64} className="text-amber-600" />
                            </div>
                            <h3 className="font-bold text-amber-900 mb-4 flex items-center gap-2 relative z-10">
                                <UserPlus size={18} />
                                Requests <Badge className="bg-amber-500 ml-auto">{requests.length}</Badge>
                            </h3>
                            <div className="space-y-4 relative z-10">
                                {requests.map(req => (
                                    <div key={req.connection_id} className="flex items-center gap-3 bg-white/50 p-3 rounded-2xl border border-white/50 shadow-sm">
                                        <div className="w-10 h-10 rounded-full bg-amber-200 overflow-hidden">
                                            {req.avatar_url ? (
                                                <img src={req.avatar_url} alt={req.username} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-amber-100 text-amber-700 font-bold">
                                                    {req.username[0]}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-amber-950 truncate">{req.first_name || req.username}</p>
                                            <p className="text-[10px] text-amber-700 font-medium">@{req.username}</p>
                                        </div>
                                        <div className="flex gap-1">
                                            <button
                                                className="p-1.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 shadow-md shadow-emerald-200 transition-all"
                                                onClick={() => handleAcceptRequest(req.id)}
                                            >
                                                <Check size={16} />
                                            </button>
                                            <button className="p-1.5 bg-slate-100 text-slate-400 rounded-lg hover:bg-white hover:text-red-500 transition-all">
                                                <X size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Friends List */}
                    <Card className="p-6 rounded-3xl border-slate-100 shadow-sm overflow-hidden group">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                <Users size={18} className="text-emerald-600" /> My Network
                            </h3>
                            <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-full">
                                {friends.length}
                            </span>
                        </div>

                        <div className="space-y-4">
                            {friends.length > 0 ? (
                                friends.map(friend => (
                                    <div key={friend.id} className="flex items-center gap-4 p-2 hover:bg-slate-50 rounded-2xl transition-all cursor-pointer group/item">
                                        <div className="relative">
                                            <div className="w-11 h-11 rounded-full bg-slate-100 overflow-hidden ring-2 ring-white shadow-sm group-hover/item:ring-emerald-100 transition-all">
                                                {friend.avatar_url ? (
                                                    <img src={friend.avatar_url} alt={friend.username} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold bg-slate-200">
                                                        {friend.username[0]}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full shadow-sm"></div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-slate-900 group-hover/item:text-emerald-700 transition-colors">
                                                {friend.first_name || friend.username}
                                            </p>
                                            <p className="text-[11px] text-slate-400 font-medium">@{friend.username}</p>
                                        </div>
                                        <button className="opacity-0 group-hover/item:opacity-100 p-2 text-slate-300 hover:text-emerald-500 transition-all">
                                            <MessageCircle size={16} />
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-6">
                                    <p className="text-sm text-slate-400 italic">No connections yet.</p>
                                    <Button
                                        variant="ghost"
                                        className="text-xs text-emerald-600 mt-2 hover:bg-emerald-50 rounded-full"
                                        onClick={() => setIsInviteOpen(true)}
                                    >
                                        <Search size={14} className="mr-1" /> Browse Chefs
                                    </Button>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Cooking Tips/Stats */}
                    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 rounded-3xl p-8 text-white shadow-xl shadow-slate-200 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl group-hover:bg-emerald-500/30 transition-all"></div>
                        <h4 className="text-emerald-400 font-extrabold text-xs uppercase tracking-widest mb-2">Community Goal</h4>
                        <p className="text-xl font-bold leading-tight">Together we saved over <span className="text-emerald-400">4,200kg</span> of food waste this month!</p>
                        <div className="mt-8 pt-8 border-t border-white/10 flex justify-between items-center text-sm font-medium">
                            <span className="text-slate-400 italic">You helped save 12kg</span>
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                                <ChefHat size={16} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Discovery Modal */}
            {isInviteOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100">
                        <div className="p-8 bg-gradient-to-br from-slate-50 to-white flex justify-between items-center border-b border-slate-100">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900">Discover Chefs</h2>
                                <p className="text-slate-500 text-sm mt-1">Search the FoodGenie community</p>
                            </div>
                            <button
                                className="p-2 hover:bg-slate-100 rounded-2xl transition-colors text-slate-400"
                                onClick={() => setIsInviteOpen(false)}
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <div className="p-8">
                            <div className="relative mb-8">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Type a name or username..."
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                />
                            </div>

                            <div className="space-y-4 max-h-[40vh] overflow-y-auto px-1">
                                {searchResults.length > 0 ? (
                                    searchResults.map(u => (
                                        <div key={u.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-2xl transition-all border border-transparent hover:border-slate-100">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden shadow-sm">
                                                    {u.avatarUrl ? (
                                                        <img src={u.avatarUrl} alt={u.username} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold bg-slate-100">
                                                            {u.username[0]}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900">{u.displayName || u.username}</p>
                                                    <p className="text-xs text-slate-400">@{u.username}</p>
                                                </div>
                                            </div>
                                            {u.connectionStatus === 'pending' || sentRequests.includes(u.id) ? (
                                                <Badge className="bg-amber-100 text-amber-700 border-0 font-bold px-3">Pending</Badge>
                                            ) : u.connectionStatus === 'accepted' ? (
                                                <Badge className="bg-emerald-100 text-emerald-700 border-0 font-bold px-3">Chef</Badge>
                                            ) : (
                                                <Button
                                                    variant="secondary"
                                                    className="px-4 py-1.5 text-xs rounded-full font-bold bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 transition-all border-0"
                                                    onClick={() => handleSendRequest(u.id)}
                                                >
                                                    Connect
                                                </Button>
                                            )}
                                        </div>
                                    ))
                                ) : searchQuery && (
                                    <div className="text-center py-10">
                                        <UserIcon size={48} className="mx-auto text-slate-200 mb-4" />
                                        <p className="text-slate-400 italic text-sm">No chefs found matching "{searchQuery}"</p>
                                    </div>
                                )}
                                {!searchQuery && (
                                    <div className="text-center py-10">
                                        <UserIcon size={48} className="mx-auto text-slate-100 mb-4 opacity-50" />
                                        <p className="text-slate-400 italic text-sm">Search for FoodGenie users to connect.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="p-6 bg-slate-50 flex gap-4">
                            <Button variant="outline" className="flex-1 rounded-2xl" onClick={() => setIsInviteOpen(false)}>Cancel</Button>
                            <Button className="flex-1 rounded-2xl shadow-lg shadow-emerald-100">Invite via Email</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
