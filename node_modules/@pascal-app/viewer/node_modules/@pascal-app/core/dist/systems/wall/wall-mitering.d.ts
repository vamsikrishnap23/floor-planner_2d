import type { WallNode } from '../../schema';
export interface Point2D {
    x: number;
    y: number;
}
type WallIntersections = Map<string, {
    left?: Point2D;
    right?: Point2D;
}>;
type JunctionData = Map<string, WallIntersections>;
declare function pointToKey(p: Point2D, tolerance?: number): string;
interface Junction {
    meetingPoint: Point2D;
    connectedWalls: Array<{
        wall: WallNode;
        endType: 'start' | 'end' | 'passthrough';
    }>;
}
export interface WallMiterData {
    junctionData: JunctionData;
    junctions: Map<string, Junction>;
}
/**
 * Calculates miter data for all walls on a level
 */
export declare function calculateLevelMiters(walls: WallNode[]): WallMiterData;
/**
 * Gets wall IDs that share junctions with the given walls
 */
export declare function getAdjacentWallIds(allWalls: WallNode[], dirtyWallIds: Set<string>): Set<string>;
export { pointToKey };
//# sourceMappingURL=wall-mitering.d.ts.map