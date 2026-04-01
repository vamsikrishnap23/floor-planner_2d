import type * as THREE from 'three';
export declare const sceneRegistry: {
    nodes: Map<string, THREE.Object3D<THREE.Object3DEventMap>>;
    byType: {
        site: Set<string>;
        building: Set<string>;
        ceiling: Set<string>;
        level: Set<string>;
        wall: Set<string>;
        item: Set<string>;
        slab: Set<string>;
        zone: Set<string>;
        roof: Set<string>;
        'roof-segment': Set<string>;
        scan: Set<string>;
        guide: Set<string>;
        window: Set<string>;
        door: Set<string>;
    };
    /** Remove all entries. Call when unloading a scene to prevent stale 3D refs. */
    clear(): void;
};
export declare function useRegistry(id: string, type: keyof typeof sceneRegistry.byType, ref: React.RefObject<THREE.Object3D>): void;
//# sourceMappingURL=scene-registry.d.ts.map