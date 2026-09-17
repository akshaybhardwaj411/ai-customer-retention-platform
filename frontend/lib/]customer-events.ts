import { apiRequest } from "./api";


export type CustomerEvent = {
  id: string;
  customer_id: string;
  event_type: string;
  description: string | null;
  created_at: string;
};


export async function createCustomerEvent(
  organizationId: string,
  customerId: string,
  eventType: string,
  description?: string,
): Promise<CustomerEvent> {
  return apiRequest<CustomerEvent>(
    "/customer-events/",
    {
      method: "POST",
      body: JSON.stringify({
        organization_id: organizationId,
        customer_id: customerId,
        event_type: eventType,
        description:
          description || null,
      }),
    },
  );
}
