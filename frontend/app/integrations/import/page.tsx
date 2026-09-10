"use client";

import { ChangeEvent, useState } from "react";
import { useRouter } from "next/navigation";


function fileToBase64(
  file: File,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result;

      if (typeof result !== "string") {
        reject(
          new Error(
            "Unable to read the selected file.",
          ),
        );
        return;
      }

      resolve(result);
    };

    reader.onerror = () => {
      reject(
        new Error(
          "Unable to read the selected file.",
        ),
      );
    };

    reader.readAsDataURL(file);
  });
}


export default function ImportCustomersPage() {
  const router = useRouter();

  const [file, setFile] =
    useState<File | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");


  function handleFileChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    setError("");

    const selectedFile =
      event.target.files?.[0] || null;

    setFile(selectedFile);
  }


  async function handleUpload() {
    if (!file) {
      setError("Please select a CSV file.");
      return;
    }

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

    setLoading(true);
    setError("");

    try {
      const base64File =
        await fileToBase64(file);

      sessionStorage.setItem(
        "import_file",
        base64File,
      );

      sessionStorage.setItem(
        "import_file_name",
        file.name,
      );

      const formData = new FormData();

      formData.append(
        "file",
        file,
      );

      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL ||
          "http://localhost:8000"
        }/imports/preview`,
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

      const preview =
        await response.json();

      sessionStorage.setItem(
        "import_preview",
        JSON.stringify(preview),
      );

      router.push(
        "/integrations/import/mapping",
      );
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to prepare the import.",
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
        display: "flex",
        justifyContent: "center",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: "620px",
          background: "white",
          padding: "40px",
          borderRadius: "16px",
          border: "1px solid #e2e8f0",
        }}
      >
        <h1>
          Import customer data
        </h1>

        <p
          style={{
            color: "#64748b",
            marginBottom: "28px",
          }}
        >
          Upload a CSV file containing your
          customer information.
        </p>

        <input
          type="file"
          accept=".csv,text/csv"
          onChange={handleFileChange}
        />

        {file && (
          <p
            style={{
              marginTop: "16px",
              color: "#475569",
            }}
          >
            Selected: {file.name}
          </p>
        )}

        {error && (
          <p
            style={{
              color: "#dc2626",
              marginTop: "16px",
            }}
          >
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={handleUpload}
          disabled={loading}
          style={{
            marginTop: "24px",
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
            ? "Preparing..."
            : "Preview Customers"}
        </button>
      </section>
    </main>
  );
}
