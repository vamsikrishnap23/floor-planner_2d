'use client';
import { create } from 'zustand';
const defaultControlValue = (interactive, index) => {
    const control = interactive.controls[index];
    if (!control)
        return false;
    switch (control.kind) {
        case 'toggle':
            return control.default ?? false;
        case 'slider':
            return control.default ?? control.min;
        case 'temperature':
            return control.default ?? control.min;
    }
};
export const useInteractive = create((set, get) => ({
    items: {},
    initItem: (itemId, interactive) => {
        const { controls } = interactive;
        if (controls.length === 0)
            return;
        // Don't overwrite existing state (idempotent)
        if (get().items[itemId])
            return;
        set((state) => ({
            items: {
                ...state.items,
                [itemId]: {
                    controlValues: controls.map((_, i) => defaultControlValue(interactive, i)),
                },
            },
        }));
    },
    setControlValue: (itemId, index, value) => {
        set((state) => {
            const item = state.items[itemId];
            if (!item)
                return state;
            const next = [...item.controlValues];
            next[index] = value;
            return { items: { ...state.items, [itemId]: { controlValues: next } } };
        });
    },
    removeItem: (itemId) => {
        set((state) => {
            const { [itemId]: _, ...rest } = state.items;
            return { items: rest };
        });
    },
}));
