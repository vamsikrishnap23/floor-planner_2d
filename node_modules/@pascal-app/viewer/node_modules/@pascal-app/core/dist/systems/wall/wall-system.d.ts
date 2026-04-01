import * as THREE from 'three';
import type { AnyNode, WallNode } from '../../schema';
import { type WallMiterData } from './wall-mitering';
export declare const WallSystem: () => null;
/**
 * Generates extruded wall geometry with mitering and cutouts
 *
 * Key insight from demo: polygon is built in WORLD coordinates first,
 * then we transform to wall-local for the 3D mesh.
 */
export declare function generateExtrudedWall(wallNode: WallNode, childrenNodes: AnyNode[], miterData: WallMiterData, slabElevation?: number): THREE.BufferGeometry<THREE.NormalBufferAttributes, THREE.BufferGeometryEventMap>;
//# sourceMappingURL=wall-system.d.ts.map