
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

import "./customerFeedback.css";
import {
  Appreciation,
  getApprecitions,
  getAppreciationImageUrl,
} from "@/app/service/dataService";

import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import { ChevronLeft, ChevronRight } from "react-feather";

import "swiper/css";
import Button from "../button/button";
import Loading from "../loading/loading";

type CustomerFeedbackProps = {
  limit?: number;
  variant?: "slide" | "grid";
};

export default function CustomerFeedback({
  limit,
  variant = "slide",
}: CustomerFeedbackProps) {
  const [appreciationData, setAppreciationData] = useState<
    Appreciation[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [isBeginning, setIsBeginning] = useState(true);
  const swiperRef = useRef<SwiperType | null>(null);
  const [isEnd, setIsEnd] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadAppreciations() {
      try {
        const result = await getApprecitions();

        if (isMounted) {
          setAppreciationData(result);
        }
      } catch (error) {
        console.error(
          "[CustomerFeedback] Failed to load appreciations:",
          error
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadAppreciations();

    return () => {
      isMounted = false;
    };
  }, []);

  const displayedData =
    limit != null
      ? appreciationData.slice(0, limit)
      : appreciationData;

  if (loading) {
    return (
      <div className="appreciation-container">
        <Loading type="section" message="Loading appreciations..." />
      </div>
    );
  }

  if (displayedData.length === 0) {
    return (
      <div className="appreciation-container">
        <p>No appreciations available.</p>
      </div>
    );
  }

  const updateNavigation = (swiper: SwiperType) => {
    setIsBeginning(swiper.isBeginning);
    setIsEnd(swiper.isEnd);
  };

  return (
    <div className="appreciation-container">

      {variant === "slide" ? (
        <>
          {/* Slide Variant */}
          <Swiper
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
              updateNavigation(swiper);
            }}
            onSlideChange={updateNavigation}
            onResize={updateNavigation}
            slidesPerView={4}
            slidesPerGroup={1}
            spaceBetween={20}
            speed={500}
            loop={false}
            watchOverflow
            breakpoints={{
             320: { slidesPerView: 1.25, slidesPerGroup: 1 , spaceBetween: 15},
          567: { slidesPerView: 1.25, slidesPerGroup: 1 , spaceBetween: 15},
          768: { slidesPerView: 2.25, slidesPerGroup: 1 , spaceBetween: 15},
              1024: { slidesPerView: 5, slidesPerGroup: 1 },
            }}
          >
            {displayedData.map((item, i) => (
              <SwiperSlide key={i}>
                <div className="appreciation-card">
                  <Link
                    className="appreciation-link"
                    href={item.appreciation_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      className="appreciation-img"
                      src={getAppreciationImageUrl(
                        item.appreciation_image
                      )}
                      alt={item.appreciation_image}
                      loading="lazy"
                    />
                  </Link>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Slider Navigation */}
          <div className="products-arrrow-container">
            <Button
              type="button"
              variant="circle"
              size="medium"
              color="primary"
              onClick={() => swiperRef.current?.slidePrev()}
              disabled={isBeginning}
            >
              <ChevronLeft size={50} />
            </Button>

            <Button
              type="button"
              variant="circle"
              size="medium"
              color="primary"
              onClick={() => swiperRef.current?.slideNext()}
              disabled={isEnd}
            >
              <ChevronRight size={50} />
            </Button>
          </div>
        </>
      ) : (
        <>
          {/* Grid Variant - Without Swiper */}
          <div className="appreciation-grid">
            {displayedData.map((item, i) => (
              <div className="appreciation-card" key={i}>
                <Link
                  className="appreciation-link"
                  href={item.appreciation_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    className="appreciation-img"
                    src={getAppreciationImageUrl(
                      item.appreciation_image
                    )}
                    alt={item.appreciation_image}
                    loading="lazy"
                  />
                </Link>
              </div>
            ))}
          </div>
        </>
      )}

    </div>
  );
}
