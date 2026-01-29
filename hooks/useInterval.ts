
import { useEffect, useRef } from 'react';

/**
 * Custom hook to safely handle intervals in React components.
 * 
 * @param callback Function to be called at each interval
 * @param delay Delay in milliseconds. Pass null to pause the interval.
 */
export function useInterval(callback: () => void, delay: number | null) {
    const savedCallback = useRef<() => void>(undefined);

    // Remember the latest callback.
    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    // Set up the interval.
    useEffect(() => {
        function tick() {
            if (savedCallback.current) {
                savedCallback.current();
            }
        }
        if (delay !== null) {
            const id = setInterval(tick, delay);
            return () => clearInterval(id);
        }
    }, [delay]);
}
