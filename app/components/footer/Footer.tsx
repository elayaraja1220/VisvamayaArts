"use client"
import Link from "next/link";
import Button from "../button/button";
import { Container } from "../container/Container";
import Typography from "../typegrophy/typography";
import "./footer.css";
import Image from "next/image";
import Menu from "../../data/header-nav.json"
import policies from "@/app/data/policies.json";
import { useEffect, useState } from "react";
import CustomerCare from "../customercare/customerCare";
import SocialNetwork from "../socialNetwork/socialNetwork";
import socialNetworkData from "@/app/data/socialNetwork.json";
export default function Footer() {
    const [year, setYear] = useState<number>(2026);

    useEffect(() => {
        setYear(new Date().getFullYear());
    }, []);

    return (
        <footer className="footer">

            <div className="footer-top">
                <Container>
                    <div className="footer-top-row">
                        <div className="footer-top-left">
                            <Typography variant="h1" >Reach us</Typography>
                        </div>
                        <div className="footer-top-center">
                            <CustomerCare isShowWhatsApp={true} />
                        </div>
                        <div className="footer-top-right">
                            <SocialNetwork
                                items={socialNetworkData.socialNetwork}
                                className="footer-social-network"
                                iconClassName="footer-icon-circle"
                            />

                        </div>
                    </div>

                </Container>
            </div>
            <div className="footer-bottom">
                <Container>
                    <div className="footer-bottom-row">
                        <div className="footer-bottom-col-left">
                            <div><Image src={"/images/footer/vimaya-logo.svg"} alt="" width={100} height={100} /></div><Typography>We bring authentic sculptures into your home.
                                Our mission is to celebrate and illuminate India's heritage, offering you a tangible piece
                                of this legacy.</Typography>
                            <div></div>
                        </div>
                        <div className="footer-bottom-col-right">
                            <div className="footer-menu-left">
                                <ul className="footer-menu-list">
                                    {
                                        Menu.headerNav.map((item, i) => (
                                            <li className="footer-menu-list-item" key={i}><Link className="footer-menu-item-link" href={item.link} >{item.label}</Link></li>
                                        ))
                                    }

                                </ul>
                            </div>
                            <div className="footer-menu-right">
                                <ul className="footer-menu-list">

                                    {policies.map((policy) => (
                                        <li key={policy.id} className="footer-menu-list-item">
                                            <Link
                                                href={`/policies?type=${encodeURIComponent(policy.id)}`}
                                                className="footer-menu-item-link"
                                            >
                                                {policy.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </Container>
                <div className="footer-copyright">
                    <Container>
                        <Typography>Copyright  &copy; Vismayam {year}</Typography>
                    </Container>
                </div>
            </div>

        </footer>
    )
}