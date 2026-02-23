// FoodGenie — API client
// All auth calls go through the Vite dev proxy → http://localhost:3001
// Cookies are included automatically (credentials: 'include')

const BASE = '/api/auth';

export interface ApiUser {
    id: number;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    displayName: string | null;
    avatarUrl: string | null;
    bio: string | null;
    location: string | null;
    role: 'user' | 'admin';
    createdAt: string;
    updatedAt: string;
}

export interface ApiError {
    code: string;
    message: string;
    details?: Record<string, string[]>;
}

export interface ApiResponse<T> {
    success: true;
    data: T;
}

async function request<T>(
    path: string,
    options: RequestInit = {}
): Promise<T> {
    const res = await fetch(`${BASE}${path}`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...options.headers },
        ...options,
    });

    const body = await res.json().catch(() => null);

    if (!res.ok) {
        const err: ApiError = body?.error ?? { code: 'UNKNOWN', message: 'An unexpected error occurred.' };
        throw err;
    }

    return (body as ApiResponse<T>).data;
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface RegisterPayload {
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    password: string;
}

export const register = (payload: RegisterPayload) =>
    request<ApiUser>('/register', { method: 'POST', body: JSON.stringify(payload) });

export interface LoginPayload {
    email: string;
    password: string;
}

export const login = (payload: LoginPayload) =>
    request<ApiUser>('/login', { method: 'POST', body: JSON.stringify(payload) });

export const logout = () =>
    request<{ message: string }>('/logout', { method: 'POST' });

export const getMe = () =>
    request<ApiUser>('/me');

// ─── Profile ──────────────────────────────────────────────────────────────────

export interface UpdateProfilePayload {
    firstName?: string;
    lastName?: string;
    displayName?: string;
    bio?: string;
    location?: string;
}

export const updateProfile = (payload: UpdateProfilePayload) =>
    request<ApiUser>('/me', { method: 'PATCH', body: JSON.stringify(payload) });

export const deleteAccount = () =>
    request<{ message: string }>('/me', { method: 'DELETE' });

export const uploadAvatar = (file: File) => {
    const form = new FormData();
    form.append('avatar', file);
    return fetch(`${BASE}/me/avatar`, {
        method: 'POST',
        credentials: 'include',
        body: form,
    }).then(async (res) => {
        const body = await res.json().catch(() => null);
        if (!res.ok) throw body?.error ?? { code: 'UNKNOWN', message: 'Upload failed.' };
        return (body as ApiResponse<ApiUser>).data;
    });
};

// ─── Password ─────────────────────────────────────────────────────────────────

export interface ChangePasswordPayload {
    currentPassword: string;
    newPassword: string;
}

export const changePassword = (payload: ChangePasswordPayload) =>
    request<{ message: string }>('/password', { method: 'PATCH', body: JSON.stringify(payload) });

export const forgotPassword = (email: string) =>
    request<{ message: string }>('/forgot-password', { method: 'POST', body: JSON.stringify({ email }) });

export const resetPassword = (token: string, password: string) =>
    request<{ message: string }>('/reset-password', { method: 'POST', body: JSON.stringify({ token, newPassword: password }) });

// ─── Preferences ──────────────────────────────────────────────────────────────

export interface Preference {
    type: 'diet' | 'allergen' | 'blacklist';
    value: string;
}

export const getPreferences = () =>
    request<Preference[]>('/preferences');

export const updatePreferences = (preferences: Preference[]) =>
    request<Preference[]>('/preferences', { method: 'PUT', body: JSON.stringify({ preferences }) });
