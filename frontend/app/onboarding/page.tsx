"use client";

import { FormEvent, useState } from "react";
import "./onboarding.css";

export default function OnboardingPage() {
  const [organizationName, setOrganizationName] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    console.log("Organization:", organizationName);
  }

  return (
    <main className="onboarding">
      <section className="card">
        <h1 className="title">Create your organization</h1>

        <p className="description">
          Set up your organization to start managing customer retention.
        </p>

        <form className="form" onSubmit={handleSubmit}>
          <label className="label" htmlFor="organizationName">
            Organization name
          </label>

          <input
            className="input"
            id="organizationName"
            type="text"
            placeholder="Enter organization name"
            value={organizationName}
            onChange={(event) =>
              setOrganizationName(event.target.value)
            }
            required
          />

          <button className="button" type="submit">
            Create Organization
          </button>
        </form>
      </section>
    </main>
  );
}
