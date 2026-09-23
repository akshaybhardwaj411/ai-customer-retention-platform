"use client";

import { useEffect, useState } from "react";

import { apiRequest } from "../../lib/api";
import {
  getMLStatus,
  MLStatus,
} from "../../lib/ml-status";


type DatabaseHealth = {
  status: string;
  database: string;
};

type VersionResponse = {
  version: string;
  service: string;
};


export default function PlatformStatus() {
  const [database, setDatabase] =
    useState<DatabaseHealth | null>(null);

  const [version, setVersion] =
    useState<VersionResponse | null>(null);

  const [mlStatus, setMLStatus] =
    useState<MLStatus | null>(null);

  const [loading, setLoading] =
    useState(true);


  useEffect(() => {
    async function loadStatus() {
      try {
        const [
          databaseHealth,
          versionInfo,
          modelStatus,
        ] = await Promise.all([
          apiRequest<DatabaseHealth>(
            "/health/database",
          ),

          apiRequest<VersionResponse>(
            "/version",
          ),

          getMLStatus(),
        ]);

        setDatabase(databaseHealth);
        setVersion(versionInfo);
        setMLStatus(modelStatus);

      } catch {
        // Keep the status cards
        // available even if one
        // health request fails.
      } finally {
        setLoading(false);
      }
    }

    loadStatus();
  }, []);


  if (loading) {
    return (
      <section
        style={{
          marginTop: "24px",
          padding: "20px",
          background: "white",
          border:
            "1px solid #e2e8f0",
          borderRadius: "12px",
        }}
      >
        <strong>
          Checking platform status...
        </strong>
      </section>
    );
  }


  return (
    <section
      style={{
        marginTop: "24px",
        padding: "20px",
        background: "white",
        border:
          "1px solid #e2e8f0",
        borderRadius: "12px",
      }}
    >
      <h2
        style={{
          marginTop: 0,
        }}
      >
        Platform Status
      </h2>


      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "12px",
        }}
      >
        <StatusCard
          title="API"
          value={
            version
              ? "Connected"
              : "Unavailable"
          }
          healthy={Boolean(version)}
        />

        <StatusCard
          title="Database"
          value={
            database?.status === "healthy"
              ? "Connected"
              : "Unavailable"
          }
          healthy={
            database?.status ===
            "healthy"
          }
        />

        <StatusCard
          title="ML Model"
          value={
            mlStatus?.model_available
              ? "Ready"
              : "Not Ready"
          }
          healthy={
            Boolean(
              mlStatus?.model_available,
            )
          }
        />

        <StatusCard
          title="ML Features"
          value={
            mlStatus?.features_available
              ? "Ready"
              : "Unavailable"
          }
          healthy={
            Boolean(
              mlStatus?.features_available,
            )
          }
        />
      </div>


      {version && (
        <p
          style={{
            marginBottom: 0,
            marginTop: "16px",
            color: "#64748b",
          }}
        >
          API version:{" "}
          {version.version}
        </p>
      )}
    </section>
  );
}


function StatusCard({
  title,
  value,
  healthy,
}: {
  title: string;
  value: string;
  healthy: boolean;
}) {
  return (
    <div
      style={{
        padding: "14px",
        background:
          healthy
            ? "#f0fdf4"
            : "#fffbeb",
        border:
          healthy
            ? "1px solid #bbf7d0"
            : "1px solid #fde68a",
        borderRadius: "8px",
      }}
    >
      <p
        style={{
          marginTop: 0,
          marginBottom: "6px",
          color: "#64748b",
          fontSize: "14px",
        }}
      >
        {title}
      </p>

      <strong>
        {value}
      </strong>
    </div>
  );
}
