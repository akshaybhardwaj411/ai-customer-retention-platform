"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";


type PreviewResponse = {
  filename: string;
  columns: string[];
  preview_rows: Record<string, string>[];
};


export default function ImportMappingPage() {
  const router = useRouter();

  const [preview, setPreview] =
    useState<PreviewResponse | null>(null);

  const [error, setError] =
    useState("");


  useEffect(() => {
    async function loadPreview() {
      const organizationId =
        localStorage.getItem(
          "organization_id",
        );

      if (!organizationId) {
        setError(
          "Organization information is missing.",
        );
        return;
      }

      const storedFileName =
        localStorage.getItem(
          "import_file_name",
        );

      if (!storedFileName) {
        setError(
          "No import file was selected.",
        );
        return;
      }

      setError(
        "Please upload the CSV again to preview it.",
      );
    }

    loadPreview();
  }, []);


  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "40px 24px",
      }}
    >
      <section
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          background: "white",
          padding: "40px",
          borderRadius: "16px",
          border: "1px solid #e2e8f0",
        }}
      >
        <h1>
          Map customer data
        </h1>

        <p
          style={{
            color: "#64748b",
          }}
        >
          Review your customer columns before
          continuing.
        </p>

        {error && (
          <p
            style={{
              color: "#dc2626",
              marginTop: "24px",
            }}
          >
            {error}
          </p>
        )}

        {preview && (
          <div
            style={{
              overflowX: "auto",
              marginTop: "24px",
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
                  {preview.columns.map(
                    (column) => (
                      <th
                        key={column}
                        style={{
                          textAlign: "left",
                          padding: "12px",
                          borderBottom:
                            "1px solid #e2e8f0",
                        }}
                      >
                        {column}
                      </th>
                    ),
                  )}
                </tr>
              </thead>

              <tbody>
                {preview.preview_rows.map(
                  (row, index) => (
                    <tr key={index}>
                      {preview.columns.map(
                        (column) => (
                          <td
                            key={column}
                            style={{
                              padding: "12px",
                              borderBottom:
                                "1px solid #f1f5f9",
                            }}
                          >
                            {row[column]}
                          </td>
                        ),
                      )}
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        )}

        <button
          type="button"
          onClick={() =>
            router.push(
              "/action-center",
            )
          }
          style={{
            marginTop: "28px",
            padding: "12px 18px",
            border: "none",
            borderRadius: "8px",
            background: "#2563eb",
            color: "white",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Continue
        </button>
      </section>
    </main>
  );
}
