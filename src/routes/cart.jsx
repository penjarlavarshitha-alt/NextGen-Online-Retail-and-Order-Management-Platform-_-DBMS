import { createFileRoute } from "@tanstack/react-router";
import AppLayout from "../components/AppLayout";
import DataTable from "../components/DataTable";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Cart — NextGen Retail & Order Management" },
      { name: "description", content: "Active cart items held by customers before checkout." },
      { property: "og:title", content: "Cart — NextGen Retail & Order Management" },
      { property: "og:description", content: "Browse active cart items per customer." },
    ],
  }),
  component: Cart,
});

function Cart() {
  return (
    <AppLayout breadcrumb="Home / Operations" title="Cart">
      <DataTable
        title="Cart Items"
        schema="cart_id · customer_id · product_id · quantity · added_at"
        columns={[
          { key: "cart_id", label: "Cart ID" },
          { key: "customer", label: "Customer" },
          { key: "product", label: "Product" },
          { key: "quantity", label: "Qty" },
          { key: "added_at", label: "Added On" },
        ]}
      />
    </AppLayout>
  );
}
