"use client";

import Image from "next/image";
import Link from "next/link";
import "./socialNetwork.css";

export type SocialNetworkItem = {
    name: string;
    url: string;
    icon: string;
    width?: number;
    height?: number;
    className?: string;
};

type SocialNetworkProps = {
    items: SocialNetworkItem[];
    className?: string;
    iconClassName?: string;
    target?: "_blank" | "_self";
};

export default function SocialNetwork({
    items,
    className = "",
    iconClassName = "",
    target = "_blank",
}: SocialNetworkProps) {
    return (
        <div className={`social-network ${className}`}>
            {items.map((item) => (
                <Link
                    key={item.name}
                    href={item.url}
                    target={target}
                    rel={target === "_blank" ? "noopener noreferrer" : undefined}
                    aria-label={item.name}
                    title={item.name}
                    className={`social-network-icon social-network-icon-circle ${iconClassName} ${item.className ?? ""}`}
                >
                    <Image
                        alt={item.name}
                        className="social-network-image"
                        src={item.icon}
                        width={item.width ?? 25}
                        height={item.height ?? 25}
                    />
                </Link>
            ))}
        </div>
    );
}
