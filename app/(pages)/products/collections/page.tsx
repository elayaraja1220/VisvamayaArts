import { Suspense } from "react";

import PageSection from "@/app/components/page-section/page-section";
import { Container } from "@/app/components/container/Container";
import Loading from "@/app/components/loading/loading";
import CollectionsContent from "@/app/components/productCollection/productCollection";

function CollectionsLoading() {
  return (
    <PageSection className="text-white">
      <Container>
        <Loading type="section" message="Loading collections..." />
      </Container>
    </PageSection>
  );
}

export default function CollectionsPage() {
  return (
    <Suspense fallback={<CollectionsLoading />}>
      <CollectionsContent fallback={<CollectionsLoading />} />
    </Suspense>
  );
}
