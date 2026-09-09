import Link from "next/link";

export default function DashboardPage() {
  return (
    <main>
      <h1>Retention Workspace</h1>

      <p>
        Monitor customer risk and take action to improve retention.
      </p>

      <nav>
        <Link href="/action-center">Action Center</Link>
        {" | "}
        <Link href="/customers">Customers</Link>
        {" | "}
        <Link href="/risk">Risk Center</Link>
        {" | "}
        <Link href="/ai-actions">AI Actions</Link>
        {" | "}
        <Link href="/campaigns">Campaigns</Link>
        {" | "}
        <Link href="/impact">Impact</Link>
        {" | "}
        <Link href="/integrations">Integrations</Link>
        {" | "}
        <Link href="/settings">Settings</Link>
      </nav>

      <section>
        <h2>Workspace Overview</h2>

        <p>
          Your retention workspace will appear here.
        </p>
      </section>
    </main>
  );
}
