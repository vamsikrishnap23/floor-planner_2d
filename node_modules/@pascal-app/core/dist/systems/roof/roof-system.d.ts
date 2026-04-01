import * as THREE from 'three';
import { Brush } from 'three-bvh-csg';
import type { RoofSegmentNode } from '../../schema';
export declare const RoofSystem: () => null;
/**
 * Generate complete hollow-shell geometry for a roof segment.
 * Ports the prototype's CSG approach using three-bvh-csg.
 */
export declare function getRoofSegmentBrushes(node: RoofSegmentNode): {
    deckSlab: Brush;
    shinSlab: Brush;
    wallBrush: Brush;
    innerBrush: Brush;
} | null;
export declare function generateRoofSegmentGeometry(node: RoofSegmentNode): THREE.BufferGeometry;
//# sourceMappingURL=roof-system.d.ts.map