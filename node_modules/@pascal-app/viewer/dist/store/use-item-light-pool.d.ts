import type { AnyNodeId, Interactive, LightEffect } from '@pascal-app/core';
export type LightRegistration = {
    nodeId: AnyNodeId;
    effect: LightEffect;
    toggleIndex: number;
    sliderIndex: number;
    sliderMin: number;
    sliderMax: number;
    hasSlider: boolean;
};
type ItemLightPoolStore = {
    registrations: Map<string, LightRegistration>;
    register: (key: string, nodeId: AnyNodeId, effect: LightEffect, interactive: Interactive) => void;
    unregister: (key: string) => void;
};
export declare const useItemLightPool: import("zustand").UseBoundStore<import("zustand").StoreApi<ItemLightPoolStore>>;
export {};
//# sourceMappingURL=use-item-light-pool.d.ts.map