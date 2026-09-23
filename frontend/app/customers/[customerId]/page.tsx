"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import {
  getCustomer360,
  type Customer360,
} from "@/lib/customer-360";

import {
  getCustomerInsight,
  type CustomerInsight,
} from "@/lib/insights";

import {
  getNextBestAction,
  type NextBestAction,
} from "@/lib/next-best-action";

import {
  getCustomerPriority,
  type CustomerPriority,
} from "@/lib/priority";

import {
  predictCustomerChurn,
  type ChurnPrediction,
} from "@/lib/ml";

import {
  getCustomerRiskExplanation,
  type RiskFactor,
} from "@/lib/explanations";

import {
  createRetentionAction,
  executeRetentionAction,
} from "@/lib/actions";

import {
  createActionOutcome,
} from "@/lib/outcomes";


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
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "12px",
        padding: "18px",
      }}
    >
      <div
        style={{
          fontSize: "13px",
          color: "#64748b",
          marginBottom: "6px",
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: "20px",
          fontWeight: 700,
          color: "#0f172a",
        }}
      >
        {value}
      </div>
    </div>
  );
}


function InputField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "6px",
      }}
    >
      <span
        style={{
          fontSize: "13px",
          fontWeight: 600,
          color: "#475569",
        }}
      >
        {label}
      </span>

      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) =>
          onChange(event.target.value)
        }
        style={{
          width: "100%",
          padding: "10px 12px",
          border: "1px solid #cbd5e1",
          borderRadius: "8px",
          background: "#ffffff",
          color: "#0f172a",
          outline: "none",
        }}
      />
    </label>
  );
}


