import { create } from 'zustand';
export const useItemLightPool = create((set) => ({
    registrations: new Map(),
    register: (key, nodeId, effect, interactive) => {
        const toggleIndex = interactive.controls.findIndex((c) => c.kind === 'toggle');
        const sliderIndex = interactive.controls.findIndex((c) => c.kind === 'slider');
        const sliderControl = sliderIndex >= 0 ? interactive.controls[sliderIndex] : null;
        const registration = {
            nodeId,
            effect,
            toggleIndex,
            sliderIndex,
            hasSlider: sliderControl !== null,
            sliderMin: sliderControl?.min ?? 0,
            sliderMax: sliderControl?.max ?? 1,
        };
        set((s) => {
            const next = new Map(s.registrations);
            next.set(key, registration);
            return { registrations: next };
        });
    },
    unregister: (key) => {
        set((s) => {
            const next = new Map(s.registrations);
            next.delete(key);
            return { registrations: next };
        });
    },
}));
