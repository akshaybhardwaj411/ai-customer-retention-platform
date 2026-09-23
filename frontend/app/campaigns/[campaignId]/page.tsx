"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  getCampaign,
  getCampaignCustomers,
  type Campaign,
  type CampaignCustomer,
} from "@/lib/campaigns";


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
    pending: {
      background: "#f1f5f9",
      color: "#475569",
    },
    action_created: {
      background: "#dbeafe",
      color: "#1d4ed8",
    },
    executed: {
      background: "#fef3c7",
      color: "#92400e",
    },
    outcome_recorded: {
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
      {normalized.replace(
        /_/g,
        " ",
      )}
    </span>
  );
}


function OutcomeBadge({
  outcome,
}: {
  outcome: string | null;
}) {
  if (!outcome) {
    return (
      <span
        style={{
          color: "#94a3b8",
          fontSize: "13px",
        }}
      >
        —
      </span>
    );
  }

  return (
    <span
      style={{
        fontSize: "13px",
        fontWeight: 600,
        color:
          outcome === "saved"
            ? "#166534"
            : outcome === "not_saved"
              ? "#991b1b"
              : "#92400e",
        textTransform:
          "capitalize",
      }}
    >
      {outcome.replace(
        /_/g,
        " ",
      )}
    </span>
  );
}


