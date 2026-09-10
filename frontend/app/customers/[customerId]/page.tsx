"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import {
  Customer360,
  getCustomer360,
} from "../../../lib/customer-360";


export default function Customer360Page() {
  const params = useParams();

  const customerId =
    params.customerId as string;

  const [data, setData] =
    useState<Customer360 | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  useEffect(() => {
    async function loadCustomer() {
      try {
        const result =
          await getCustomer360(
            customerId,
          );

        setData(result);
      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to load customer.",
        );
      } finally {
        setLoading(false);
      }
    }

    if (customerId) {
      loadCustomer();
    }
  }, [customerId]);


  if (loading) {
    return (
      <main
        style={{
          padding: "40px 24px",
        }}
      >
        <p>
          Loading customer...
        </p>
      </main>
    );
  }


  if (error) {
    return (
      <main
        style={{
          padding: "40px 24px",
        }}
      >
        <p
          style={{
            color: "#dc2626",
          }}
        >
          {error}
        </p>
      </main>
    );
  }


  if (!data) {
    return null;
  }


  const probability =
    data.risk.churn_probability;


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
          {data.customer.name}
        </h1>

        <p
          style={{
            color: "#64748b",
          }}
        >
          {data.customer.email ||
            "No email available"}
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px",
            marginTop: "28px",
          }}
        >
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
              Risk level
            </p>

            <h2>
              {data.risk.risk_level}
            </h2>
          </div>

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
              Churn probability
            </p>

            <h2>
              {probability === null
                ? "—"
                : `${Math.round(
                    probability * 100,
                  )}%`}
            </h2>
          </div>

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
              Customer health
            </p>

            <h2>
              {data.health.status}
            </h2>
          </div>
        </div>

        <section
          style={{
            marginTop: "28px",
            padding: "24px",
            background: "white",
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
          }}
        >
          <h2>
            Timeline
          </h2>

          {data.timeline.length === 0 ? (
            <p
              style={{
                color: "#64748b",
              }}
            >
              No customer events recorded yet.
            </p>
          ) : (
            <div>
              {data.timeline.map(
                (event) => (
                  <div
                    key={event.id}
                    style={{
                      padding: "14px 0",
                      borderBottom:
                        "1px solid #f1f5f9",
                    }}
                  >
                    <strong>
                      {event.event_type}
                    </strong>

                    <p
                      style={{
                        margin: "6px 0",
                        color: "#475569",
                      }}
                    >
                      {event.description ||
                        "No description"}
                    </p>

                    <small
                      style={{
                        color: "#94a3b8",
                      }}
                    >
                      {new Date(
                        event.created_at,
                      ).toLocaleString()}
                    </small>
                  </div>
                ),
              )}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
