import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import AppLayout from "../components/AppLayout";
import DataTable from "../components/DataTable";

export const Route = createFileRoute("/orders")({
  head: () => ({
    meta: [
      { title: "Orders — NextGen Retail & Order Management" },
      {
        name: "description",
        content: "Placed orders, totals and order status records.",
      },
      {
        property: "og:title",
        content: "Orders — NextGen Retail & Order Management",
      },
      {
        property: "og:description",
        content: "Browse the order lifecycle and status.",
      },
    ],
  }),
  component: Orders,
});

function Orders() {
  const [orders, setOrders] = useState([]);

  const [customerId, setCustomerId] = useState("");
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [status, setStatus] = useState("Pending");

  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  const loadOrders = async () => {
    try {
      const response = await fetch(
        "http://localhost:4000/api/orders"
      );

      if (!response.ok) {
        throw new Error("Failed to load orders");
      }

      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error("Error loading orders:", error);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setNotice("");

    if (!customerId || !productId || !quantity) {
      setNotice("Please fill all required fields.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:4000/api/orders",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            customer_id: Number(customerId),
            status,
            items: [
              {
                product_id: Number(productId),
                quantity: Number(quantity),
              },
            ],
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to create order"
        );
      }

      console.log("Order created:", data);

      setNotice("Order saved successfully!");

      setCustomerId("");
      setProductId("");
      setQuantity("");
      setStatus("Pending");

      await loadOrders();
    } catch (error) {
      console.error("Order API Error:", error);
      setNotice(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout
      breadcrumb="Home / Operations"
      title="Orders"
    >
      <DataTable
        title="Orders"
        schema="order_id · customer · order_date · total_amount · status"
        columns={[
          {
            key: "order_id",
            label: "Order ID",
          },
          {
            key: "customer_name",
            label: "Customer",
          },
          {
            key: "order_date",
            label: "Order Date",
          },
          {
            key: "total_amount",
            label: "Total",
          },
          {
            key: "status",
            label: "Status",
          },
        ]}
        rows={orders}
      />

      <div className="mt-6">
        <section className="card-surface p-5 sm:p-6">
          <div>
            <h3 className="text-lg font-semibold">
              Add Order
            </h3>

            <p className="mt-1 text-sm text-inksoft font-mono">
              POST /api/orders — connected to backend
            </p>
          </div>

          <form
            className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4"
            onSubmit={handleSubmit}
          >
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Customer ID *
              </label>

              <input
                type="number"
                className="field-input"
                placeholder="e.g. 1"
                value={customerId}
                onChange={(e) =>
                  setCustomerId(e.target.value)
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">
                Status *
              </label>

              <select
                className="field-input"
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value)
                }
              >
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">
                Product ID *
              </label>

              <input
                type="number"
                className="field-input"
                placeholder="e.g. 2"
                value={productId}
                onChange={(e) =>
                  setProductId(e.target.value)
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">
                Quantity *
              </label>

              <input
                type="number"
                min="1"
                className="field-input"
                placeholder="1"
                value={quantity}
                onChange={(e) =>
                  setQuantity(e.target.value)
                }
              />
            </div>

            <div className="sm:col-span-2 flex flex-wrap items-center justify-between gap-3 pt-2">
              <p className="text-xs text-inksoft font-mono">
                * required · saved to PostgreSQL
              </p>

              <button
                type="submit"
                disabled={loading}
                className="h-11 px-6 rounded-full bg-primary text-primary-foreground text-sm font-semibold"
              >
                {loading ? "Saving..." : "Save order"}
              </button>
            </div>

            {notice && (
              <p className="sm:col-span-2 text-sm font-medium">
                {notice}
              </p>
            )}
          </form>
        </section>
      </div>
    </AppLayout>
  );
}