import { createFileRoute } from "@tanstack/react-router";
import AppLayout from "../components/AppLayout";
import DataTable from "../components/DataTable";
import RecordForm from "../components/RecordForm";

export const Route = createFileRoute("/products")({
  head: () => ({
    meta: [
      { title: "Products — NextGen Retail & Order Management" },
      { name: "description", content: "Catalog items, pricing and product records." },
      { property: "og:title", content: "Products — NextGen Retail & Order Management" },
      { property: "og:description", content: "Add and browse product catalog records." },
    ],
  }),
  component: Products,
});

function Products() {
  return (
    <AppLayout breadcrumb="Home / Catalog" title="Products">
      <DataTable
        title="Products"
        schema="product_id · name · sku · category_id · price"
        columns={[
          { key: "product_id", label: "ID" },
          { key: "name", label: "Product" },
          { key: "sku", label: "SKU" },
          { key: "category", label: "Category" },
          { key: "price", label: "Price" },
        ]}
      />
      <div className="mt-6">
        <RecordForm
          title="Add Product"
          endpoint="POST /api/products"
          fields={[
            { name: "name", label: "Product Name", required: true, placeholder: "e.g. Desk Lamp" },
            { name: "sku", label: "SKU / Code", required: true, placeholder: "e.g. PRD-0001" },
            { name: "category_id", label: "Category ID", required: true, placeholder: "e.g. 3" },
            { name: "price", label: "Price", type: "number", required: true, placeholder: "0.00" },
            { name: "description", label: "Description", wide: true, placeholder: "Short product description" },
          ]}
        />
      </div>
    </AppLayout>
  );
}
