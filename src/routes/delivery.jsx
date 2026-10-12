import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import AppLayout from "../components/AppLayout";
import DataTable from "../components/DataTable";

export const Route = createFileRoute("/delivery")({
  head: () => ({
    meta: [
      { title: "Delivery — NextGen Retail & Order Management" },
      {
        name: "description",
        content: "Shipment tracking, delivery agents and status.",
      },
      {
        property: "og:title",
        content: "Delivery — NextGen Retail & Order Management",
      },
      {
        property: "og:description",
        content: "Browse shipment and delivery records.",
      },
    ],
  }),
  component: Delivery,
});

function Delivery() {
  const [deliveries, setDeliveries] = useState([]);

  const [orderId, setOrderId] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [courierName, setCourierName] = useState("");
  const [deliveryStatus, setDeliveryStatus] = useState("Pending");
  const [deliveryDate, setDeliveryDate] = useState("");

  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  const loadDeliveries = async () => {
    try {
      const response = await fetch(
        "http://localhost:4000/api/deliveries"
      );

      if (!response.ok) {
        throw new Error("Failed to load deliveries");
      }

      const data = await response.json();
      setDeliveries(data);
    } catch (error) {
      console.error("Error loading deliveries:", error);
    }
  };

  useEffect(() => {
    loadDeliveries();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setNotice("");

    if (!orderId || !deliveryAddress) {
      setNotice(
        "Please fill Order ID and Delivery Address."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:4000/api/deliveries",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            order_id: Number(orderId),
            delivery_address: deliveryAddress,
            courier_name: courierName || null,
            delivery_status: deliveryStatus,
            delivery_date: deliveryDate || null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to create delivery"
        );
      }

      console.log("Delivery created:", data);

      setNotice("Delivery saved successfully!");

      setOrderId("");
      setDeliveryAddress("");
      setCourierName("");
      setDeliveryStatus("Pending");
      setDeliveryDate("");

      await loadDeliveries();
    } catch (error) {
      console.error("Delivery API Error:", error);
      setNotice(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout
      breadcrumb="Home / Operations"
      title="Delivery"
    >
      <DataTable
        title="Delivery"
        schema="delivery_id · order_id · delivery_address · courier_name · delivery_status · delivery_date"
        columns={[
          { key: "delivery_id", label: "Delivery ID" },
          { key: "order_id", label: "Order" },
          { key: "delivery_address", label: "Address" },
          { key: "courier_name", label: "Courier" },
          { key: "delivery_status", label: "Status" },
          { key: "delivery_date", label: "Delivery Date" },
        ]}
        rows={deliveries}
      />

      <div className="mt-6">
        <section className="card-surface p-5 sm:p-6">
          <div>
            <h3 className="text-lg font-semibold">
              Add Delivery
            </h3>

            <p className="mt-1 text-sm text-inksoft font-mono">
              POST /api/deliveries — connected to backend
            </p>
          </div>

          <form
            className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4"
            onSubmit={handleSubmit}
          >
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Order ID *
              </label>

              <input
                type="number"
                min="1"
                className="field-input"
                placeholder="e.g. 1"
                value={orderId}
                onChange={(e) =>
                  setOrderId(e.target.value)
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">
                Courier Name
              </label>

              <input
                type="text"
                className="field-input"
                placeholder="e.g. BlueDart"
                value={courierName}
                onChange={(e) =>
                  setCourierName(e.target.value)
                }
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-1.5">
                Delivery Address *
              </label>

              <input
                type="text"
                className="field-input"
                placeholder="Enter delivery address"
                value={deliveryAddress}
                onChange={(e) =>
                  setDeliveryAddress(e.target.value)
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">
                Delivery Status *
              </label>

              <select
                className="field-input"
                value={deliveryStatus}
                onChange={(e) =>
                  setDeliveryStatus(e.target.value)
                }
              >
                <option value="Pending">Pending</option>
                <option value="Dispatched">Dispatched</option>
                <option value="In Transit">
                  In Transit
                </option>
                <option value="Delivered">Delivered</option>
                <option value="Returned">Returned</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">
                Delivery Date
              </label>

              <input
                type="date"
                className="field-input"
                value={deliveryDate}
                onChange={(e) =>
                  setDeliveryDate(e.target.value)
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
                {loading ? "Saving..." : "Save delivery"}
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