/**
 * WebGL Feature Detection Utility
 * 
 * Checks if the browser supports WebGL, which is required for reagraph visualization.
 * This helps us fail gracefully and show fallback UI when WebGL is unavailable.
 */

export function isWebGLAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    if (!gl) {
      console.warn('[WebGL] WebGL context not available');
      return false;
    }
    
    console.log('[WebGL] WebGL is available');
    return true;
  } catch (error) {
    console.error('[WebGL] Error checking WebGL availability:', error);
    return false;
  }
}
