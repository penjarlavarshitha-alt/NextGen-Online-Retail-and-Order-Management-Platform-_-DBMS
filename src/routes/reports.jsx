import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import AppLayout from "../components/AppLayout";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Reports — NextGen Retail & Order Management" },
      {
        name: "description",
        content: "Summary reports driven by SQL aggregate queries.",
      },
      {
        property: "og:title",
        content: "Reports — NextGen Retail & Order Management",
      },
      {
        property: "og:description",
        content: "Sales, stock and customer summary reports.",
      },
    ],
  }),
  component: Reports,
});

const REPORTS = [
  { title: "Sales Summary", endpoint: "/api/reports/sales" },
  { title: "Top Selling Products", endpoint: "/api/reports/top-products" },
  { title: "Low Stock Items", endpoint: "/api/reports/low-stock" },
  { title: "Customer Order Count", endpoint: "/api/reports/customer-orders" },
  { title: "Payment Mode Split", endpoint: "/api/reports/payment-methods" },
  { title: "Average Product Rating", endpoint: "/api/reports/ratings" },
];

const PIE_COLORS = ["#6366f1", "#14b8a6", "#f59e0b", "#ec4899", "#8b5cf6"];

const money = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;

function ChartCard({ title, children }) {
  return (
    <section className="card-surface min-w-0 rounded-xl p-3 sm:p-4">
      <h3 className="mb-3 text-sm font-semibold sm:text-base">{title}</h3>
      <div className="h-52 w-full">{children}</div>
    </section>
  );
}

