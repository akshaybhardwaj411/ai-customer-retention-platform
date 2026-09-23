"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  getActionCenter,
  type ActionCenterItem,
  type ActionCenterResponse,
} from "@/lib/action-center";

import {
  executeRetentionAction,
} from "@/lib/actions";

import {
  createActionOutcome,
} from "@/lib/outcomes";


type OutcomeValue =
  | "saved"
  | "not_saved"
  | "no_response"
  | "unknown";


function RiskBadge({
  level,
}: {
  level: string;
}) {
  const normalized =
    level.toLowerCase();

  const styles: Record<
    string,
    {
      background: string;
      color: string;
    }
  > = {
    critical: {
      background: "#fee2e2",
      color: "#991b1b",
    },
    high: {
      background: "#ffedd5",
      color: "#9a3412",
    },
    medium: {
      background: "#fef3c7",
      color: "#92400e",
    },
    low: {
      background: "#dcfce7",
      color: "#166534",
    },
  };

  const style =
    styles[normalized] || {
      background: "#f1f5f9",
      color: "#475569",
    };

  return (
    <span
      style={{
        display: "inline-block",
        padding: "5px 9px",
        borderRadius: "999px",
        fontSize: "12px",
        fontWeight: 600,
        background: style.background,
        color: style.color,
        textTransform: "capitalize",
      }}
    >
      {normalized}
    </span>
  );
}


