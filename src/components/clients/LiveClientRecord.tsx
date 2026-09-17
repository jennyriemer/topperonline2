"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader, Button, Card, StatusBadge } from "@/components/ui";
import { formatCurrency, formatPhone } from "@/lib/utils";
import type { ClientDetail } from "@/lib/data/clients";
import { statusToVariant } from "@/lib/mock-data";

export function LiveClientRecord({ id }: { id: string }) {
  const [detail, setDetail] = useState<ClientDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/clients/${id}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("not found"))))
      .then(setDetail)
      .catch(() => setError("This id isn’t in the sample set, and live client lookup didn’t return a row."));
  }, [id]);

  if (error) {
    return (
      <div>
        <PageHeader breadcrumbs={[{ label: "Clients", href: "/clients" }, { label: id }]} title="Client" />
        <div style={{ padding: "0 32px 40px" }}>
          <Card>
            <p className="text-graphite">{error}</p>
            <Link href="/clients">
              <Button variant="outlined" size="sm">
                Back to clients
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  if (!detail) {
    return (
      <div>
        <PageHeader breadcrumbs={[{ label: "Clients", href: "/clients" }]} title="Loading…" />
      </div>
    );
  }

  const { client, invoices } = detail;
  const name = (client.companyName ?? `${client.firstName} ${client.lastName}`.trim()) || "Client";

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Suburban Toppers" }, { label: "Clients", href: "/clients" }, { label: name }]}
        title={name}
        subtitle="Live record from the production store (read-only). Sample jobs/invoices are on demo clients."
        actions={
          <Link href="/clients">
            <Button variant="outlined">All clients</Button>
          </Link>
        }
      />
      <div style={{ padding: "0 32px 40px" }}>
        <Card padding={22}>
          <p className="text-carbon" style={{ fontSize: 14 }}>
            {client.phone ? formatPhone(client.phone) : "No phone"} · {client.email || "No email"}
          </p>
          <p className="text-slate" style={{ fontSize: 13, marginTop: 6 }}>
            {[client.address, client.city, client.state, client.zip].filter(Boolean).join(", ")}
          </p>
        </Card>
        <div style={{ height: 16 }} />
        <Card padding={0}>
          <div style={{ padding: "16px 22px", fontFamily: "var(--font-display)", fontWeight: 600 }}>Invoices</div>
          <ul>
            {invoices.map((inv) => (
              <li
                key={inv.id}
                className="flex items-center justify-between"
                style={{ padding: "12px 22px", borderTop: "1px solid var(--color-chalk)" }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{inv.number}</div>
                  <div className="text-slate" style={{ fontSize: 12 }}>
                    {inv.date ?? "No date"}
                  </div>
                </div>
                <div className="flex items-center" style={{ gap: 8 }}>
                  <span style={{ fontWeight: 600 }}>{formatCurrency(inv.total ?? 0)}</span>
                  <StatusBadge variant={statusToVariant(inv.statusVariant)}>{inv.statusLabel}</StatusBadge>
                </div>
              </li>
            ))}
            {invoices.length === 0 && (
              <li className="text-slate" style={{ padding: 24, fontSize: 13 }}>
                No invoices on this live record.
              </li>
            )}
          </ul>
        </Card>
      </div>
    </div>
  );
}
