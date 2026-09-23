"use client";

import { useEffect, useState } from "react";

import {
  createCampaign,
  executeCampaign,
  getCampaignAnalytics,
  getCampaigns,
  targetCampaignCustomers,
  updateCampaignStatus,
  type Campaign,
  type CampaignAnalytics,
} from "@/lib/campaigns";


const ACTION_TYPES = [
  {
    value: "retention_outreach",
    label: "Retention Outreach",
  },
  {
    value: "review_plan_value",
    label: "Review Plan Value",
  },
  {
    value: "contract_retention",
    label: "Contract Retention",
  },
  {
    value: "customer_engagement",
    label: "Customer Engagement",
  },
  {
    value: "payment_support",
    label: "Payment Support",
  },
  {
    value: "security_value_offer",
    label: "Security Value Offer",
  },
  {
    value: "support_outreach",
    label: "Support Outreach",
  },
];


const SEGMENTS = [
  {
    value: "critical_risk",
    label: "Critical Risk",
  },
  {
    value: "high_risk",
    label: "High Risk",
  },
  {
    value: "medium_risk",
    label: "Medium Risk",
  },
  {
    value: "low_risk",
    label: "Low Risk",
  },
  {
    value: "all_customers",
    label: "All Customers",
  },
];


function StatusBadge({
  status,
}: {
  status: string;
}) {
  const normalized =
    status.toLowerCase();

  const styles: Record<
    string,
    {
      background: string;
      color: string;
    }
  > = {
    draft: {
      background: "#f1f5f9",
      color: "#475569",
    },
    scheduled: {
      background: "#dbeafe",
      color: "#1d4ed8",
    },
    active: {
      background: "#dcfce7",
      color: "#166534",
    },
    paused: {
      background: "#fef3c7",
      color: "#92400e",
    },
    completed: {
      background: "#e0e7ff",
      color: "#3730a3",
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


function ActionLabel({
  actionType,
}: {
  actionType: string;
}) {
  return (
    <span
      style={{
        textTransform: "capitalize",
      }}
    >
      {actionType.replace(
        /_/g,
        " ",
      )}
    </span>
  );
}


function Metric({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div
      style={{
        minWidth: "100px",
      }}
    >
      <div
        style={{
          fontSize: "11px",
          color: "#94a3b8",
          textTransform: "uppercase",
          letterSpacing: "0.04em",
        }}
      >
        {label}
      </div>

      <div
        style={{
          marginTop: "4px",
          fontSize: "18px",
          fontWeight: 700,
          color: "#0f172a",
        }}
      >
        {value}
      </div>
    </div>
  );
}


function AnalyticsPanel({
  analytics,
}: {
  analytics: CampaignAnalytics;
}) {
  const saveRate =
    `${(
      analytics.save_rate * 100
    ).toFixed(1)}%`;

  return (
    <div
      style={{
        marginTop: "18px",
        padding: "18px",
        background: "#f8fafc",
        borderRadius: "10px",
        border:
          "1px solid #e2e8f0",
      }}
    >
      <div
        style={{
          fontSize: "14px",
          fontWeight: 700,
          color: "#0f172a",
          marginBottom: "14px",
        }}
      >
        Campaign Performance
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(100px, 1fr))",
          gap: "16px",
        }}
      >
        <Metric
          label="Targeted"
          value={
            analytics.targeted_customers
          }
        />

        <Metric
          label="Actions"
          value={
            analytics.actions_created
          }
        />

        <Metric
          label="Executed"
          value={
            analytics.actions_executed
          }
        />

        <Metric
          label="Outcomes"
          value={
            analytics.outcomes_recorded
          }
        />

        <Metric
          label="Saved"
          value={analytics.saved}
        />

        <Metric
          label="Not Saved"
          value={
            analytics.not_saved
          }
        />

        <Metric
          label="No Response"
          value={
            analytics.no_response
          }
        />

        <Metric
          label="Save Rate"
          value={saveRate}
        />

        <Metric
          label="Revenue Saved"
          value={`₹${analytics.revenue_saved.toLocaleString(
            "en-IN",
          )}`}
        />
      </div>
    </div>
  );
}


