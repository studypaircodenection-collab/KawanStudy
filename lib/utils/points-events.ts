/**
 * Utility functions for dispatching and listening to points update events
 */

export interface PointsUpdateEventDetail {
  pointsAwarded?: number;
  newTotal?: number;
  source?: string; // e.g., 'quiz', 'achievement', 'daily-challenge'
}

/**
 * Dispatch a custom event to notify components that points have been updated
 */
export function dispatchPointsUpdate(detail: PointsUpdateEventDetail = {}) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('points-updated', { detail }));
  }
}

/**
 * Add an event listener for points updates
 */
export function addPointsUpdateListener(callback: (detail: PointsUpdateEventDetail) => void) {
  if (typeof window !== 'undefined') {
    const handler = (event: CustomEvent<PointsUpdateEventDetail>) => {
      callback(event.detail);
    };
    window.addEventListener('points-updated', handler as EventListener);
    return () => window.removeEventListener('points-updated', handler as EventListener);
  }
  return () => {};
}

/**
 * Hook for listening to points updates in React components
 */
export function usePointsUpdateListener(callback: (detail: PointsUpdateEventDetail) => void) {
  if (typeof window !== 'undefined' && typeof callback === 'function') {
    const cleanup = addPointsUpdateListener(callback);
    return cleanup;
  }
  return () => {};
}
