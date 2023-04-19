import { useRef, useEffect, FC } from 'react';
import p5, { Renderer } from 'p5';

interface P5WrapperProps {
  sketch: (p: p5) => void;
}

const P5Wrapper: FC<P5WrapperProps> = ({ sketch }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const p5Ref = useRef<Renderer | null>(null);

  useEffect(() => {
    if (containerRef && containerRef.current) {
      const p5Instance = new p5(sketch, containerRef.current);
      
      // @ts-ignore
      p5Ref.current = p5Instance.canvas;
      return () => {
        p5Instance.remove();
      };
    }
  }, [sketch]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
};


export default P5Wrapper;