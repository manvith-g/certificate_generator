import { useEffect, useRef } from 'react';

export default function CanvasEditor({ onCanvasReady, templateUrl, templateWidth, templateHeight, canvasHook }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !templateUrl || !canvasHook) return;
    
    const canvas = canvasHook.initCanvas(canvasRef.current, templateUrl, templateWidth, templateHeight);
    if (onCanvasReady) onCanvasReady(canvas);
  }, [templateUrl, templateWidth, templateHeight]);

  return (
    <div ref={(el) => {
      containerRef.current = el;
      if (canvasHook?.fabricCanvas) {
        // Share container ref with hook if needed
      }
    }} className="canvas-container flex items-center justify-center p-5">
      <canvas ref={canvasRef} />
    </div>
  );
}
