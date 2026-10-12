import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import AppLayout from "../components/AppLayout";
import DataTable from "../components/DataTable";

const API = "http://localhost:4000/api";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Cart — NextGen Retail & Order Management" },
      {
        name: "description",
        content: "Manage customer shopping carts.",
      },
    ],
  }),
  component: Cart,
});

function Cart() {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [customerCarts, setCustomerCarts] = useState([]);

  const [customerId, setCustomerId] = useState("");
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedCustomer = customers.find(
    (customer) => String(customer.customer_id) === customerId
  );

  const selectedProduct = products.find(
    (product) => String(product.product_id) === productId
  );

  const productPrice = selectedProduct
    ? Number(selectedProduct.price)
    : 0;

  const totalPrice = productPrice * Number(quantity || 0);

  async function loadCustomers() {
    const response = await fetch(`${API}/customers`);

    if (!response.ok) {
      throw new Error("Failed to load customers");
    }

    const data = await response.json();

    setCustomers(
      Array.isArray(data) ? data : data.customers || []
    );
  }

  async function loadProducts() {
    const response = await fetch(`${API}/products`);

    if (!response.ok) {
      throw new Error("Failed to load products");
    }

    const data = await response.json();

    setProducts(
      Array.isArray(data) ? data : data.products || []
    );
  }

  async function loadCartItems() {
    const response = await fetch(`${API}/carts`);

    if (!response.ok) {
      throw new Error("Failed to load cart items");
    }

    const data = await response.json();
    const rows = Array.isArray(data) ? data : data.carts || [];

    setCartItems(
      rows.map((item, index) => ({
        ...item,
        id:
          item.cart_item_id != null
            ? `cart-item-${item.cart_item_id}`
            : `cart-${item.cart_id}-${index}`,
      }))
    );
  }

  async function loadCustomerCarts(id) {
    if (!id) {
      setCustomerCarts([]);
      return [];
    }

    const response = await fetch(
      `${API}/carts/customer/${id}`
    );

    if (!response.ok) {
      throw new Error("Failed to load customer's carts");
    }

    const data = await response.json();

    const carts = Array.isArray(data)
      ? data
      : data.carts || [];

    setCustomerCarts(carts);

    return carts;
  }

  useEffect(() => {
    async function initialize() {
      try {
        await Promise.all([
          loadCustomers(),
          loadProducts(),
          loadCartItems(),
        ]);
      } catch (error) {
        console.error(error);
        setMessage("Could not load data. Check the backend server.");
      }
    }

    initialize();
  }, []);

  async function handleCustomerChange(event) {
    setCustomerId(event.target.value);
    setMessage("");
    setCustomerCarts([]);

    if (!event.target.value) return;

    try {
      await loadCustomerCarts(event.target.value);
    } catch (error) {
      console.error(error);
      setMessage("Could not load this customer's carts.");
    }
  }

  async function handleAddToCart(event) {
    event.preventDefault();

    if (!customerId) {
      setMessage("Please select a customer ID.");
      return;
    }

    if (!productId) {
      setMessage("Please select a product ID.");
      return;
    }

    if (!Number.isInteger(Number(quantity)) || Number(quantity) < 1) {
      setMessage("Quantity must be a whole number greater than zero.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      // Find an existing cart for this customer.
      let carts = await loadCustomerCarts(customerId);
      let cart = carts[0];

      // Automatically create a cart if the customer has none.
      if (!cart) {
        const createResponse = await fetch(`${API}/carts`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            customer_id: Number(customerId),
          }),
        });

        const createdCart = await createResponse.json();

        if (!createResponse.ok) {
          throw new Error(
            createdCart.message || "Could not create customer cart"
          );
        }

        cart = createdCart;
      }

      if (!cart.cart_id) {
        throw new Error("The backend did not return a cart ID.");
      }

      // Add the selected product to the customer's cart.
      const response = await fetch(`${API}/carts/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cart_id: Number(cart.cart_id),
          product_id: Number(productId),
          quantity: Number(quantity),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Could not add product to cart"
        );
      }

      await Promise.all([
        loadCartItems(),
        loadCustomerCarts(customerId),
      ]);

      setMessage(
        `${selectedProduct?.name || "Product"} added to ${
          selectedCustomer?.name || "customer"
        }'s cart successfully.`
      );

      setProductId("");
      setQuantity("1");
    } catch (error) {
      console.error(error);
      setMessage(
        error.message || "Something went wrong while adding the product."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppLayout breadcrumb="Home / Operations" title="Cart">
      <div className="mb-6 rounded-lg border p-5">
        <h2 className="mb-5 text-lg font-semibold">
          Add Product to Customer Cart
        </h2>

        <form onSubmit={handleAddToCart} className="space-y-5">
          {/* Customer ID */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Customer ID
            </label>

            <select
              className="w-full rounded-md border p-3"
              value={customerId}
              onChange={handleCustomerChange}
              required
            >
              <option value="">Select Customer ID</option>

              {customers.map((customer) => (
                <option
                  key={customer.customer_id}
                  value={customer.customer_id}
                >
                  {customer.customer_id}
                </option>
              ))}
            </select>
          </div>

          {/* Automatically displayed customer name */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Customer Name
            </label>

            <input
              className="w-full rounded-md border bg-gray-100 p-3"
              value={selectedCustomer?.name || ""}
              placeholder="Customer name appears automatically"
              readOnly
            />
          </div>

          {/* Product ID */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Product ID
            </label>

            <select
              className="w-full rounded-md border p-3"
              value={productId}
              onChange={(event) => setProductId(event.target.value)}
              required
            >
              <option value="">Select Product ID</option>

              {products.map((product) => (
                <option
                  key={product.product_id}
                  value={product.product_id}
                >
                  {product.product_id}
                </option>
              ))}
            </select>
          </div>

          {/* Automatically displayed product name */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Product Name
            </label>

            <input
              className="w-full rounded-md border bg-gray-100 p-3"
              value={selectedProduct?.name || ""}
              placeholder="Product name appears automatically"
              readOnly
            />
          </div>

          {/* Automatically displayed price */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Price per Item (₹)
            </label>

            <input
              className="w-full rounded-md border bg-gray-100 p-3"
              value={selectedProduct ? productPrice.toFixed(2) : ""}
              placeholder="Price appears automatically"
              readOnly
            />
          </div>

          {/* User enters quantity */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Quantity
            </label>

            <input
              className="w-full rounded-md border p-3"
              type="number"
              min="1"
              step="1"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              required
            />
          </div>

          {/* Automatically calculated total */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Total Price (₹)
            </label>

            <input
              className="w-full rounded-md border bg-gray-100 p-3"
              value={
                selectedProduct && Number(quantity) > 0
                  ? totalPrice.toFixed(2)
                  : ""
              }
              readOnly
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-blue-600 px-5 py-3 text-white disabled:opacity-50"
          >
            {loading ? "Adding Product..." : "Add to Cart"}
          </button>
        </form>

        {message && (
          <p className="mt-4 rounded-md border p-3" role="status">
            {message}
          </p>
        )}
      </div>

      <DataTable
        title="Cart Items"
        schema="cart_id · customer · product · quantity · price · total"
        columns={[
          { key: "cart_id", label: "Cart ID" },
          { key: "customer_name", label: "Customer" },
          { key: "product_name", label: "Product" },
          { key: "quantity", label: "Qty" },
          { key: "price", label: "Price" },
          { key: "line_total", label: "Total" },
          { key: "created_at", label: "Added On" },
        ]}
        rows={cartItems}
      />
    </AppLayout>
  );
}