// src/components/utils/ScrollToTop.jsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export const ScrollToTop = ({ containerSelector }) => {
  const { pathname } = useLocation();

  useEffect(() => {
    if (containerSelector) {
      const container = document.querySelector(containerSelector);
      if (container) container.scrollTo({ top: 0, left: 0, behavior: "auto" });
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }
    console.log("ScrollToTop triggered for:", pathname);
  }, [pathname, containerSelector]);

  return null;
};
