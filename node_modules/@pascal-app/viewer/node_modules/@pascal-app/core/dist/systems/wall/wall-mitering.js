// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================
const TOLERANCE = 0.001;
function pointToKey(p, tolerance = TOLERANCE) {
    const snap = 1 / tolerance;
    return `${Math.round(p.x * snap)},${Math.round(p.y * snap)}`;
}
function createLineFromPointAndVector(p, v) {
    const a = -v.y;
    const b = v.x;
    const c = -(a * p.x + b * p.y);
    return { a, b, c };
}
/**
 * Checks if a point lies on a wall segment (not at its endpoints)
 */
function pointOnWallSegment(point, wall, tolerance = TOLERANCE) {
    const start = { x: wall.start[0], y: wall.start[1] };
    const end = { x: wall.end[0], y: wall.end[1] };
    // Check if point is at endpoints (those are handled separately)
    if (pointToKey(point, tolerance) === pointToKey(start, tolerance))
        return false;
    if (pointToKey(point, tolerance) === pointToKey(end, tolerance))
        return false;
    // Vector from start to end
    const v = { x: end.x - start.x, y: end.y - start.y };
    const L = Math.sqrt(v.x * v.x + v.y * v.y);
    if (L < 1e-9)
        return false;
    // Vector from start to point
    const w = { x: point.x - start.x, y: point.y - start.y };
    // Project point onto wall line (t is parametric position along segment)
    const t = (v.x * w.x + v.y * w.y) / (L * L);
    // Check if projection is within segment (not at endpoints)
    if (t < tolerance || t > 1 - tolerance)
        return false;
    // Check distance from point to line
    const projX = start.x + t * v.x;
    const projY = start.y + t * v.y;
    const dist = Math.sqrt((point.x - projX) ** 2 + (point.y - projY) ** 2);
    return dist < tolerance;
}
function findJunctions(walls) {
    const junctions = new Map();
    // First pass: group walls by their endpoints
    for (const wall of walls) {
        const startPt = { x: wall.start[0], y: wall.start[1] };
        const endPt = { x: wall.end[0], y: wall.end[1] };
        const keyStart = pointToKey(startPt);
        const keyEnd = pointToKey(endPt);
        if (!junctions.has(keyStart)) {
            junctions.set(keyStart, { meetingPoint: startPt, connectedWalls: [] });
        }
        junctions.get(keyStart)?.connectedWalls.push({ wall, endType: 'start' });
        if (!junctions.has(keyEnd)) {
            junctions.set(keyEnd, { meetingPoint: endPt, connectedWalls: [] });
        }
        junctions.get(keyEnd)?.connectedWalls.push({ wall, endType: 'end' });
    }
    // Second pass: detect T-junctions (walls passing through junction points)
    for (const [_key, junction] of junctions.entries()) {
        for (const wall of walls) {
            // Skip if wall already in this junction
            if (junction.connectedWalls.some((cw) => cw.wall.id === wall.id))
                continue;
            // Check if junction point lies on this wall's segment (not at endpoints)
            if (pointOnWallSegment(junction.meetingPoint, wall)) {
                junction.connectedWalls.push({ wall, endType: 'passthrough' });
            }
        }
    }
    // Filter to only junctions with 2+ walls
    const actualJunctions = new Map();
    for (const [key, junction] of junctions.entries()) {
        if (junction.connectedWalls.length >= 2) {
            actualJunctions.set(key, junction);
        }
    }
    return actualJunctions;
}
function calculateJunctionIntersections(junction, getThickness) {
    const { meetingPoint, connectedWalls } = junction;
    const processedWalls = [];
    for (const { wall, endType } of connectedWalls) {
        const halfT = getThickness(wall) / 2;
        if (endType === 'passthrough') {
            // For passthrough walls (T-junctions), add both directions
            // This allows walls meeting the middle of this wall to miter against it
            const v1 = { x: wall.end[0] - wall.start[0], y: wall.end[1] - wall.start[1] };
            const v2 = { x: -v1.x, y: -v1.y };
            for (const v of [v1, v2]) {
                const L = Math.sqrt(v.x * v.x + v.y * v.y);
                if (L < 1e-9)
                    continue;
                const nUnit = { x: -v.y / L, y: v.x / L };
                const pA = { x: meetingPoint.x + nUnit.x * halfT, y: meetingPoint.y + nUnit.y * halfT };
                const pB = { x: meetingPoint.x - nUnit.x * halfT, y: meetingPoint.y - nUnit.y * halfT };
                const edgeA = createLineFromPointAndVector(pA, v);
                const edgeB = createLineFromPointAndVector(pB, v);
                const angle = Math.atan2(v.y, v.x);
                processedWalls.push({ wallId: wall.id, angle, edgeA, edgeB, isPassthrough: true });
            }
        }
        else {
            // Normal wall endpoint (start or end)
            const v = endType === 'start'
                ? { x: wall.end[0] - wall.start[0], y: wall.end[1] - wall.start[1] }
                : { x: wall.start[0] - wall.end[0], y: wall.start[1] - wall.end[1] };
            const L = Math.sqrt(v.x * v.x + v.y * v.y);
            if (L < 1e-9)
                continue;
            const nUnit = { x: -v.y / L, y: v.x / L };
            const pA = { x: meetingPoint.x + nUnit.x * halfT, y: meetingPoint.y + nUnit.y * halfT };
            const pB = { x: meetingPoint.x - nUnit.x * halfT, y: meetingPoint.y - nUnit.y * halfT };
            const edgeA = createLineFromPointAndVector(pA, v);
            const edgeB = createLineFromPointAndVector(pB, v);
            const angle = Math.atan2(v.y, v.x);
            processedWalls.push({ wallId: wall.id, angle, edgeA, edgeB, isPassthrough: false });
        }
    }
    // Sort by outgoing angle
    processedWalls.sort((a, b) => a.angle - b.angle);
    const wallIntersections = new Map();
    const n = processedWalls.length;
    if (n < 2)
        return wallIntersections;
    // Calculate intersections between adjacent walls (exactly like demo)
    for (let i = 0; i < n; i++) {
        const wall1 = processedWalls[i];
        const wall2 = processedWalls[(i + 1) % n];
        // Intersect left edge of wall1 with right edge of wall2
        const det = wall1.edgeA.a * wall2.edgeB.b - wall2.edgeB.a * wall1.edgeA.b;
        // If lines are parallel (det ≈ 0), skip this intersection - walls will use defaults
        if (Math.abs(det) < 1e-9) {
            continue;
        }
        const p = {
            x: (wall1.edgeA.b * wall2.edgeB.c - wall2.edgeB.b * wall1.edgeA.c) / det,
            y: (wall2.edgeB.a * wall1.edgeA.c - wall1.edgeA.a * wall2.edgeB.c) / det,
        };
        // Only assign intersection to non-passthrough walls
        // Passthrough walls don't receive junction data (their geometry doesn't change)
        if (!wall1.isPassthrough) {
            if (!wallIntersections.has(wall1.wallId)) {
                wallIntersections.set(wall1.wallId, {});
            }
            wallIntersections.get(wall1.wallId).left = p;
        }
        if (!wall2.isPassthrough) {
            if (!wallIntersections.has(wall2.wallId)) {
                wallIntersections.set(wall2.wallId, {});
            }
            wallIntersections.get(wall2.wallId).right = p;
        }
    }
    return wallIntersections;
}
/**
 * Calculates miter data for all walls on a level
 */
