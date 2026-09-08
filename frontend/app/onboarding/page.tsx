"use client";

import { FormEvent, useState } from "react";

export default function OnboardingPage() {
  const [organizationName, setOrganizationName] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    console.log("Organization:", organizationName);
  }

  return (
    <main>
      <h1>Create your organization</h1>

      <p>
        Set up your organization to start managing customer retention.
      </p>

      <form onSubmit={handleSubmit}>
        <label htmlFor="organizationName">
          Organization name
        </label>

        <input
          id="organizationName"
          type="text"
          placeholder="Enter organization name"
          value={organizationName}
          onChange={(event) =>
            setOrganizationName(event.target.value)
          }
          required
        />

        <button type="submit">
          Create Organization
        </button>
      </form>
    </main>
  );
}
