"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import {
  ActionCenterResponse,
  getActionCenter,
} from "../../lib/action-center";


export default function ActionCenterPage() {
  const [data, setData] =
    useState<ActionCenterResponse | null>(
      null,
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  useEffect(() => {
    async function loadActionCenter() {
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
          await getActionCenter(
            organizationId,
          );

        setData(result);
      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to load actions.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadActionCenter();
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
        <h1>
          Action Center
        </h1>

        <p
          style={{
            color: "#64748b",
          }}
        >
          Prioritize and manage retention actions
          for at-risk customers.
        </p>

        {loading && (
          <p>
            Loading actions...
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

        {data &&
          data.actions.length === 0 && (
            <div
              style={{
                marginTop: "28px",
                padding: "32px",
                background: "white",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
              }}
            >
              <h2>
                No pending actions
              </h2>

              <p
                style={{
                  color: "#64748b",
                }}
              >
                AI-generated retention actions
                will appear here when available.
              </p>
            </div>
          )}

        {data &&
          data.actions.length > 0 && (
            <div
              style={{
                marginTop: "28px",
                display: "grid",
                gap: "16px",
              }}
            >
              {data.actions.map(
                (action) => (
                  <div
                    key={action.id}
                    style={{
                      padding: "24px",
                      background: "white",
                      border: "1px solid #e2e8f0",
                      borderRadius: "12px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent:
                          "space-between",
                        gap: "16px",
                        flexWrap:
                          "wrap",
                      }}
                    >
                      <div>
                        <h2
                          style={{
                            marginTop: 0,
                          }}
                        >
                          {action.action_type}
                        </h2>

                        <p
                          style={{
                            color: "#64748b",
                          }}
                        >
                          {action.recommendation ||
                            "No recommendation provided."}
                        </p>
                      </div>

                      <span
                        style={{
                          alignSelf:
                            "flex-start",
                          padding:
                            "6px 10px",
                          borderRadius:
                            "999px",
                          background:
                            "#f1f5f9",
                          fontSize:
                            "14px",
                          fontWeight:
                            600,
                        }}
                      >
                        {action.status}
                      </span>
                    </div>

                    <Link
                      href={`/customers/${action.customer_id}`}
                      style={{
                        display:
                          "inline-block",
                        marginTop: "12px",
                        color: "#2563eb",
                        textDecoration:
                          "none",
                        fontWeight: 600,
                      }}
                    >
                      View Customer 360
                    </Link>
                  </div>
                ),
              )}
            </div>
          )}
      </section>
    </main>
  );
}
