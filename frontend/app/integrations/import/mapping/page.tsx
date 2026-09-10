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

  const [loading, setLoading] =
    useState(false);


  useEffect(() => {
    const storedPreview =
      sessionStorage.getItem(
        "import_preview",
      );

    if (!storedPreview) {
      setError(
        "No CSV preview is available. Please upload a file again.",
      );
      return;
    }

    try {
      setPreview(
        JSON.parse(storedPreview),
      );
    } catch {
      setError(
        "Unable to read the CSV preview.",
      );
    }
  }, []);


  async function importCustomers() {
    const organizationId =
      localStorage.getItem(
        "organization_id",
      );

    const base64File =
      sessionStorage.getItem(
        "import_file",
      );

    const fileName =
      sessionStorage.getItem(
        "import_file_name",
      ) || "customers.csv";

    if (!organizationId || !base64File) {
      setError(
        "Import information is missing. Please upload the CSV again.",
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      const base64Data =
        base64File.split(",")[1];

      const binaryString =
        window.atob(base64Data);

      const bytes = new Uint8Array(
        binaryString.length,
      );

      for (
        let index = 0;
        index < binaryString.length;
        index++
      ) {
        bytes[index] =
          binaryString.charCodeAt(index);
      }

      const file = new File(
        [bytes],
        fileName,
        {
          type: "text/csv",
        },
      );

      const formData = new FormData();

      formData.append(
        "file",
        file,
      );

      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL ||
        "http://localhost:8000";

      const response = await fetch(
        `${apiUrl}/imports/customers?organization_id=${encodeURIComponent(
          organizationId,
        )}`,
        {
          method: "POST",
          body: formData,
        },
      );

      if (!response.ok) {
        throw new Error(
          await response.text(),
        );
      }

      sessionStorage.removeItem(
        "import_file",
      );

      sessionStorage.removeItem(
        "import_file_name",
      );

      sessionStorage.removeItem(
        "import_preview",
      );

      router.push(
        "/action-center",
      );
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Customer import failed.",
      );
    } finally {
      setLoading(false);
    }
  }


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
          Review the detected columns before
          importing your customers.
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
          <>
            <p
              style={{
                marginTop: "24px",
                fontWeight: 600,
              }}
            >
              File: {preview.filename}
            </p>

            <div
              style={{
                overflowX: "auto",
                marginTop: "20px",
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
                            whiteSpace:
                              "nowrap",
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
                              {row[column] ||
                                ""}
                            </td>
                          ),
                        )}
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>

            <button
              type="button"
              onClick={importCustomers}
              disabled={loading}
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
              {loading
                ? "Importing..."
                : "Import Customers"}
            </button>
          </>
        )}
      </section>
    </main>
  );
}
