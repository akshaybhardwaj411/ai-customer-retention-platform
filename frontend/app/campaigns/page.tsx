"use client";

import { FormEvent, useEffect, useState } from "react";

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
    value: "retention_offer",
    label: "Retention Offer",
  },
  {
    value: "personal_outreach",
    label: "Personal Outreach",
  },
  {
    value: "support_followup",
    label: "Support Follow-up",
  },
  {
    value: "discount",
    label: "Discount",
  },
  {
    value: "plan_upgrade",
    label: "Plan Upgrade",
  },
];


const TARGET_SEGMENTS = [
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
      background: "#e2e8f0",
      color: "#334155",
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


function MetricCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "10px",
        padding: "14px",
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
          marginTop: "6px",
          fontSize: "22px",
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
  return (
    <div
      style={{
        marginTop: "14px",
        padding: "16px",
        background: "#f8fafc",
        border: "1px solid #e2e8f0",
        borderRadius: "10px",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(140px, 1fr))",
          gap: "10px",
        }}
      >
        <MetricCard
          label="Targeted"
          value={
            analytics.targeted_customers
          }
        />

        <MetricCard
          label="Actions Created"
          value={
            analytics.actions_created
          }
        />

        <MetricCard
          label="Executed"
          value={
            analytics.actions_executed
          }
        />

        <MetricCard
          label="Outcomes"
          value={
            analytics.outcomes_recorded
          }
        />

        <MetricCard
          label="Saved"
          value={analytics.saved}
        />

        <MetricCard
          label="Not Saved"
          value={analytics.not_saved}
        />

        <MetricCard
          label="No Response"
          value={
            analytics.no_response
          }
        />

        <MetricCard
          label="Save Rate"
          value={`${analytics.save_rate.toFixed(
            1,
          )}%`}
        />

        <MetricCard
          label="Revenue Saved"
          value={`$${analytics.revenue_saved.toFixed(
            2,
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
    loading,
    setLoading,
  ] = useState(true);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(null);

  const [
    successMessage,
    setSuccessMessage,
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
    ACTION_TYPES[0].value,
  );

  const [
    targetSegment,
    setTargetSegment,
  ] = useState(
    TARGET_SEGMENTS[0].value,
  );

  const [
    startDate,
    setStartDate,
  ] = useState("");

  const [
    endDate,
    setEndDate,
  ] = useState("");

  const [
    analytics,
    setAnalytics,
  ] = useState<
    Record<string, CampaignAnalytics>
  >({});

  const [
    analyticsLoading,
    setAnalyticsLoading,
  ] = useState<
    Record<string, boolean>
  >({});


  useEffect(() => {
    const storedOrganizationId =
      window.localStorage.getItem(
        "organization_id",
      );

    if (!storedOrganizationId) {
      setError(
        "Organization is not selected. Please complete organization setup first.",
      );
      setLoading(false);
      return;
    }

    setOrganizationId(
      storedOrganizationId,
    );
  }, []);


  useEffect(() => {
    if (!organizationId) {
      return;
    }

    loadCampaigns();
  }, [organizationId]);


  async function loadCampaigns() {
    try {
      setLoading(true);
      setError(null);

      const result =
        await getCampaigns(
          organizationId,
        );

      setCampaigns(result);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load campaigns.",
      );
    } finally {
      setLoading(false);
    }
  }


  async function handleCreateCampaign(
    event: FormEvent<HTMLFormElement>,
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

    if (
      startDate &&
      endDate &&
      new Date(endDate) <
        new Date(startDate)
    ) {
      setError(
        "End date cannot be earlier than start date.",
      );
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setSuccessMessage(null);

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
          start_date:
            startDate
              ? new Date(
                  startDate,
                ).toISOString()
              : undefined,
          end_date:
            endDate
              ? new Date(
                  endDate,
                ).toISOString()
              : undefined,
        });

      try {
        await targetCampaignCustomers(
          campaign.id,
          organizationId,
          targetSegment,
        );
      } catch (targetError) {
        setSuccessMessage(
          `Campaign "${campaign.name}" was created, but customer targeting could not be completed.`,
        );

        await loadCampaigns();

        throw targetError;
      }

      setName("");
      setDescription("");
      setStartDate("");
      setEndDate("");

      setSuccessMessage(
        `Campaign "${campaign.name}" was created and customers were targeted.`,
      );

      await loadCampaigns();
    } catch (createError) {
      setError(
        createError instanceof Error
          ? createError.message
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
      setSuccessMessage(null);

      const updated =
        await updateCampaignStatus(
          campaign.id,
          organizationId,
          status,
        );

      setCampaigns(
        (current) =>
          current.map((item) =>
            item.id === updated.id
              ? updated
              : item,
          ),
      );

      setSuccessMessage(
        `Campaign "${campaign.name}" is now ${status}.`,
      );
    } catch (statusError) {
      setError(
        statusError instanceof Error
          ? statusError.message
          : "Unable to update campaign status.",
      );
    }
  }


  async function handleExecuteCampaign(
    campaign: Campaign,
  ) {
    try {
      setError(null);
      setSuccessMessage(null);

      const result =
        await executeCampaign(
          campaign.id,
          organizationId,
        );

      setSuccessMessage(
        `${result.created_actions} retention action(s) created for "${campaign.name}".`,
      );

      await loadCampaigns();

      await loadAnalytics(
        campaign.id,
      );
    } catch (executeError) {
      setError(
        executeError instanceof Error
          ? executeError.message
          : "Unable to execute campaign.",
      );
    }
  }


  async function loadAnalytics(
    campaignId: string,
  ) {
    try {
      setAnalyticsLoading(
        (current) => ({
          ...current,
          [campaignId]: true,
        }),
      );

      const result =
        await getCampaignAnalytics(
          campaignId,
          organizationId,
        );

      setAnalytics(
        (current) => ({
          ...current,
          [campaignId]: result,
        }),
      );
    } catch (analyticsError) {
      setError(
        analyticsError instanceof Error
          ? analyticsError.message
          : "Unable to load campaign analytics.",
      );
    } finally {
      setAnalyticsLoading(
        (current) => ({
          ...current,
          [campaignId]: false,
        }),
      );
    }
  }


  function toggleAnalytics(
    campaignId: string,
  ) {
    if (analytics[campaignId]) {
      setAnalytics(
        (current) => {
          const next = {
            ...current,
          };

          delete next[campaignId];

          return next;
        },
      );

      return;
    }

    loadAnalytics(campaignId);
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


  if (!organizationId) {
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
          {error ||
            "Organization is not selected."}
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
            fontSize: "30px",
            color: "#0f172a",
          }}
        >
          Campaigns
        </h1>

        <p
          style={{
            marginTop: "8px",
            color: "#64748b",
            maxWidth: "700px",
          }}
        >
          Create targeted retention campaigns,
          execute actions, and measure customer
          outcomes.
        </p>
      </header>


      {error && (
        <div
          style={{
            marginBottom: "18px",
            padding: "14px 16px",
            background: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "10px",
            color: "#991b1b",
          }}
        >
          {error}
        </div>
      )}


      {successMessage && (
        <div
          style={{
            marginBottom: "18px",
            padding: "14px 16px",
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            borderRadius: "10px",
            color: "#166534",
          }}
        >
          {successMessage}
        </div>
      )}


      <section
        style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "12px",
          padding: "22px",
          marginBottom: "28px",
        }}
      >
        <div
          style={{
            marginBottom: "18px",
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
              marginBottom: 0,
              fontSize: "13px",
              color: "#64748b",
            }}
          >
            Define the audience, retention action,
            and campaign schedule.
          </p>
        </div>


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
                placeholder="e.g. High Risk Save Campaign"
                style={{
                  width: "100%",
                  padding: "10px 11px",
                  border:
                    "1px solid #cbd5e1",
                  borderRadius: "8px",
                  boxSizing: "border-box",
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
                Action type
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
                  background: "#ffffff",
                  boxSizing: "border-box",
                }}
              >
                {ACTION_TYPES.map(
                  (option) => (
                    <option
                      key={option.value}
                      value={
                        option.value
                      }
                    >
                      {option.label}
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
                value={targetSegment}
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
                  background: "#ffffff",
                  boxSizing: "border-box",
                }}
              >
                {TARGET_SEGMENTS.map(
                  (option) => (
                    <option
                      key={option.value}
                      value={
                        option.value
                      }
                    >
                      {option.label}
                    </option>
                  ),
                )}
              </select>
            </label>
          </div>


          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "14px",
              marginTop: "14px",
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
                Start date
              </div>

              <input
                type="datetime-local"
                value={startDate}
                onChange={(event) =>
                  setStartDate(
                    event.target.value,
                  )
                }
                style={{
                  width: "100%",
                  padding: "10px 11px",
                  border:
                    "1px solid #cbd5e1",
                  borderRadius: "8px",
                  boxSizing: "border-box",
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
                End date
              </div>

              <input
                type="datetime-local"
                value={endDate}
                onChange={(event) =>
                  setEndDate(
                    event.target.value,
                  )
                }
                style={{
                  width: "100%",
                  padding: "10px 11px",
                  border:
                    "1px solid #cbd5e1",
                  borderRadius: "8px",
                  boxSizing: "border-box",
                }}
              />
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
              placeholder="Describe the retention goal and campaign context."
              rows={3}
              style={{
                width: "100%",
                padding: "10px 11px",
                border:
                  "1px solid #cbd5e1",
                borderRadius: "8px",
                resize: "vertical",
                boxSizing: "border-box",
              }}
            />
          </label>


          <div
            style={{
              marginTop: "16px",
            }}
          >
            <button
              type="submit"
              disabled={submitting}
              style={{
                border: "none",
                borderRadius: "8px",
                padding: "10px 16px",
                background: submitting
                  ? "#94a3b8"
                  : "#2563eb",
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
          </div>
        </form>
      </section>


      <section>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent:
              "space-between",
            gap: "12px",
            marginBottom: "14px",
          }}
        >
          <div>
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
                marginTop: "5px",
                marginBottom: 0,
                fontSize: "13px",
                color: "#64748b",
              }}
            >
              Manage campaign lifecycle,
              execution, and performance.
            </p>
          </div>

          <button
            type="button"
            onClick={loadCampaigns}
            style={{
              border:
                "1px solid #cbd5e1",
              borderRadius: "8px",
              padding: "9px 14px",
              background: "#ffffff",
              color: "#334155",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Refresh
          </button>
        </div>


        {campaigns.length === 0 ? (
          <div
            style={{
              background: "#ffffff",
              border:
                "1px solid #e2e8f0",
              borderRadius: "12px",
              padding: "42px 20px",
              textAlign: "center",
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
              (campaign) => (
                <article
                  key={campaign.id}
                  style={{
                    background:
                      "#ffffff",
                    border:
                      "1px solid #e2e8f0",
                    borderRadius: "12px",
                    padding: "20px",
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
                      flexWrap:
                        "wrap",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          display:
                            "flex",
                          alignItems:
                            "center",
                          gap: "9px",
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
                            marginTop:
                              "7px",
                            marginBottom:
                              0,
                            color:
                              "#64748b",
                            fontSize:
                              "13px",
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
                      targeted
                    </div>
                  </div>


                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(160px, 1fr))",
                      gap: "10px",
                      marginTop: "18px",
                    }}
                  >
                    <MetricCard
                      label="Segment"
                      value={(
                        campaign.target_segment ||
                        "Not set"
                      ).replace(
                        /_/g,
                        " ",
                      )}
                    />

                    <MetricCard
                      label="Action"
                      value={campaign.action_type.replace(
                        /_/g,
                        " ",
                      )}
                    />

                    <MetricCard
                      label="Start"
                      value={
                        campaign.start_date
                          ? new Date(
                              campaign.start_date,
                            ).toLocaleString()
                          : "Not set"
                      }
                    />

                    <MetricCard
                      label="End"
                      value={
                        campaign.end_date
                          ? new Date(
                              campaign.end_date,
                            ).toLocaleString()
                          : "Not set"
                      }
                    />
                  </div>


                  <div
                    style={{
                      display: "flex",
                      flexWrap:
                        "wrap",
                      gap: "8px",
                      marginTop: "18px",
                    }}
                  >
                    {campaign.status ===
                      "draft" && (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            handleStatusChange(
                              campaign,
                              "scheduled",
                            )
                          }
                          style={{
                            border:
                              "1px solid #2563eb",
                            borderRadius:
                              "8px",
                            padding:
                              "9px 14px",
                            background:
                              "#ffffff",
                            color:
                              "#2563eb",
                            cursor:
                              "pointer",
                            fontWeight:
                              600,
                          }}
                        >
                          Schedule
                        </button>

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
                      </>
                    )}


                    {campaign.status ===
                      "scheduled" && (
                      <>
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
                      "active" && (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            handleExecuteCampaign(
                              campaign,
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
                              "#7c3aed",
                            color:
                              "#ffffff",
                            cursor:
                              "pointer",
                            fontWeight:
                              600,
                          }}
                        >
                          Execute Campaign
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
                      <>
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
                      </>
                    )}


                    <button
                      type="button"
                      onClick={() =>
                        toggleAnalytics(
                          campaign.id,
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
                      {analyticsLoading[
                        campaign.id
                      ]
                        ? "Loading..."
                        : analytics[
                              campaign.id
                            ]
                          ? "Hide Analytics"
                          : "View Analytics"}
                    </button>


                    <button
                      type="button"
                      onClick={() =>
                        window.location.href =
                          `/campaigns/${encodeURIComponent(
                            campaign.id,
                          )}`
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
                      View Customers
                    </button>
                  </div>


                  {analytics[
                    campaign.id
                  ] && (
                    <AnalyticsPanel
                      analytics={
                        analytics[
                          campaign.id
                        ]
                      }
                    />
                  )}
                </article>
              ),
            )}
          </div>
        )}
      </section>
    </main>
  );
}
