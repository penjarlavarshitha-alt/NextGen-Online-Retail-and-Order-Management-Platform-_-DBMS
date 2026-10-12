import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import AppLayout from "../components/AppLayout";
import DataTable from "../components/DataTable";
import RecordForm from "../components/RecordForm";

export const Route = createFileRoute("/customers")({
  head: () => ({
    meta: [
      { title: "Customers — NextGen Retail & Order Management" },
      {
        name: "description",
        content: "Manage customer records for the retail platform.",
      },
      {
        property: "og:title",
        content: "Customers — NextGen Retail & Order Management",
      },
      {
        property: "og:description",
        content: "Add and browse customer records.",
      },
    ],
  }),
  component: Customers,
});

function Customers() {
  const [customers, setCustomers] = useState([]);

  const loadCustomers = async () => {
    try {
      const response = await fetch("http://localhost:4000/api/customers");

      if (!response.ok) {
        throw new Error("Failed to load customers");
      }

      const data = await response.json();
      setCustomers(data);
    } catch (error) {
      console.error("Error loading customers:", error);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  return (
    <AppLayout breadcrumb="Home / Catalog" title="Customers">
      <DataTable
        title="Customers"
        schema="customer_id · name · email · phone · address"
        columns={[
          { key: "customer_id", label: "ID" },
          { key: "name", label: "Full Name" },
          { key: "email", label: "Email" },
          { key: "phone", label: "Phone" },
          { key: "address", label: "Address" },
        ]}
        rows={customers}
      />

      <div className="mt-6">
        <RecordForm
          title="Add Customer"
          endpoint="POST /api/customers"
          fields={[
            {
              name: "name",
              label: "Full Name",
              required: true,
              placeholder: "e.g. Priya Sharma",
            },
            {
              name: "email",
              label: "Email",
              type: "email",
              required: true,
              placeholder: "name@example.com",
            },
            {
              name: "phone",
              label: "Phone",
              type: "tel",
              required: false,
              placeholder: "+91 98765 43210",
            },
            {
              name: "address",
              label: "Address",
              wide: true,
              placeholder: "Street, area, pincode",
            },
          ]}
        />
      </div>
    </AppLayout>
  );
}