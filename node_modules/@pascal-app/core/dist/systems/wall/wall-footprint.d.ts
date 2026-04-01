import type { WallNode } from '../../schema';
import { type Point2D, type WallMiterData } from './wall-mitering';
export declare const DEFAULT_WALL_THICKNESS = 0.1;
export declare const DEFAULT_WALL_HEIGHT = 2.5;
export declare function getWallThickness(wallNode: WallNode): number;
export declare function getWallPlanFootprint(wallNode: WallNode, miterData: WallMiterData): Point2D[];
//# sourceMappingURL=wall-footprint.d.ts.map