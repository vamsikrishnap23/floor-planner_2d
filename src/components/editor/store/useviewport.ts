import { create } from 'zustand';

interface Point2D {
  x: number;
  y: number;
}

interface ViewportState {
  pan: Point2D;
  zoom: number;
  setPan: (pan: Point2D | ((prev: Point2D) => Point2D)) => void;
  setZoom: (zoom: number | ((prev: number) => number)) => void;
}

export const useViewport = create<ViewportState>((set) => ({
  pan: { x: 0, y: 0 },
  zoom: 1, 
  
  setPan: (updater) => set((state) => ({
    pan: typeof updater === 'function' ? updater(state.pan) : updater
  })),
  
  setZoom: (updater) => set((state) => ({
    zoom: typeof updater === 'function' ? updater(state.zoom) : updater
  })),
}));