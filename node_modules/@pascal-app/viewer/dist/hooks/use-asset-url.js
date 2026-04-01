import { loadAssetUrl } from '@pascal-app/core';
import { useEffect, useState } from 'react';
/**
 * Resolves an asset:// URL to a blob URL for use with Three.js loaders.
 * Returns null while loading or if resolution fails.
 */
export function useAssetUrl(url) {
    const [resolved, setResolved] = useState(null);
    useEffect(() => {
        let cancelled = false;
        setResolved(null);
        loadAssetUrl(url).then((result) => {
            if (!cancelled)
                setResolved(result);
        });
        return () => {
            cancelled = true;
        };
    }, [url]);
    return resolved;
}
