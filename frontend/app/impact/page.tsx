"use client";

import { useEffect, useState } from "react";

import {
  ImpactSummary,
  getImpact,
} from "../../lib/impact";


export default function ImpactPage() {
  const [impact, setImpact] =
    useState<ImpactSummary | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  useEffect(() => {
    async function loadImpact() {
      const organizationId =
        localStorage.getItem(
          "organization_id",
        );

      if (!organizationId) {
        setError(
          "No organization has been selected.",
        );
        setLoading(false);
        return;
      }

      try {
        const result =
          await getImpact(
            organizationId,
          );

        setImpact(result);
      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to load impact data.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadImpact();
  }, []);


  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "32px 24px",
      }}
    >
      <section
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
        }}
      >
        <h1>
          Impact
        </h1>

        <p
          style={{
            color: "#64748b",
          }}
        >
          Measure the business impact of
          retention actions.
        </p>

        {loading && (
          <p>
            Loading impact data...
          </p>
        )}

        {error && (
          <p
            style={{
              color: "#dc2626",
            }}
          >
            {error}
          </p>
        )}

        {impact && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "16px",
              marginTop: "28px",
            }}
          >
            <ImpactCard
              label="Actions Measured"
              value={impact.total_actions}
            />

            <ImpactCard
              label="Customers Saved"
              value={impact.customers_saved}
            />

            <ImpactCard
              label="Revenue Saved"
              value={`$${impact.revenue_saved.toLocaleString()}`}
            />
          </div>
        )}
      </section>
    </main>
  );
}


function ImpactCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
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
      <p
        style={{
          margin: 0,
          color: "#64748b",
        }}
      >
        {label}
      </p>

      <h2
        style={{
          marginBottom: 0,
        }}
      >
        {value}
      </h2>
    </div>
  );
}
