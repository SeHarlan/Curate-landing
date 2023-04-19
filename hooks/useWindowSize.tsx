import { useEffect, useState } from "react";
import throttle from 'lodash.throttle'

export const MD_SCREEN_BREAKPOINT = 768
const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState<{width?: number, height?:number}>({
    width: undefined,
    height: undefined,
  });
  const [isMdScreen, setIsMdScreen] = useState(false)

  useEffect(() => {
    // only execute all the code below in client side
    // Handler to call on window resize
    const handleResize = throttle(() => {
      // Set window width/height to state
      if(!window.innerWidth) return
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
      setIsMdScreen(window.innerWidth <= MD_SCREEN_BREAKPOINT)
    }, 200);

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Call handler right away so state gets updated with initial window size
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []); 

  return { ...windowSize, isMdScreen }
}
export default useWindowSize