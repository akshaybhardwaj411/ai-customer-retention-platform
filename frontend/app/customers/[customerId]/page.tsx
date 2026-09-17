"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import {
  Customer360,
  getCustomer360,
} from "../../../lib/customer-360";

import {
  CustomerInsight,
  getCustomerInsight,
} from "../../../lib/insights";

import {
  NextBestAction,
  getNextBestAction,
} from "../../../lib/next-best-action";


export default function Customer360Page() {
  const params = useParams();

  const customerId =
    params.customerId as string;

  const [data, setData] =
    useState<Customer360 | null>(null);

  const [insight, setInsight] =
    useState<CustomerInsight | null>(null);

  const [nextAction, setNextAction] =
    useState<NextBestAction | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  useEffect(() => {
    async function loadCustomer() {
      try {
        const [
          customerData,
          insightData,
          actionData,
        ] = await Promise.all([
          getCustomer360(customerId),
          getCustomerInsight(customerId),
          getNextBestAction(customerId),
        ]);

        setData(customerData);
        setInsight(insightData);
        setNextAction(actionData);
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
          <InfoCard
            label="Risk level"
            value={data.risk.risk_level}
          />

          <InfoCard
            label="Churn probability"
            value={
              probability === null
                ? "—"
                : `${Math.round(
                    probability * 100,
                  )}%`
            }
          />

          <InfoCard
            label="Customer health"
            value={data.health.status}
          />
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
            AI Insight
          </h2>

          <p
            style={{
              color: "#475569",
              lineHeight: 1.6,
            }}
          >
            {insight?.summary ||
              "No AI insight available yet."}
          </p>

          {insight &&
            insight.risk_factors.length >
              0 && (
              <>
                <h3>
                  Risk factors
                </h3>

                <ul>
                  {insight.risk_factors.map(
                    (factor) => (
                      <li key={factor}>
                        {factor}
                      </li>
                    ),
                  )}
                </ul>
              </>
            )}
        </section>


        <section
          style={{
            marginTop: "20px",
            padding: "24px",
            background: "white",
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
          }}
        >
          <h2>
            Next Best Action
          </h2>

          <h3>
            {nextAction?.action ||
              "No action available yet"}
          </h3>

          <p
            style={{
              color: "#475569",
              lineHeight: 1.6,
            }}
          >
            {nextAction?.reason ||
              "There is currently no recommendation."}
          </p>

          {nextAction?.expected_value !==
            null &&
            nextAction?.expected_value !==
              undefined && (
              <p>
                Expected value:{" "}
                {nextAction.expected_value}
              </p>
            )}
        </section>


        <section
          style={{
            marginTop: "20px",
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


function InfoCard({
  label,
  value,
}: {
  label: string;
  value: string;
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