function Reports() {
  const [reportData, setReportData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadReports = async () => {
      const results = {};

      await Promise.all(
        REPORTS.map(async (report) => {
          try {
            const response = await fetch(
              `http://localhost:4000${report.endpoint}`
            );

            if (response.ok) {
              results[report.title] = await response.json();
            } else {
              console.error(
                `Could not load ${report.title}: HTTP ${response.status}`
              );
            }
          } catch (error) {
            console.error(`Error loading ${report.title}:`, error);
          }
        })
      );

      if (isMounted) {
        setReportData(results);
        setLoading(false);
      }
    };

    loadReports();

    return () => {
      isMounted = false;
    };
  }, []);

  const sales = reportData["Sales Summary"];
  const topProducts = reportData["Top Selling Products"] || [];
  const lowStock = reportData["Low Stock Items"] || [];
  const customerOrders = reportData["Customer Order Count"] || [];
  const paymentMethods = reportData["Payment Mode Split"] || [];
  const ratings = reportData["Average Product Rating"] || [];

  const salesChartData = topProducts.map((item) => ({
    name: item.product_name,
    sales: Number(item.total_sales || 0),
  }));

  const paymentChartData = paymentMethods.map((item) => ({
    name: item.payment_method,
    payments: Number(item.payment_count || 0),
    amount: Number(item.total_amount || 0),
  }));

  const customerChartData = customerOrders.map((item) => ({
    name: item.customer_name,
    orders: Number(item.order_count || 0),
  }));

  const ratingsChartData = ratings
    .filter(
      (item) =>
        item.average_rating !== null &&
        item.average_rating !== undefined
    )
    .map((item) => ({
      name: item.product_name,
      rating: Number(item.average_rating),
    }));

  return (
    <AppLayout breadcrumb="Home / Operations" title="Reports">
      <div className="mb-6">
        <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
        <p className="mt-2 max-w-[56ch] text-sm text-inksoft text-pretty">
          Summary reports generated from PostgreSQL aggregate queries.
        </p>
      </div>

      {loading ? (
        <div className="card-surface p-6">
          <p className="text-sm text-inksoft">Loading reports...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Four graphs */}
          <section aria-label="Report charts">
            <div className="mb-3">
              <h3 className="text-lg font-semibold">Reports at a Glance</h3>
              <p className="mt-1 text-sm text-inksoft">
                Visual summaries based on the latest report data.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
              {/* 1. Sales by Product */}
              <ChartCard title="Sales by Product">
                {salesChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={salesChartData}
                      margin={{ top: 4, right: 4, left: -20, bottom: 30 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 10 }}
                        angle={-25}
                        textAnchor="end"
                        interval={0}
                      />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip
                        formatter={(value) => money(value)}
                      />
                      <Bar
                        dataKey="sales"
                        name="Sales"
                        fill="#6366f1"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="pt-8 text-sm text-inksoft">
                    No product sales data.
                  </p>
                )}
              </ChartCard>

              {/* 2. Payment Mode Split */}
              <ChartCard title="Payment Mode Split">
                {paymentChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={paymentChartData}
                        dataKey="payments"
                        nameKey="name"
                        cx="50%"
                        cy="45%"
                        outerRadius={62}
                        innerRadius={28}
                        paddingAngle={2}
                      >
                        {paymentChartData.map((entry, index) => (
                          <Cell
                            key={entry.name}
                            fill={PIE_COLORS[index % PIE_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value, name, item) => [
                          `${value} payments (${money(item.payload.amount)})`,
                          item.payload.name,
                        ]}
                      />
                      <Legend
                        wrapperStyle={{ fontSize: "11px" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="pt-8 text-sm text-inksoft">
                    No payment data.
                  </p>
                )}
              </ChartCard>

              {/* 3. Customer Orders */}
              <ChartCard title="Customer Orders">
                {customerChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={customerChartData}
                      margin={{ top: 4, right: 4, left: -20, bottom: 30 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 10 }}
                        angle={-25}
                        textAnchor="end"
                        interval={0}
                      />
                      <YAxis
                        allowDecimals={false}
                        tick={{ fontSize: 10 }}
                      />
                      <Tooltip />
                      <Bar
                        dataKey="orders"
                        name="Orders"
                        fill="#14b8a6"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="pt-8 text-sm text-inksoft">
                    No customer order data.
                  </p>
                )}
              </ChartCard>

              {/* 4. Product Ratings */}
              <ChartCard title="Product Ratings">
                {ratingsChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={ratingsChartData}
                      margin={{ top: 4, right: 4, left: -18, bottom: 30 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 10 }}
                        angle={-25}
                        textAnchor="end"
                        interval={0}
                      />
                      <YAxis
                        domain={[0, 5]}
                        tick={{ fontSize: 10 }}
                      />
                      <Tooltip
                        formatter={(value) => [
                          `${Number(value).toFixed(2)} / 5`,
                          "Average rating",
                        ]}
                      />
                      <Bar
                        dataKey="rating"
                        name="Rating"
                        fill="#f59e0b"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="pt-8 text-sm text-inksoft">
                    No rated products yet.
                  </p>
                )}
              </ChartCard>
            </div>
          </section>

          {/* Sales Summary */}
          <section className="card-surface p-5 sm:p-6">
            <h3 className="text-lg font-semibold">Sales Summary</h3>

            {sales ? (
              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-xl bg-canvas p-4">
                  <p className="text-sm text-inksoft">Total Orders</p>
                  <p className="mt-2 text-2xl font-bold">
                    {sales.total_orders}
                  </p>
                </div>

                <div className="rounded-xl bg-canvas p-4">
                  <p className="text-sm text-inksoft">Total Sales</p>
                  <p className="mt-2 text-2xl font-bold">
                    {money(sales.total_sales)}
                  </p>
                </div>

                <div className="rounded-xl bg-canvas p-4">
                  <p className="text-sm text-inksoft">
                    Average Order Value
                  </p>
                  <p className="mt-2 text-2xl font-bold">
                    {money(sales.average_order_value)}
                  </p>
                </div>
              </div>
            ) : (
              <p className="mt-4 text-sm text-inksoft">
                No sales data available.
              </p>
            )}
          </section>

          {/* Top Selling Products */}
          <section className="card-surface p-5 sm:p-6">
            <h3 className="text-lg font-semibold">
              Top Selling Products
            </h3>

            {topProducts.length > 0 ? (
              <div className="mt-5 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="py-3 pr-4 text-left">Product</th>
                      <th className="py-3 pr-4 text-left">
                        Quantity Sold
                      </th>
                      <th className="py-3 text-left">Sales</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topProducts.map((item) => (
                      <tr
                        key={item.product_id}
                        className="border-b last:border-0"
                      >
                        <td className="py-3 pr-4 font-medium">
                          {item.product_name}
                        </td>
                        <td className="py-3 pr-4">
                          {item.total_quantity_sold}
                        </td>
                        <td className="py-3">
                          {money(item.total_sales)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="mt-4 text-sm text-inksoft">
                No product sales data available.
              </p>
            )}
          </section>

          {/* Low Stock */}
          <section className="card-surface p-5 sm:p-6">
            <h3 className="text-lg font-semibold">Low Stock Items</h3>

            {lowStock.length > 0 ? (
              <div className="mt-5 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="py-3 pr-4 text-left">Product</th>
                      <th className="py-3 pr-4 text-left">Quantity</th>
                      <th className="py-3 pr-4 text-left">
                        Reorder Level
                      </th>
                      <th className="py-3 text-left">Warehouse</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowStock.map((item) => (
                      <tr
                        key={item.inventory_id}
                        className="border-b last:border-0"
                      >
                        <td className="py-3 pr-4 font-medium">
                          {item.product_name}
                        </td>
                        <td className="py-3 pr-4">{item.quantity}</td>
                        <td className="py-3 pr-4">
                          {item.reorder_level}
                        </td>
                        <td className="py-3">
                          {item.warehouse_location || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="mt-4 text-sm text-inksoft">
                No low-stock items.
              </p>
            )}
          </section>

          {/* Customer Orders */}
          <section className="card-surface p-5 sm:p-6">
            <h3 className="text-lg font-semibold">
              Customer Order Count
            </h3>

            {customerOrders.length > 0 ? (
              <div className="mt-5 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="py-3 pr-4 text-left">Customer</th>
                      <th className="py-3 pr-4 text-left">Orders</th>
                      <th className="py-3 text-left">Total Spent</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customerOrders.map((item) => (
                      <tr
                        key={item.customer_id}
                        className="border-b last:border-0"
                      >
                        <td className="py-3 pr-4 font-medium">
                          {item.customer_name}
                        </td>
                        <td className="py-3 pr-4">
                          {item.order_count}
                        </td>
                        <td className="py-3">
                          {money(item.total_spent)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="mt-4 text-sm text-inksoft">
                No customer order data available.
              </p>
            )}
          </section>

          {/* Payment Methods */}
          <section className="card-surface p-5 sm:p-6">
            <h3 className="text-lg font-semibold">Payment Mode Split</h3>

            {paymentMethods.length > 0 ? (
              <div className="mt-5 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="py-3 pr-4 text-left">
                        Payment Method
                      </th>
                      <th className="py-3 pr-4 text-left">Payments</th>
                      <th className="py-3 text-left">Total Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentMethods.map((item) => (
                      <tr
                        key={item.payment_method}
                        className="border-b last:border-0"
                      >
                        <td className="py-3 pr-4 font-medium">
                          {item.payment_method}
                        </td>
                        <td className="py-3 pr-4">
                          {item.payment_count}
                        </td>
                        <td className="py-3">
                          {money(item.total_amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="mt-4 text-sm text-inksoft">
                No payment data available.
              </p>
            )}
          </section>

          {/* Average Ratings */}
          <section className="card-surface p-5 sm:p-6">
            <h3 className="text-lg font-semibold">
              Average Product Rating
            </h3>

            {ratings.length > 0 ? (
              <div className="mt-5 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="py-3 pr-4 text-left">Product</th>
                      <th className="py-3 pr-4 text-left">
                        Average Rating
                      </th>
                      <th className="py-3 text-left">Reviews</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ratings.map((item) => (
                      <tr
                        key={item.product_id}
                        className="border-b last:border-0"
                      >
                        <td className="py-3 pr-4 font-medium">
                          {item.product_name}
                        </td>
                        <td className="py-3 pr-4">
                          {item.average_rating !== null &&
                          item.average_rating !== undefined
                            ? `${Number(item.average_rating).toFixed(2)} / 5`
                            : "No ratings"}
                        </td>
                        <td className="py-3">{item.review_count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="mt-4 text-sm text-inksoft">
                No rating data available.
              </p>
            )}
          </section>
        </div>
      )}
    </AppLayout>
  );
}