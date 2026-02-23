
import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Heart, MessageCircle, Share2, MoreHorizontal, ChefHat, Search, Mail, Send } from 'lucide-react';
import { Card, Button, Badge, Modal, Input, Label } from './components';
import { api, Friend, Activity, USERS, FRIENDS, User } from './data';

export default function SocialNetwork() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const currentUser = USERS[0];

  // Invite Modal State
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [activeInviteTab, setActiveInviteTab] = useState<'search' | 'email'>('search');
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [sentInvites, setSentInvites] = useState<number[]>([]); // Track IDs of sent requests

  useEffect(() => {
    api.getFriends().then(setFriends);
    api.getActivities().then(setActivities);
  }, []);

  const pendingRequests = friends.filter(f => f.status === 'pending_incoming');
  const connectedFriends = friends.filter(f => f.status === 'connected');

  const handleSearch = async () => {
    if (searchQuery.trim().length > 0) {
        const results = await api.searchUsers(searchQuery);
        // Filter out existing friends
        const friendIds = friends.map(f => f.id);
        const filtered = results.filter(u => !friendIds.includes(u.id));
        setSearchResults(filtered);
    } else {
        setSearchResults([]);
    }
  };

  const handleSendRequest = async (userId: number) => {
    await api.sendFriendRequest(userId);
    setSentInvites([...sentInvites, userId]);
  };

  const handleEmailInvite = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Invitation sent to ${inviteEmail}!`);
    setInviteEmail("");
    setIsInviteModalOpen(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column: Feed */}
      <div className="lg:col-span-2 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Activity Feed</h1>
          <p className="text-slate-500">See what your network is cooking up.</p>
        </div>

        {/* Share Box */}
        <Card className="p-4">
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
                <img src={currentUser.avatar} alt={currentUser.name} />
            </div>
            <div className="flex-1">
              <input 
                type="text" 
                placeholder="Share a recipe, tip, or food photo..." 
                className="w-full bg-slate-50 border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 mb-3"
              />
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                    <Button variant="ghost" className="text-xs px-2"><ChefHat size={14} className="mr-1"/> Share Recipe</Button>
                </div>
                <Button className="px-6 py-1.5 text-sm">Post</Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Feed Items */}
        <div className="space-y-6">
          {activities.map(activity => {
            const author = FRIENDS.find(f => f.id === activity.user_id) || USERS[0]; // Fallback logic for mock
            
            return (
              <Card key={activity.id} className="p-0 overflow-visible">
                <div className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden">
                        <img src={author.avatar} alt={author.name} />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{author.name}</p>
                        <p className="text-xs text-slate-500">{activity.timestamp}</p>
                      </div>
                    </div>
                    <button className="text-slate-400 hover:text-slate-600">
                      <MoreHorizontal size={20} />
                    </button>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-slate-600 mb-2">
                        <span className="font-medium text-emerald-600">{activity.type.replace('_', ' ')}:</span> {activity.title}
                    </p>
                    <p className="text-slate-800">{activity.description}</p>
                  </div>

                  {activity.image && (
                    <div className="rounded-xl overflow-hidden mb-4 border border-slate-100">
                        <img src={activity.image} alt="Post content" className="w-full h-64 object-cover" />
                    </div>
                  )}

                  <div className="flex items-center gap-6 pt-4 border-t border-slate-100">
                    <button className="flex items-center gap-2 text-slate-500 hover:text-red-500 transition-colors text-sm font-medium">
                        <Heart size={18} /> {activity.likes}
                    </button>
                    <button className="flex items-center gap-2 text-slate-500 hover:text-blue-500 transition-colors text-sm font-medium">
                        <MessageCircle size={18} /> {activity.comments}
                    </button>
                    <button className="flex items-center gap-2 text-slate-500 hover:text-emerald-500 transition-colors text-sm font-medium ml-auto">
                        <Share2 size={18} /> Share
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Right Column: Sidebar */}
      <div className="space-y-6">
        
        {/* Profile Card */}
        <Card className="p-6 text-center">
            <div className="w-20 h-20 rounded-full bg-slate-200 overflow-hidden mx-auto mb-4 border-4 border-white shadow-md">
                <img src={currentUser.avatar} alt={currentUser.name} />
            </div>
            <h2 className="font-bold text-lg text-slate-800">{currentUser.name}</h2>
            <p className="text-sm text-slate-500 mb-4">Master Chef in Training</p>
            <div className="flex justify-center gap-4 text-sm border-t border-slate-100 pt-4">
                <div>
                    <span className="block font-bold text-slate-900">142</span>
                    <span className="text-slate-500">Recipes</span>
                </div>
                <div>
                    <span className="block font-bold text-slate-900">{connectedFriends.length}</span>
                    <span className="text-slate-500">Friends</span>
                </div>
            </div>
        </Card>

        {/* Friend Requests */}
        {pendingRequests.length > 0 && (
            <Card className="p-5">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <UserPlus size={18} className="text-emerald-600" /> 
                Requests <Badge color="red">{pendingRequests.length}</Badge>
            </h3>
            <div className="space-y-4">
                {pendingRequests.map(req => (
                    <div key={req.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden">
                                <img src={req.avatar} alt={req.name} />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-900">{req.name}</p>
                                <p className="text-xs text-slate-500">{req.mutual_friends} mutual friends</p>
                            </div>
                        </div>
                        <div className="flex gap-1">
                            <Button className="px-3 py-1 text-xs">Accept</Button>
                        </div>
                    </div>
                ))}
            </div>
            </Card>
        )}

        {/* My Friends */}
        <Card className="p-5">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <Users size={18} className="text-emerald-600" /> My Network
                </h3>
                <div className="flex gap-2">
                    <Button variant="ghost" className="p-1 h-8 w-8 text-emerald-600" onClick={() => setIsInviteModalOpen(true)}>
                        <UserPlus size={18} />
                    </Button>
                </div>
            </div>
            <div className="space-y-4">
                {connectedFriends.map(friend => (
                    <div key={friend.id} className="flex items-center justify-between group cursor-pointer hover:bg-slate-50 p-2 rounded-lg -mx-2 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden relative">
                                <img src={friend.avatar} alt={friend.name} />
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">{friend.name}</p>
                                <p className="text-xs text-slate-500">Online now</p>
                            </div>
                        </div>
                    </div>
                ))}
                {connectedFriends.length === 0 && (
                    <p className="text-sm text-slate-500 text-center py-4">No connections yet.</p>
                )}
            </div>
            <Button variant="secondary" className="w-full mt-4 text-sm" onClick={() => setIsInviteModalOpen(true)}>Find Chefs</Button>
        </Card>
      </div>

      {/* Find & Invite Modal */}
      <Modal 
        isOpen={isInviteModalOpen} 
        onClose={() => setIsInviteModalOpen(false)} 
        title="Grow Your Network"
      >
        <div className="space-y-6">
            <div className="flex border-b border-slate-200">
                <button 
                    className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeInviteTab === 'search' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                    onClick={() => setActiveInviteTab('search')}
                >
                    Find Chefs
                </button>
                <button 
                    className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeInviteTab === 'email' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                    onClick={() => setActiveInviteTab('email')}
                >
                    Invite by Email
                </button>
            </div>

            {activeInviteTab === 'search' ? (
                <div className="space-y-4">
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input 
                                type="text" 
                                placeholder="Search by name..." 
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                        </div>
                        <Button onClick={handleSearch}>Search</Button>
                    </div>

                    <div className="max-h-64 overflow-y-auto space-y-3">
                        {searchResults.length > 0 ? (
                            searchResults.map(user => (
                                <div key={user.id} className="flex items-center justify-between p-2 border border-slate-100 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden">
                                            <img src={user.avatar} alt={user.name} />
                                        </div>
                                        <span className="font-medium text-slate-800">{user.name}</span>
                                    </div>
                                    {sentInvites.includes(user.id) ? (
                                        <Badge color="slate">Sent</Badge>
                                    ) : (
                                        <Button variant="secondary" className="px-3 py-1 text-xs" onClick={() => handleSendRequest(user.id)}>
                                            Connect
                                        </Button>
                                    )}
                                </div>
                            ))
                        ) : searchQuery && (
                            <p className="text-center text-sm text-slate-500 py-4">No chefs found matching "{searchQuery}"</p>
                        )}
                        {!searchQuery && (
                            <p className="text-center text-sm text-slate-400 py-4">Search for FoodGenie users to connect.</p>
                        )}
                    </div>
                </div>
            ) : (
                <form onSubmit={handleEmailInvite} className="space-y-4">
                    <p className="text-sm text-slate-600">Invite your friends to join FoodGenie and share recipes together!</p>
                    <div>
                        <Label>Email Address</Label>
                        <div className="relative">
                            <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <Input 
                                type="email" 
                                placeholder="friend@example.com" 
                                className="pl-10"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <Button type="submit" className="w-full">
                        <Send size={16} className="mr-2" /> Send Invitation
                    </Button>
                </form>
            )}
        </div>
      </Modal>
    </div>
  );
}
