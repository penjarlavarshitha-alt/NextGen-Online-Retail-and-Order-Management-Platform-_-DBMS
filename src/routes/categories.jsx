import { createFileRoute } from "@tanstack/react-router";
import AppLayout from "../components/AppLayout";
import DataTable from "../components/DataTable";
import RecordForm from "../components/RecordForm";

export const Route = createFileRoute("/categories")({
  head: () => ({
    meta: [
      { title: "Categories — NextGen Retail & Order Management" },
      { name: "description", content: "Product category classification records." },
      { property: "og:title", content: "Categories — NextGen Retail & Order Management" },
      { property: "og:description", content: "Add and browse product categories." },
    ],
  }),
  component: Categories,
});

function Categories() {
  return (
    <AppLayout breadcrumb="Home / Catalog" title="Categories">
      <DataTable
        title="Categories"
        schema="category_id · name · parent_id · description"
        columns={[
          { key: "category_id", label: "ID" },
          { key: "name", label: "Category" },
          { key: "parent", label: "Parent" },
          { key: "description", label: "Description" },
        ]}
      />
      <div className="mt-6">
        <RecordForm
          title="Add Category"
          endpoint="POST /api/categories"
          fields={[
            { name: "name", label: "Category Name", required: true, placeholder: "e.g. Electronics" },
            { name: "parent_id", label: "Parent Category ID", placeholder: "leave blank for top level" },
            { name: "description", label: "Description", wide: true, placeholder: "What belongs in this category" },
          ]}
        />
      </div>
    </AppLayout>
  );
}
