"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import {
  getCustomer360,
  Customer360,
} from "../../../lib/customer-360";
import {
  getCustomerInsight,
  CustomerInsight,
} from "../../../lib/insights";
import {
  getNextBestAction,
  NextBestAction,
} from "../../../lib/next-best-action";


export default function Customer360Page() {
  const params = useParams();
  const customerId = String(params.customerId);

  const [data, setData] =
    useState<Customer360 | null>(null);

  const [insight, setInsight] =
    useState<CustomerInsight | null>(null);

  const [nextBestAction, setNextBestAction] =
    useState<NextBestAction | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  useEffect(() => {
    async function loadCustomer() {
      const organizationId =
        localStorage.getItem(
          "organization_id",
        );

      if (!organizationId) {
        setError(
          "Organization not found.",
        );
        setLoading(false);
        return;
      }

      try {
       const [
         customer360,
         customerInsight,
         customerNextBestAction,
       ] = await Promise.all([
         getCustomer360(
           customerId,
           organizationId,
         ),
         getCustomerInsight(
           customerId,
           organizationId,
         ),
         getNextBestAction(customerId),
       ]);

        setData(customer360);
        setInsight(customerInsight);
        setNextBestAction(
          customerNextBestAction,
        );
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

    loadCustomer();
  }, [customerId]);


  if (loading) {
    return (
      <main
        style={{
          padding: "32px 24px",
        }}
      >
        <p>
          Loading Customer 360...
        </p>
      </main>
    );
  }


  if (error || !data) {
    return (
      <main
        style={{
          padding: "32px 24px",
        }}
      >
        <Link href="/customers">
          ← Customers
        </Link>

        <h1>
          Customer 360
        </h1>

        <p>
          {error ||
            "Customer information is unavailable."}
        </p>
      </main>
    );
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
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        <Link href="/customers">
          ← Customers
        </Link>

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
            marginTop: "24px",
          }}
        >
          <InfoCard
            title="Risk Level"
            value={
              data.risk.risk_level
            }
          />

          <InfoCard
            title="Churn Probability"
            value={
              probability !== null
                ? `${(
                    probability * 100
                  ).toFixed(1)}%`
                : "Unavailable"
            }
          />

          <InfoCard
            title="Customer Health"
            value={
              data.health.status
            }
          />
        </div>


        <section
          style={{
            marginTop: "24px",
            padding: "24px",
            background: "white",
            border:
              "1px solid #e2e8f0",
            borderRadius: "12px",
          }}
        >
          <h2>
            AI Insight
          </h2>

          <p>
            {insight?.summary ||
              "No insight available."}
          </p>

          {insight?.risk_factors?.length ? (
            <>
              <h3>
                Risk Factors
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
          ) : (
            <p
              style={{
                color: "#64748b",
              }}
            >
              No specific risk factors
              are available yet.
            </p>
          )}
        </section>


        <section
          style={{
            marginTop: "24px",
            padding: "24px",
            background: "white",
            border:
              "1px solid #e2e8f0",
            borderRadius: "12px",
          }}
        >
          <h2>
            Next Best Action
          </h2>

          {nextBestAction?.action ? (
            <>
              <p>
                <strong>
                  {nextBestAction.action}
                </strong>
              </p>

              <p>
                {nextBestAction.reason ||
                  "No reason provided."}
              </p>

              {nextBestAction.expected_value !==
                null && (
                <p>
                  Expected value:{" "}
                  {
                    nextBestAction.expected_value
                  }
                </p>
              )}
            </>
          ) : (
            <p
              style={{
                color: "#64748b",
              }}
            >
              No recommended action is
              available yet.
            </p>
          )}
        </section>


        <section
          style={{
            marginTop: "24px",
            padding: "24px",
            background: "white",
            border:
              "1px solid #e2e8f0",
            borderRadius: "12px",
          }}
        >
          <h2>
            Customer Timeline
          </h2>

          {data.timeline.length === 0 ? (
            <p
              style={{
                color: "#64748b",
              }}
            >
              No customer events recorded.
            </p>
          ) : (
            <div>
              {data.timeline.map(
                (event) => (
                  <div
                    key={event.id}
                    style={{
                      padding:
                        "14px 0",
                      borderBottom:
                        "1px solid #e2e8f0",
                    }}
                  >
                    <strong>
                      {event.event_type}
                    </strong>

                    <p>
                      {event.description ||
                        "No description"}
                    </p>

                    <small
                      style={{
                        color:
                          "#64748b",
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
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div
      style={{
        padding: "20px",
        background: "white",
        border:
          "1px solid #e2e8f0",
        borderRadius: "12px",
      }}
    >
      <p
        style={{
          marginTop: 0,
          color: "#64748b",
        }}
      >
        {title}
      </p>

      <strong
        style={{
          fontSize: "24px",
        }}
      >
        {value}
      </strong>
    </div>
  );
}
