import React, { useState, useRef } from 'react';
import { MapPin, Calendar, Edit2, ChefHat, Save, Camera, Lock, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card, Button, Badge, Label, Input, TextArea } from './components';
import { useAuth } from '../context/AuthContext';
import {
    updateProfile,
    changePassword,
    getPreferences,
    updatePreferences,
    uploadAvatar,
    deleteAccount,
    Preference,
    ApiError,
} from '../lib/api';

type Tab = 'overview' | 'recipes' | 'settings';

export default function Profile() {
    const { user, refreshUser, logout } = useAuth();
    const [activeTab, setActiveTab] = useState<Tab>('overview');
    const [isSaving, setIsSaving] = useState(false);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

    // ── Profile form state (seeded from context) ──────────────────────────────
    const [firstName, setFirstName] = useState(user?.firstName ?? '');
    const [lastName, setLastName] = useState(user?.lastName ?? '');
    const [displayName, setDisplayName] = useState(user?.displayName ?? '');
    const [bio, setBio] = useState(user?.bio ?? '');
    const [location, setLocation] = useState(user?.location ?? '');

    // ── Preferences ───────────────────────────────────────────────────────────
    const [prefs, setPrefs] = useState<Preference[]>([]);
    const [prefsLoaded, setPrefsLoaded] = useState(false);

    const loadPrefs = async () => {
        if (prefsLoaded) return;
        const p = await getPreferences().catch(() => [] as Preference[]);
        setPrefs(p);
        setPrefsLoaded(true);
    };

    const toggleDiet = (diet: string) => {
        const exists = prefs.find(p => p.type === 'diet' && p.value === diet);
        if (exists) setPrefs(prefs.filter(p => !(p.type === 'diet' && p.value === diet)));
        else setPrefs([...prefs, { type: 'diet', value: diet }]);
    };

    // ── Password form ─────────────────────────────────────────────────────────
    const [currentPw, setCurrentPw] = useState('');
    const [newPw, setNewPw] = useState('');
    const [confirmPw, setConfirmPw] = useState('');

    // ── Avatar ────────────────────────────────────────────────────────────────
    const fileInputRef = useRef<HTMLInputElement>(null);

    // ── Delete account ────────────────────────────────────────────────────────
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const showFeedback = (type: 'success' | 'error', msg: string) => {
        setFeedback({ type, msg });
        setTimeout(() => setFeedback(null), 4000);
    };

    const handleApiError = (err: unknown) => {
        const e = err as ApiError;
        showFeedback('error', e?.message ?? 'Something went wrong.');
    };

    // ── Save profile info ─────────────────────────────────────────────────────
    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await updateProfile({ firstName, lastName, displayName: displayName || undefined, bio, location });
            await updatePreferences(prefs);
            await refreshUser();
            showFeedback('success', 'Profile updated!');
        } catch (err) {
            handleApiError(err);
        } finally {
            setIsSaving(false);
        }
    };

    // ── Change password ───────────────────────────────────────────────────────
    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPw !== confirmPw) { showFeedback('error', 'New passwords do not match.'); return; }
        setIsSaving(true);
        try {
            await changePassword({ currentPassword: currentPw, newPassword: newPw });
            setCurrentPw(''); setNewPw(''); setConfirmPw('');
            showFeedback('success', 'Password changed!');
        } catch (err) {
            handleApiError(err);
        } finally {
            setIsSaving(false);
        }
    };

    // ── Avatar upload ─────────────────────────────────────────────────────────
    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            await uploadAvatar(file);
            await refreshUser();
            showFeedback('success', 'Avatar updated!');
        } catch (err) {
            handleApiError(err);
        }
    };

    // ── Delete account ────────────────────────────────────────────────────────
    const handleDelete = async () => {
        try {
            await deleteAccount();
            await logout();
        } catch (err) {
            handleApiError(err);
        }
    };

    if (!user) return <div className="p-8 text-center text-slate-400">Loading profile…</div>;

    const displayNameShown = user.displayName || `${user.firstName} ${user.lastName}`;
    const initials = `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`;
    const memberSince = new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    const dietValues = prefs.filter(p => p.type === 'diet').map(p => p.value);
    const allergenValues = prefs.filter(p => p.type === 'allergen').map(p => p.value);

    return (
        <div className="space-y-6">

            {/* Feedback toast */}
            {feedback && (
                <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium animate-in slide-in-from-right-4 duration-300 ${feedback.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
                    }`}>
                    {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    {feedback.msg}
                </div>
            )}

            {/* Profile header */}
            <div className="relative rounded-2xl overflow-hidden bg-white shadow-sm border border-slate-200">
                <div className="h-48 bg-gradient-to-r from-emerald-600 to-teal-500 relative">
                    <div className="absolute inset-0 bg-black/10" />
                </div>
                <div className="px-8 pb-6 relative">
                    <div className="flex flex-col md:flex-row justify-between items-end -mt-12 mb-4 gap-4">
                        <div className="flex items-end gap-6">
                            {/* Avatar */}
                            <div className="relative group">
                                <div className="w-32 h-32 rounded-2xl border-4 border-white overflow-hidden bg-emerald-100 shadow-md flex items-center justify-center">
                                    {user.avatarUrl
                                        ? <img src={user.avatarUrl} alt={displayNameShown} className="w-full h-full object-cover" />
                                        : <span className="text-3xl font-bold text-emerald-700">{initials}</span>
                                    }
                                </div>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                                    title="Change avatar"
                                >
                                    <Camera size={24} />
                                </button>
                                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleAvatarChange} />
                            </div>
                            <div className="mb-1">
                                <h1 className="text-2xl font-bold text-slate-800">{displayNameShown}</h1>
                                <p className="text-slate-500 font-medium">@{user.username}</p>
                            </div>
                        </div>
                        <div className="flex gap-3 mb-1">
                            <Button variant="secondary" onClick={() => { setActiveTab('settings'); loadPrefs(); }}>
                                <Edit2 size={16} /> Edit Profile
                            </Button>
                        </div>
                    </div>

                    {user.bio && <p className="text-slate-600 max-w-2xl mb-6 leading-relaxed">{user.bio}</p>}

                    <div className="flex flex-wrap gap-6 text-sm text-slate-500 border-t border-slate-100 pt-6">
                        {user.location && (
                            <div className="flex items-center gap-2">
                                <MapPin size={16} className="text-slate-400" /> {user.location}
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <Calendar size={16} className="text-slate-400" /> Member since {memberSince}
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200">
                {([
                    { id: 'overview', label: 'Overview', icon: '👤' },
                    { id: 'recipes', label: 'My Recipes', icon: '🍳' },
                    { id: 'settings', label: 'Settings', icon: '⚙️' },
                ] as { id: Tab; label: string; icon: string }[]).map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => { setActiveTab(tab.id); if (tab.id === 'settings') loadPrefs(); }}
                        className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id
                            ? 'border-emerald-500 text-emerald-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab content */}
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">

                {/* ── Overview ── */}
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="p-6 md:col-span-2">
                            <h3 className="font-bold text-slate-800 mb-4">Badges &amp; Achievements</h3>
                            <div className="flex gap-4">
                                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center text-2xl" title="Early Adopter">🌟</div>
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-2xl" title="Recipe Master">👨‍🍳</div>
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-2xl" title="Health Nut">🥗</div>
                            </div>
                        </Card>
                        <Card className="p-6">
                            <h3 className="font-bold text-slate-800 mb-4">Dietary Profile</h3>
                            <div className="flex flex-wrap gap-2">
                                {dietValues.map(d => <Badge key={d} color="emerald">{d}</Badge>)}
                                {allergenValues.map(a => <Badge key={a} color="red">No {a}</Badge>)}
                                {!dietValues.length && !allergenValues.length && (
                                    <span className="text-slate-400 text-sm">No preferences set yet</span>
                                )}
                            </div>
                        </Card>
                    </div>
                )}

                {/* ── My Recipes ── */}
                {activeTab === 'recipes' && (
                    <Card className="p-8 text-center text-slate-400">
                        <ChefHat size={40} className="mx-auto mb-3 opacity-40" />
                        <p className="font-medium">Your recipes will appear here</p>
                        <p className="text-sm mt-1">Recipe authorship coming in Sprint 1.2</p>
                    </Card>
                )}

                {/* ── Settings ── */}
                {activeTab === 'settings' && (
                    <div className="max-w-2xl mx-auto space-y-8">

                        {/* Personal info form */}
                        <Card className="p-8">
                            <form onSubmit={handleSaveProfile} className="space-y-6">
                                <h3 className="font-bold text-lg text-slate-800 border-b border-slate-100 pb-2">Public Profile</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>First Name</Label>
                                        <Input value={firstName} onChange={e => setFirstName(e.target.value)} />
                                    </div>
                                    <div>
                                        <Label>Last Name</Label>
                                        <Input value={lastName} onChange={e => setLastName(e.target.value)} />
                                    </div>
                                </div>
                                <div>
                                    <Label>Display Name <span className="text-slate-400 font-normal text-xs">(optional)</span></Label>
                                    <Input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder={`${firstName} ${lastName}`} />
                                </div>
                                <div>
                                    <Label>Bio</Label>
                                    <TextArea rows={3} value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell us about your cooking style…" />
                                </div>
                                <div>
                                    <Label>Location</Label>
                                    <Input value={location} onChange={e => setLocation(e.target.value)} placeholder="City, State" />
                                </div>

                                {/* Dietary preferences */}
                                <h3 className="font-bold text-lg text-slate-800 border-b border-slate-100 pb-2 pt-2">Dietary Preferences</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {['Vegetarian', 'Vegan', 'Keto', 'Paleo', 'Gluten Free', 'Dairy Free'].map(diet => (
                                        <label key={diet} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${dietValues.includes(diet) ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:bg-slate-50'
                                            }`}>
                                            <input type="checkbox" className="rounded text-emerald-600"
                                                checked={dietValues.includes(diet)} onChange={() => toggleDiet(diet)} />
                                            <span className={`text-sm font-medium ${dietValues.includes(diet) ? 'text-emerald-900' : 'text-slate-700'}`}>{diet}</span>
                                        </label>
                                    ))}
                                </div>

                                <div className="flex justify-end pt-2">
                                    <Button type="submit" disabled={isSaving} className="px-8">
                                        <Save size={16} /> {isSaving ? 'Saving…' : 'Save Changes'}
                                    </Button>
                                </div>
                            </form>
                        </Card>

                        {/* Change password */}
                        <Card className="p-8">
                            <form onSubmit={handleChangePassword} className="space-y-4">
                                <h3 className="font-bold text-lg text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
                                    <Lock size={18} /> Change Password
                                </h3>
                                <div>
                                    <Label>Current Password</Label>
                                    <Input type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} placeholder="••••••••" required />
                                </div>
                                <div>
                                    <Label>New Password</Label>
                                    <Input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="Min 8 chars, 1 uppercase, 1 number" required />
                                </div>
                                <div>
                                    <Label>Confirm New Password</Label>
                                    <Input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} placeholder="••••••••" required />
                                </div>
                                <div className="flex justify-end">
                                    <Button type="submit" disabled={isSaving} className="px-8">
                                        <Lock size={16} /> {isSaving ? 'Saving…' : 'Update Password'}
                                    </Button>
                                </div>
                            </form>
                        </Card>

                        {/* Danger zone */}
                        <Card className="p-8 border-red-100">
                            <h3 className="font-bold text-lg text-red-700 border-b border-red-100 pb-2 flex items-center gap-2 mb-4">
                                <Trash2 size={18} /> Danger Zone
                            </h3>
                            {!showDeleteConfirm ? (
                                <Button variant="danger" onClick={() => setShowDeleteConfirm(true)}>
                                    Delete My Account
                                </Button>
                            ) : (
                                <div className="space-y-3">
                                    <p className="text-sm text-red-700 font-medium">This is permanent and cannot be undone. All your data will be deleted.</p>
                                    <div className="flex gap-3">
                                        <Button variant="danger" onClick={handleDelete}>Yes, delete my account</Button>
                                        <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
                                    </div>
                                </div>
                            )}
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
}
