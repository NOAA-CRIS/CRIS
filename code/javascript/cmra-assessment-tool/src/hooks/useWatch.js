import { useEffect } from 'react';

export function useWatches(obj, names, callback) {
    useEffect(() => {
        if (!obj) {
            return;
        }
        const handles = names.map((name) => obj.watch(name, callback));
        return function removeHandles() {
            handles.forEach((handle) => {
                handle.remove();
            });
        };
    }, [obj, names, callback]);
}

export function useWatch(obj, name, callback) {
    useWatches(obj, [name], callback);
}

export function useOnEvents(obj, names, callback) {
    useEffect(() => {
        if (!obj || typeof obj.on !== 'function') {
            return;
        }
        const handles = names.map((name) => obj.on(name, callback));
        return function removeHandles() {
            handles.forEach((handle) => {
                handle.remove();
            });
        };
    }, [obj, names, callback]);
}

export function useOnEvent(obj, name, callback) {
    useOnEvents(obj, [name], callback);
}
