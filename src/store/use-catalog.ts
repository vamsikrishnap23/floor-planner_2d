import { create } from 'zustand'

export interface CatalogItem {
  id: string;
  name: string;
  width: number;
  depth: number;
  imageSrc?: string; // For your downloaded SVG/PNG files!
  icon?: string;     // Fallback emoji
}

interface CatalogState {
  activeItem: CatalogItem | null;
  setActiveItem: (item: CatalogItem | null) => void;
}

export const useCatalog = create<CatalogState>((set) => ({
  activeItem: null,
  setActiveItem: (item) => set({ activeItem: item }),
}))