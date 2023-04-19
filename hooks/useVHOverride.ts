import { useEffect } from "react";

export default function useVHOverride() {
  const setViewHeight = () => {
    let vh = window.innerHeight * 0.01
    document.documentElement.style.setProperty('--vh', `${vh}px`)
  }

  useEffect(() => {
    setViewHeight()
    window.addEventListener("resize", setViewHeight);
    return () => window.removeEventListener("resize", setViewHeight)
  },[])
}