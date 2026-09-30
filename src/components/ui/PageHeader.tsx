import type { ReactNode } from "react";
import Link from "next/link";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  breadcrumbs?: BreadcrumbItem[];
  title: string;
  actions?: ReactNode;
  subtitle?: ReactNode;
}

export function PageHeader({ breadcrumbs, title, actions, subtitle }: PageHeaderProps) {
  return (
    <header
      className="flex items-center justify-between bg-white"
      style={{
        minHeight: "48px",
        padding: "12px 24px",
        borderBottom: "1px solid var(--color-gray-150)",
        gap: "16px",
      }}
    >
      <div className="min-w-0">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="text-gray-600" style={{ fontSize: "12px", marginBottom: 2 }}>
            {breadcrumbs.map((b, i) => {
              const isLast = i === breadcrumbs.length - 1;
              return (
                <span key={i}>
                  {i > 0 && <span style={{ margin: "0 6px", color: "var(--color-gray-400)" }}>›</span>}
                  {b.href && !isLast ? (
                    <Link href={b.href} className="hover:text-ink">
                      {b.label}
                    </Link>
                  ) : (
                    <span style={{ color: isLast ? "var(--color-gray-700)" : undefined }}>{b.label}</span>
                  )}
                </span>
              );
            })}
          </nav>
        )}
        <h1 className="font-display text-ink truncate" style={{ fontSize: "24px", lineHeight: "30px" }}>
          {title}
        </h1>
        {subtitle && (
          <div className="text-gray-600" style={{ fontSize: "13px", lineHeight: 1.4, marginTop: 4 }}>
            {subtitle}
          </div>
        )}
      </div>
        <div className="flex items-center shrink-0" style={{ gap: 8 }}>
          <span
            className="hidden sm:inline-flex items-center rounded-md"
            style={{
              height: 22,
              padding: "0 8px",
              fontSize: 12,
              fontWeight: 500,
              background: "var(--color-yellow-100)",
              color: "var(--color-yellow-700)",
            }}
          >
            Demo data
          </span>
          {actions}
        </div>
    </header>
  );
}
