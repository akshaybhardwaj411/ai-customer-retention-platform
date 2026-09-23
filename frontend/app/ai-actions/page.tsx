"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  getMLStatus,
  MLStatus,
} from "../../lib/ml-status";


export default function AIActionsPage() {
  const [status, setStatus] =
    useState<MLStatus | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  useEffect(() => {
    async function loadStatus() {
      try {
        const result =
          await getMLStatus();

        setStatus(result);

      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to load AI status.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadStatus();
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
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        <Link href="/dashboard">
          ← Dashboard
        </Link>

        <h1>
          AI Actions
        </h1>

        <p
          style={{
            color: "#64748b",
          }}
        >
          Manage AI-powered customer
          retention capabilities.
        </p>


        {loading && (
          <p>
            Checking AI model status...
          </p>
        )}


        {error && (
          <div
            style={{
              marginTop: "20px",
              padding: "14px 16px",
              background: "#fef2f2",
              border:
                "1px solid #fecaca",
              borderRadius: "8px",
              color: "#991b1b",
            }}
          >
            {error}
          </div>
        )}


        {status && (
          <>
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
              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems: "center",
                  gap: "16px",
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <h2
                    style={{
                      marginTop: 0,
                    }}
                  >
                    Churn Prediction Model
                  </h2>

                  <p
                    style={{
                      color:
                        "#64748b",
                    }}
                  >
                    {status.message}
                  </p>
                </div>

                <span
                  style={{
                    padding:
                      "8px 12px",
                    borderRadius:
                      "999px",
                    background:
                      status.model_available
                        ? "#dcfce7"
                        : "#fef3c7",
                    color:
                      status.model_available
                        ? "#166534"
                        : "#92400e",
                    fontWeight: 700,
                  }}
                >
                  {status.model_available
                    ? "Ready"
                    : "Not Ready"}
                </span>
              </div>


              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "16px",
                  marginTop: "20px",
                }}
              >
                <StatusCard
                  title="Model"
                  value={
                    status.model_available
                      ? "Available"
                      : "Unavailable"
                  }
                />

                <StatusCard
                  title="Features"
                  value={
                    status.features_available
                      ? "Available"
                      : "Unavailable"
                  }
                />

                <StatusCard
                  title="Feature Count"
                  value={String(
                    status.feature_count,
                  )}
                />
              </div>
            </section>


            {status.training && (
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
                <h2
                  style={{
                    marginTop: 0,
                  }}
                >
                  Model Training
                </h2>

                <p
                  style={{
                    color:
                      "#64748b",
                  }}
                >
                  Training and validation
                  information for the
                  current churn model.
                </p>


                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "16px",
                    marginTop: "20px",
                  }}
                >
                  <StatusCard
                    title="Model Type"
                    value={
                      status.training
                        .model_type
                    }
                  />

                  <StatusCard
                    title="Test Rows"
                    value={String(
                      status.training
                        .test_rows,
                    )}
                  />

                  <StatusCard
                    title="Trained At"
                    value={new Date(
                      status.training
                        .trained_at,
                    ).toLocaleString()}
                  />

                  <StatusCard
                    title="Accuracy"
                    value={`${(
                      status.training
                        .metrics
                        .accuracy * 100
                    ).toFixed(1)}%`}
                  />

                  <StatusCard
                    title="Precision"
                    value={`${(
                      status.training
                        .metrics
                        .precision * 100
                    ).toFixed(1)}%`}
                  />

                  <StatusCard
                    title="Recall"
                    value={`${(
                      status.training
                        .metrics
                        .recall * 100
                    ).toFixed(1)}%`}
                  />

                  <StatusCard
                    title="ROC-AUC"
                    value={
                      status.training
                        .metrics
                        .roc_auc
                        .toFixed(3)
                    }
                  />
                </div>
              </section>
            )}
          </>
        )}


        <section
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px",
            marginTop: "24px",
          }}
        >
          <FeatureCard
            title="Churn Prediction"
            description="Estimate the probability that a customer may churn."
          />

          <FeatureCard
            title="Risk Detection"
            description="Classify customers into actionable risk levels."
          />

          <FeatureCard
            title="Next Best Action"
            description="Recommend retention actions based on customer context."
          />
        </section>
      </section>
    </main>
  );
}


function StatusCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div
      style={{
        padding: "16px",
        background:
          "#f8fafc",
        border:
          "1px solid #e2e8f0",
        borderRadius: "8px",
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

      <strong>
        {value}
      </strong>
    </div>
  );
}


function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <article
      style={{
        padding: "20px",
        background: "white",
        border:
          "1px solid #e2e8f0",
        borderRadius: "12px",
      }}
    >
      <h2
        style={{
          marginTop: 0,
          fontSize: "18px",
        }}
      >
        {title}
      </h2>

      <p
        style={{
          color: "#64748b",
          lineHeight: 1.6,
        }}
      >
        {description}
      </p>
    </article>
  );
}
