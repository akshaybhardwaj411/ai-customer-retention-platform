"use client";

import { ChangeEvent, FormEvent, useState } from "react";

export default function CustomerImportPage() {
  const [file, setFile] = useState<File | null>(null);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0] ?? null;
    setFile(selectedFile);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!file) {
      alert("Please select a CSV file.");
      return;
    }

    console.log("Selected file:", file.name);
  }

  return (
    <main>
      <h1>Import Customers</h1>

      <p>
        Upload a CSV file containing your customer data.
      </p>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="customer-file">
            Customer CSV
          </label>

          <input
            id="customer-file"
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileChange}
          />
        </div>

        {file && (
          <p>
            Selected file: <strong>{file.name}</strong>
          </p>
        )}

        <button type="submit">
          Import Customers
        </button>
      </form>
    </main>
  );
}
