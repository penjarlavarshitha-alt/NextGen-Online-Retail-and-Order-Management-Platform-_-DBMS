import { createFileRoute } from "@tanstack/react-router";
import AppLayout from "../components/AppLayout";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Reports — NextGen Retail & Order Management" },
      { name: "description", content: "Summary reports driven by SQL aggregate queries." },
      { property: "og:title", content: "Reports — NextGen Retail & Order Management" },
      { property: "og:description", content: "Sales, stock and customer summary reports." },
    ],
  }),
  component: Reports,
});

const REPORTS = [
  { title: "Sales Summary", query: "SELECT SUM(total_amount) FROM orders GROUP BY date" },
  { title: "Top Selling Products", query: "SELECT product_id, COUNT(*) FROM order_items GROUP BY product_id" },
  { title: "Low Stock Items", query: "SELECT * FROM inventory WHERE quantity < reorder_level" },
  { title: "Customer Order Count", query: "SELECT customer_id, COUNT(*) FROM orders GROUP BY customer_id" },
  { title: "Payment Mode Split", query: "SELECT method, COUNT(*) FROM payments GROUP BY method" },
  { title: "Average Product Rating", query: "SELECT product_id, AVG(rating) FROM reviews GROUP BY product_id" },
];

function Reports() {
  return (
    <AppLayout breadcrumb="Home / Operations" title="Reports">
      <div className="mb-6">
        <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
        <p className="mt-2 text-sm text-inksoft max-w-[56ch] text-pretty">
          Each card maps to one aggregate query in the PostgreSQL database. Values stay blank until
          the backend API returns results.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {REPORTS.map((r) => (
          <div key={r.title} className="card-surface p-5 flex flex-col gap-3">
            <div>
              <p className="text-base font-semibold leading-none">{r.title}</p>
              <p className="mt-2 text-3xl font-bold text-inksoft/40">—</p>
            </div>
            <p className="text-[11px] font-mono text-inksoft bg-canvas rounded-lg px-2.5 py-2 break-words">
              {r.query}
            </p>
          </div>
        ))}
      </div>
    </AppLayout>
  );
}
