import { emitter, } from '@pascal-app/core';
import useViewer from '../store/use-viewer';
export function useNodeEvents(node, type) {
    const emit = (suffix, e) => {
        const eventKey = `${type}:${suffix}`;
        const localPoint = e.object.worldToLocal(e.point.clone());
        const payload = {
            node,
            position: [e.point.x, e.point.y, e.point.z],
            localPosition: [localPoint.x, localPoint.y, localPoint.z],
            normal: e.face ? [e.face.normal.x, e.face.normal.y, e.face.normal.z] : undefined,
            stopPropagation: () => e.stopPropagation(),
            nativeEvent: e,
        };
        emitter.emit(eventKey, payload);
    };
    return {
        onPointerDown: (e) => {
            if (useViewer.getState().cameraDragging)
                return;
            if (e.button !== 0)
                return;
            emit('pointerdown', e);
        },
        onPointerUp: (e) => {
            if (useViewer.getState().cameraDragging)
                return;
            if (e.button !== 0)
                return;
            emit('pointerup', e);
            // Synthesize a click event on pointer up to be more forgiving than R3F's default onClick
            // which often fails if the mouse moves even 1 pixel.
            emit('click', e);
        },
        onClick: (e) => {
            // Disable default R3F click since we synthesize it on pointerup
            // This prevents double-clicks from firing twice.
        },
        onPointerEnter: (e) => {
            if (useViewer.getState().cameraDragging)
                return;
            emit('enter', e);
        },
        onPointerLeave: (e) => {
            if (useViewer.getState().cameraDragging)
                return;
            emit('leave', e);
        },
        onPointerMove: (e) => {
            if (useViewer.getState().cameraDragging)
                return;
            emit('move', e);
        },
        onDoubleClick: (e) => {
            if (useViewer.getState().cameraDragging)
                return;
            emit('double-click', e);
        },
        onContextMenu: (e) => {
            if (useViewer.getState().cameraDragging)
                return;
            emit('context-menu', e);
        },
    };
}
