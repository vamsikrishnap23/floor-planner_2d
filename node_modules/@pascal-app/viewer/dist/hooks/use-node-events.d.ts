import { type BuildingEvent, type BuildingNode, type CeilingEvent, type CeilingNode, type DoorEvent, type DoorNode, type ItemEvent, type ItemNode, type LevelEvent, type LevelNode, type RoofEvent, type RoofNode, type RoofSegmentEvent, type RoofSegmentNode, type SiteEvent, type SiteNode, type SlabEvent, type SlabNode, type WallEvent, type WallNode, type WindowEvent, type WindowNode, type ZoneEvent, type ZoneNode } from '@pascal-app/core';
import type { ThreeEvent } from '@react-three/fiber';
type NodeConfig = {
    site: {
        node: SiteNode;
        event: SiteEvent;
    };
    item: {
        node: ItemNode;
        event: ItemEvent;
    };
    wall: {
        node: WallNode;
        event: WallEvent;
    };
    building: {
        node: BuildingNode;
        event: BuildingEvent;
    };
    level: {
        node: LevelNode;
        event: LevelEvent;
    };
    zone: {
        node: ZoneNode;
        event: ZoneEvent;
    };
    slab: {
        node: SlabNode;
        event: SlabEvent;
    };
    ceiling: {
        node: CeilingNode;
        event: CeilingEvent;
    };
    roof: {
        node: RoofNode;
        event: RoofEvent;
    };
    'roof-segment': {
        node: RoofSegmentNode;
        event: RoofSegmentEvent;
    };
    window: {
        node: WindowNode;
        event: WindowEvent;
    };
    door: {
        node: DoorNode;
        event: DoorEvent;
    };
};
type NodeType = keyof NodeConfig;
export declare function useNodeEvents<T extends NodeType>(node: NodeConfig[T]['node'], type: T): {
    onPointerDown: (e: ThreeEvent<PointerEvent>) => void;
    onPointerUp: (e: ThreeEvent<PointerEvent>) => void;
    onClick: (e: ThreeEvent<PointerEvent>) => void;
    onPointerEnter: (e: ThreeEvent<PointerEvent>) => void;
    onPointerLeave: (e: ThreeEvent<PointerEvent>) => void;
    onPointerMove: (e: ThreeEvent<PointerEvent>) => void;
    onDoubleClick: (e: ThreeEvent<PointerEvent>) => void;
    onContextMenu: (e: ThreeEvent<PointerEvent>) => void;
};
export {};
//# sourceMappingURL=use-node-events.d.ts.map