export class SpatialGrid {
    cells = new Map();
    itemCells = new Map(); // reverse lookup
    config;
    constructor(config) {
        this.config = config;
    }
    posToCell(x, z) {
        return [Math.floor(x / this.config.cellSize), Math.floor(z / this.config.cellSize)];
    }
    cellKey(cx, cz) {
        return `${cx},${cz}`;
    }
    // Get all cells an item occupies based on its AABB
    getItemCells(position, dimensions, rotation) {
        // Simplified: axis-aligned bounding box
        // For full rotation support, compute rotated corners
        const [x, , z] = position;
        const [w, , d] = dimensions;
        const yRot = rotation[1]; // Y-axis rotation
        // Compute rotated footprint (simplified for 90° increments)
        const cos = Math.abs(Math.cos(yRot));
        const sin = Math.abs(Math.sin(yRot));
        const rotatedW = w * cos + d * sin;
        const rotatedD = w * sin + d * cos;
        const minX = x - rotatedW / 2;
        const maxX = x + rotatedW / 2;
        const minZ = z - rotatedD / 2;
        const maxZ = z + rotatedD / 2;
        const [minCx, minCz] = this.posToCell(minX, minZ);
        // Use exclusive upper bound: subtract epsilon so exact boundaries don't overlap
        // This allows adjacent items (touching but not overlapping) to not conflict
        const epsilon = 1e-6;
        const [maxCx, maxCz] = this.posToCell(maxX - epsilon, maxZ - epsilon);
        const keys = [];
        for (let cx = minCx; cx <= maxCx; cx++) {
            for (let cz = minCz; cz <= maxCz; cz++) {
                keys.push(this.cellKey(cx, cz));
            }
        }
        return keys;
    }
    // Register an item
    insert(itemId, position, dimensions, rotation) {
        const cellKeys = this.getItemCells(position, dimensions, rotation);
        this.itemCells.set(itemId, new Set(cellKeys));
        for (const key of cellKeys) {
            if (!this.cells.has(key)) {
                this.cells.set(key, { itemIds: new Set() });
            }
            this.cells.get(key)?.itemIds.add(itemId);
        }
    }
    // Remove an item
    remove(itemId) {
        const cellKeys = this.itemCells.get(itemId);
        if (!cellKeys)
            return;
        for (const key of cellKeys) {
            const cell = this.cells.get(key);
            if (cell) {
                cell.itemIds.delete(itemId);
                if (cell.itemIds.size === 0) {
                    this.cells.delete(key);
                }
            }
        }
        this.itemCells.delete(itemId);
    }
    // Update = remove + insert
    update(itemId, position, dimensions, rotation) {
        this.remove(itemId);
        this.insert(itemId, position, dimensions, rotation);
    }
    // Query: is this placement valid?
    canPlace(position, dimensions, rotation, ignoreIds = []) {
        const cellKeys = this.getItemCells(position, dimensions, rotation);
        const ignoreSet = new Set(ignoreIds);
        const conflicts = new Set();
        for (const key of cellKeys) {
            const cell = this.cells.get(key);
            if (cell) {
                for (const id of cell.itemIds) {
                    if (!ignoreSet.has(id)) {
                        conflicts.add(id);
                    }
                }
            }
        }
        return {
            valid: conflicts.size === 0,
            conflictIds: [...conflicts],
        };
    }
    // Query: get all items near a point (for snapping, selection, etc.)
    queryRadius(x, z, radius) {
        const cellRadius = Math.ceil(radius / this.config.cellSize);
        const [cx, cz] = this.posToCell(x, z);
        const found = new Set();
        for (let dx = -cellRadius; dx <= cellRadius; dx++) {
            for (let dz = -cellRadius; dz <= cellRadius; dz++) {
                const cell = this.cells.get(this.cellKey(cx + dx, cz + dz));
                if (cell) {
                    for (const id of cell.itemIds) {
                        found.add(id);
                    }
                }
            }
        }
        return [...found];
    }
    getItemCount() {
        return this.itemCells.size;
    }
}
