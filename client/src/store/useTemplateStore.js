import { create } from 'zustand';

const useTemplateStore = create((set) => ({
  templateFile: null,
  templateUrl: null,
  templateWidth: 0,
  templateHeight: 0,
  
  setTemplate: (file, url, width, height) => set({
    templateFile: file,
    templateUrl: url,
    templateWidth: width,
    templateHeight: height
  }),
  
  clearTemplate: () => {
    set((state) => {
      if (state.templateUrl) {
        URL.revokeObjectURL(state.templateUrl);
      }
      return { templateFile: null, templateUrl: null, templateWidth: 0, templateHeight: 0 };
    });
  }
}));

export default useTemplateStore;
