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

import {
  getCustomerPriority,
  CustomerPriority,
} from "../../../lib/priority";

import {
  predictCustomerChurn,
  ChurnPrediction,
} from "../../../lib/ml";


export default function Customer360Page() {
  const params = useParams();
  const customerId = String(params.customerId);

  const [data, setData] =
    useState<Customer360 | null>(null);

  const [insight, setInsight] =
    useState<CustomerInsight | null>(null);

  const [nextBestAction, setNextBestAction] =
    useState<NextBestAction | null>(null);

  const [priority, setPriority] =
    useState<CustomerPriority | null>(null);

  const [prediction, setPrediction] =
    useState<ChurnPrediction | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [predicting, setPredicting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [predictionError, setPredictionError] =
    useState("");

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

        setData(customer360);
        setInsight(customerInsight);
        setNextBestAction(
          customerNextBestAction,
        );
        setPriority(customerPriority);

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


  async function handlePrediction() {
    const organizationId =
      localStorage.getItem(
        "organization_id",
      );

    if (!organizationId || !data) {
      setPredictionError(
        "Customer or organization information is unavailable.",
      );
      return;
    }

    if (
      !tenure &&
      !monthlyCharges &&
      !totalCharges &&
      !contract &&
      !paymentMethod &&
      !internetService &&
      !onlineSecurity &&
      !techSupport
    ) {
      setPredictionError(
        "Enter at least one customer feature before running the prediction.",
      );
      return;
    }

    setPredicting(true);
    setPredictionError("");

    try {
      const result =
        await predictCustomerChurn(
          customerId,
          organizationId,
          {
            tenure: tenure
              ? Number(tenure)
              : undefined,

            monthly_charges:
              monthlyCharges
                ? Number(monthlyCharges)
                : undefined,

            total_charges:
              totalCharges
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
          },
        );

      setPrediction(result);

    } catch (requestError) {
      setPredictionError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to generate churn prediction.",
      );
    } finally {
      setPredicting(false);
    }
  }


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
            title="Priority"
            value={
              priority
                ? priority.priority_level
                : "Unavailable"
            }
          />

          <InfoCard
            title="Priority Score"
            value={
              priority
                ? priority.priority_score.toFixed(
                    3,
                  )
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
            ML Churn Prediction
          </h2>

          <p
            style={{
              color: "#64748b",
            }}
          >
            Enter available customer
            data and run the trained
            churn model.
          </p>


          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "14px",
              marginTop: "18px",
            }}
          >
            <InputField
              label="Tenure"
              value={tenure}
              onChange={setTenure}
              type="number"
              placeholder="e.g. 24"
            />

            <InputField
              label="Monthly Charges"
              value={monthlyCharges}
              onChange={setMonthlyCharges}
              type="number"
              placeholder="e.g. 79.50"
            />

            <InputField
              label="Total Charges"
              value={totalCharges}
              onChange={setTotalCharges}
              type="number"
              placeholder="e.g. 1908"
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
              placeholder="e.g. Yes / No"
            />

            <InputField
              label="Tech Support"
              value={techSupport}
              onChange={setTechSupport}
              placeholder="e.g. Yes / No"
            />
          </div>


          <button
            type="button"
            onClick={handlePrediction}
            disabled={predicting}
            style={{
              marginTop: "20px",
              padding:
                "10px 16px",
              border: "none",
              borderRadius: "8px",
              background:
                "#0f172a",
              color: "white",
              fontWeight: 600,
              cursor:
                predicting
                  ? "not-allowed"
                  : "pointer",
              opacity:
                predicting
                  ? 0.6
                  : 1,
            }}
          >
            {predicting
              ? "Predicting..."
              : "Run Churn Prediction"}
          </button>


          {predictionError && (
            <p
              style={{
                marginTop: "16px",
                color: "#b91c1c",
              }}
            >
              {predictionError}
            </p>
          )}


          {prediction && (
            <div
              style={{
                marginTop: "20px",
                padding: "16px",
                background:
                  "#f8fafc",
                border:
                  "1px solid #e2e8f0",
                borderRadius: "8px",
              }}
            >
              <p>
                <strong>
                  Churn Probability:
                </strong>{" "}
                {(
                  prediction.churn_probability *
                  100
                ).toFixed(1)}
                %
              </p>

              <p>
                <strong>
                  Risk Level:
                </strong>{" "}
                {prediction.risk_level}
              </p>

              <small
                style={{
                  color:
                    "#64748b",
                }}
              >
                Prediction generated{" "}
                {new Date(
                  prediction.created_at,
                ).toLocaleString()}
              </small>
            </div>
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
            AI Insight
          </h2>

          <p>
            {insight?.summary ||
              "No insight available."}
          </p>

          {insight?.risk_factors
            ?.length ? (
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
                color:
                  "#64748b",
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
                  {
                    nextBestAction.action
                  }
                </strong>
              </p>

              <p>
                {
                  nextBestAction.reason ||
                  "No reason provided."
                }
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
                color:
                  "#64748b",
              }}
            >
              No recommended action
              is available yet.
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

          {data.timeline.length ===
          0 ? (
            <p
              style={{
                color:
                  "#64748b",
              }}
            >
              No customer events
              recorded.
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
                      {
                        event.event_type
                      }
                    </strong>

                    <p>
                      {
                        event.description ||
                        "No description"
                      }
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
        display: "grid",
        gap: "6px",
      }}
    >
      <span
        style={{
          fontSize: "14px",
          fontWeight: 600,
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
          border:
            "1px solid #cbd5e1",
          borderRadius: "8px",
          outline: "none",
        }}
      />
    </label>
  );
}
