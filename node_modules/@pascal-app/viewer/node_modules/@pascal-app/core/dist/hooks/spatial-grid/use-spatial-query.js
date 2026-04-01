import { useCallback } from 'react';
import { spatialGridManager } from './spatial-grid-manager';
export function useSpatialQuery() {
    const canPlaceOnFloor = useCallback((levelId, position, dimensions, rotation, ignoreIds) => {
        return spatialGridManager.canPlaceOnFloor(levelId, position, dimensions, rotation, ignoreIds);
    }, []);
    const canPlaceOnWall = useCallback((levelId, wallId, localX, localY, dimensions, attachType = 'wall', side, ignoreIds) => {
        return spatialGridManager.canPlaceOnWall(levelId, wallId, localX, localY, dimensions, attachType, side, ignoreIds);
    }, []);
    const canPlaceOnCeiling = useCallback((ceilingId, position, dimensions, rotation, ignoreIds) => {
        return spatialGridManager.canPlaceOnCeiling(ceilingId, position, dimensions, rotation, ignoreIds);
    }, []);
    return { canPlaceOnFloor, canPlaceOnWall, canPlaceOnCeiling };
}
