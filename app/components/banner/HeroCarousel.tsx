"use client";

import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";
import "./heroCarousel.css";
import { Container } from "../container/Container";
import Typography from "../typegrophy/typography";
import Button from "../button/button";
import useMediaQuery from "@/app/utils/useMediaQuery";
import { breakpoints } from "@/app/utils/breakpoints";

const slides = [
  {
    id: 1,
    title: "Vismayam Arts",
    mainTitle: `<span class="text-highlight">Bringing</span> 1,000 years of heritage<span class="text-highlight"> to your home</span>`,
    description: "Inspired by Chola temples from Saraswati and Varahi to the Pancha Rama set made for modern living spaces.",
    image: "/images/banner/1-NrityaGanapathi.avif",
  },
  {
    id: 2,
   title: "Vismayam Arts",
    mainTitle: `<span class="text-highlight">Bringing</span> 1,000 years of heritage<span class="text-highlight"> to your home</span>`,
    description: "Inspired by Chola temples from Saraswati and Varahi to the Pancha Rama set made for modern living spaces.",
    image: "/images/banner/2-Veenadarar.avif",
  },
  {
    id: 3,
    title: "Vismayam Arts",
    mainTitle: `<span class="text-highlight">Bringing</span> 1,000 years of heritage<span class="text-highlight"> to your home</span>`,
    description: "Inspired by Chola temples from Saraswati and Varahi to the Pancha Rama set made for modern living spaces.",
    image: "/images/banner/3-Varahi.avif",
  },

  {
    id: 4,
    title: "Vismayam Arts",
    mainTitle: `<span class="text-highlight">Bringing</span> 1,000 years of heritage<span class="text-highlight"> to your home</span>`,
    description: "Inspired by Chola temples from Saraswati and Varahi to the Pancha Rama set made for modern living spaces.",
    image: "/images/banner/4-Saraswati.avif",
  },

  {
    id: 5,
    title: "Vismayam Arts",
    mainTitle: `<span class="text-highlight">Bringing</span> 1,000 years of heritage<span class="text-highlight"> to your home</span>`,
    description: "Inspired by Chola temples from Saraswati and Varahi to the Pancha Rama set made for modern living spaces.",
    image: "/images/banner/5-Rishabakunjaram.avif",
  },

  {
    id: 6,
    title: "Vismayam Arts",
    mainTitle: `<span class="text-highlight">Bringing</span> 1,000 years of heritage<span class="text-highlight"> to your home</span>`,
    description: "Inspired by Chola temples from Saraswati and Varahi to the Pancha Rama set made for modern living spaces.",
    image: "/images/banner/6-MuthuswamiDikshitar.avif",
  },

  {
    id: 7,
    title: "Vismayam Arts",
    mainTitle: `<span class="text-highlight">Bringing</span> 1,000 years of heritage<span class="text-highlight"> to your home</span>`,
    description: "Inspired by Chola temples from Saraswati and Varahi to the Pancha Rama set made for modern living spaces.",
    image: "/images/banner/7-Rama-set.avif",
  },
];

export default function HeroCarousel() {
  const [isMounted, setIsMounted] = useState(false);
const isMobile = useMediaQuery(breakpoints.mobile);
  const isIpadSmall = useMediaQuery(breakpoints.ipadSmall);
  const isDesktop = useMediaQuery(breakpoints.desktop);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <section className="hero-carousel" style={{ minHeight: "400px" }} />;
  }

  return (
    <section className="hero-carousel">

      <Swiper
        modules={[Autoplay, EffectFade, Pagination]}
        effect="fade"
        
        slidesPerView={1}
        loop={true}
        speed={1000}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div
              className="hero-slide"
              style={{
                backgroundImage: `url("${slide.image}")`,
              }}
            >
             
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      <div className="hero-carousel-overlay-box"></div>

        <div className="hero-content">
                <Container>
                  <div className="hero-inside-content">
                <Typography variant="h4">Vismayam Arts</Typography>
                <Typography variant="h1"><span className="text-highlight">Bringing</span> 1,000 years of <br />heritage<span className="text-highlight"> to your home</span></Typography>
                {!isMobile && (<Typography>Inspired by Chola temples from Saraswati and Varahi to the Pancha Rama set made for modern living spaces.</Typography>)
                }
                 
              </div>

              <div className="hero-banner-button">
                <Button href="/products/collections" size="large" curve="full" variant="filled" color="primary">Explore Collecion</Button>
                <Button href="/about" size="large" curve="full" variant="outline" color="primary">Our Story</Button>
              </div>

             </Container>
             </div>
    </section>
  );
}