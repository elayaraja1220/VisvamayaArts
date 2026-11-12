
import Button from "../button/button";
import Typography from "../typegrophy/typography";
import "./page-title.css";

type PageTitleProps = {
  title: string;
  label?: string;
  subtitle?: string;
  showAllHref?: string;
  wrapperClassName?: string;
};

export default function PageTitle({
  title,
  label,
  subtitle,
  showAllHref,
  wrapperClassName
}: PageTitleProps) {
  return (
    <div className={`page-title ${wrapperClassName}`}>
      <div className="page-title-group">
        {label && (
          <Typography variant="caption" className="page-title-label">
            {label}
          </Typography>
        )}
        {
            title &&
        
        <Typography variant="h2" className="page-title-main">{title}</Typography>
}
        {subtitle && (
          <Typography variant="small" className="page-title-subtitle">
            {subtitle}
          </Typography>
        )}
      </div>

      {showAllHref && (
        <Button href={showAllHref} curve="full" variant="outline" color="white" size="medium">
          Show All
        </Button>
      )}
    </div>
  );
}