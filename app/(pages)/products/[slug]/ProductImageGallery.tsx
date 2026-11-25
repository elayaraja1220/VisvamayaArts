"use client";

import { useState } from "react";

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

  if (images.length === 0) return null;

  const handleThumbHover = (index: number) => {
    setActiveIndex(index);
  };

  const handleThumbClick = (index: number) => {
    setActiveIndex(index);
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
          <ul className="product-gallery-thumb-list">
            {images.map((src, index) => {
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
