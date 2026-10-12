import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import AppLayout from "../components/AppLayout";
import DataTable from "../components/DataTable";
import RecordForm from "../components/RecordForm";

export const Route = createFileRoute("/categories")({
  head: () => ({
    meta: [
      { title: "Categories — NextGen Retail & Order Management" },
      {
        name: "description",
        content: "Product category classification records.",
      },
      {
        property: "og:title",
        content: "Categories — NextGen Retail & Order Management",
      },
      {
        property: "og:description",
        content: "Add and browse product categories.",
      },
    ],
  }),
  component: Categories,
});

function Categories() {
  const [categories, setCategories] = useState([]);

  const loadCategories = async () => {
    try {
      const response = await fetch(
        "http://localhost:4000/api/categories"
      );

      if (!response.ok) {
        throw new Error("Failed to load categories");
      }

      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  return (
    <AppLayout breadcrumb="Home / Catalog" title="Categories">
      <DataTable
        title="Categories"
        schema="category_id · name · description"
        columns={[
          { key: "category_id", label: "ID" },
          { key: "name", label: "Name" },
          { key: "description", label: "Description" },
        ]}
        rows={categories}
      />

      <div className="mt-6">
        <RecordForm
          title="Add Category"
          endpoint="POST /api/categories"
          onSubmit={() => {
            loadCategories();
          }}
          fields={[
            {
              name: "name",
              label: "Name",
              required: true,
              placeholder: "e.g. Electronics",
            },
            {
              name: "description",
              label: "Description",
              wide: true,
              placeholder: "What belongs in this category",
            },
          ]}
        />
      </div>
    </AppLayout>
  );
}