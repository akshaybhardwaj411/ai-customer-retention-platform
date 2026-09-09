import Link from "next/link";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <header>
        <strong>AI Customer Retention Platform</strong>

        <nav>
          <Link href="/dashboard">Dashboard</Link>{" "}
          <Link href="/action-center">Action Center</Link>{" "}
          <Link href="/customers">Customers</Link>{" "}
          <Link href="/risk">Risk Center</Link>{" "}
          <Link href="/ai-actions">AI Actions</Link>{" "}
          <Link href="/campaigns">Campaigns</Link>{" "}
          <Link href="/impact">Impact</Link>{" "}
          <Link href="/integrations">Integrations</Link>{" "}
          <Link href="/settings">Settings</Link>
        </nav>
      </header>

      <main>{children}</main>
    </div>
  );
}
