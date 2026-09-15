import { createFileRoute } from "@tanstack/react-router";
import AppLayout from "../components/AppLayout";
import DataTable from "../components/DataTable";

export const Route = createFileRoute("/payments")({
  head: () => ({
    meta: [
      { title: "Payments — NextGen Retail & Order Management" },
      { name: "description", content: "Payment transactions, modes and statuses." },
      { property: "og:title", content: "Payments — NextGen Retail & Order Management" },
      { property: "og:description", content: "Browse payment transaction records." },
    ],
  }),
  component: Payments,
});

function Payments() {
  return (
    <AppLayout breadcrumb="Home / Operations" title="Payments">
      <DataTable
        title="Payments"
        schema="payment_id · order_id · amount · method · paid_on · status"
        columns={[
          { key: "payment_id", label: "Payment ID" },
          { key: "order_id", label: "Order" },
          { key: "amount", label: "Amount" },
          { key: "method", label: "Method" },
          { key: "paid_on", label: "Paid On" },
          { key: "status", label: "Status" },
        ]}
      />
    </AppLayout>
  );
}
