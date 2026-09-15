import { createFileRoute } from "@tanstack/react-router";
import AppLayout from "../components/AppLayout";
import DataTable from "../components/DataTable";

export const Route = createFileRoute("/reviews")({
  head: () => ({
    meta: [
      { title: "Reviews — NextGen Retail & Order Management" },
      { name: "description", content: "Customer ratings and product feedback records." },
      { property: "og:title", content: "Reviews — NextGen Retail & Order Management" },
      { property: "og:description", content: "Browse product ratings and reviews." },
    ],
  }),
  component: Reviews,
});

function Reviews() {
  return (
    <AppLayout breadcrumb="Home / Operations" title="Reviews">
      <DataTable
        title="Reviews"
        schema="review_id · product_id · customer_id · rating · comment · created_at"
        columns={[
          { key: "review_id", label: "Review ID" },
          { key: "product", label: "Product" },
          { key: "customer", label: "Customer" },
          { key: "rating", label: "Rating" },
          { key: "comment", label: "Comment" },
          { key: "created_at", label: "Date" },
        ]}
      />
    </AppLayout>
  );
}