export function calculateLevelMiters(walls) {
    const getThickness = (wall) => wall.thickness ?? 0.1;
    const junctions = findJunctions(walls);
    const junctionData = new Map();
    for (const [key, junction] of junctions.entries()) {
        const wallIntersections = calculateJunctionIntersections(junction, getThickness);
        junctionData.set(key, wallIntersections);
    }
    return { junctionData, junctions };
}
/**
 * Gets wall IDs that share junctions with the given walls
 */
export function getAdjacentWallIds(allWalls, dirtyWallIds) {
    const adjacent = new Set();
    for (const dirtyId of dirtyWallIds) {
        const dirtyWall = allWalls.find((w) => w.id === dirtyId);
        if (!dirtyWall)
            continue;
        const dirtyStart = { x: dirtyWall.start[0], y: dirtyWall.start[1] };
        const dirtyEnd = { x: dirtyWall.end[0], y: dirtyWall.end[1] };
        for (const wall of allWalls) {
            if (wall.id === dirtyId)
                continue;
            const wallStart = { x: wall.start[0], y: wall.start[1] };
            const wallEnd = { x: wall.end[0], y: wall.end[1] };
            // Check corner connections (endpoints meeting)
            const startKey = pointToKey(wallStart);
            const endKey = pointToKey(wallEnd);
            const dirtyStartKey = pointToKey(dirtyStart);
            const dirtyEndKey = pointToKey(dirtyEnd);
            if (startKey === dirtyStartKey ||
                startKey === dirtyEndKey ||
                endKey === dirtyStartKey ||
                endKey === dirtyEndKey) {
                adjacent.add(wall.id);
                continue;
            }
            // Check T-junction connections (dirty wall endpoint on other wall's segment)
            if (pointOnWallSegment(dirtyStart, wall) || pointOnWallSegment(dirtyEnd, wall)) {
                adjacent.add(wall.id);
                continue;
            }
            // Check reverse T-junction (other wall endpoint on dirty wall's segment)
            if (pointOnWallSegment(wallStart, dirtyWall) || pointOnWallSegment(wallEnd, dirtyWall)) {
                adjacent.add(wall.id);
            }
        }
    }
    return adjacent;
}
// Re-export for backwards compatibility
export { pointToKey };
