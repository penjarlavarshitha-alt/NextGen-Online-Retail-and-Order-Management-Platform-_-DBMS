import { useState } from "react";

/**
 * Reusable add-record form.
 * fields: [{ name, label, type, required, options?, placeholder? }]
 * Nothing is persisted yet — submit only validates and reports that the
 * backend endpoint is not wired in.
 */
export default function RecordForm({ title, endpoint, fields, onSubmit }) {
  const empty = Object.fromEntries(fields.map((f) => [f.name, ""]));
  const [values, setValues] = useState(empty);
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState("");

  function validate() {
    const next = {};
    fields.forEach((f) => {
      const value = String(values[f.name] ?? "").trim();
      if (f.required && !value) next[f.name] = `${f.label} is required.`;
      else if (value && f.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
        next[f.name] = "Enter a valid email address.";
      else if (value && f.type === "number" && Number.isNaN(Number(value)))
        next[f.name] = "Enter a number.";
    });
    return next;
  }

  function handleSubmit(event) {
    event.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) {
      setNotice("");
      return;
    }
    setNotice(`Validated. ${endpoint} is not connected yet — no record was saved.`);
    if (onSubmit) onSubmit(values);
  }

  return (
    <section className="card-surface p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold leading-none">{title}</h3>
          <p className="mt-1 text-sm text-inksoft font-mono">{endpoint} — ready to bind</p>
        </div>
        <span className="text-[11px] font-mono text-inksoft bg-canvas px-2.5 py-1 rounded-full">
          Form
        </span>
      </div>

      <form className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4" noValidate onSubmit={handleSubmit}>
        {fields.map((field) => (
          <div key={field.name} className={field.wide ? "sm:col-span-2" : undefined}>
            <label htmlFor={field.name} className="block text-sm font-medium mb-1.5">
              {field.label} {field.required && <span className="text-brand2">*</span>}
            </label>
            {field.options ? (
              <select
                id={field.name}
                className="field-input"
                value={values[field.name]}
                onChange={(e) => setValues({ ...values, [field.name]: e.target.value })}
              >
                <option value="">Select {field.label.toLowerCase()}</option>
                {field.options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : (
              <input
                id={field.name}
                type={field.type === "number" ? "number" : field.type || "text"}
                placeholder={field.placeholder}
                className="field-input"
                aria-invalid={Boolean(errors[field.name])}
                value={values[field.name]}
                onChange={(e) => setValues({ ...values, [field.name]: e.target.value })}
              />
            )}
            {errors[field.name] && (
              <p className="mt-1.5 text-xs text-neg font-medium">{errors[field.name]}</p>
            )}
          </div>
        ))}

        <div className="sm:col-span-2 flex flex-wrap items-center justify-between gap-3 pt-2">
          <p className="text-xs text-inksoft font-mono">* required · validated on submit</p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setValues(empty);
                setErrors({});
                setNotice("");
              }}
              className="h-11 px-5 rounded-full bg-canvas text-sm font-medium text-ink"
            >
              Reset
            </button>
            <button
              type="submit"
              className="h-11 px-6 rounded-full bg-primary text-primary-foreground text-sm font-semibold"
            >
              Save record
            </button>
          </div>
        </div>

        {notice && (
          <p className="sm:col-span-2 text-sm text-pos font-medium">{notice}</p>
        )}
      </form>
    </section>
  );
}
