type CustomerPageProps = {
  params: Promise<{
    customerId: string;
  }>;
};

export default async function Customer360Page({
  params,
}: CustomerPageProps) {
  const { customerId } = await params;

  return (
    <main>
      <h1>Customer 360</h1>

      <p>
        Customer ID: {customerId}
      </p>

      <section>
        <h2>Customer Overview</h2>
        <p>Customer information will appear here.</p>
      </section>

      <section>
        <h2>Risk</h2>
        <p>Risk prediction will appear here.</p>
      </section>

      <section>
        <h2>AI Insight</h2>
        <p>AI explanation will appear here.</p>
      </section>

      <section>
        <h2>Next Best Action</h2>
        <p>Recommended retention action will appear here.</p>
      </section>

      <section>
        <h2>Customer Timeline</h2>
        <p>Customer activity will appear here.</p>
      </section>
    </main>
  );
}
