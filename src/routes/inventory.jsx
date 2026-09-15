import { createFileRoute } from "@tanstack/react-router";
import AppLayout from "../components/AppLayout";
import DataTable from "../components/DataTable";
import RecordForm from "../components/RecordForm";

export const Route = createFileRoute("/inventory")({
  head: () => ({
    meta: [
      { title: "Inventory — NextGen Retail & Order Management" },
      { name: "description", content: "Stock levels, warehouses and reorder thresholds." },
      { property: "og:title", content: "Inventory — NextGen Retail & Order Management" },
      { property: "og:description", content: "Add stock entries and monitor inventory levels." },
    ],
  }),
  component: Inventory,
});

function Inventory() {
  return (
    <AppLayout breadcrumb="Home / Catalog" title="Inventory">
      <DataTable
        title="Inventory"
        schema="inventory_id · product_id · warehouse · quantity · reorder_level"
        columns={[
          { key: "inventory_id", label: "ID" },
          { key: "product", label: "Product" },
          { key: "warehouse", label: "Warehouse" },
          { key: "quantity", label: "Quantity" },
          { key: "reorder_level", label: "Reorder Level" },
        ]}
      />
      <div className="mt-6">
        <RecordForm
          title="Add Inventory / Stock"
          endpoint="POST /api/inventory"
          fields={[
            { name: "product_id", label: "Product ID", required: true, placeholder: "e.g. 12" },
            { name: "warehouse", label: "Warehouse", required: true, placeholder: "e.g. Central Store" },
            { name: "quantity", label: "Quantity", type: "number", required: true, placeholder: "0" },
            { name: "reorder_level", label: "Reorder Level", type: "number", placeholder: "0" },
            { name: "unit_cost", label: "Unit Cost", type: "number", placeholder: "0.00" },
          ]}
        />
      </div>
    </AppLayout>
  );
}
