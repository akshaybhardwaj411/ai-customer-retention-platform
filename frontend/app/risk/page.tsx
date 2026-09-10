"use client";

import { useEffect, useState } from "react";

import {
  RiskSummary,
  getRiskSummary,
} from "../../lib/risk";


export default function RiskPage() {
  const [summary, setSummary] =
    useState<RiskSummary | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  useEffect(() => {
    async function loadRiskSummary() {
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
          await getRiskSummary(
            organizationId,
          );

        setSummary(result);
      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to load risk data.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadRiskSummary();
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
          Risk Center
        </h1>

        <p
          style={{
            color: "#64748b",
          }}
        >
          Monitor customer churn risk across
          your organization.
        </p>

        {loading && (
          <p>
            Loading risk data...
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

        {summary && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "16px",
              marginTop: "28px",
            }}
          >
            <RiskCard
              label="Critical"
              value={summary.critical}
            />

            <RiskCard
              label="High"
              value={summary.high}
            />

            <RiskCard
              label="Medium"
              value={summary.medium}
            />

            <RiskCard
              label="Low"
              value={summary.low}
            />

            <RiskCard
              label="Predicted Customers"
              value={
                summary.total_customers_with_predictions
              }
            />
          </div>
        )}
      </section>
    </main>
  );
}


function RiskCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div
      style={{
        padding: "20px",
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