function ActionCard({
  item,
  organizationId,
  onUpdated,
}: {
  item: ActionCenterItem;
  organizationId: string;
  onUpdated: () => void;
}) {
  const [executing, setExecuting] =
    useState(false);

  const [recordingOutcome, setRecordingOutcome] =
    useState(false);

  const [executed, setExecuted] =
    useState(item.status === "completed");

  const [outcome, setOutcome] =
    useState<OutcomeValue | "">("");

  const [revenueSaved, setRevenueSaved] =
    useState("");

  const [error, setError] =
    useState<string | null>(null);

  const [success, setSuccess] =
    useState<string | null>(null);


  async function handleExecute() {
    try {
      setExecuting(true);
      setError(null);
      setSuccess(null);

      await executeRetentionAction(
        item.id,
        organizationId,
      );

      setExecuted(true);

      setSuccess(
        "Action executed. Record the customer outcome below.",
      );
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : "Unable to execute action.",
      );
    } finally {
      setExecuting(false);
    }
  }


  async function handleRecordOutcome() {
    if (!outcome) {
      setError(
        "Please select an outcome.",
      );
      return;
    }

    if (
      outcome === "saved" &&
      revenueSaved &&
      Number(revenueSaved) < 0
    ) {
      setError(
        "Revenue saved cannot be negative.",
      );
      return;
    }

    try {
      setRecordingOutcome(true);
      setError(null);
      setSuccess(null);

      await createActionOutcome(
        organizationId,
        item.id,
        item.customer_id,
        outcome,
        outcome === "saved" &&
          revenueSaved
          ? Number(revenueSaved)
          : undefined,
      );

      setSuccess(
        "Outcome recorded successfully.",
      );

      setOutcome("");
      setRevenueSaved("");

      onUpdated();
    } catch (outcomeError) {
      setError(
        outcomeError instanceof Error
          ? outcomeError.message
          : "Unable to record outcome.",
      );
    } finally {
      setRecordingOutcome(false);
    }
  }


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
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            minWidth: 0,
            flex: 1,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "10px",
            }}
          >
            <RiskBadge
              level={item.risk_level}
            />

            <span
              style={{
                fontSize: "12px",
                color: "#64748b",
              }}
            >
              Priority {item.priority}
            </span>
          </div>

          <Link
            href={`/customers/${encodeURIComponent(
              item.customer_id,
            )}`}
            style={{
              fontSize: "19px",
              fontWeight: 700,
              color: "#0f172a",
              textDecoration: "none",
            }}
          >
            {item.customer_name}
          </Link>

          {item.customer_email && (
            <div
              style={{
                marginTop: "4px",
                fontSize: "13px",
                color: "#64748b",
              }}
            >
              {item.customer_email}
            </div>
          )}

          <div
            style={{
              marginTop: "12px",
              fontSize: "15px",
              fontWeight: 600,
              color: "#334155",
              textTransform: "capitalize",
            }}
          >
            {item.action_type.replace(
              /_/g,
              " ",
            )}
          </div>

          <Link
            href={`/customers/${encodeURIComponent(
              item.customer_id,
            )}`}
            style={{
              display: "inline-block",
              marginTop: "7px",
              fontSize: "13px",
              color: "#2563eb",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            View Customer →
          </Link>
        </div>

        {!executed && (
          <button
            type="button"
            onClick={handleExecute}
            disabled={executing}
            style={{
              border: "none",
              borderRadius: "8px",
              padding: "10px 16px",
              background: executing
                ? "#94a3b8"
                : "#0f172a",
              color: "#ffffff",
              cursor: executing
                ? "not-allowed"
                : "pointer",
              fontWeight: 600,
            }}
          >
            {executing
              ? "Executing..."
              : "Execute Action"}
          </button>
        )}

        {executed && (
          <span
            style={{
              display: "inline-block",
              padding: "9px 13px",
              borderRadius: "8px",
              background: "#dcfce7",
              color: "#166534",
              fontSize: "13px",
              fontWeight: 600,
            }}
          >
            Action Executed
          </span>
        )}
      </div>

      {item.recommendation && (
        <div
          style={{
            marginTop: "18px",
            padding: "14px",
            background: "#f8fafc",
            borderRadius: "8px",
            color: "#334155",
            lineHeight: 1.5,
            fontSize: "14px",
          }}
        >
          <strong>
            AI Recommendation
          </strong>

          <div
            style={{
              marginTop: "5px",
            }}
          >
            {item.recommendation}
          </div>
        </div>
      )}

      {executed && (
        <div
          style={{
            marginTop: "20px",
            paddingTop: "20px",
            borderTop:
              "1px solid #e2e8f0",
          }}
        >
          <div
            style={{
              fontSize: "16px",
              fontWeight: 700,
              color: "#0f172a",
              marginBottom: "12px",
            }}
          >
            Record Outcome
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "minmax(180px, 1fr) minmax(180px, 1fr) auto",
              gap: "10px",
              alignItems: "end",
            }}
          >
            <label
              style={{
                display: "block",
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  color: "#64748b",
                  marginBottom: "6px",
                }}
              >
                Customer outcome
              </div>

              <select
                value={outcome}
                onChange={(event) =>
                  setOutcome(
                    event.target.value as
                      | OutcomeValue
                      | "",
                  )
                }
                style={{
                  width: "100%",
                  padding: "10px",
                  border:
                    "1px solid #cbd5e1",
                  borderRadius: "8px",
                  background: "#ffffff",
                }}
              >
                <option value="">
                  Select outcome
                </option>

                <option value="saved">
                  Saved
                </option>

                <option value="not_saved">
                  Not Saved
                </option>

                <option value="no_response">
                  No Response
                </option>

                <option value="unknown">
                  Unknown
                </option>
              </select>
            </label>

            <label
              style={{
                display: "block",
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  color: "#64748b",
                  marginBottom: "6px",
                }}
              >
                Revenue saved
              </div>

              <input
                type="number"
                min="0"
                step="0.01"
                value={revenueSaved}
                onChange={(event) =>
                  setRevenueSaved(
                    event.target.value,
                  )
                }
                disabled={
                  outcome !== "saved"
                }
                placeholder="₹ 0"
                style={{
                  width: "100%",
                  padding: "10px",
                  border:
                    "1px solid #cbd5e1",
                  borderRadius: "8px",
                  background:
                    outcome === "saved"
                      ? "#ffffff"
                      : "#f1f5f9",
                }}
              />
            </label>

            <button
              type="button"
              onClick={
                handleRecordOutcome
              }
              disabled={
                recordingOutcome ||
                !outcome
              }
              style={{
                border: "none",
                borderRadius: "8px",
                padding:
                  "10px 16px",
                background:
                  recordingOutcome ||
                  !outcome
                    ? "#cbd5e1"
                    : "#2563eb",
                color:
                  recordingOutcome ||
                  !outcome
                    ? "#64748b"
                    : "#ffffff",
                cursor:
                  recordingOutcome ||
                  !outcome
                    ? "not-allowed"
                    : "pointer",
                fontWeight: 600,
              }}
            >
              {recordingOutcome
                ? "Saving..."
                : "Record Outcome"}
            </button>
          </div>
        </div>
      )}

      {error && (
        <div
          style={{
            marginTop: "14px",
            padding: "10px",
            borderRadius: "8px",
            background: "#fef2f2",
            color: "#991b1b",
            fontSize: "13px",
          }}
        >
          {error}
        </div>
      )}

      {success && (
        <div
          style={{
            marginTop: "14px",
            padding: "10px",
            borderRadius: "8px",
            background: "#f0fdf4",
            color: "#166534",
            fontSize: "13px",
          }}
        >
          {success}
        </div>
      )}
    </div>
  );
}


