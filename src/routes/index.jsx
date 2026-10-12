import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import AppLayout from "../components/AppLayout";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — NextGen Retail & Order Management" },
      {
        name: "description",
        content:
          "Admin dashboard for the NextGen online retail and order management platform, built on PostgreSQL.",
      },
      {
        property: "og:title",
        content: "Dashboard — NextGen Retail & Order Management",
      },
      {
        property: "og:description",
        content:
          "Navigate customers, products, inventory, orders, payments and reports.",
      },
    ],
  }),

  component: Dashboard,
});

const HIGHLIGHTS = [
  {
    to: "/customers",
    label: "Customers",
    text: "Registration and contact records.",
    cls: "bg-primary/10 ring-primary/20",
  },
  {
    to: "/products",
    label: "Products",
    text: "Catalog items and pricing.",
    cls: "bg-brand2/10 ring-brand2/20",
  },
  {
    to: "/inventory",
    label: "Inventory",
    text: "Stock levels and thresholds.",
    cls: "bg-accent/15 ring-accent/30",
  },
  {
    to: "/orders",
    label: "Orders",
    text: "Placed orders and status.",
    cls: "bg-pos/10 ring-pos/20",
  },
];

const MORE = [
  {
    to: "/categories",
    label: "Categories",
    text: "Product classification tree.",
    cls: "bg-accent/15 ring-accent/25",
  },
  {
    to: "/cart",
    label: "Cart",
    text: "Active cart items per customer.",
    cls: "bg-primary/10 ring-primary/20",
  },
  {
    to: "/payments",
    label: "Payments",
    text: "Transactions and payment modes.",
    cls: "bg-pos/10 ring-pos/20",
  },
  {
    to: "/delivery",
    label: "Delivery",
    text: "Shipment tracking and agents.",
    cls: "bg-brand2/10 ring-brand2/20",
  },
  {
    to: "/reviews",
    label: "Reviews",
    text: "Ratings and customer feedback.",
    cls: "bg-accent/15 ring-accent/25",
  },
  {
    to: "/reports",
    label: "Reports",
    text: "Aggregate queries and summaries.",
    cls: "bg-primary/10 ring-primary/20",
  },
];

function Dashboard() {
  const navigate = useNavigate();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      navigate({ to: "/login" });
      return;
    }

    setCheckingAuth(false);
  }, [navigate]);

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-inksoft">Checking authentication...</p>
      </div>
    );
  }

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
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {HIGHLIGHTS.map((m) => (
          <Link
            key={m.to}
            to={m.to}
            className={`rounded-2xl p-5 flex flex-col gap-3 text-ink ring-1 ${m.cls}`}
          >
            <p className="text-2xl font-bold leading-none">
              {m.label}
            </p>

            <p className="text-sm text-inksoft text-pretty">
              {m.text}
            </p>
          </Link>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-2 lg:grid-cols-3 gap-3">
        {MORE.map((m) => (
          <Link
            key={m.to}
            to={m.to}
            className={`rounded-2xl p-5 flex flex-col gap-2 text-ink ring-1 ${m.cls}`}
          >
            <p className="text-xl font-bold leading-none">
              {m.label}
            </p>

            <p className="text-sm text-inksoft text-pretty">
              {m.text}
            </p>
          </Link>
        ))}
      </div>
    </AppLayout>
  );
}