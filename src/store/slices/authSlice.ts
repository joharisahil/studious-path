import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, User } from '../../types';

// Load from localStorage (fallback if cookie not parsed on frontend)
const storedUser = localStorage.getItem('user');
const storedToken = localStorage.getItem('token');

const initialState: AuthState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  token: storedToken || null,
  isAuthenticated: !!storedToken && !!storedUser,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;

      // 🔹 Persist in localStorage
      localStorage.setItem('user', JSON.stringify(action.payload.user));
      localStorage.setItem('token', action.payload.token);

      // 🔹 Also set cookie manually (non-httpOnly for frontend use)
      // 👉 If backend already sets HttpOnly cookie, you don’t need this part,
      // but keeping it allows Redux to read the token directly.
      document.cookie = `token=${action.payload.token}; path=/; SameSite=Lax`;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;

      // Clear storage + cookie
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      document.cookie = "token=; Max-Age=0; path=/; SameSite=Lax"; // expire cookie
    },
    clearError: (state) => {
      state.error = null;
    },
    updateProfile: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem('user', JSON.stringify(state.user));
      }
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  clearError,
  updateProfile,
} = authSlice.actions;

export default authSlice.reducer;