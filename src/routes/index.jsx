import { createFileRoute, Link } from "@tanstack/react-router";
import AppLayout from "../components/AppLayout";
import DataTable from "../components/DataTable";
import RecordForm from "../components/RecordForm";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — NextGen Retail & Order Management" },
      {
        name: "description",
        content:
          "Admin dashboard for the NextGen online retail and order management platform, built on PostgreSQL.",
      },
      { property: "og:title", content: "Dashboard — NextGen Retail & Order Management" },
      {
        property: "og:description",
        content: "Navigate customers, products, inventory, orders, payments and reports.",
      },
    ],
  }),
  component: Dashboard,
});

const HIGHLIGHTS = [
  { to: "/customers", n: "01", label: "Customers", text: "Registration and contact records.", cls: "bg-primary text-primary-foreground", sub: "text-primary-foreground/70", body: "text-primary-foreground/80" },
  { to: "/products", n: "02", label: "Products", text: "Catalog items and pricing.", cls: "bg-brand2 text-brand2-foreground", sub: "text-brand2-foreground/70", body: "text-brand2-foreground/80" },
  { to: "/inventory", n: "03", label: "Inventory", text: "Stock levels and thresholds.", cls: "bg-accent text-accent-foreground", sub: "text-accent-foreground/60", body: "text-accent-foreground/70" },
  { to: "/orders", n: "04", label: "Orders", text: "Placed orders and status.", cls: "bg-card text-ink", sub: "text-inksoft/70", body: "text-inksoft" },
];

const MORE = [
  { to: "/categories", n: "05", label: "Categories", text: "Product classification tree." },
  { to: "/cart", n: "06", label: "Cart", text: "Active cart items per customer." },
  { to: "/payments", n: "07", label: "Payments", text: "Transactions and payment modes." },
  { to: "/delivery", n: "08", label: "Delivery", text: "Shipment tracking and agents." },
  { to: "/reviews", n: "09", label: "Reviews", text: "Ratings and customer feedback." },
  { to: "/reports", n: "10", label: "Reports", text: "Aggregate queries and summaries." },
];

function Dashboard() {
  return (
    <AppLayout
      breadcrumb="Home"
      title="Dashboard"
      actions={
        <Link
          to="/orders"
          className="h-10 px-5 rounded-full bg-primary text-primary-foreground text-sm font-semibold grid place-items-center"
        >
          View Orders
        </Link>
      }
    >
      <div className="mb-6">
        <h2 className="text-4xl sm:text-5xl font-bold leading-none tracking-tight max-w-[20ch] text-balance">
          Control room for the retail platform
        </h2>
        <p className="mt-3 text-base text-inksoft max-w-[52ch] text-pretty">
          Browse every module, manage records, and watch data flow from your PostgreSQL database
          once the API is wired in.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {HIGHLIGHTS.map((m) => (
          <Link key={m.to} to={m.to} className={`rounded-2xl p-5 flex flex-col gap-4 ${m.cls}`}>
            <div>
              <p className={`font-mono text-[11px] uppercase tracking-[0.15em] ${m.sub}`}>
                Module {m.n}
              </p>
              <p className="text-2xl font-bold leading-none mt-1">{m.label}</p>
            </div>
            <p className={`text-sm text-pretty ${m.body}`}>{m.text}</p>
          </Link>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-2 lg:grid-cols-3 gap-3">
        {MORE.map((m) => (
          <Link
            key={m.to}
            to={m.to}
            className="rounded-2xl bg-card p-5 flex flex-col gap-2 ring-1 ring-ink/5"
          >
            <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-inksoft/70">
              Module {m.n}
            </p>
            <p className="text-xl font-bold leading-none">{m.label}</p>
            <p className="text-sm text-inksoft text-pretty">{m.text}</p>
          </Link>
        ))}
      </div>

      <div className="mt-6">
        <DataTable
          title="Customers"
          schema="customer_id · full_name · email · phone"
          columns={[
            { key: "customer_id", label: "ID" },
            { key: "full_name", label: "Full Name" },
            { key: "email", label: "Email" },
            { key: "phone", label: "Phone" },
          ]}
          action={
            <Link
              to="/customers"
              className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-semibold grid place-items-center"
            >
              + Add Customer
            </Link>
          }
        />
      </div>

      <div className="mt-6">
        <RecordForm
          title="Add Customer"
          endpoint="POST /api/customers"
          fields={[
            { name: "full_name", label: "Full Name", required: true, placeholder: "e.g. Priya Sharma" },
            { name: "email", label: "Email", type: "email", required: true, placeholder: "name@example.com" },
            { name: "phone", label: "Phone", type: "tel", required: true, placeholder: "+91 98765 43210" },
            { name: "city", label: "City", placeholder: "e.g. Pune" },
          ]}
        />
      </div>
    </AppLayout>
  );
}
