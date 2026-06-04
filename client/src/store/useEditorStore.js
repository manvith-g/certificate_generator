import { create } from 'zustand';

const useEditorStore = create((set, get) => ({
  fields: [],
  selectedFieldId: null,
  isDirty: false,
  canvasReady: false,

  setFields: (fields) => set({ fields, isDirty: false }),

  addField: (field) => set((state) => ({
    fields: [...state.fields, field],
    isDirty: true,
  })),

  updateField: (id, updates) => set((state) => ({
    fields: state.fields.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    isDirty: true,
  })),

  removeField: (id) => set((state) => ({
    fields: state.fields.filter((f) => f.id !== id),
    selectedFieldId: state.selectedFieldId === id ? null : state.selectedFieldId,
    isDirty: true,
  })),

  selectField: (id) => set({ selectedFieldId: id }),
  deselectField: () => set({ selectedFieldId: null }),

  getSelectedField: () => {
    const state = get();
    return state.fields.find((f) => f.id === state.selectedFieldId) || null;
  },

  setCanvasReady: (ready) => set({ canvasReady: ready }),
  setDirty: (dirty) => set({ isDirty: dirty }),

  clearEditor: () => set({
    fields: [],
    selectedFieldId: null,
    isDirty: false,
    canvasReady: false,
  }),
}));

export default useEditorStore;
