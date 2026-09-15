import { createFileRoute } from "@tanstack/react-router";
import AppLayout from "../components/AppLayout";
import DataTable from "../components/DataTable";
import RecordForm from "../components/RecordForm";

export const Route = createFileRoute("/customers")({
  head: () => ({
    meta: [
      { title: "Customers — NextGen Retail & Order Management" },
      { name: "description", content: "Manage customer records for the retail platform." },
      { property: "og:title", content: "Customers — NextGen Retail & Order Management" },
      { property: "og:description", content: "Add and browse customer records." },
    ],
  }),
  component: Customers,
});

function Customers() {
  return (
    <AppLayout breadcrumb="Home / Catalog" title="Customers">
      <DataTable
        title="Customers"
        schema="customer_id · full_name · email · phone · city"
        columns={[
          { key: "customer_id", label: "ID" },
          { key: "full_name", label: "Full Name" },
          { key: "email", label: "Email" },
          { key: "phone", label: "Phone" },
          { key: "city", label: "City" },
        ]}
      />
      <div className="mt-6">
        <RecordForm
          title="Add Customer"
          endpoint="POST /api/customers"
          fields={[
            { name: "full_name", label: "Full Name", required: true, placeholder: "e.g. Priya Sharma" },
            { name: "email", label: "Email", type: "email", required: true, placeholder: "name@example.com" },
            { name: "phone", label: "Phone", type: "tel", required: true, placeholder: "+91 98765 43210" },
            { name: "city", label: "City", placeholder: "e.g. Pune" },
            { name: "address", label: "Address", wide: true, placeholder: "Street, area, pincode" },
          ]}
        />
      </div>
    </AppLayout>
  );
}
