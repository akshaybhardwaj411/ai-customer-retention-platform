"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import {
  Customer,
  getCustomers,
} from "../../lib/customers";


export default function CustomersPage() {
  const [customers, setCustomers] =
    useState<Customer[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  useEffect(() => {
    async function loadCustomers() {
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
        const data =
          await getCustomers(
            organizationId,
          );

        setCustomers(data);
      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to load customers.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadCustomers();
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
          maxWidth: "1000px",
          margin: "0 auto",
        }}
      >
        <h1>Customers</h1>

        <p
          style={{
            color: "#64748b",
          }}
        >
          View and manage your organization's
          customers.
        </p>

        {loading && (
          <p>
            Loading customers...
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

        {!loading &&
          !error &&
          customers.length === 0 && (
            <div
              style={{
                marginTop: "24px",
                padding: "32px",
                background: "white",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
              }}
            >
              <h2>
                No customers yet
              </h2>

              <p
                style={{
                  color: "#64748b",
                }}
              >
                Import customer data to begin
                monitoring retention risk.
              </p>

              <Link
                href="/integrations/import"
                style={{
                  display: "inline-block",
                  marginTop: "12px",
                  padding: "10px 16px",
                  background: "#2563eb",
                  color: "white",
                  borderRadius: "8px",
                  textDecoration: "none",
                  fontWeight: 600,
                }}
              >
                Import Customers
              </Link>
            </div>
          )}

        {!loading &&
          !error &&
          customers.length > 0 && (
            <div
              style={{
                marginTop: "24px",
                overflowX: "auto",
                background: "white",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                }}
              >
                <thead>
                  <tr>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "14px",
                        borderBottom:
                          "1px solid #e2e8f0",
                      }}
                    >
                      Customer
                    </th>

                    <th
                      style={{
                        textAlign: "left",
                        padding: "14px",
                        borderBottom:
                          "1px solid #e2e8f0",
                      }}
                    >
                      Email
                    </th>

                    <th
                      style={{
                        textAlign: "left",
                        padding: "14px",
                        borderBottom:
                          "1px solid #e2e8f0",
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
                        key={customer.id}
                      >
                        <td
                          style={{
                            padding: "14px",
                            borderBottom:
                              "1px solid #f1f5f9",
                            fontWeight: 600,
                          }}
                        >
                          {customer.name}
                        </td>

                        <td
                          style={{
                            padding: "14px",
                            borderBottom:
                              "1px solid #f1f5f9",
                          }}
                        >
                          {customer.email ||
                            "—"}
                        </td>

                        <td
                          style={{
                            padding: "14px",
                            borderBottom:
                              "1px solid #f1f5f9",
                          }}
                        >
                          <Link
                            href={`/customers/${customer.id}`}
                            style={{
                              color: "#2563eb",
                              textDecoration:
                                "none",
                              fontWeight: 600,
                            }}
                          >
                            View 360
                          </Link>
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
