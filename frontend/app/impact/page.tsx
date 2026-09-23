"use client";

import { useEffect, useState } from "react";

import {
  getImpact,
  type ImpactMetrics,
} from "@/lib/impact";


function MetricCard({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string;
  subtitle?: string;
}) {
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "12px",
        padding: "20px",
      }}
    >
      <div
        style={{
          fontSize: "13px",
          color: "#64748b",
          marginBottom: "8px",
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: "28px",
          fontWeight: 700,
          color: "#0f172a",
        }}
      >
        {value}
      </div>

      {subtitle && (
        <div
          style={{
            marginTop: "6px",
            fontSize: "13px",
            color: "#64748b",
          }}
        >
          {subtitle}
        </div>
      )}
    </div>
  );
}


export default function ImpactPage() {
  const [organizationId, setOrganizationId] =
    useState("");

  const [impact, setImpact] =
    useState<ImpactMetrics | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);


  useEffect(() => {
    if (
      typeof window ===
      "undefined"
    ) {
      return;
    }

    const storedOrganizationId =
      window.localStorage.getItem(
        "organization_id",
      );

    if (!storedOrganizationId) {
      setError(
        "Organization is not selected.",
      );
      setLoading(false);
      return;
    }

    setOrganizationId(
      storedOrganizationId,
    );
  }, []);


  useEffect(() => {
    if (!organizationId) {
      return;
    }

    async function loadImpact() {
      try {
        setLoading(true);
        setError(null);

        const data =
          await getImpact(
            organizationId,
          );

        setImpact(data);
      } catch (impactError) {
        setError(
          impactError instanceof Error
            ? impactError.message
            : "Unable to load impact metrics.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadImpact();
  }, [organizationId]);


  if (loading) {
    return (
      <main
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "32px 20px",
        }}
      >
        Loading impact...
      </main>
    );
  }


  if (error) {
    return (
      <main
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "32px 20px",
        }}
      >
        <div
          style={{
            padding: "16px",
            background: "#fef2f2",
            border:
              "1px solid #fecaca",
            borderRadius: "10px",
            color: "#991b1b",
          }}
        >
          {error}
        </div>
      </main>
    );
  }


  if (!impact) {
    return (
      <main
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "32px 20px",
        }}
      >
        No impact data available.
      </main>
    );
  }


  return (
    <main
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "32px 20px 60px",
      }}
    >
      <div
        style={{
          marginBottom: "28px",
        }}
      >
        <div
          style={{
            fontSize: "13px",
            color: "#64748b",
            marginBottom: "6px",
          }}
        >
          Retention Analytics
        </div>

        <h1
          style={{
            margin: 0,
            fontSize: "32px",
            color: "#0f172a",
          }}
        >
          Impact
        </h1>

        <p
          style={{
            marginTop: "8px",
            color: "#64748b",
            lineHeight: 1.5,
          }}
        >
          Measure the business impact of
          retention actions.
        </p>
      </div>


      <section
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "14px",
          marginBottom: "28px",
        }}
      >
        <MetricCard
          title="Actions Executed"
          value={String(
            impact.total_actions,
          )}
        />

        <MetricCard
          title="Customers Saved"
          value={String(
            impact.customers_saved,
          )}
        />

        <MetricCard
          title="Revenue Saved"
          value={`₹${impact.revenue_saved.toLocaleString(
            "en-IN",
          )}`}
        />

        <MetricCard
          title="Save Rate"
          value={`${(
            impact.save_rate * 100
          ).toFixed(1)}%`}
        />
      </section>


      <section
        style={{
          background: "#ffffff",
          border:
            "1px solid #e2e8f0",
          borderRadius: "12px",
          padding: "22px",
        }}
      >
        <h2
          style={{
            margin:
              "0 0 18px",
            fontSize: "20px",
          }}
        >
          Outcome Breakdown
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "14px",
          }}
        >
          <MetricCard
            title="Saved"
            value={String(
              impact.customers_saved,
            )}
          />

          <MetricCard
            title="Not Saved"
            value={String(
              impact.customers_not_saved,
            )}
          />

          <MetricCard
            title="No Response"
            value={String(
              impact.no_response,
            )}
          />

          <MetricCard
            title="Unknown"
            value={String(
              impact.unknown,
            )}
          />
        </div>
      </section>
    </main>
  );
}
