"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import feather from "feather-icons";

import "./action-icons-list.css";
import Button from "../button/button";

type Props = {
    audio?: string | null;
    product_360_image_hidden?: string | null;
    youtube?: string | null;
    facebook?: string | null;
    instagram?: string | null;
    title?: string;
};

type ActionItem = {
    name: string;
    label: string;
    icon: string;
    disabled: boolean;
    onClick: () => void | Promise<void>;
};

const getIcon = (name: string) =>
    feather.icons[name as keyof typeof feather.icons]?.toSvg({
        width: 20,
        height: 20,
        "stroke-width": 1.8,
    }) ?? "";

export default function ActionListIcons({
    audio,
    product_360_image_hidden,
    youtube,
    facebook,
    instagram,
    title,
}: Props) {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [playing, setPlaying] = useState(false);

    const hasValue = (value?: string | null) =>
        Boolean(value?.trim());

    const toggleAudio = async () => {
        if (!hasValue(audio)) return;

        if (!audioRef.current) {
            audioRef.current = new Audio(audio!);
            audioRef.current.onended = () => setPlaying(false);
        }

        const player = audioRef.current;

        if (playing) {
            player.pause();
            setPlaying(false);
        } else {
            try {
                await player.play();
                setPlaying(true);
            } catch (error) {
                console.error("Unable to play audio:", error);
            }
        }
    };

    const share = async () => {
        const url = window.location.href;

        try {
            if (navigator.share) {
                await navigator.share({ title, url });
            } else {
                await navigator.clipboard.writeText(url);
            }
        } catch (error) {
            if (error instanceof Error && error.name !== "AbortError") {
                console.error("Unable to share:", error);
            }
        }
    };

    const open = (url?: string | null) => {
        if (!hasValue(url)) return;

        window.open(url!, "_blank", "noopener,noreferrer");
    };

    const items: ActionItem[] = [
        {
            name: "audio",
            label: playing ? "Pause audio" : "Play audio",
            icon: "headphones",
            disabled: !hasValue(audio),
            onClick: toggleAudio,
        },
        {
            name: "360-view",
            label: "View product in 360 degrees",
            icon: "svg-icon-360",
            disabled: !hasValue(product_360_image_hidden),
            onClick: () => open(product_360_image_hidden),
        },
        {
            name: "share",
            label: "Share",
            icon: "share-2",
            disabled: false,
            onClick: share,
        },
        {
            name: "youtube",
            label: "YouTube",
            icon: "youtube",
            disabled: !hasValue(youtube),
            onClick: () => open(youtube),
        },
        {
            name: "facebook",
            label: "Facebook",
            icon: "facebook",
            disabled: !hasValue(facebook),
            onClick: () => open(facebook),
        },
        {
            name: "instagram",
            label: "Instagram",
            icon: "instagram",
            disabled: !hasValue(instagram),
            onClick: () => open(instagram),
        },
    ];

    return (
        <ul className="product-title-actions">
            {items.map((item) => (
                <li key={item.name}>
                    <Button
                        color="black"
                        variant="circle"
                        aria-label={item.label}
                        disabled={item.disabled}
                        onClick={item.onClick}
                    >
                        {item.name === "360-view" ? (
                            <Image
                                src="/images/icons/svg/svg-icon-360.svg"
                                alt=""
                                width={20}
                                height={20}
                                className="product-title-action-icon"
                                aria-hidden="true"
                            />
                        ) : (
                            <span
                                className="product-title-action-icon"
                                aria-hidden="true"
                                dangerouslySetInnerHTML={{
                                    __html: getIcon(item.icon),
                                }}
                            />
                        )}
                    </Button>
                </li>
            ))}
        </ul>
    );
}