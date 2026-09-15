import { createFileRoute } from "@tanstack/react-router";
import AppLayout from "../components/AppLayout";
import DataTable from "../components/DataTable";

export const Route = createFileRoute("/orders")({
  head: () => ({
    meta: [
      { title: "Orders — NextGen Retail & Order Management" },
      { name: "description", content: "Placed orders, totals and order status records." },
      { property: "og:title", content: "Orders — NextGen Retail & Order Management" },
      { property: "og:description", content: "Browse the order lifecycle and status." },
    ],
  }),
  component: Orders,
});

function Orders() {
  return (
    <AppLayout breadcrumb="Home / Operations" title="Orders">
      <DataTable
        title="Orders"
        schema="order_id · customer_id · order_date · total_amount · status"
        columns={[
          { key: "order_id", label: "Order ID" },
          { key: "customer", label: "Customer" },
          { key: "order_date", label: "Order Date" },
          { key: "total_amount", label: "Total" },
          { key: "status", label: "Status" },
        ]}
      />
    </AppLayout>
  );
}
