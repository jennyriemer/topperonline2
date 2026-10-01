import Link from "next/link";
import { PageHeader, Card, Button } from "@/components/ui";
import { LOCATIONS, USERS, MANUFACTURERS } from "@/lib/mock-data";

const COPY: Record<string, { title: string; body: string }> = {
  locations: { title: "Locations", body: "Colfax HQ and South / Centennial. Used by the schedule mock." },
  users: { title: "Users", body: "Staff roster stub. PIN login is unchanged." },
  password: { title: "Password", body: "PIN is still the shop gate. This page does not change production credentials." },
  pricing: { title: "Pricing", body: "Ballpark installed prices live in Sarah’s fitment KB and sample invoices." },
  manufacturers: { title: "Manufacturers", body: "A.R.E., ATC, Leer, Snugtop — the lines on sample jobs." },
  items: { title: "Items", body: "See Stock → Inventory for on-hand counts and reorder levels." },
  vehicles: { title: "Vehicles", body: "Fitment lives on client records (year/make/model/bed/color)." },
  "installation-packs": { title: "Installation Packs", body: "Labor lines on invoices are the catch-all for pack-style charges." },
};

export default async function MaintenancePage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  const meta = COPY[section] ?? { title: section, body: "Admin stub." };

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { label: "Suburban Toppers" },
          { label: "Maintenance" },
          { label: meta.title },
        ]}
        title={meta.title}
        actions={
          <Link href="/settings">
            <Button variant="outlined">Settings</Button>
          </Link>
        }
      />
      <div style={{ padding: "0 32px 40px 32px" }}>
        <Card padding={24} className="max-w-3xl">
          <p className="text-graphite" style={{ fontSize: 14, lineHeight: 1.5, marginBottom: 16 }}>
            {meta.body}
          </p>
          {section === "locations" && (
            <ul className="flex flex-col" style={{ gap: 8 }}>
              {LOCATIONS.map((l) => (
                <li key={l.id} className="rounded-md" style={{ padding: 12, background: "var(--color-fog)" }}>
                  <div style={{ fontWeight: 600 }}>{l.name}</div>
                  <div className="text-slate" style={{ fontSize: 13 }}>
                    {l.address}, {l.city} · {l.phone}
                  </div>
                </li>
              ))}
            </ul>
          )}
          {section === "users" && (
            <ul className="flex flex-col" style={{ gap: 8 }}>
              {USERS.map((u) => (
                <li key={u.id} className="flex justify-between" style={{ padding: "8px 0", borderBottom: "1px solid var(--color-chalk)" }}>
                  <span style={{ fontWeight: 500 }}>{u.name}</span>
                  <span className="text-slate" style={{ fontSize: 13 }}>
                    {u.role}
                  </span>
                </li>
              ))}
            </ul>
          )}
          {section === "manufacturers" && (
            <ul className="flex flex-col" style={{ gap: 8 }}>
              {MANUFACTURERS.map((m) => (
                <li key={m.id} style={{ padding: "8px 0", borderBottom: "1px solid var(--color-chalk)" }}>
                  <span style={{ fontWeight: 600 }}>{m.name}</span>
                  <span className="text-slate" style={{ fontSize: 13 }}>
                    {" "}
                    · {m.productLine}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
