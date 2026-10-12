import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import AppLayout from "../components/AppLayout";
import DataTable from "../components/DataTable";
import RecordForm from "../components/RecordForm";

export const Route = createFileRoute("/inventory")({
  head: () => ({
    meta: [
      { title: "Inventory — NextGen Retail & Order Management" },
      {
        name: "description",
        content: "Stock levels, warehouses and reorder thresholds.",
      },
      {
        property: "og:title",
        content: "Inventory — NextGen Retail & Order Management",
      },
      {
        property: "og:description",
        content: "Add stock entries and monitor inventory levels.",
      },
    ],
  }),
  component: Inventory,
});

function Inventory() {
  const [inventory, setInventory] = useState([]);

  const loadInventory = async () => {
    try {
      const response = await fetch("http://localhost:4000/api/inventory");

      if (!response.ok) {
        throw new Error("Failed to load inventory");
      }

      const data = await response.json();
      setInventory(data);
    } catch (error) {
      console.error("Error loading inventory:", error);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  return (
    <AppLayout breadcrumb="Home / Catalog" title="Inventory">
      <DataTable
        title="Inventory"
        schema="inventory_id · product_id · warehouse · quantity · reorder_level"
        columns={[
          { key: "inventory_id", label: "ID" },
          { key: "product_id", label: "Product ID" },
          { key: "warehouse", label: "Warehouse" },
          { key: "quantity", label: "Quantity" },
          { key: "reorder_level", label: "Reorder Level" },
        ]}
        rows={inventory}
      />

      <div className="mt-6">
        <RecordForm
          title="Add Inventory / Stock"
          endpoint="POST /api/inventory"
          fields={[
            {
              name: "product_id",
              label: "Product ID",
              required: true,
              placeholder: "e.g. 12",
            },
            {
              name: "warehouse",
              label: "Warehouse",
              required: true,
              placeholder: "e.g. Central Store",
            },
            {
              name: "quantity",
              label: "Quantity",
              type: "number",
              required: true,
              placeholder: "0",
            },
            {
              name: "reorder_level",
              label: "Reorder Level",
              type: "number",
              placeholder: "0",
            },
            {
              name: "unit_cost",
              label: "Unit Cost",
              type: "number",
              placeholder: "0.00",
            },
          ]}
        />
      </div>
    </AppLayout>
  );
}