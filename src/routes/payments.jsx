import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import AppLayout from "../components/AppLayout";
import DataTable from "../components/DataTable";

export const Route = createFileRoute("/payments")({
  head: () => ({
    meta: [
      { title: "Payments — NextGen Retail & Order Management" },
      {
        name: "description",
        content: "Payment transactions, modes and statuses.",
      },
      {
        property: "og:title",
        content: "Payments — NextGen Retail & Order Management",
      },
      {
        property: "og:description",
        content: "Browse payment transaction records.",
      },
    ],
  }),
  component: Payments,
});

function Payments() {
  const [payments, setPayments] = useState([]);

  const [orderId, setOrderId] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [paymentStatus, setPaymentStatus] = useState("Pending");

  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  const loadPayments = async () => {
    try {
      const response = await fetch(
        "http://localhost:4000/api/payments"
      );

      if (!response.ok) {
        throw new Error("Failed to load payments");
      }

      const data = await response.json();
      setPayments(data);
    } catch (error) {
      console.error("Error loading payments:", error);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setNotice("");

    if (!orderId || !amount) {
      setNotice("Please fill all required fields.");
      return;
    }

    if (Number(amount) < 0) {
      setNotice("Amount cannot be negative.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:4000/api/payments",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            order_id: Number(orderId),
            amount: Number(amount),
            payment_method: paymentMethod,
            payment_status: paymentStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to create payment"
        );
      }

      console.log("Payment created:", data);

      setNotice("Payment saved successfully!");

      setOrderId("");
      setAmount("");
      setPaymentMethod("UPI");
      setPaymentStatus("Pending");

      await loadPayments();
    } catch (error) {
      console.error("Payment API Error:", error);
      setNotice(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout
      breadcrumb="Home / Operations"
      title="Payments"
    >
      <DataTable
        title="Payments"
        schema="payment_id · order_id · amount · payment_method · payment_date · payment_status"
        columns={[
          { key: "payment_id", label: "Payment ID" },
          { key: "order_id", label: "Order" },
          { key: "amount", label: "Amount" },
          { key: "payment_method", label: "Method" },
          { key: "payment_date", label: "Payment Date" },
          { key: "payment_status", label: "Status" },
        ]}
        rows={payments}
      />

      <div className="mt-6">
        <section className="card-surface p-5 sm:p-6">
          <div>
            <h3 className="text-lg font-semibold">
              Add Payment
            </h3>

            <p className="mt-1 text-sm text-inksoft font-mono">
              POST /api/payments — connected to backend
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
                onChange={(e) => setOrderId(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">
                Amount *
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                className="field-input"
                placeholder="e.g. 15000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">
                Payment Method *
              </label>

              <select
                className="field-input"
                value={paymentMethod}
                onChange={(e) =>
                  setPaymentMethod(e.target.value)
                }
              >
                <option value="Card">Card</option>
                <option value="UPI">UPI</option>
                <option value="NetBanking">
                  NetBanking
                </option>
                <option value="COD">COD</option>
                <option value="Wallet">Wallet</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">
                Payment Status *
              </label>

              <select
                className="field-input"
                value={paymentStatus}
                onChange={(e) =>
                  setPaymentStatus(e.target.value)
                }
              >
                <option value="Pending">Pending</option>
                <option value="Success">Success</option>
                <option value="Failed">Failed</option>
                <option value="Refunded">Refunded</option>
              </select>
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
                {loading ? "Saving..." : "Save payment"}
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