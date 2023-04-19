import { useEffect, useRef, FC } from "react";

interface WriteOnProps {
  paths: string[];
  fillClass?: (index?: number) => string;
}

const WriteOn: FC<WriteOnProps> = ({ 
  paths,
  fillClass = () => "fill-current stroke-current"
}) => {
  const pathRefs = useRef<SVGPathElement[]>([]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      pathRefs.current.forEach((path, index, paths) => {
        const length = path.getTotalLength();
        path.style.strokeDasharray = `${length}`;
        path.style.strokeDashoffset = `${length}`;
        path.getBoundingClientRect(); // Triggers a reflow, which is necessary for the animation to work
  
        const duration = 2 + index * 0.5;
        const wait = 1 + (paths.length) * 0.45
        path.style.transition = path.style.transition = `stroke-dashoffset ${duration}s ease-in-out, fill-opacity 1s ${wait}s ease-in-out`;
        path.style.strokeDashoffset = "0";
        path.style.fillOpacity = "1";
        path.style.strokeOpacity = "1";
      });
    }, 3000)
  }, []);

  return (
    <svg className="w-full h-auto drop-shadow-2xl" viewBox="0 0 800 250" style={{
      "fillRule": "evenodd",
      "clipRule": "evenodd",
      "strokeLinejoin": "round",
      "strokeMiterlimit": 2
    }}
    > 
      <defs>
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="5" />
          <feOffset dx="5" dy="5" result="offsetblur" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.5" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {paths.map((path, index) => {
        const fill = fillClass(index)
        return (
          <path
            className={fill}
            // filter="url(#shadow)"
            key={index}
            ref={(el) => (pathRefs.current[index] = el!)}
            d={path}
            fillOpacity="0"
            strokeWidth="2"
            strokeOpacity="0"
          />
        )
      })}
    </svg>
  );
};

export default WriteOn;