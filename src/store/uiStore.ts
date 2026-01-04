import type React from 'react';
import { create } from 'zustand';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

interface Modal {
  id: string;
  component: React.ComponentType<unknown>;
  props?: Record<string, unknown>;
}

interface UIState {
  toasts: Toast[];
  modals: Modal[];
  isLoading: boolean;
  loadingMessage?: string;
}

interface UIActions {
  showToast: (toast: Omit<Toast, 'id'>) => void;
  hideToast: (id: string) => void;
  clearToasts: () => void;
  showModal: (modal: Omit<Modal, 'id'>) => void;
  hideModal: (id: string) => void;
  clearModals: () => void;
  setLoading: (isLoading: boolean, message?: string) => void;
}

type UIStore = UIState & UIActions;

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const useUIStore = create<UIStore>()((set) => ({
  toasts: [],
  modals: [],
  isLoading: false,
  loadingMessage: undefined,

  showToast: (toast) =>
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id: generateId() }],
    })),

  hideToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    })),

  clearToasts: () => set({ toasts: [] }),

  showModal: (modal) =>
    set((state) => ({
      modals: [...state.modals, { ...modal, id: generateId() }],
    })),

  hideModal: (id) =>
    set((state) => ({
      modals: state.modals.filter((modal) => modal.id !== id),
    })),

  clearModals: () => set({ modals: [] }),

  setLoading: (isLoading, loadingMessage) => set({ isLoading, loadingMessage }),
}));