export default function CampaignsPage() {
  const [
    organizationId,
    setOrganizationId,
  ] = useState("");

  const [
    campaigns,
    setCampaigns,
  ] = useState<Campaign[]>([]);

  const [
    analytics,
    setAnalytics,
  ] = useState<
    Record<string, CampaignAnalytics>
  >({});

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    loadingAnalytics,
    setLoadingAnalytics,
  ] = useState<string | null>(null);

  const [
    executingCampaignId,
    setExecutingCampaignId,
  ] = useState<string | null>(
    null,
  );

  const [
    error,
    setError,
  ] = useState<string | null>(null);

  const [
    success,
    setSuccess,
  ] = useState<string | null>(null);

  const [
    name,
    setName,
  ] = useState("");

  const [
    description,
    setDescription,
  ] = useState("");

  const [
    actionType,
    setActionType,
  ] = useState(
    "retention_outreach",
  );

  const [
    targetSegment,
    setTargetSegment,
  ] = useState(
    "high_risk",
  );


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


  async function loadCampaigns() {
    if (!organizationId) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result =
        await getCampaigns(
          organizationId,
        );

      setCampaigns(result);
    } catch (campaignError) {
      setError(
        campaignError instanceof Error
          ? campaignError.message
          : "Unable to load campaigns.",
      );
    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    loadCampaigns();
  }, [organizationId]);


  async function handleLoadAnalytics(
    campaignId: string,
  ) {
    if (!organizationId) {
      return;
    }

    try {
      setLoadingAnalytics(
        campaignId,
      );
      setError(null);

      const result =
        await getCampaignAnalytics(
          campaignId,
          organizationId,
        );

      setAnalytics(
        (current) => ({
          ...current,
          [campaignId]:
            result,
        }),
      );
    } catch (analyticsError) {
      setError(
        analyticsError instanceof Error
          ? analyticsError.message
          : "Unable to load campaign analytics.",
      );
    } finally {
      setLoadingAnalytics(null);
    }
  }


  async function handleCreateCampaign(
    event: React.FormEvent,
  ) {
    event.preventDefault();

    if (!organizationId) {
      setError(
        "Organization is not selected.",
      );
      return;
    }

    if (!name.trim()) {
      setError(
        "Campaign name is required.",
      );
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);

      const campaign =
        await createCampaign({
          organization_id:
            organizationId,
          name: name.trim(),
          description:
            description.trim() ||
            undefined,
          action_type:
            actionType,
          target_segment:
            targetSegment,
        });

      const targetResult =
        await targetCampaignCustomers(
          campaign.id,
          organizationId,
          targetSegment,
        );

      setName("");
      setDescription("");

      setSuccess(
        `Campaign created and ${targetResult.added} customers targeted.`,
      );

      await loadCampaigns();
    } catch (campaignError) {
      setError(
        campaignError instanceof Error
          ? campaignError.message
          : "Unable to create campaign.",
      );
    } finally {
      setSubmitting(false);
    }
  }


  async function handleStatusChange(
    campaign: Campaign,
    status: string,
  ) {
    try {
      setError(null);
      setSuccess(null);

      await updateCampaignStatus(
        campaign.id,
        organizationId,
        status,
      );

      setSuccess(
        `Campaign ${status}.`,
      );

      await loadCampaigns();

      if (
        analytics[campaign.id]
      ) {
        await handleLoadAnalytics(
          campaign.id,
        );
      }
    } catch (statusError) {
      setError(
        statusError instanceof Error
          ? statusError.message
          : "Unable to update campaign.",
      );
    }
  }


  async function handleExecuteCampaign(
    campaign: Campaign,
  ) {
    try {
      setExecutingCampaignId(
        campaign.id,
      );
      setError(null);
      setSuccess(null);

      const result =
        await executeCampaign(
          campaign.id,
          organizationId,
        );

      setSuccess(
        `Campaign executed. ${result.created_actions} retention actions created.`,
      );

      await loadCampaigns();

      await handleLoadAnalytics(
        campaign.id,
      );
    } catch (executionError) {
      setError(
        executionError instanceof Error
          ? executionError.message
          : "Unable to execute campaign.",
      );
    } finally {
      setExecutingCampaignId(null);
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
        Loading campaigns...
      </main>
    );
  }


  if (error && !organizationId) {
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
          Campaigns
        </h1>

        <p
          style={{
            marginTop: "8px",
            color: "#64748b",
          }}
        >
          Create targeted retention
          campaigns and measure their
          customer impact.
        </p>
      </header>


      {error && (
        <div
          style={{
            marginBottom: "16px",
            padding: "12px 14px",
            background: "#fef2f2",
            border:
              "1px solid #fecaca",
            borderRadius: "10px",
            color: "#991b1b",
            fontSize: "14px",
          }}
        >
          {error}
        </div>
      )}


      {success && (
        <div
          style={{
            marginBottom: "16px",
            padding: "12px 14px",
            background: "#f0fdf4",
            border:
              "1px solid #bbf7d0",
            borderRadius: "10px",
            color: "#166534",
            fontSize: "14px",
          }}
        >
          {success}
        </div>
      )}


      <section
        style={{
          background: "#ffffff",
          border:
            "1px solid #e2e8f0",
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "28px",
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: "19px",
            color: "#0f172a",
          }}
        >
          Create Campaign
        </h2>

        <p
          style={{
            marginTop: "6px",
            marginBottom: "20px",
            color: "#64748b",
            fontSize: "14px",
          }}
        >
          Select a risk segment and
          define the retention action
          for those customers.
        </p>

        <form
          onSubmit={
            handleCreateCampaign
          }
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "14px",
            }}
          >
            <label>
              <div
                style={{
                  fontSize: "12px",
                  color: "#64748b",
                  marginBottom: "6px",
                }}
              >
                Campaign name
              </div>

              <input
                value={name}
                onChange={(event) =>
                  setName(
                    event.target.value,
                  )
                }
                placeholder="High Risk Retention"
                style={{
                  width: "100%",
                  padding: "10px 11px",
                  border:
                    "1px solid #cbd5e1",
                  borderRadius: "8px",
                }}
              />
            </label>

            <label>
              <div
                style={{
                  fontSize: "12px",
                  color: "#64748b",
                  marginBottom: "6px",
                }}
              >
                Retention action
              </div>

              <select
                value={actionType}
                onChange={(event) =>
                  setActionType(
                    event.target.value,
                  )
                }
                style={{
                  width: "100%",
                  padding: "10px 11px",
                  border:
                    "1px solid #cbd5e1",
                  borderRadius: "8px",
                  background:
                    "#ffffff",
                }}
              >
                {ACTION_TYPES.map(
                  (action) => (
                    <option
                      key={
                        action.value
                      }
                      value={
                        action.value
                      }
                    >
                      {action.label}
                    </option>
                  ),
                )}
              </select>
            </label>

            <label>
              <div
                style={{
                  fontSize: "12px",
                  color: "#64748b",
                  marginBottom: "6px",
                }}
              >
                Target segment
              </div>

              <select
                value={
                  targetSegment
                }
                onChange={(event) =>
                  setTargetSegment(
                    event.target.value,
                  )
                }
                style={{
                  width: "100%",
                  padding: "10px 11px",
                  border:
                    "1px solid #cbd5e1",
                  borderRadius: "8px",
                  background:
                    "#ffffff",
                }}
              >
                {SEGMENTS.map(
                  (segment) => (
                    <option
                      key={
                        segment.value
                      }
                      value={
                        segment.value
                      }
                    >
                      {segment.label}
                    </option>
                  ),
                )}
              </select>
            </label>
          </div>

          <label
            style={{
              display: "block",
              marginTop: "14px",
            }}
          >
            <div
              style={{
                fontSize: "12px",
                color: "#64748b",
                marginBottom: "6px",
              }}
            >
              Description
            </div>

            <textarea
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value,
                )
              }
              placeholder="Describe what this campaign should accomplish."
              rows={3}
              style={{
                width: "100%",
                padding: "10px 11px",
                border:
                  "1px solid #cbd5e1",
                borderRadius: "8px",
                resize: "vertical",
              }}
            />
          </label>

          <button
            type="submit"
            disabled={submitting}
            style={{
              marginTop: "16px",
              border: "none",
              borderRadius: "8px",
              padding: "11px 18px",
              background:
                submitting
                  ? "#94a3b8"
                  : "#0f172a",
              color: "#ffffff",
              cursor: submitting
                ? "not-allowed"
                : "pointer",
              fontWeight: 600,
            }}
          >
            {submitting
              ? "Creating..."
              : "Create Campaign"}
          </button>
        </form>
      </section>


      <section>
        <div
          style={{
            marginBottom: "14px",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "20px",
              color: "#0f172a",
            }}
          >
            Campaigns
          </h2>

          <p
            style={{
              margin:
                "5px 0 0",
              color: "#64748b",
              fontSize: "14px",
            }}
          >
            {campaigns.length} campaign
            {campaigns.length === 1
              ? ""
              : "s"}
          </p>
        </div>


        {campaigns.length === 0 ? (
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
            No campaigns created yet.
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gap: "14px",
            }}
          >
            {campaigns.map(
              (campaign) => {
                const campaignAnalytics =
                  analytics[
                    campaign.id
                  ];

                return (
                  <div
                    key={campaign.id}
                    style={{
                      background:
                        "#ffffff",
                      border:
                        "1px solid #e2e8f0",
                      borderRadius:
                        "12px",
                      padding: "20px",
                    }}
                  >
                    <div
                      style={{
                        display:
                          "flex",
                        justifyContent:
                          "space-between",
                        alignItems:
                          "flex-start",
                        gap: "16px",
                        flexWrap:
                          "wrap",
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
                            display:
                              "flex",
                            alignItems:
                              "center",
                            gap: "10px",
                            flexWrap:
                              "wrap",
                          }}
                        >
                          <h3
                            style={{
                              margin: 0,
                              fontSize:
                                "18px",
                              color:
                                "#0f172a",
                            }}
                          >
                            {
                              campaign.name
                            }
                          </h3>

                          <StatusBadge
                            status={
                              campaign.status
                            }
                          />
                        </div>

                        {campaign.description && (
                          <p
                            style={{
                              margin:
                                "8px 0 0",
                              color:
                                "#64748b",
                              fontSize:
                                "14px",
                            }}
                          >
                            {
                              campaign.description
                            }
                          </p>
                        )}
                      </div>

                      <div
                        style={{
                          fontSize:
                            "13px",
                          color:
                            "#64748b",
                        }}
                      >
                        {
                          campaign.customer_count ??
                          0
                        }{" "}
                        customers
                      </div>
                    </div>


                    <div
                      style={{
                        display:
                          "flex",
                        gap: "20px",
                        flexWrap:
                          "wrap",
                        marginTop:
                          "16px",
                        paddingTop:
                          "16px",
                        borderTop:
                          "1px solid #f1f5f9",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize:
                              "11px",
                            color:
                              "#94a3b8",
                            textTransform:
                              "uppercase",
                            letterSpacing:
                              "0.04em",
                          }}
                        >
                          Action
                        </div>

                        <div
                          style={{
                            marginTop:
                              "4px",
                            fontSize:
                              "14px",
                            fontWeight:
                              600,
                            color:
                              "#334155",
                          }}
                        >
                          <ActionLabel
                            actionType={
                              campaign.action_type
                            }
                          />
                        </div>
                      </div>

                      <div>
                        <div
                          style={{
                            fontSize:
                              "11px",
                            color:
                              "#94a3b8",
                            textTransform:
                              "uppercase",
                            letterSpacing:
                              "0.04em",
                          }}
                        >
                          Segment
                        </div>

                        <div
                          style={{
                            marginTop:
                              "4px",
                            fontSize:
                              "14px",
                            fontWeight:
                              600,
                            color:
                              "#334155",
                            textTransform:
                              "capitalize",
                          }}
                        >
                          {(
                            campaign.target_segment ||
                            "Not set"
                          ).replace(
                            /_/g,
                            " ",
                          )}
                        </div>
                      </div>
                    </div>


                    <div
                      style={{
                        display:
                          "flex",
                        gap: "8px",
                        flexWrap:
                          "wrap",
                        marginTop:
                          "18px",
                      }}
                    >
                      {campaign.status ===
                        "draft" && (
                        <button
                          type="button"
                          onClick={() =>
                            handleStatusChange(
                              campaign,
                              "active",
                            )
                          }
                          style={{
                            border:
                              "none",
                            borderRadius:
                              "8px",
                            padding:
                              "9px 14px",
                            background:
                              "#16a34a",
                            color:
                              "#ffffff",
                            cursor:
                              "pointer",
                            fontWeight:
                              600,
                          }}
                        >
                          Activate
                        </button>
                      )}

                      {campaign.status ===
                        "active" && (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              handleExecuteCampaign(
                                campaign,
                              )
                            }
                            disabled={
                              executingCampaignId ===
                              campaign.id
                            }
                            style={{
                              border:
                                "none",
                              borderRadius:
                                "8px",
                              padding:
                                "9px 14px",
                              background:
                                executingCampaignId ===
                                campaign.id
                                  ? "#94a3b8"
                                  : "#2563eb",
                              color:
                                "#ffffff",
                              cursor:
                                executingCampaignId ===
                                campaign.id
                                  ? "not-allowed"
                                  : "pointer",
                              fontWeight:
                                600,
                            }}
                          >
                            {executingCampaignId ===
                            campaign.id
                              ? "Executing..."
                              : "Execute Campaign"}
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleStatusChange(
                                campaign,
                                "paused",
                              )
                            }
                            style={{
                              border:
                                "1px solid #cbd5e1",
                              borderRadius:
                                "8px",
                              padding:
                                "9px 14px",
                              background:
                                "#ffffff",
                              color:
                                "#334155",
                              cursor:
                                "pointer",
                              fontWeight:
                                600,
                            }}
                          >
                            Pause
                          </button>
                        </>
                      )}

                      {campaign.status ===
                        "paused" && (
                        <button
                          type="button"
                          onClick={() =>
                            handleStatusChange(
                              campaign,
                              "active",
                            )
                          }
                          style={{
                            border:
                              "none",
                            borderRadius:
                              "8px",
                            padding:
                              "9px 14px",
                            background:
                              "#16a34a",
                            color:
                              "#ffffff",
                            cursor:
                              "pointer",
                            fontWeight:
                              600,
                          }}
                        >
                          Resume
                        </button>
                      )}

                      {(campaign.status ===
                        "active" ||
                        campaign.status ===
                          "paused") && (
                        <button
                          type="button"
                          onClick={() =>
                            handleStatusChange(
                              campaign,
                              "completed",
                            )
                          }
                          style={{
                            border:
                              "1px solid #cbd5e1",
                            borderRadius:
                              "8px",
                            padding:
                              "9px 14px",
                            background:
                              "#ffffff",
                            color:
                              "#334155",
                            cursor:
                              "pointer",
                            fontWeight:
                              600,
                          }}
                        >
                          Complete
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          handleLoadAnalytics(
                            campaign.id,
                          )
                        }
                        disabled={
                          loadingAnalytics ===
                          campaign.id
                        }
                        style={{
                          border:
                            "1px solid #cbd5e1",
                          borderRadius:
                            "8px",
                          padding:
                            "9px 14px",
                          background:
                            "#ffffff",
                          color:
                            "#334155",
                          cursor:
                            loadingAnalytics ===
                            campaign.id
                              ? "not-allowed"
                              : "pointer",
                          fontWeight:
                            600,
                        }}
                      >
                        {loadingAnalytics ===
                        campaign.id
                          ? "Loading..."
                          : campaignAnalytics
                            ? "Refresh Analytics"
                            : "View Analytics"}
                      </button>
                    </div>


                    {campaignAnalytics && (
                      <AnalyticsPanel
                        analytics={
                          campaignAnalytics
                        }
                      />
                    )}
                  </div>
                );
              },
            )}
          </div>
        )}
      </section>
    </main>
  );
}
