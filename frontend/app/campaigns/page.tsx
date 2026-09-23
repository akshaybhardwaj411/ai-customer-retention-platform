"use client";

import { FormEvent, useEffect, useState } from "react";

import {
  createCampaign,
  getCampaigns,
  targetCampaignCustomers,
  updateCampaignStatus,
  type Campaign,
} from "@/lib/campaigns";


const ACTION_TYPES = [
  "retention_outreach",
  "customer_engagement",
  "support_outreach",
  "review_plan_value",
  "contract_retention",
  "payment_support",
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
    styles[status] ||
    styles.draft;

  return (
    <span
      style={{
        display: "inline-block",
        padding: "5px 9px",
        borderRadius: "999px",
        fontSize: "12px",
        fontWeight: 600,
        background:
          style.background,
        color: style.color,
        textTransform:
          "capitalize",
      }}
    >
      {status}
    </span>
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
    creating,
    setCreating,
  ] = useState(false);

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
    ACTION_TYPES[0],
  );

  const [
    segment,
    setSegment,
  ] = useState(
    SEGMENTS[0].value,
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

      const data =
        await getCampaigns(
          organizationId,
        );

      setCampaigns(data);
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


  async function handleCreateCampaign(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!name.trim()) {
      setError(
        "Campaign name is required.",
      );
      return;
    }

    try {
      setCreating(true);
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
            segment,
        });

      await targetCampaignCustomers(
        campaign.id,
        organizationId,
        segment,
      );

      setName("");
      setDescription("");

      setSuccess(
        "Campaign created and customers targeted successfully.",
      );

      await loadCampaigns();
    } catch (campaignError) {
      setError(
        campaignError instanceof Error
          ? campaignError.message
          : "Unable to create campaign.",
      );
    } finally {
      setCreating(false);
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
        `Campaign moved to ${status}.`,
      );

      await loadCampaigns();
    } catch (statusError) {
      setError(
        statusError instanceof Error
          ? statusError.message
          : "Unable to update campaign.",
      );
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
          campaigns for customer segments.
        </p>
      </header>


      {error && (
        <div
          style={{
            marginBottom: "16px",
            padding: "12px",
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


      {success && (
        <div
          style={{
            marginBottom: "16px",
            padding: "12px",
            background: "#f0fdf4",
            border:
              "1px solid #bbf7d0",
            borderRadius: "8px",
            color: "#166534",
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
          padding: "22px",
          marginBottom: "28px",
        }}
      >
        <h2
          style={{
            margin:
              "0 0 18px",
            fontSize: "20px",
          }}
        >
          Create Campaign
        </h2>

        <form
          onSubmit={
            handleCreateCampaign
          }
          style={{
            display: "grid",
            gap: "14px",
          }}
        >
          <label>
            <div
              style={{
                fontSize: "13px",
                color: "#475569",
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
              placeholder="High Risk Retention Outreach"
              style={{
                width: "100%",
                padding: "11px",
                border:
                  "1px solid #cbd5e1",
                borderRadius: "8px",
              }}
            />
          </label>


          <label>
            <div
              style={{
                fontSize: "13px",
                color: "#475569",
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
              placeholder="Describe the retention campaign..."
              rows={3}
              style={{
                width: "100%",
                padding: "11px",
                border:
                  "1px solid #cbd5e1",
                borderRadius: "8px",
                resize: "vertical",
              }}
            />
          </label>


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
                  fontSize: "13px",
                  color: "#475569",
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
                  padding: "11px",
                  border:
                    "1px solid #cbd5e1",
                  borderRadius: "8px",
                  background:
                    "#ffffff",
                }}
              >
                {ACTION_TYPES.map(
                  (type) => (
                    <option
                      key={type}
                      value={type}
                    >
                      {type.replace(
                        /_/g,
                        " ",
                      )}
                    </option>
                  ),
                )}
              </select>
            </label>


            <label>
              <div
                style={{
                  fontSize: "13px",
                  color: "#475569",
                  marginBottom: "6px",
                }}
              >
                Target segment
              </div>

              <select
                value={segment}
                onChange={(event) =>
                  setSegment(
                    event.target.value,
                  )
                }
                style={{
                  width: "100%",
                  padding: "11px",
                  border:
                    "1px solid #cbd5e1",
                  borderRadius: "8px",
                  background:
                    "#ffffff",
                }}
              >
                {SEGMENTS.map(
                  (item) => (
                    <option
                      key={item.value}
                      value={item.value}
                    >
                      {item.label}
                    </option>
                  ),
                )}
              </select>
            </label>
          </div>


          <button
            type="submit"
            disabled={creating}
            style={{
              width: "fit-content",
              border: "none",
              borderRadius: "8px",
              padding:
                "11px 18px",
              background:
                creating
                  ? "#94a3b8"
                  : "#0f172a",
              color: "#ffffff",
              cursor:
                creating
                  ? "not-allowed"
                  : "pointer",
              fontWeight: 600,
            }}
          >
            {creating
              ? "Creating..."
              : "Create Campaign"}
          </button>
        </form>
      </section>


      <section>
        <h2
          style={{
            margin:
              "0 0 14px",
            fontSize: "20px",
          }}
        >
          Campaigns
        </h2>


        {campaigns.length === 0 ? (
          <div
            style={{
              padding: "36px 20px",
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
              gap: "12px",
            }}
          >
            {campaigns.map(
              (campaign) => (
                <div
                  key={campaign.id}
                  style={{
                    background:
                      "#ffffff",
                    border:
                      "1px solid #e2e8f0",
                    borderRadius:
                      "12px",
                    padding: "18px",
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
                      <h3
                        style={{
                          margin: 0,
                          fontSize:
                            "18px",
                          color:
                            "#0f172a",
                        }}
                      >
                        {campaign.name}
                      </h3>

                      {campaign.description && (
                        <p
                          style={{
                            margin:
                              "7px 0 0",
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

                    <StatusBadge
                      status={
                        campaign.status
                      }
                    />
                  </div>


                  <div
                    style={{
                      display: "flex",
                      gap: "18px",
                      flexWrap:
                        "wrap",
                      marginTop:
                        "16px",
                      fontSize:
                        "13px",
                      color:
                        "#64748b",
                    }}
                  >
                    <span>
                      Action:{" "}
                      {campaign.action_type.replace(
                        /_/g,
                        " ",
                      )}
                    </span>

                    <span>
                      Segment:{" "}
                      {campaign.target_segment
                        ? campaign.target_segment.replace(
                            /_/g,
                            " ",
                          )
                        : "Not selected"}
                    </span>

                    <span>
                      Customers:{" "}
                      {campaign.customer_count ??
                        0}
                    </span>
                  </div>


                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      marginTop:
                        "16px",
                      flexWrap:
                        "wrap",
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
                            "7px",
                          padding:
                            "8px 12px",
                          background:
                            "#16a34a",
                          color:
                            "#ffffff",
                          fontWeight:
                            600,
                          cursor:
                            "pointer",
                        }}
                      >
                        Activate
                      </button>
                    )}

                    {campaign.status ===
                      "active" && (
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
                            "7px",
                          padding:
                            "8px 12px",
                          background:
                            "#ffffff",
                          color:
                            "#334155",
                          fontWeight:
                            600,
                          cursor:
                            "pointer",
                        }}
                      >
                        Pause
                      </button>
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
                            "7px",
                          padding:
                            "8px 12px",
                          background:
                            "#2563eb",
                          color:
                            "#ffffff",
                          fontWeight:
                            600,
                          cursor:
                            "pointer",
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
                            "7px",
                          padding:
                            "8px 12px",
                          background:
                            "#ffffff",
                          color:
                            "#334155",
                          fontWeight:
                            600,
                          cursor:
                            "pointer",
                        }}
                      >
                        Complete
                      </button>
                    )}
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
