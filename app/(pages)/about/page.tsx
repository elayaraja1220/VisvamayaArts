"use client"

import { Container } from "@/app/components/container/Container";
import PageSection from "@/app/components/page-section/page-section";
import AboutUs from "@/app/components/home-about/home-about";
import "./aboutpage.css"
import { useEffect } from "react";
export default function About() {
     useEffect(() => {
        document.body.classList.add("product-details-body");
    
        return () => {
          document.body.classList.remove("product-details-body");
        };
      }, []);
    return(
       
            <AboutUs variant="page" />
    )
}