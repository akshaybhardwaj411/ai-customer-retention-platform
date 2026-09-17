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
          />

          <DashboardCard
            title="Risk Center"
            description="Monitor customer churn risk."
          />

          <DashboardCard
            title="Customers"
            description="Explore Customer 360 profiles."
          />

          <DashboardCard
            title="Impact"
            description="Measure revenue saved through retention."
          />
        </div>
      </section>
    </main>
  );
}


function DashboardCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div
      style={{
        padding: "24px",
        background: "white",
        border: "1px solid #e2e8f0",
        borderRadius: "12px",
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
    </div>
  );
}
