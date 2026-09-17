import Link from "next/link";

import PlatformStatus from "../components/PlatformStatus";


export default function DashboardPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "32px 24px",
      }}
    >
      <section
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        <h1>
          Retention Dashboard
        </h1>

        <p
          style={{
            color: "#64748b",
          }}
        >
          Monitor customer retention performance
          and platform health.
        </p>

        <PlatformStatus />

        <nav
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
            marginTop: "28px",
          }}
        >
          <NavLink
            href="/action-center"
            label="Action Center"
          />

          <NavLink
            href="/customers"
            label="Customers"
          />

          <NavLink
            href="/risk"
            label="Risk Center"
          />

          <NavLink
            href="/ai-actions"
            label="AI Actions"
          />

          <NavLink
            href="/campaigns"
            label="Campaigns"
          />

          <NavLink
            href="/impact"
            label="Impact"
          />

          <NavLink
            href="/integrations"
            label="Integrations"
          />

          <NavLink
            href="/settings"
            label="Settings"
          />
        </nav>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px",
            marginTop: "28px",
          }}
        >
          <DashboardCard
            title="Action Center"
            description="Review prioritized retention actions."
            href="/action-center"
          />

          <DashboardCard
            title="Risk Center"
            description="Monitor customer churn risk."
            href="/risk"
          />

          <DashboardCard
            title="Customers"
            description="Explore Customer 360 profiles."
            href="/customers"
          />

          <DashboardCard
            title="Impact"
            description="Measure revenue saved through retention."
            href="/impact"
          />
        </div>
      </section>
    </main>
  );
}


function NavLink({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      style={{
        padding: "10px 14px",
        background: "white",
        border: "1px solid #e2e8f0",
        borderRadius: "8px",
        color: "#0f172a",
        textDecoration: "none",
        fontWeight: 600,
      }}
    >
      {label}
    </Link>
  );
}


function DashboardCard({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      style={{
        padding: "24px",
        background: "white",
        border: "1px solid #e2e8f0",
        borderRadius: "12px",
        textDecoration: "none",
        color: "#0f172a",
      }}
    >
      <h2>
        {title}
      </h2>

      <p
        style={{
          color: "#64748b",
          lineHeight: 1.5,
        }}
      >
        {description}
      </p>
    </Link>
  );
}
