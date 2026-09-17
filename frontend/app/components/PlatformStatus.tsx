"use client";

import { useEffect, useState } from "react";

import { getDatabaseHealth } from "../../lib/health";
import { getApiVersion } from "../../lib/version";


export default function PlatformStatus() {
  const [apiStatus, setApiStatus] =
    useState("checking");

  const [databaseStatus, setDatabaseStatus] =
    useState("checking");

  const [version, setVersion] =
    useState("");


  useEffect(() => {
    async function checkPlatform() {
      try {
        const [
          database,
          apiVersion,
        ] = await Promise.all([
          getDatabaseHealth(),
          getApiVersion(),
        ]);

        setApiStatus("healthy");
        setDatabaseStatus(
          database.status,
        );
        setVersion(
          apiVersion.version,
        );
      } catch {
        setApiStatus("unavailable");
        setDatabaseStatus(
          "unavailable",
        );
      }
    }

    checkPlatform();
  }, []);


  return (
    <div
      style={{
        display: "flex",
        gap: "12px",
        flexWrap: "wrap",
        marginTop: "24px",
      }}
    >
      <StatusItem
        label="API"
        status={apiStatus}
      />

      <StatusItem
        label="Database"
        status={databaseStatus}
      />

      {version && (
        <StatusItem
          label="Version"
          status={version}
        />
      )}
    </div>
  );
}


function StatusItem({
  label,
  status,
}: {
  label: string;
  status: string;
}) {
  return (
    <div
      style={{
        padding: "10px 14px",
        background: "white",
        border: "1px solid #e2e8f0",
        borderRadius: "8px",
      }}
    >
      <span
        style={{
          color: "#64748b",
          marginRight: "8px",
        }}
      >
        {label}
      </span>

      <strong>
        {status}
      </strong>
    </div>
  );
}