export default function Customer360Page() {
  const params = useParams();

  const customerId = String(
    params.customerId || "",
  );

  const [organizationId, setOrganizationId] =
    useState("");

  const [customer360, setCustomer360] =
    useState<Customer360 | null>(null);

  const [insight, setInsight] =
    useState<CustomerInsight | null>(null);

  const [nextBestAction, setNextBestAction] =
    useState<NextBestAction | null>(null);

  const [priority, setPriority] =
    useState<CustomerPriority | null>(null);

  const [prediction, setPrediction] =
    useState<ChurnPrediction | null>(null);

  const [riskFactors, setRiskFactors] =
    useState<RiskFactor[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [predictionLoading, setPredictionLoading] =
    useState(false);

  const [explanationLoading, setExplanationLoading] =
    useState(false);

  const [executeLoading, setExecuteLoading] =
    useState(false);

  const [outcomeLoading, setOutcomeLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [predictionError, setPredictionError] =
    useState<string | null>(null);

  const [explanationError, setExplanationError] =
    useState<string | null>(null);

  const [actionError, setActionError] =
    useState<string | null>(null);

  const [actionSuccess, setActionSuccess] =
    useState<string | null>(null);

  const [outcomeError, setOutcomeError] =
    useState<string | null>(null);

  const [outcomeSuccess, setOutcomeSuccess] =
    useState<string | null>(null);

  const [tenure, setTenure] =
    useState("");

  const [monthlyCharges, setMonthlyCharges] =
    useState("");

  const [totalCharges, setTotalCharges] =
    useState("");

  const [contract, setContract] =
    useState("");

  const [paymentMethod, setPaymentMethod] =
    useState("");

  const [internetService, setInternetService] =
    useState("");

  const [onlineSecurity, setOnlineSecurity] =
    useState("");

  const [techSupport, setTechSupport] =
    useState("");

  const [outcome, setOutcome] =
    useState("saved");

  const [revenueSaved, setRevenueSaved] =
    useState("");

  const [executedActionId, setExecutedActionId] =
    useState<string | null>(null);


  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const storedOrganizationId =
      window.localStorage.getItem(
        "organization_id",
      );

    if (storedOrganizationId) {
      setOrganizationId(
        storedOrganizationId,
      );
    } else {
      setLoading(false);
      setError(
        "Organization is not selected.",
      );
    }
  }, []);


  useEffect(() => {
    if (!organizationId || !customerId) {
      return;
    }

    async function loadCustomer() {
      try {
        setLoading(true);
        setError(null);

        const [
          customerData,
          customerInsight,
          customerAction,
          customerPriority,
        ] = await Promise.all([
          getCustomer360(
            customerId,
            organizationId,
          ),

          getCustomerInsight(
            customerId,
            organizationId,
          ),

          getNextBestAction(
            customerId,
            organizationId,
          ),

          getCustomerPriority(
            customerId,
            organizationId,
            0.5,
            0.5,
          ),
        ]);

        setCustomer360(customerData);
        setInsight(customerInsight);
        setNextBestAction(customerAction);
        setPriority(customerPriority);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load customer.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadCustomer();
  }, [
    organizationId,
    customerId,
  ]);


  function getCustomerFeatures() {
    return {
      tenure: tenure
        ? Number(tenure)
        : undefined,

      monthly_charges: monthlyCharges
        ? Number(monthlyCharges)
        : undefined,

      total_charges: totalCharges
        ? Number(totalCharges)
        : undefined,

      contract:
        contract || undefined,

      payment_method:
        paymentMethod || undefined,

      internet_service:
        internetService || undefined,

      online_security:
        onlineSecurity || undefined,

      tech_support:
        techSupport || undefined,
    };
  }


  async function handlePrediction() {
    if (
      !organizationId ||
      !customerId
    ) {
      return;
    }

    try {
      setPredictionLoading(true);
      setPredictionError(null);

      const result =
        await predictCustomerChurn(
          customerId,
          organizationId,
          getCustomerFeatures(),
        );

      setPrediction(result);

      const updatedAction =
        await getNextBestAction(
          customerId,
          organizationId,
        );

      setNextBestAction(
        updatedAction,
      );
    } catch (predictionErrorValue) {
      setPredictionError(
        predictionErrorValue instanceof Error
          ? predictionErrorValue.message
          : "Unable to generate prediction.",
      );
    } finally {
      setPredictionLoading(false);
    }
  }


  async function handleExplanation() {
    if (
      !organizationId ||
      !customerId
    ) {
      return;
    }

    try {
      setExplanationLoading(true);
      setExplanationError(null);

      const result =
        await getCustomerRiskExplanation(
          customerId,
          organizationId,
          getCustomerFeatures(),
        );

      setRiskFactors(
        result.risk_factors,
      );
    } catch (explanationErrorValue) {
      setExplanationError(
        explanationErrorValue instanceof Error
          ? explanationErrorValue.message
          : "Unable to generate risk explanation.",
      );
    } finally {
      setExplanationLoading(false);
    }
  }


  async function handleExecuteAction() {
    if (
      !organizationId ||
      !customerId ||
      !nextBestAction?.action
    ) {
      return;
    }

    try {
      setExecuteLoading(true);
      setActionError(null);
      setActionSuccess(null);
      setOutcomeSuccess(null);

      const action =
        await createRetentionAction(
          organizationId,
          customerId,
          nextBestAction.action,
          nextBestAction.reason ||
            undefined,
        );

      const result =
        await executeRetentionAction(
          action.id,
          organizationId,
        );

      setExecutedActionId(
        action.id,
      );

      setActionSuccess(
        result.message ||
          "Retention action executed successfully.",
      );
    } catch (executeError) {
      setActionError(
        executeError instanceof Error
          ? executeError.message
          : "Unable to execute retention action.",
      );
    } finally {
      setExecuteLoading(false);
    }
  }


  async function handleRecordOutcome() {
    if (
      !organizationId ||
      !customerId ||
      !executedActionId
    ) {
      return;
    }

    try {
      setOutcomeLoading(true);
      setOutcomeError(null);
      setOutcomeSuccess(null);

      const parsedRevenue =
        revenueSaved.trim()
          ? Number(revenueSaved)
          : undefined;

      if (
        parsedRevenue !== undefined &&
        (
          Number.isNaN(parsedRevenue) ||
          parsedRevenue < 0
        )
      ) {
        throw new Error(
          "Revenue saved must be a valid positive number.",
        );
      }

      await createActionOutcome(
        organizationId,
        executedActionId,
        customerId,
        outcome,
        parsedRevenue,
      );

      setOutcomeSuccess(
        "Action outcome recorded successfully.",
      );
    } catch (outcomeErrorValue) {
      setOutcomeError(
        outcomeErrorValue instanceof Error
          ? outcomeErrorValue.message
          : "Unable to record action outcome.",
      );
    } finally {
      setOutcomeLoading(false);
    }
  }


  if (loading) {
    return (
      <main
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "32px 20px",
        }}
      >
        Loading customer...
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
            border: "1px solid #fecaca",
            borderRadius: "10px",
            color: "#991b1b",
          }}
        >
          {error}
        </div>
      </main>
    );
  }


  if (!customer360) {
    return (
      <main
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "32px 20px",
        }}
      >
        Customer not found.
      </main>
    );
  }


  const customer =
    customer360.customer;


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
          Customer 360
        </div>

        <h1
          style={{
            margin: 0,
            fontSize: "32px",
            lineHeight: 1.2,
            color: "#0f172a",
          }}
        >
          {customer.name}
        </h1>

        <div
          style={{
            marginTop: "6px",
            color: "#64748b",
          }}
        >
          {customer.email ||
            "No email available"}
        </div>
      </div>


      <section
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "14px",
          marginBottom: "28px",
        }}
      >
        <InfoCard
          title="Risk Level"
          value={
            prediction?.risk_level ||
            customer360.risk.risk_level
          }
        />

        <InfoCard
          title="Churn Probability"
          value={
            prediction
              ? `${(
                  prediction.churn_probability *
                  100
                ).toFixed(1)}%`
              : customer360.risk
                    .churn_probability !==
                  null
                ? `${(
                    customer360.risk
                      .churn_probability *
                    100
                  ).toFixed(1)}%`
                : "—"
          }
        />

        <InfoCard
          title="Priority"
          value={
            priority
              ? priority.priority_level
              : "—"
          }
        />

        <InfoCard
          title="Priority Score"
          value={
            priority
              ? priority.priority_score.toFixed(
                  3,
                )
              : "—"
          }
        />
      </section>


      <section
        style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "12px",
          padding: "22px",
          marginBottom: "24px",
        }}
      >
        <h2
          style={{
            margin: "0 0 6px",
            fontSize: "20px",
          }}
        >
          Churn Prediction Inputs
        </h2>

        <p
          style={{
            margin: "0 0 18px",
            color: "#64748b",
            fontSize: "14px",
          }}
        >
          Provide the customer attributes used
          by the churn model.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px",
          }}
        >
          <InputField
            label="Tenure"
            value={tenure}
            onChange={setTenure}
            type="number"
            placeholder="e.g. 12"
          />

          <InputField
            label="Monthly Charges"
            value={monthlyCharges}
            onChange={setMonthlyCharges}
            type="number"
            placeholder="e.g. 79.99"
          />

          <InputField
            label="Total Charges"
            value={totalCharges}
            onChange={setTotalCharges}
            type="number"
            placeholder="e.g. 950"
          />

          <InputField
            label="Contract"
            value={contract}
            onChange={setContract}
            placeholder="e.g. Month-to-month"
          />

          <InputField
            label="Payment Method"
            value={paymentMethod}
            onChange={setPaymentMethod}
            placeholder="e.g. Electronic check"
          />

          <InputField
            label="Internet Service"
            value={internetService}
            onChange={setInternetService}
            placeholder="e.g. Fiber optic"
          />

          <InputField
            label="Online Security"
            value={onlineSecurity}
            onChange={setOnlineSecurity}
            placeholder="e.g. No"
          />

          <InputField
            label="Tech Support"
            value={techSupport}
            onChange={setTechSupport}
            placeholder="e.g. No"
          />
        </div>

        <div
          style={{
            display: "flex",
            gap: "10px",
            marginTop: "20px",
            flexWrap: "wrap",
          }}
        >
          <button
            type="button"
            onClick={handlePrediction}
            disabled={predictionLoading}
            style={{
              padding: "11px 18px",
              border: 0,
              borderRadius: "8px",
              background: "#0f172a",
              color: "#ffffff",
              cursor: predictionLoading
                ? "not-allowed"
                : "pointer",
              opacity: predictionLoading
                ? 0.7
                : 1,
              fontWeight: 600,
            }}
          >
            {predictionLoading
              ? "Running Prediction..."
              : "Run Churn Prediction"}
          </button>

          <button
            type="button"
            onClick={handleExplanation}
            disabled={explanationLoading}
            style={{
              padding: "11px 18px",
              border: "1px solid #cbd5e1",
              borderRadius: "8px",
              background: "#ffffff",
              color: "#0f172a",
              cursor: explanationLoading
                ? "not-allowed"
                : "pointer",
              opacity: explanationLoading
                ? 0.7
                : 1,
              fontWeight: 600,
            }}
          >
            {explanationLoading
              ? "Explaining Risk..."
              : "Explain Risk"}
          </button>
        </div>

        {predictionError && (
          <div
            style={{
              marginTop: "14px",
              color: "#b91c1c",
              fontSize: "14px",
            }}
          >
            {predictionError}
          </div>
        )}
      </section>


      {prediction && (
        <section
          style={{
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
            padding: "22px",
            marginBottom: "24px",
          }}
        >
          <h2
            style={{
              margin: "0 0 16px",
              fontSize: "20px",
            }}
          >
            Latest Churn Prediction
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "14px",
            }}
          >
            <InfoCard
              title="Risk"
              value={prediction.risk_level}
            />

            <InfoCard
              title="Probability"
              value={`${(
                prediction.churn_probability *
                100
              ).toFixed(1)}%`}
            />

            <InfoCard
              title="Source"
              value={prediction.source}
            />
          </div>
        </section>
      )}


      <section
        style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "12px",
          padding: "22px",
          marginBottom: "24px",
        }}
      >
        <h2
          style={{
            margin: "0 0 12px",
            fontSize: "20px",
          }}
        >
          AI Insight
        </h2>

        <p
          style={{
            margin: 0,
            color: "#475569",
            lineHeight: 1.6,
          }}
        >
          {insight?.summary ||
            "No AI insight is available yet."}
        </p>
      </section>


      <section
        style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "12px",
          padding: "22px",
          marginBottom: "24px",
        }}
      >
        <h2
          style={{
            margin: "0 0 6px",
            fontSize: "20px",
          }}
        >
          AI Risk Explanation
        </h2>

        <p
          style={{
            margin: "0 0 18px",
            color: "#64748b",
            fontSize: "14px",
          }}
        >
          The strongest factors influencing the
          current churn prediction.
        </p>

        {explanationError && (
          <div
            style={{
              marginBottom: "14px",
              color: "#b91c1c",
              fontSize: "14px",
            }}
          >
            {explanationError}
          </div>
        )}

        {riskFactors.length === 0 ? (
          <div
            style={{
              color: "#64748b",
              fontSize: "14px",
            }}
          >
            Run Explain Risk to view the
            prediction drivers.
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            {riskFactors
              .slice(0, 8)
              .map((factor) => (
                <div
                  key={`${factor.feature}-${factor.impact}`}
                  style={{
                    padding: "14px 16px",
                    background: "#f8fafc",
                    border:
                      "1px solid #e2e8f0",
                    borderRadius: "8px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      alignItems:
                        "flex-start",
                      gap: "16px",
                    }}
                  >
                    <div>
                      <strong>
                        {factor.label}
                      </strong>

                      <p
                        style={{
                          margin:
                            "4px 0 0",
                          color:
                            factor.direction ===
                            "increases_risk"
                              ? "#b91c1c"
                              : "#15803d",
                          fontSize:
                            "13px",
                        }}
                      >
                        {factor.direction ===
                        "increases_risk"
                          ? "Increases churn risk"
                          : "Decreases churn risk"}
                      </p>
                    </div>

                    <strong>
                      {factor.impact > 0
                        ? "+"
                        : ""}
                      {factor.impact.toFixed(
                        3,
                      )}
                    </strong>
                  </div>

                  <p
                    style={{
                      margin:
                        "8px 0 0",
                      color: "#475569",
                      fontSize: "14px",
                      lineHeight: 1.5,
                    }}
                  >
                    {factor.interpretation}
                  </p>
                </div>
              ))}
          </div>
        )}
      </section>


      <section
        style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "12px",
          padding: "22px",
          marginBottom: "24px",
        }}
      >
        <h2
          style={{
            margin: "0 0 6px",
            fontSize: "20px",
          }}
        >
          Next Best Action
        </h2>

        <p
          style={{
            margin: "0 0 18px",
            color: "#64748b",
            fontSize: "14px",
          }}
        >
          The recommended retention action for
          this customer.
        </p>

        {!nextBestAction?.action ? (
          <div
            style={{
              color: "#64748b",
            }}
          >
            No retention action is available yet.
          </div>
        ) : (
          <>
            <div
              style={{
                padding: "18px",
                background: "#f8fafc",
                border:
                  "1px solid #e2e8f0",
                borderRadius: "10px",
              }}
            >
              <div
                style={{
                  fontSize: "13px",
                  color: "#64748b",
                  marginBottom: "6px",
                }}
              >
                RECOMMENDED ACTION
              </div>

              <div
                style={{
                  fontSize: "20px",
                  fontWeight: 700,
                  color: "#0f172a",
                  textTransform:
                    "capitalize",
                }}
              >
                {nextBestAction.action.replace(
                  /_/g,
                  " ",
                )}
              </div>

              {nextBestAction.reason && (
                <p
                  style={{
                    margin:
                      "8px 0 0",
                    color: "#475569",
                    lineHeight: 1.6,
                  }}
                >
                  {nextBestAction.reason}
                </p>
              )}
            </div>


            {nextBestAction.risk_factors
              ?.length > 0 && (
              <div
                style={{
                  marginTop: "16px",
                  padding:
                    "14px 16px",
                  background:
                    "#f8fafc",
                  border:
                    "1px solid #e2e8f0",
                  borderRadius: "8px",
                }}
              >
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#64748b",
                    marginBottom:
                      "6px",
                  }}
                >
                  PRIMARY RISK DRIVER
                </div>

                <div
                  style={{
                    fontSize: "16px",
                    fontWeight: 600,
                    color: "#0f172a",
                  }}
                >
                  {
                    nextBestAction
                      .risk_factors[0]
                      .label
                  }
                </div>

                <div
                  style={{
                    marginTop: "4px",
                    fontSize: "14px",
                    color: "#475569",
                    lineHeight: 1.5,
                  }}
                >
                  {
                    nextBestAction
                      .risk_factors[0]
                      .interpretation
                  }
                </div>
              </div>
            )}


            <div
              style={{
                marginTop: "18px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              {!executedActionId && (
                <button
                  type="button"
                  onClick={
                    handleExecuteAction
                  }
                  disabled={
                    executeLoading
                  }
                  style={{
                    alignSelf:
                      "flex-start",
                    padding:
                      "11px 20px",
                    border: 0,
                    borderRadius:
                      "8px",
                    background:
                      "#0f172a",
                    color:
                      "#ffffff",
                    cursor:
                      executeLoading
                        ? "not-allowed"
                        : "pointer",
                    opacity:
                      executeLoading
                        ? 0.7
                        : 1,
                    fontWeight:
                      600,
                  }}
                >
                  {executeLoading
                    ? "Executing..."
                    : "Execute Action"}
                </button>
              )}


              {actionSuccess && (
                <div
                  style={{
                    padding:
                      "10px 12px",
                    background:
                      "#f0fdf4",
                    border:
                      "1px solid #bbf7d0",
                    borderRadius:
                      "8px",
                    color:
                      "#166534",
                    fontSize:
                      "14px",
                  }}
                >
                  {actionSuccess}
                </div>
              )}


              {actionError && (
                <div
                  style={{
                    padding:
                      "10px 12px",
                    background:
                      "#fef2f2",
                    border:
                      "1px solid #fecaca",
                    borderRadius:
                      "8px",
                    color:
                      "#991b1b",
                    fontSize:
                      "14px",
                  }}
                >
                  {actionError}
                </div>
              )}
            </div>


            {executedActionId && (
              <div
                style={{
                  marginTop: "20px",
                  padding: "18px",
                  border:
                    "1px solid #e2e8f0",
                  borderRadius: "10px",
                  background: "#ffffff",
                }}
              >
                <h3
                  style={{
                    margin:
                      "0 0 14px",
                    fontSize: "16px",
                  }}
                >
                  Record Action Outcome
                </h3>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "14px",
                  }}
                >
                  <label
                    style={{
                      display:
                        "flex",
                      flexDirection:
                        "column",
                      gap: "6px",
                    }}
                  >
                    <span
                      style={{
                        fontSize:
                          "13px",
                        fontWeight:
                          600,
                        color:
                          "#475569",
                      }}
                    >
                      Outcome
                    </span>

                    <select
                      value={outcome}
                      onChange={(
                        event,
                      ) =>
                        setOutcome(
                          event.target
                            .value,
                        )
                      }
                      style={{
                        padding:
                          "10px 12px",
                        border:
                          "1px solid #cbd5e1",
                        borderRadius:
                          "8px",
                        background:
                          "#ffffff",
                        color:
                          "#0f172a",
                      }}
                    >
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


                  <InputField
                    label="Revenue Saved"
                    value={
                      revenueSaved
                    }
                    onChange={
                      setRevenueSaved
                    }
                    type="number"
                    placeholder="e.g. 499.00"
                  />
                </div>


                <button
                  type="button"
                  onClick={
                    handleRecordOutcome
                  }
                  disabled={
                    outcomeLoading
                  }
                  style={{
                    marginTop:
                      "16px",
                    padding:
                      "11px 18px",
                    border: 0,
                    borderRadius:
                      "8px",
                    background:
                      "#0f172a",
                    color:
                      "#ffffff",
                    cursor:
                      outcomeLoading
                        ? "not-allowed"
                        : "pointer",
                    opacity:
                      outcomeLoading
                        ? 0.7
                        : 1,
                    fontWeight:
                      600,
                  }}
                >
                  {outcomeLoading
                    ? "Recording..."
                    : "Record Outcome"}
                </button>


                {outcomeSuccess && (
                  <div
                    style={{
                      marginTop:
                        "10px",
                      padding:
                        "10px 12px",
                      background:
                        "#f0fdf4",
                      border:
                        "1px solid #bbf7d0",
                      borderRadius:
                        "8px",
                      color:
                        "#166534",
                      fontSize:
                        "14px",
                    }}
                  >
                    {outcomeSuccess}
                  </div>
                )}


                {outcomeError && (
                  <div
                    style={{
                      marginTop:
                        "10px",
                      padding:
                        "10px 12px",
                      background:
                        "#fef2f2",
                      border:
                        "1px solid #fecaca",
                      borderRadius:
                        "8px",
                      color:
                        "#991b1b",
                      fontSize:
                        "14px",
                    }}
                  >
                    {outcomeError}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </section>


      <section
        style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "12px",
          padding: "22px",
        }}
      >
        <h2
          style={{
            margin: "0 0 18px",
            fontSize: "20px",
          }}
        >
          Customer Timeline
        </h2>

        {customer360.timeline.length === 0 ? (
          <div
            style={{
              color: "#64748b",
            }}
          >
            No customer events available.
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            {customer360.timeline.map(
              (event) => (
                <div
                  key={event.id}
                  style={{
                    padding:
                      "14px 16px",
                    background:
                      "#f8fafc",
                    border:
                      "1px solid #e2e8f0",
                    borderRadius:
                      "8px",
                  }}
                >
                  <div
                    style={{
                      fontWeight: 600,
                      color:
                        "#0f172a",
                    }}
                  >
                    {event.event_type}
                  </div>

                  {event.description && (
                    <div
                      style={{
                        marginTop:
                          "4px",
                        color:
                          "#475569",
                      }}
                    >
                      {
                        event.description
                      }
                    </div>
                  )}

                  <div
                    style={{
                      marginTop:
                        "6px",
                      fontSize:
                        "12px",
                      color:
                        "#94a3b8",
                    }}
                  >
                    {new Date(
                      event.created_at,
                    ).toLocaleString()}
                  </div>
                </div>
              ),
            )}
          </div>
        )}
      </section>
    </main>
  );
}
