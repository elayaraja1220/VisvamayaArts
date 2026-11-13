"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import "./policy.css";
import policies from "@/app/data/policies.json";

import PageSection from "@/app/components/page-section/page-section";
import { Container } from "@/app/components/container/Container";
import { Card } from "@/app/components/card/card";
import Button from "@/app/components/button/button";
import Typography from "@/app/components/typegrophy/typography";

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

const policyList = policies as Policy[];

const EMAIL_PATTERN = /([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/g;

// Turns email addresses into mailto links.
function renderEmailLinks(text: string, keyPrefix: string) {
  return text.split(EMAIL_PATTERN).map((part, index) =>
    index % 2 === 1 ? (
      <a
        key={`${keyPrefix}-${index}`}
        href={`mailto:${part}`}
        className="policy-link"
      >
        {part}
      </a>
    ) : (
      part
    )
  );
}

// Renders "**text**" segments from policies.json as semibold (600)
// and email addresses as mailto links.
function renderRichText(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <span key={index} className="font-weight-semibold">
        {renderEmailLinks(part.slice(2, -2), `${index}`)}
      </span>
    ) : (
      renderEmailLinks(part, `${index}`)
    )
  );
}

function PolicyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const requestedPolicy = searchParams.get("type");

  const activePolicy = policyList.some(
    (policy) => policy.id === requestedPolicy
  )
    ? requestedPolicy!
    : "terms";

  useEffect(() => {
    document.body.classList.add("product-details-body");

    return () => {
      document.body.classList.remove("product-details-body");
    };
  }, []);

  const handlePolicyChange = (policyId: string) => {
    router.replace(
      `/policies?type=${encodeURIComponent(policyId)}`,
      {
        scroll: false,
      }
    );
  };

  const selectedPolicy = policyList.find(
    (policy) => policy.id === activePolicy
  );

  return (
    <PageSection className="page-section-policies">
      <Container>

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

        <Card className="m-0">
          <div className="policy-content">

            {selectedPolicy && (
              <>

                <Typography variant="h5">
                  {selectedPolicy.content.title}
                </Typography>

                {selectedPolicy.content.sections.map(
                  (section, index) => (
                    <section
                      className="policy-section"
                      key={`${selectedPolicy.id}-${index}`}
                    >

                      <Typography variant="small" className="font-weight-semibold ">
                        {section.title}
                      </Typography>

                      {section.paragraphs?.map(
                        (paragraph, paragraphIndex) => (
                          <Typography key={paragraphIndex}>
                            {renderRichText(paragraph)}
                          </Typography>
                        )
                      )}

                      {section.bullets &&
                        section.bullets.length > 0 && (
                          <ul>
                            {section.bullets.map(
                              (bullet, bulletIndex) => (
                                <li key={bulletIndex}>
                                  {renderRichText(bullet)}
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
        </Card>

      </Container>
    </PageSection>
  );
}

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
