// Navigation metadata for every module of the platform.
export const NAV_GROUPS = [
  {
    label: "Overview",
    items: [{ to: "/", label: "Dashboard", dot: "bg-primary" }],
  },
  {
    label: "Catalog",
    items: [
      { to: "/customers", label: "Customers", dot: "bg-accent" },
      { to: "/products", label: "Products", dot: "bg-brand2" },
      { to: "/categories", label: "Categories", dot: "bg-primary" },
      { to: "/inventory", label: "Inventory", dot: "bg-pos" },
    ],
  },
  {
    label: "Operations",
    items: [
      { to: "/cart", label: "Cart", dot: "bg-accent" },
      { to: "/orders", label: "Orders", dot: "bg-brand2" },
      { to: "/payments", label: "Payments", dot: "bg-pos" },
      { to: "/delivery", label: "Delivery", dot: "bg-primary" },
      { to: "/reviews", label: "Reviews", dot: "bg-inksoft" },
      { to: "/reports", label: "Reports", dot: "bg-accent" },
    ],
  },
];
