import { jsx as _jsx } from "react/jsx-runtime";
import { useRegistry } from '@pascal-app/core';
import { Suspense, useMemo, useRef } from 'react';
import { useAssetUrl } from '../../../hooks/use-asset-url';
import { useGLTFKTX2 } from '../../../hooks/use-gltf-ktx2';
import useViewer from '../../../store/use-viewer';
export const ScanRenderer = ({ node }) => {
    const showScans = useViewer((s) => s.showScans);
    const ref = useRef(null);
    useRegistry(node.id, 'scan', ref);
    const resolvedUrl = useAssetUrl(node.url);
    return (_jsx("group", { position: node.position, ref: ref, rotation: node.rotation, scale: [node.scale, node.scale, node.scale], visible: showScans, children: resolvedUrl && (_jsx(Suspense, { children: _jsx(ScanModel, { opacity: node.opacity, url: resolvedUrl }) })) }));
};
const ScanModel = ({ url, opacity }) => {
    const gltf = useGLTFKTX2(url);
    const scene = gltf.scene;
    useMemo(() => {
        const normalizedOpacity = opacity / 100;
        const isTransparent = normalizedOpacity < 1;
        const updateMaterial = (material) => {
            if (isTransparent) {
                material.transparent = true;
                material.opacity = normalizedOpacity;
                material.depthWrite = false;
            }
            else {
                material.transparent = false;
                material.opacity = 1;
                material.depthWrite = true;
            }
            material.needsUpdate = true;
        };
        scene.traverse((child) => {
            if (child.isMesh) {
                const mesh = child;
                // Disable raycasting
                mesh.raycast = () => { };
                // Exclude from bounding box calculations
                mesh.geometry.boundingBox = null;
                mesh.geometry.boundingSphere = null;
                mesh.frustumCulled = false;
                if (Array.isArray(mesh.material)) {
                    mesh.material.forEach((material) => {
                        updateMaterial(material);
                    });
                }
                else {
                    updateMaterial(mesh.material);
                }
            }
        });
    }, [scene, opacity]);
    return _jsx("primitive", { object: scene });
};
