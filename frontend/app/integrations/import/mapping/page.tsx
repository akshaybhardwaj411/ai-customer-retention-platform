"use client";

import { useState } from "react";

const availableColumns = [
  "name",
  "email",
  "phone",
  "plan",
  "revenue",
  "last_active",
];

export default function ImportMappingPage() {
  const [nameColumn, setNameColumn] = useState("");
  const [emailColumn, setEmailColumn] = useState("");

  function handleContinue() {
    console.log("Column mapping:", {
      name: nameColumn,
      email: emailColumn,
    });
  }

  return (
    <main>
      <h1>Map Customer Data</h1>

      <p>
        Match your CSV columns to the fields used by the retention
        platform.
      </p>

      <section>
        <label htmlFor="name-column">
          Customer Name
        </label>

        <select
          id="name-column"
          value={nameColumn}
          onChange={(event) => setNameColumn(event.target.value)}
        >
          <option value="">Select column</option>

          {availableColumns.map((column) => (
            <option key={column} value={column}>
              {column}
            </option>
          ))}
        </select>
      </section>

      <section>
        <label htmlFor="email-column">
          Customer Email
        </label>

        <select
          id="email-column"
          value={emailColumn}
          onChange={(event) => setEmailColumn(event.target.value)}
        >
          <option value="">Select column</option>

          {availableColumns.map((column) => (
            <option key={column} value={column}>
              {column}
            </option>
          ))}
        </select>
      </section>

      <button type="button" onClick={handleContinue}>
        Continue
      </button>
    </main>
  );
}
