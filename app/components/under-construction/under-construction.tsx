
import Image from "next/image";
import "./under-construction.css";

export type PolicyUnderConstructionProps = {
  title?: string;
  description?: string;
  natarajaImage: string;
  ganapathiImage: string;
};

const policyPages = [
  "Terms & Conditions",
  "Privacy Policy",
  "Return & Refund Policy",
  "Shipping Policy",
  "Cancellation Policy",
];

export default function PolicyUnderConstruction({
  title = "Policy Information",
  description = "We're currently working on this page to bring you clear and detailed information soon. Thank you for your patience and understanding.",
  natarajaImage,
  ganapathiImage,
}: PolicyUnderConstructionProps) {
  return (
    <section className="policy-construction">

      <div className="policy-construction__overlay" />

      <div className="policy-construction__container">

        {/* Decorative Divider */}
        <div className="policy-construction__divider">
          <span />
          <span className="policy-construction__lotus">
            ❀
          </span>
          <span />
        </div>

      

        {/* Main Content */}
        <div className="policy-construction__content">

          <span className="policy-construction__eyebrow">
            VISMAYAM ARTS · POLICY INFORMATION
          </span>

          <h1>
            This Page is
            <span>Under Construction</span>
          </h1>

          <p className="policy-construction__description">
            {description}
          </p>

          {/* Policy Pages */}
          <div className="policy-construction__pages">

            <p className="policy-construction__pages-heading">
              INFORMATION PAGES BEING UPDATED
            </p>

            
          

          </div>

          {/* Bottom Message */}
          <div className="policy-construction__message">
            <span className="policy-construction__clock">
              ◷
            </span>

            Please Check Back Soon!
          </div>

        </div>

        {/* Product Showcase */}
        <div className="policy-construction__products">

          <div className="policy-construction__product policy-construction__product--nataraja">
            <Image
              src={natarajaImage}
              alt="Traditional Nataraja sculpture"
              fill
              priority
              sizes="(max-width: 650px) 55vw, 35vw"
              className="policy-construction__product-image"
            />
          </div>

          <div className="policy-construction__product policy-construction__product--ganapathi">
            <Image
              src={ganapathiImage}
              alt="Traditional Ganapathi sculpture"
              fill
              priority
              sizes="(max-width: 650px) 35vw, 20vw"
              className="policy-construction__product-image"
            />
          </div>

          

        </div>

      </div>

    </section>
  );
}
