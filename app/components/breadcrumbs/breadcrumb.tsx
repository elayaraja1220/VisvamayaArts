import Link from "next/link";
import "./breadcrumb.css";

export type BreadcrumbItem = {
  label: string;
  href?: string;
  onClick?: () => void;
};

type BreadcrumbProps = {
  items: BreadcrumbItem[];
  className?: string;
};

export default function Breadcrumb({ items, className = "" }: BreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={["breadcrumb", className].filter(Boolean).join(" ")}
    >
      <ol className="breadcrumb-list">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={`${item.label}-${index}`} className="breadcrumb-item">
              {isLast ? (
                <span aria-current="page" className="breadcrumb-current">
                  {item.label}
                </span>
              ) : item.href ? (
                <Link href={item.href} className="breadcrumb-link">
                  {item.label}
                </Link>
              ) : item.onClick ? (
                <button
                  type="button"
                  onClick={item.onClick}
                  className="breadcrumb-link"
                >
                  {item.label}
                </button>
              ) : (
                <span>{item.label}</span>
              )}

              {!isLast && (
                <span className="breadcrumb-separator" aria-hidden="true">
                  &gt;
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}