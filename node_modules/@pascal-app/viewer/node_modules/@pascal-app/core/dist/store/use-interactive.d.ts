import type { Interactive } from '../schema/nodes/item';
import type { AnyNodeId } from '../schema/types';
export type ControlValue = boolean | number;
export type ItemInteractiveState = {
    controlValues: ControlValue[];
};
type InteractiveStore = {
    items: Record<AnyNodeId, ItemInteractiveState>;
    /** Initialize a node's interactive state from its asset definition (idempotent) */
    initItem: (itemId: AnyNodeId, interactive: Interactive) => void;
    /** Set a single control value */
    setControlValue: (itemId: AnyNodeId, index: number, value: ControlValue) => void;
    /** Remove a node's state (e.g. on unmount) */
    removeItem: (itemId: AnyNodeId) => void;
};
export declare const useInteractive: import("zustand").UseBoundStore<import("zustand").StoreApi<InteractiveStore>>;
export {};
//# sourceMappingURL=use-interactive.d.ts.map