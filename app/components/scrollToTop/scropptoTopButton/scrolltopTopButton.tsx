"use client";

import { useState, useEffect } from "react";
import { ArrowUp } from "react-feather";
import Button from "../../button/button";

export default function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 140);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  };

  if (!isVisible) return null;

  return (
    <Button
      type="button"
      onClick={handleScrollToTop}
      variant="circle"
      color="primary"
      className="page-scroll-top"
      size="large"
    >
      <ArrowUp size={16} />      
    </Button>
  );
}
