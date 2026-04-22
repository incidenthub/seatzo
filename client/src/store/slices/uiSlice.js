import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isAuthModalOpen: false,
  authMode: 'login',
  authRole: 'customer',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    openAuthModal: (state, action) => {
      state.isAuthModalOpen = true;
      state.authMode = action.payload?.mode || 'login';
      state.authRole = action.payload?.role || 'customer';
    },
    closeAuthModal: (state) => {
      state.isAuthModalOpen = false;
      state.authMode = 'login';
      state.authRole = 'customer';
    },
  },
});

export const { openAuthModal, closeAuthModal } = uiSlice.actions;
export default uiSlice.reducer;
