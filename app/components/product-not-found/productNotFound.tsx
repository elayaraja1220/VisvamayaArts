
"use client";

import Link from "next/link";
import { Package, ArrowLeft, ArrowRight } from "react-feather";

import Typography from "@/app/components/typegrophy/typography";
import { Container } from "@/app/components/container/Container";
import PageSection from "@/app/components/page-section/page-section";

import "./product-not-found.css";

type ProductNotFoundProps = {
  title?: string;
  description?: string;
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
};

export default function ProductNotFound({
  title = "Product Not Found",
  description = "Oops! This masterpiece is currently unavailable. The product may have been removed or the link might be incorrect.",
  primaryLabel = "Explore Collections",
  primaryHref = "/collections",
  secondaryLabel = "Back to Home",
  secondaryHref = "/",
}: ProductNotFoundProps) {
  return (
    <PageSection className="product-not-found-section">
      <Container>
        <div className="product-not-found">

          <div className="product-not-found-icon">
            <Package
              size={54}
              strokeWidth={1.3}
            />
          </div>

          <Typography variant="h2" as="h2">
            {title}
          </Typography>

          <Typography variant="small">
            {description}
          </Typography>

          <div className="product-not-found-actions">

            <Link
              href={primaryHref}
              className="product-not-found-primary"
            >
              {primaryLabel}
              <ArrowRight size={18} />
            </Link>

            <Link
              href={secondaryHref}
              className="product-not-found-secondary"
            >
              <ArrowLeft size={16} />
              {secondaryLabel}
            </Link>

          </div>
        </div>
      </Container>
    </PageSection>
  );
}