export default function ActionCenterPage() {
  const [
    organizationId,
    setOrganizationId,
  ] = useState("");

  const [
    data,
    setData,
  ] = useState<ActionCenterResponse | null>(
    null,
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<string | null>(null);


  useEffect(() => {
    const storedId =
      window.localStorage.getItem(
        "organization_id",
      );

    if (!storedId) {
      setError(
        "Organization is not selected.",
      );
      setLoading(false);
      return;
    }

    setOrganizationId(
      storedId,
    );
  }, []);


  async function loadActionCenter() {
    if (!organizationId) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result =
        await getActionCenter(
          organizationId,
        );

      setData(result);
    } catch (actionCenterError) {
      setError(
        actionCenterError instanceof Error
          ? actionCenterError.message
          : "Unable to load Action Center.",
      );
    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    loadActionCenter();
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
        Loading Action Center...
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


  if (!data) {
    return (
      <main
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "32px 20px",
        }}
      >
        No action data available.
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
      <header
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
          Retention Operations
        </div>

        <h1
          style={{
            margin: 0,
            fontSize: "32px",
            color: "#0f172a",
          }}
        >
          Action Center
        </h1>

        <p
          style={{
            marginTop: "8px",
            color: "#64748b",
          }}
        >
          Prioritized retention actions
          that need attention.
        </p>
      </header>


      <section
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(150px, 1fr))",
          gap: "12px",
          marginBottom: "28px",
        }}
      >
        {[
          ["Total", data.total_actions],
          ["Critical", data.critical],
          ["High", data.high],
          ["Medium", data.medium],
          ["Low", data.low],
        ].map(
          ([label, value]) => (
            <div
              key={String(label)}
              style={{
                background:
                  "#ffffff",
                border:
                  "1px solid #e2e8f0",
                borderRadius:
                  "10px",
                padding: "16px",
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  color: "#64748b",
                }}
              >
                {label}
              </div>

              <div
                style={{
                  marginTop: "5px",
                  fontSize: "24px",
                  fontWeight: 700,
                }}
              >
                {value}
              </div>
            </div>
          ),
        )}
      </section>


      {data.actions.length === 0 ? (
        <div
          style={{
            padding: "40px 20px",
            textAlign: "center",
            background: "#ffffff",
            border:
              "1px solid #e2e8f0",
            borderRadius: "12px",
            color: "#64748b",
          }}
        >
          <div
            style={{
              fontSize: "18px",
              fontWeight: 600,
              color: "#0f172a",
              marginBottom: "6px",
            }}
          >
            No pending actions
          </div>

          All current retention
          actions have been handled.
        </div>
      ) : (
        <section
          style={{
            display: "grid",
            gap: "14px",
          }}
        >
          {data.actions.map(
            (item) => (
              <ActionCard
                key={`${item.source}-${item.id}`}
                item={item}
                organizationId={
                  organizationId
                }
                onUpdated={
                  loadActionCenter
                }
              />
            ),
          )}
        </section>
      )}
    </main>
  );
}
