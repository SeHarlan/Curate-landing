import { useState, useEffect } from 'react';

function isWebGLSupported(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  } catch (e) {
    return false;
  }
}

export function useWebGLSupported(): boolean {
  const [webGLSupported, setWebGLSupported] = useState(false);

  useEffect(() => {
    setWebGLSupported(isWebGLSupported());
  }, []);

  return webGLSupported;
}