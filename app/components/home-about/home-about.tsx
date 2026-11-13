"use client";

import Image from "next/image";
import Link from "next/link";
import Typography from "../typegrophy/typography";
import aboutData from "@/app/data/about-us.json";
import "./home-about.css";
import Button from "../button/button";
import { ArrowRight } from "react-feather";
import { Container } from "../container/Container";
import PageSection from "../page-section/page-section";

type AboutUsProps = {
  variant?: "home" | "page";
};

export default function AboutUs({
  variant = "home",
}: AboutUsProps) {
  const isHome = variant === "home";

  return (
    <>
     <Container>
        {!isHome && (
          <Typography
            variant="h3"
            as="h1"
            className="about-us-page-title m-0"
          >
            {aboutData.title}
          </Typography>
        )}
        </Container>

    <PageSection
      className={`about-us about-us--${variant} ${!isHome ? "page-section-bg-color-secondary" : "" }`}
      aria-labelledby="about-us-title"
    >
      <Container>
      <div className="about-us-container">

        <div className="about-us-intro">
          
          <div className="about-us-image">
             {
              !isHome && <div className="img-Scupture-text-poster"><img src={"/images/about/Scupture-text-poster.png"} alt="Scupture-text-poster" className="img-Scupture" /></div>
            }
            <Image
              src={aboutData.heroImage}
              alt="Traditional Indian temple-inspired sculptures"
              width={600}
              height={600}
              className="about-us-main-image"
            />
           
          </div>

          <div className="about-us-content">
            {isHome ? (
              <>
                <Typography
                  variant="h4"
                  as="h2"
                  className=" m-0"
                >
                  {aboutData.homeTitle}
                </Typography>
                <Typography>
                  {aboutData.intro}
                </Typography>
               <div >
  {aboutData.founders
    .filter((founder) => founder.name === "Swamimalai Saravanan")
    .map((founder) => (
     <div className="about-legacy-row" key={founder.name}>
     
      <div className="about-legacy-col" >
          <Typography
            variant="h4"
            as="h3"
            className="about-legacy-title"
          >
            Legacy Behind
          </Typography>

          <Typography className="about-legacy-description">
            {founder.description}
          </Typography>
        </div>

        <div className="about-legacy-col Scupture-image-div">
          <Image
            src="/images/about/Scupture-text-poster.png"
            alt={founder.name}
            width={300}
            height={300}
            className="about-legacy-image"
          />
        </div>

        </div>
    ))}
</div>
              </>
            ) : (
              <div>
                
               <img src={"/images/about/Vismayam-brand-icon.svg"} alt="" className="float-left"/>
                {aboutData.intro.map((paragraph, index) => (
                  <Typography key={index}>
                    {paragraph}
                  </Typography>
                ))}

                <Typography className="about-us-description">
                  {aboutData.description}
                </Typography>
              </div>
            )}

            {isHome && (
              <div>
                <Button
                  href="/about/"

                  variant="outline"
                  color="primary"
                  curve="full"
                >
                  Know More...
                  <ArrowRight />
                  
                </Button>
              </div>
            )}
          </div>
        </div>

        {!isHome && (
          <div className="about-us-founders">
            {aboutData.founders.map((founder) => (
              <article
                className="about-founder-card"
                key={founder.name}
              >
                <div className="about-founder-header">
                  <Image
                    src={founder.image}
                    alt={founder.name}
                    width={180}
                    height={180}
                    className="about-founder-image"
                  />

                  <div className="about-founder-info">
                    <Typography
                      variant="h5"
                      as="h2"
                      className="about-founder-name"
                    >
                      {founder.name}
                    </Typography>

                    <div className="about-founder-socials">
                      {
                        founder.socialLinks.linkedin &&
                         <Link
                        href={founder.socialLinks.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${founder.name} on LinkedIn`}
                      >
                        <img src={"/images/social-icons/icon-Linkedin.png"} />
                      </Link>

                      }
                      {
                        founder.socialLinks.instagram &&
                         <Link
                        href={founder.socialLinks.instagram}
                        target="_blank"
                      >
                        <img src={"/images/social-icons/icon-Instagram.png"} />
                      </Link>
                      }

                       {
                        founder.socialLinks.facebook &&
                         <Link
                        href={founder.socialLinks.facebook}
                        target="_blank"
                      >
                        <img src={"/images/social-icons/icon-Facebook.png"} />
                      </Link>
                      }

                       {
                        founder.socialLinks.youtube &&
                         <Link
                        href={founder.socialLinks.youtube}
                        target="_blank"
                      >
                        <img src={"/images/social-icons/icon-Youtube.png"} />
                      </Link>
                      }

                      {
                        founder.socialLinks.x &&
                         <Link
                        href={founder.socialLinks.x}
                        target="_blank"
                      >
                        <img src={"/images/social-icons/icon-X.png"} />
                      </Link>
                      }

                    </div>
                  </div>
                </div>

                <Typography className="about-founder-description">
                  {founder.description}
                </Typography>
              </article>
            ))}
          </div>
        )}

      </div>
      </Container>
    </PageSection>
    </>
  );
}