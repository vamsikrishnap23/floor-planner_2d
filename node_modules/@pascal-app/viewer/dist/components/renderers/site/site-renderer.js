import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRegistry } from '@pascal-app/core';
import { useMemo, useRef } from 'react';
import { BufferGeometry, Float32BufferAttribute, Shape } from 'three';
import { useNodeEvents } from '../../../hooks/use-node-events';
import { NodeRenderer } from '../node-renderer';
const Y_OFFSET = 0.01;
/**
 * Creates simple line geometry for site boundary
 * Single horizontal line at ground level
 */
const createBoundaryLineGeometry = (points) => {
    const geometry = new BufferGeometry();
    if (points.length < 2)
        return geometry;
    const positions = [];
    // Create a simple line loop at ground level
    for (const [x, z] of points) {
        positions.push(x ?? 0, Y_OFFSET, z ?? 0);
    }
    // Close the loop
    positions.push(points[0]?.[0] ?? 0, Y_OFFSET, points[0]?.[1] ?? 0);
    geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
    return geometry;
};
export const SiteRenderer = ({ node }) => {
    const ref = useRef(null);
    useRegistry(node.id, 'site', ref);
    // Create floor shape from polygon points
    const floorShape = useMemo(() => {
        if (!node?.polygon?.points || node.polygon.points.length < 3)
            return null;
        const shape = new Shape();
        const firstPt = node.polygon.points[0];
        // Shape is in X-Y plane, we rotate it to X-Z plane
        // Negate Y (which becomes Z) to get correct orientation
        shape.moveTo(firstPt[0], -firstPt[1]);
        for (let i = 1; i < node.polygon.points.length; i++) {
            const pt = node.polygon.points[i];
            shape.lineTo(pt[0], -pt[1]);
        }
        shape.closePath();
        return shape;
    }, [node?.polygon?.points]);
    // Create boundary line geometry
    const lineGeometry = useMemo(() => {
        if (!node?.polygon?.points || node.polygon.points.length < 2)
            return null;
        return createBoundaryLineGeometry(node.polygon.points);
    }, [node?.polygon?.points]);
    const handlers = useNodeEvents(node, 'site');
    if (!(node && floorShape && lineGeometry)) {
        return null;
    }
    return (_jsxs("group", { ref: ref, ...handlers, children: [node.children.map((child) => (_jsx(NodeRenderer, { nodeId: typeof child === 'string' ? child : child.id }, typeof child === 'string' ? child : child.id))), _jsxs("mesh", { position: [0, Y_OFFSET - 0.005, 0], receiveShadow: true, rotation: [-Math.PI / 2, 0, 0], children: [_jsx("shapeGeometry", { args: [floorShape] }), _jsx("shadowMaterial", { opacity: 0.75, transparent: true })] }), _jsx("line", { frustumCulled: false, geometry: lineGeometry, renderOrder: 9, children: _jsx("lineBasicMaterial", { color: "#f59e0b", linewidth: 2, opacity: 0.6, transparent: true }) })] }));
};
