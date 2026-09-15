import { createFileRoute } from "@tanstack/react-router";
import AppLayout from "../components/AppLayout";
import DataTable from "../components/DataTable";

export const Route = createFileRoute("/delivery")({
  head: () => ({
    meta: [
      { title: "Delivery — NextGen Retail & Order Management" },
      { name: "description", content: "Shipment tracking, delivery agents and status." },
      { property: "og:title", content: "Delivery — NextGen Retail & Order Management" },
      { property: "og:description", content: "Browse shipment and delivery records." },
    ],
  }),
  component: Delivery,
});

function Delivery() {
  return (
    <AppLayout breadcrumb="Home / Operations" title="Delivery">
      <DataTable
        title="Delivery"
        schema="delivery_id · order_id · agent · dispatched_on · delivered_on · status"
        columns={[
          { key: "delivery_id", label: "Delivery ID" },
          { key: "order_id", label: "Order" },
          { key: "agent", label: "Agent" },
          { key: "dispatched_on", label: "Dispatched" },
          { key: "delivered_on", label: "Delivered" },
          { key: "status", label: "Status" },
        ]}
      />
    </AppLayout>
  );
}
