"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  executeRetentionAction,
  getActionCenter,
  RetentionAction,
} from "../../lib/actions";

export default function ActionCenterPage() {
  const [actions, setActions] = useState<RetentionAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [executingId, setExecutingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function loadActions() {
    const organizationId = localStorage.getItem(
      "organization_id",
    );

    if (!organizationId) {
      setError("Organization not found.");
      setLoading(false);
      return;
    }

    try {
      const result = await getActionCenter(
        organizationId,
      );
      setActions(result.actions);
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

  useEffect(() => {
    loadActions();
  }, []);

  async function handleExecute(actionId: string) {
    setExecutingId(actionId);
    setError("");

    try {
      await executeRetentionAction(actionId);

      setActions((currentActions) =>
        currentActions.filter(
          (action) => action.id !== actionId,
        ),
      );
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to execute action.",
      );
    } finally {
      setExecutingId(null);
    }
  }

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

        <h1>Action Center</h1>

        <p style={{ color: "#64748b" }}>
          Review and execute prioritized retention
          actions.
        </p>

        {error && (
          <div
            style={{
              marginTop: "20px",
              padding: "12px 16px",
              background: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: "8px",
              color: "#991b1b",
            }}
          >
            {error}
          </div>
        )}

        {loading ? (
          <p>Loading actions...</p>
        ) : actions.length === 0 ? (
          <div
            style={{
              marginTop: "24px",
              padding: "24px",
              background: "white",
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
            }}
          >
            <h2>No pending actions</h2>
            <p style={{ color: "#64748b" }}>
              There are currently no retention actions
              waiting for execution.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gap: "16px",
              marginTop: "24px",
            }}
          >
            {actions.map((action) => (
              <article
                key={action.id}
                style={{
                  padding: "20px",
                  background: "white",
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "16px",
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <h2
                      style={{
                        marginTop: 0,
                        marginBottom: "8px",
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
                        "No recommendation details available."}
                    </p>

                    <Link
                      href={`/customers/${action.customer_id}`}
                    >
                      View Customer 360
                    </Link>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      handleExecute(action.id)
                    }
                    disabled={
                      executingId === action.id
                    }
                    style={{
                      alignSelf: "center",
                      padding: "10px 16px",
                      border: "none",
                      borderRadius: "8px",
                      background: "#0f172a",
                      color: "white",
                      fontWeight: 600,
                      cursor:
                        executingId === action.id
                          ? "not-allowed"
                          : "pointer",
                      opacity:
                        executingId === action.id
                          ? 0.6
                          : 1,
                    }}
                  >
                    {executingId === action.id
                      ? "Executing..."
                      : "Execute Action"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
