"use client"

import { Container } from "@/app/components/container/Container";
import PageSection from "@/app/components/page-section/page-section";
import { Card } from "@/app/components/card/card";
import Typography from "@/app/components/typegrophy/typography";
import PageTitle from "@/app/components/pageTitle/page-title";
import "./contact.css";
import CustomerCare from "@/app/components/customercare/customerCare";
import socialNetworkData from "@/app/data/socialNetwork.json";
import SocialNetwork from "@/app/components/socialNetwork/socialNetwork";
import EnquiryForm, { EnquiryFormValues } from "@/app/components/enquiryForm/enquiryForm";
import { useEffect } from "react";
export default function About() {
    useEffect(() => {
        document.body.classList.add("product-details-body");

        return () => {
            document.body.classList.remove("product-details-body");
        };
    }, []);
    const handleEnquirySubmit = async (
        values: EnquiryFormValues,
    ) => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/SubmitEnquiry`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(values),
                },
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Failed to send enquiry");
            }

            alert("Your enquiry has been sent successfully!");
        } catch (error) {
            console.error(error);
            alert("Unable to send your enquiry. Please try again.");
        }
    };

    return (
        <>
           
                <Container>
                    <PageTitle wrapperClassName="textWhite m-0" title="Contact" />
                </Container>
            <PageSection className="page-section-bg-color-secondary">
              <Container>
                  <Card>
                    <div className="page-contact-top">
                        <div className="page-contact-top-container">
                            <Typography variant="h5" as={"h4"} className="page-contact-title">We would be plessed to assist you with any further information your require</Typography>
                            <CustomerCare variant="vertical" background="transparent" isShowCallUs={true} isShowHeading={true} isDivider={true} />
                            <div className="contact-social-network">
                                <Typography>Follow us to find latest update</Typography>
                                <SocialNetwork items={socialNetworkData.socialNetwork} />
                            </div>
                        </div>
                        <div className="enquiry-form-container">
                           <EnquiryForm
  initialValues={{
    name: "",
    phone_number: "",
    mail_id: "",
    description: "",
  }}
  onSuccess={() => {
    console.log("Bulk enquiry submitted successfully");
  }}
/>
                        </div>

                    </div>
                </Card>

              </Container>

            </PageSection>
        </>
    )
}