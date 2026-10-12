import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import AppLayout from "../components/AppLayout";
import DataTable from "../components/DataTable";

export const Route = createFileRoute("/reviews")({
  head: () => ({
    meta: [
      { title: "Reviews — NextGen Retail & Order Management" },
      {
        name: "description",
        content: "Customer ratings and product feedback records.",
      },
      {
        property: "og:title",
        content: "Reviews — NextGen Retail & Order Management",
      },
      {
        property: "og:description",
        content: "Browse product ratings and reviews.",
      },
    ],
  }),
  component: Reviews,
});

function Reviews() {
  const [reviews, setReviews] = useState([]);

  const [customerId, setCustomerId] = useState("");
  const [productId, setProductId] = useState("");
  const [rating, setRating] = useState("5");
  const [comment, setComment] = useState("");

  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  const loadReviews = async () => {
    try {
      const response = await fetch(
        "http://localhost:4000/api/reviews"
      );

      if (!response.ok) {
        throw new Error("Failed to load reviews");
      }

      const data = await response.json();
      setReviews(data);
    } catch (error) {
      console.error("Error loading reviews:", error);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setNotice("");

    if (!customerId || !productId || !rating) {
      setNotice(
        "Please fill Customer ID, Product ID and Rating."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:4000/api/reviews",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            customer_id: Number(customerId),
            product_id: Number(productId),
            rating: Number(rating),
            comment: comment || null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to create review"
        );
      }

      console.log("Review created:", data);

      setNotice("Review saved successfully!");

      setCustomerId("");
      setProductId("");
      setRating("5");
      setComment("");

      await loadReviews();
    } catch (error) {
      console.error("Review API Error:", error);
      setNotice(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout
      breadcrumb="Home / Operations"
      title="Reviews"
    >
      <DataTable
        title="Reviews"
        schema="review_id · customer · product · rating · comment · review_date"
        columns={[
          { key: "review_id", label: "Review ID" },
          { key: "customer_name", label: "Customer" },
          { key: "product_name", label: "Product" },
          { key: "rating", label: "Rating" },
          { key: "comment", label: "Comment" },
          { key: "review_date", label: "Date" },
        ]}
        rows={reviews}
      />

      <div className="mt-6">
        <section className="card-surface p-5 sm:p-6">
          <div>
            <h3 className="text-lg font-semibold">
              Add Review
            </h3>

            <p className="mt-1 text-sm text-inksoft font-mono">
              POST /api/reviews — connected to backend
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
                min="1"
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
                Product ID *
              </label>

              <input
                type="number"
                min="1"
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
                Rating *
              </label>

              <select
                className="field-input"
                value={rating}
                onChange={(e) =>
                  setRating(e.target.value)
                }
              >
                <option value="1">1 — Poor</option>
                <option value="2">2 — Fair</option>
                <option value="3">3 — Good</option>
                <option value="4">4 — Very Good</option>
                <option value="5">5 — Excellent</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">
                Comment
              </label>

              <input
                type="text"
                maxLength="500"
                className="field-input"
                placeholder="Write your review"
                value={comment}
                onChange={(e) =>
                  setComment(e.target.value)
                }
              />
            </div>

            <div className="sm:col-span-2 flex flex-wrap items-center justify-between gap-3 pt-2">
              <p className="text-xs text-inksoft font-mono">
                * required · rating must be 1–5 · saved to PostgreSQL
              </p>

              <button
                type="submit"
                disabled={loading}
                className="h-11 px-6 rounded-full bg-primary text-primary-foreground text-sm font-semibold"
              >
                {loading ? "Saving..." : "Save review"}
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