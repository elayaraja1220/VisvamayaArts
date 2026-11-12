
"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import "./policy.css";
import policies from "@/app/data/policies.json";

import PageSection from "@/app/components/page-section/page-section";
import { Container } from "@/app/components/container/Container";
import { Card } from "@/app/components/card/card";
import Button from "@/app/components/button/button";
import Typography from "@/app/components/typegrophy/typography";
import PolicyUnderConstruction from "@/app/components/under-construction/under-construction";

// ---------------------------------------------
// Types
// ---------------------------------------------

interface PolicySection {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
}

interface Policy {
  id: string;
  label: string;
  content: {
    title: string;
    sections: PolicySection[];
  };
}

// Type-safe policies data
const policyList = policies as Policy[];

// ---------------------------------------------
// Policy Content Component
// ---------------------------------------------

function PolicyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // -----------------------------------------
  // Get Policy from URL
  // -----------------------------------------

  const requestedPolicy = searchParams.get("type");

  const activePolicy = policyList.some(
    (policy) => policy.id === requestedPolicy
  )
    ? requestedPolicy!
    : "terms";

  // -----------------------------------------
  // Body Class
  // -----------------------------------------

  useEffect(() => {
    document.body.classList.add("product-details-body");

    return () => {
      document.body.classList.remove("product-details-body");
    };
  }, []);

  // -----------------------------------------
  // Change Policy
  // -----------------------------------------

  const handlePolicyChange = (policyId: string) => {
    router.replace(
      `/policies?type=${encodeURIComponent(policyId)}`,
      {
        scroll: false,
      }
    );
  };

  // -----------------------------------------
  // Selected Policy
  // -----------------------------------------

  const selectedPolicy = policyList.find(
    (policy) => policy.id === activePolicy
  );

  // -----------------------------------------
  // Render
  // -----------------------------------------


  const [hideNow, setHideNow] = useState(false)
  return (
    <PageSection className="page-section-policies">
      <Container>

        {/* Policy Navigation */}

        <nav
          className="policy-navigation"
          aria-label="Policy navigation"
        >
          {policyList.map((policy) => {
            const isActive = activePolicy === policy.id;

            return (
              <Button
                key={policy.id}
                variant="transparent"
                color="white"
                size="small"
                type="button"
                className={isActive ? "active" : ""}
                aria-current={isActive ? "page" : undefined}
                onClick={() => handlePolicyChange(policy.id)}
              >
                {policy.label}
              </Button>
            );
          })}
        </nav>

        {/* Policy Content */}

        <Card className="m-0">
        <PolicyUnderConstruction 
        natarajaImage="/images/png/nataraja.png"
         ganapathiImage="/images/png/ganapathi.png"
 />
          {
            hideNow &&
          
          <div className="policy-content hide-now">

            {selectedPolicy && (
              <>
                {/* Policy Title */}

                <Typography variant="h5">
                  {selectedPolicy.content.title}
                </Typography>

                {/* Policy Sections */}

                {selectedPolicy.content.sections.map(
                  (section, index) => (
                    <section
                      className="policy-section"
                      key={`${selectedPolicy.id}-${index}`}
                    >

                      {/* Section Title */}

                      <Typography variant="h6">
                        {section.title}
                      </Typography>

                      {/* Paragraphs */}

                      {section.paragraphs?.map(
                        (paragraph, paragraphIndex) => (
                          <Typography key={paragraphIndex}>
                            {paragraph}
                          </Typography>
                        )
                      )}

                      {/* Bullet Points */}

                      {section.bullets &&
                        section.bullets.length > 0 && (
                          <ul>
                            {section.bullets.map(
                              (bullet, bulletIndex) => (
                                <li key={bulletIndex}>
                                  {bullet}
                                </li>
                              )
                            )}
                          </ul>
                        )}

                    </section>
                  )
                )}
              </>
            )}

          </div>
          }
        </Card>

      </Container>
    </PageSection>
  );
}

// ---------------------------------------------
// Policy Page
// ---------------------------------------------

export default function PolicyPage() {
  return (
    <Suspense
      fallback={
        <div className="policy-loading">
          Loading policy...
        </div>
      }
    >
      <PolicyContent />
    </Suspense>
  );
}
