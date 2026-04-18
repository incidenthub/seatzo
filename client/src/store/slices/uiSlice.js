import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isAuthModalOpen: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    openAuthModal: (state) => {
      state.isAuthModalOpen = true;
    },
    closeAuthModal: (state) => {
      state.isAuthModalOpen = false;
    },
  },
});

export const { openAuthModal, closeAuthModal } = uiSlice.actions;
export default uiSlice.reducer;
