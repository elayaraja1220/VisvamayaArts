"use client";

import { useState } from "react";

const VISIBLE_THUMBS = 5;

export type GalleryVariant = "horizontal" | "vertical";

type Props = {
  images: string[];
  alt: string;
  variant?: GalleryVariant;
};

export default function ProductImageGallery({
  images,
  alt,
  variant = "vertical",
}: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [startIndex, setStartIndex] = useState(0);

  if (images.length === 0) return null;

  const showArrows = images.length > VISIBLE_THUMBS;
  const maxStart = Math.max(0, images.length - VISIBLE_THUMBS);
  const visibleThumbs = images.slice(startIndex, startIndex + VISIBLE_THUMBS);

  const handleThumbHover = (index: number) => {
    setActiveIndex(index);
  };

  const handleThumbClick = (index: number) => {
    setActiveIndex(index);
  };

  const handlePrev = () => {
    setStartIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setStartIndex((prev) => Math.min(maxStart, prev + 1));
  };

  const largeImage = (
    <div className="product-details-image-container">
      <img
        src={images[activeIndex]}
        alt={alt}
        className="product-details-image"
      />
    </div>
  );

  const thumbnails = images.length > 1 && (
        <div className="product-gallery-thumbs">
          {showArrows && (
            <button
              type="button"
              className="product-gallery-arrow"
              onClick={handlePrev}
              disabled={startIndex === 0}
              aria-label="Previous images"
            >
              &#8249;
            </button>
          )}

          <ul className="product-gallery-thumb-list">
            {visibleThumbs.map((src, i) => {
              const index = startIndex + i;
              return (
                <li key={`${src}-${index}`}>
                  <button
                    type="button"
                    className={`product-gallery-thumb${
                      index === activeIndex ? " is-active" : ""
                    }`}
                    onMouseEnter={() => handleThumbHover(index)}
                    onClick={() => handleThumbClick(index)}
                    aria-label={`Show image ${index + 1}`}
                    aria-current={index === activeIndex}
                  >
                    <img src={src} alt={`${alt} thumbnail ${index + 1}`} />
                  </button>
                </li>
              );
            })}
          </ul>

          {showArrows && (
            <button
              type="button"
              className="product-gallery-arrow"
              onClick={handleNext}
              disabled={startIndex >= maxStart}
              aria-label="Next images"
            >
              &#8250;
            </button>
          )}
        </div>
  );

  return (
    <div className={`product-gallery product-gallery--${variant}`}>
      {variant === "vertical" ? (
        <>
          {thumbnails}
          {largeImage}
        </>
      ) : (
        <>
          {largeImage}
          {thumbnails}
        </>
      )}
    </div>
  );
}
