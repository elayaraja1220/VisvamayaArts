"use client";

import Image from "next/image";
import Link from "next/link";
import "./customerCare.css";

type CustomerCareProps = {
    variant?: "horizontal" | "vertical";
    size?: "small" | "medium" | "large";
    background?: "filled" | "transparent";
    isShowHeading?: Boolean;
    isShow?: Boolean;
    isShowWhatsApp?: Boolean;
    isShowCallUs?: Boolean;
    isDivider?: Boolean
};

export default function CustomerCare({
    variant = "horizontal",
    size = "medium",
    background = "filled",
    isShowHeading = false,
    isShow = false,
    isShowWhatsApp = false,
    isShowCallUs = false,
    isDivider = false

}: CustomerCareProps) {
    const className = [
        "customer-care",
        `customer-care--${variant}`,
        `customer-care--${size}`,
        `customer-care--${background}`,
    ].join(" ");

    return (
        <div className={className}>

            <div className={`customer-care-details ${isDivider? 'customer-care-divider' : ''}`}>
                {isShowHeading &&
                    <div>Call us</div>
                }
                <div className="customer-care-icons">
                    <span className="customer-care-icon customer-care-icon--phone">
                        <a href="tel:+919980992830" >
                        <Image
                            alt=""
                            className="customer-care-icon-image"
                            src="/images/icons/svg/svg-phone.svg"
                            width={20}
                            height={20}
                        />
                        </a>
                    </span>
                    {
                        isShowWhatsApp &&

                    <span className="customer-care-icon customer-care-icon--whatsapp">
                       <Link href="https://wa.me/9980992830?text=Checking I am interested in buying your product. Please contact me. Thank you" target="_blank">
                        <Image
                            alt=""
                            className="customer-care-icon-image"
                            src="/images/icons/svg/svg-whatsapp.svg"
                            width={26}
                            height={26}
                        />
                       </Link>
                    </span>
}
                </div>

                <a href="tel:+919980992830" className="customer-care-text">
                    +91 99809 92830
                </a>
            </div>
            {isShowCallUs &&

                <div className={`customer-care-details ${isDivider? 'customer-care-divider' : ''}`}>
                    {isShowHeading &&
                        <div>Chat us</div>
                    }
                    <div className="customer-care-icons">

                        <span className="customer-care-icon customer-care-icon--whatsapp">
                            <Link href="https://wa.me/9980992830?text=Checking I am interested in buying your product. Please contact me. Thank you" target="_blank">
                            <Image
                                alt=""
                                className="customer-care-icon-image"
                                src="/images/icons/svg/svg-whatsapp.svg"
                                width={26}
                                height={26}
                            />
                            </Link>
                        </span>
                    </div>

                    <a href="tel:+919980992830" className="customer-care-text">
                        +91 99809 92830
                    </a>
                </div>
            }
            <div className={`customer-care-details ${isDivider? 'customer-care-divider' : ''}`}>
                {isShowHeading &&
                    <div>Mail us</div>
                }
                <Link
                    className="customer-care-semail-link"
                    href="mailto:vismayamarts@gmail.com"
                >
                    <div className="customer-care-icons">
                        <span className="customer-care-icon customer-care-icon--email">
                            <Image
                                alt=""
                                className="customer-care-icon-image"
                                src="/images/icons/svg/svg-envelope.svg"
                                width={25}
                                height={25}
                            />
                        </span>
                    </div>

                    <span className="customer-care-text">
                        vismayamarts@gmail.com
                    </span>
                </Link>

            </div>

        </div>
    );
}