export default function CampaignCustomersPage({
  params,
}: {
  params: Promise<{
    campaignId: string;
  }>;
}) {
  const [
    campaignId,
    setCampaignId,
  ] = useState("");

  const [
    organizationId,
    setOrganizationId,
  ] = useState("");

  const [
    campaign,
    setCampaign,
  ] = useState<Campaign | null>(
    null,
  );

  const [
    customers,
    setCustomers,
  ] = useState<
    CampaignCustomer[]
  >([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<string | null>(null);


  useEffect(() => {
    async function loadParams() {
      const resolved =
        await params;

      setCampaignId(
        resolved.campaignId,
      );

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
    }

    loadParams();
  }, [params]);


  useEffect(() => {
    if (
      !campaignId ||
      !organizationId
    ) {
      return;
    }

    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        const [
          campaignResult,
          customerResult,
        ] = await Promise.all([
          getCampaign(
            campaignId,
            organizationId,
          ),
          getCampaignCustomers(
            campaignId,
            organizationId,
          ),
        ]);

        setCampaign(
          campaignResult,
        );

        setCustomers(
          customerResult,
        );
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load campaign.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [
    campaignId,
    organizationId,
  ]);


  if (loading) {
    return (
      <main
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "32px 20px",
        }}
      >
        Loading campaign...
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


  if (!campaign) {
    return (
      <main
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "32px 20px",
        }}
      >
        Campaign not found.
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
      <Link
        href="/campaigns"
        style={{
          display: "inline-block",
          marginBottom: "20px",
          color: "#2563eb",
          textDecoration: "none",
          fontSize: "14px",
          fontWeight: 600,
        }}
      >
        ← Back to Campaigns
      </Link>


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
          Campaign Customers
        </div>

        <h1
          style={{
            margin: 0,
            fontSize: "30px",
            color: "#0f172a",
          }}
        >
          {campaign.name}
        </h1>

        <p
          style={{
            marginTop: "8px",
            color: "#64748b",
          }}
        >
          {campaign.customer_count ??
            customers.length}{" "}
          targeted customers
        </p>
      </header>


      <section
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "12px",
          marginBottom: "28px",
        }}
      >
        <div
          style={{
            background: "#ffffff",
            border:
              "1px solid #e2e8f0",
            borderRadius: "10px",
            padding: "16px",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              color: "#64748b",
            }}
          >
            Status
          </div>

          <div
            style={{
              marginTop: "8px",
            }}
          >
            <StatusBadge
              status={
                campaign.status
              }
            />
          </div>
        </div>

        <div
          style={{
            background: "#ffffff",
            border:
              "1px solid #e2e8f0",
            borderRadius: "10px",
            padding: "16px",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              color: "#64748b",
            }}
          >
            Segment
          </div>

          <div
            style={{
              marginTop: "8px",
              fontWeight: 600,
              color: "#0f172a",
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

        <div
          style={{
            background: "#ffffff",
            border:
              "1px solid #e2e8f0",
            borderRadius: "10px",
            padding: "16px",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              color: "#64748b",
            }}
          >
            Action
          </div>

          <div
            style={{
              marginTop: "8px",
              fontWeight: 600,
              color: "#0f172a",
              textTransform:
                "capitalize",
            }}
          >
            {campaign.action_type.replace(
              /_/g,
              " ",
            )}
          </div>
        </div>
      </section>


      <section
        style={{
          background: "#ffffff",
          border:
            "1px solid #e2e8f0",
          borderRadius: "12px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "18px 20px",
            borderBottom:
              "1px solid #e2e8f0",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "18px",
              color: "#0f172a",
            }}
          >
            Targeted Customers
          </h2>
        </div>


        {customers.length === 0 ? (
          <div
            style={{
              padding: "40px 20px",
              textAlign: "center",
              color: "#64748b",
            }}
          >
            No customers have been
            targeted yet.
          </div>
        ) : (
          <div
            style={{
              overflowX: "auto",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse:
                  "collapse",
                minWidth: "720px",
              }}
            >
              <thead>
                <tr
                  style={{
                    background:
                      "#f8fafc",
                  }}
                >
                  <th
                    style={{
                      padding:
                        "12px 16px",
                      textAlign:
                        "left",
                      fontSize:
                        "12px",
                      color:
                        "#64748b",
                    }}
                  >
                    Customer
                  </th>

                  <th
                    style={{
                      padding:
                        "12px 16px",
                      textAlign:
                        "left",
                      fontSize:
                        "12px",
                      color:
                        "#64748b",
                    }}
                  >
                    Status
                  </th>

                  <th
                    style={{
                      padding:
                        "12px 16px",
                      textAlign:
                        "left",
                      fontSize:
                        "12px",
                      color:
                        "#64748b",
                    }}
                  >
                    Outcome
                  </th>

                  <th
                    style={{
                      padding:
                        "12px 16px",
                      textAlign:
                        "left",
                      fontSize:
                        "12px",
                      color:
                        "#64748b",
                    }}
                  >
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {customers.map(
                  (customer) => (
                    <tr
                      key={
                        customer.id
                      }
                      style={{
                        borderTop:
                          "1px solid #f1f5f9",
                      }}
                    >
                      <td
                        style={{
                          padding:
                            "14px 16px",
                        }}
                      >
                        <Link
                          href={`/customers/${encodeURIComponent(
                            customer.customer_id,
                          )}`}
                          style={{
                            color:
                              "#0f172a",
                            fontWeight:
                              600,
                            textDecoration:
                              "none",
                          }}
                        >
                          {
                            customer.customer_name
                          }
                        </Link>

                        {customer.customer_email && (
                          <div
                            style={{
                              marginTop:
                                "3px",
                              fontSize:
                                "12px",
                              color:
                                "#64748b",
                            }}
                          >
                            {
                              customer.customer_email
                            }
                          </div>
                        )}
                      </td>

                      <td
                        style={{
                          padding:
                            "14px 16px",
                        }}
                      >
                        <StatusBadge
                          status={
                            customer.status
                          }
                        />
                      </td>

                      <td
                        style={{
                          padding:
                            "14px 16px",
                        }}
                      >
                        <OutcomeBadge
                          outcome={
                            customer.outcome
                          }
                        />
                      </td>

                      <td
                        style={{
                          padding:
                            "14px 16px",
                        }}
                      >
                        {customer.retention_action_id ? (
                          <Link
                            href={`/customers/${encodeURIComponent(
                              customer.customer_id,
                            )}`}
                            style={{
                              color:
                                "#2563eb",
                              textDecoration:
                                "none",
                              fontSize:
                                "13px",
                              fontWeight:
                                600,
                            }}
                          >
                            View Customer →
                          </Link>
                        ) : (
                          <span
                            style={{
                              color:
                                "#94a3b8",
                              fontSize:
                                "13px",
                            }}
                          >
                            Not executed
                          </span>
                        )}
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
