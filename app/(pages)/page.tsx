import PageSection from "../components/page-section/page-section";
import { Container } from "../components/container/Container";
import PageTitle from "../components/pageTitle/page-title";
import HeroCarousel from "../components/banner/HeroCarousel";
import CustomerFeedback from "../components/customerFeedback/customerFeedback";
import AboutUs from "../components/home-about/home-about";
import HomeProductSections from "./home/homeProductSections";

export default function Home() {
  return (
    <>
      <PageSection className="page-section-home-carousel">
        <HeroCarousel />
      </PageSection>

      {/* API data loads in the browser */}
      <HomeProductSections />

      {/* Appreciation */}
      <PageSection className="page-section-our-customers">
        <Container>
          <PageTitle
            showAllHref="/appreciation"
            label="Our customers"
            title="Appreciation"
            subtitle="Words of gratitude from art lovers and patrons"
          />

          <CustomerFeedback limit={5} />
        </Container>
      </PageSection>

      {/* About */}
      <PageSection className="page-section-about-us">
        <Container>
          <AboutUs variant="home" />
        </Container>
      </PageSection>
    </>
  );
}