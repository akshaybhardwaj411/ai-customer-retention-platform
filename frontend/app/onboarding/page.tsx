"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import "./onboarding.css";
import { apiRequest } from "../../lib/api";


export default function OnboardingPage() {
  const router = useRouter();

  const [organizationName, setOrganizationName] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");


  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const organization =
        await apiRequest<{
          id: string;
          name: string;
          message: string;
        }>("/organizations/", {
          method: "POST",
          body: JSON.stringify({
            name: organizationName,
          }),
        });

      localStorage.setItem(
        "organization_id",
        organization.id,
      );

      localStorage.setItem(
        "organization_name",
        organization.name,
      );

      router.push("/integrations/import");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to create organization.",
      );
    } finally {
      setLoading(false);
    }
  }


  return (
    <main className="onboarding">
      <section className="card">
        <h1 className="title">
          Create your organization
        </h1>

        <p className="description">
          Set up your organization to start
          managing customer retention.
        </p>

        <form
          className="form"
          onSubmit={handleSubmit}
        >
          <label
            className="label"
            htmlFor="organizationName"
          >
            Organization name
          </label>

          <input
            className="input"
            id="organizationName"
            type="text"
            placeholder="Enter organization name"
            value={organizationName}
            onChange={(event) =>
              setOrganizationName(
                event.target.value,
              )
            }
            required
            disabled={loading}
          />

          {error && (
            <p
              style={{
                color: "#dc2626",
                margin: "4px 0",
              }}
            >
              {error}
            </p>
          )}

          <button
            className="button"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Creating..."
              : "Create Organization"}
          </button>
        </form>
      </section>
    </main>
  );
}
