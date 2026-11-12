"use client";

import { useRouter } from "next/navigation";
import Button from "../button/button";
import Typography from "../typegrophy/typography";
import "./backTitle.css";
import { ArrowLeft } from "react-feather";

type BackTitleProps = {
  title: string;
  /** Name of the currently selected tab, shown after the title as "Title | Tab" */
  tabName?: string;
  subtitle?: string;
  /** Custom back action. Defaults to router.back() */
  onBack?: () => void;
  /** The arrow icon points right by default; set false if your icon already points left */
  flipIcon?: boolean;
  titleVariant?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  className?: string;
  titleClassName?: string;
  subtitleClassName?: string;
};

export default function BackTitle({
  title,
  tabName,
  subtitle,
  onBack,
  flipIcon = true,
  titleVariant = "h3",
  className = "",
  titleClassName = "text-white font-weight-semibold ",
  subtitleClassName = "text-warning",
}: BackTitleProps) {
  const router = useRouter();

  return (
    <div className={["back-title", className].filter(Boolean).join(" ")}>
      <div className="back-title-action">
        <Button
          variant="circle"
          curve="none"
          color="primary"
          onClick={() => (onBack ? onBack() : router.back())}
        >
          <ArrowLeft />
        
        </Button>
      </div>

      <div className="text-white">
        <Typography variant={titleVariant} className={titleClassName}>
          {title}
          {tabName && (
            <>
              <span className="back-title-separator"> | </span>
              <span className="back-title-tab">{tabName}</span>
            </>
          )}

        </Typography>
        {subtitle && (
          <Typography className={subtitleClassName}>{subtitle}</Typography>
        )}
      </div>
    </div>
  );
}