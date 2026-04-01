import { jsx as _jsx } from "react/jsx-runtime";
import { OrthographicCamera, PerspectiveCamera } from '@react-three/drei';
import useViewer from '../../store/use-viewer';
export const ViewerCamera = () => {
    const cameraMode = useViewer((state) => state.cameraMode);
    return cameraMode === 'perspective' ? (_jsx(PerspectiveCamera, { far: 1000, fov: 50, makeDefault: true, near: 0.1, position: [10, 10, 10] })) : (_jsx(OrthographicCamera, { far: 1000, makeDefault: true, near: -1000, position: [10, 10, 10], zoom: 20 }));
};
