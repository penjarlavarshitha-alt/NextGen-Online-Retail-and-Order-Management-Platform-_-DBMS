/**
 * Generic record table.
 * Displays live records received from the backend API.
 */
export default function DataTable({
  title,
  schema,
  columns,
  rows = [],
  action,
}) {
  return (
    <section className="card-surface">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-ink/10">
        <div>
          <h3 className="text-lg font-semibold leading-none">
            {title}
          </h3>

          {schema && (
            <p className="mt-1 text-sm text-inksoft font-mono">
              {schema}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 h-9 px-3 rounded-lg bg-canvas text-sm text-inksoft font-mono">
            <span className="size-1.5 rounded-full bg-brand2" />
            {rows.length} results
          </div>

          {action}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left">
          <thead>
            <tr className="border-b border-ink/10">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-inksoft/70"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-5 py-16"
                >
                  <div className="grid place-items-center text-center">
                    <div className="size-14 rounded-2xl bg-accent/20 grid place-items-center text-2xl font-bold text-ink">
                      0
                    </div>

                    <p className="mt-4 text-base font-semibold">
                      No {title.toLowerCase()} records yet
                    </p>

                    <p className="mt-1 text-sm text-inksoft max-w-[38ch] text-pretty">
                      This table loads live from your PostgreSQL backend.
                      Records appear once the API is connected.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              rows.map((row, i) => (
                <tr
                  key={
                    row.cart_item_id ??
                    row.order_item_id ??
                    row.product_id ??
                    row.customer_id ??
                    row.cart_id ??
                    row.id ??
                    i
                  }
                  className="border-b border-ink/5 last:border-0"
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className="px-5 py-3 text-sm"
                    >
                      {row[col.key] ?? ""}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}