"use client"

import PageSection from "@/app/components/page-section/page-section"
import Contact from "../contact/page"
import { Container } from "@/app/components/container/Container"
import CustomerFeedback from "@/app/components/customerFeedback/customerFeedback"
import { useEffect } from "react"
import PageTitle from "@/app/components/pageTitle/page-title"

export default function Appreciation() {
  useEffect(() => {
    document.body.classList.add("appreciation-page");

    return () => {
      document.body.classList.remove("appreciation-page");
    };
  }, []);
  return (
    <>
      <PageSection className="page-section-appreciation">
        <Container>
          <PageTitle


            title="Appreciation"
            subtitle="Words of gratitude from art lovers and patrons"
          />

        </Container>


      </PageSection>
    <PageSection className="page-section-appreciation-grid">
        <Container>
          <CustomerFeedback variant="grid" />
        </Container>
      </PageSection>
    </>
  )
}