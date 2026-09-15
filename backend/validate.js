// Shared, very small validation helpers used by all route files.

export function isId(value) {
  const n = Number(value);
  return Number.isInteger(n) && n > 0;
}

export function toId(value) {
  return Number(value);
}

// Builds a validated object from `body` using a simple field spec.
// spec: { field: { type: "string"|"number"|"int"|"date", required, max, min, pattern, enum } }
export function validate(body, spec) {
  const errors = [];
  const data = {};

  for (const [field, rules] of Object.entries(spec)) {
    const raw = body?.[field];

    if (raw === undefined || raw === null || String(raw).trim() === "") {
      if (rules.required) errors.push(`${field} is required`);
      else data[field] = rules.default ?? null;
      continue;
    }

    if (rules.type === "number" || rules.type === "int") {
      const n = Number(raw);
      if (Number.isNaN(n)) {
        errors.push(`${field} must be a number`);
        continue;
      }
      if (rules.type === "int" && !Number.isInteger(n)) {
        errors.push(`${field} must be a whole number`);
        continue;
      }
      if (rules.min !== undefined && n < rules.min) {
        errors.push(`${field} must be at least ${rules.min}`);
        continue;
      }
      if (rules.max !== undefined && n > rules.max) {
        errors.push(`${field} must be at most ${rules.max}`);
        continue;
      }
      data[field] = n;
      continue;
    }

    const v = String(raw).trim();

    if (rules.enum && !rules.enum.includes(v)) {
      errors.push(`${field} must be one of: ${rules.enum.join(", ")}`);
      continue;
    }
    if (rules.max && v.length > rules.max) {
      errors.push(`${field} must be at most ${rules.max} characters`);
      continue;
    }
    if (rules.pattern && !rules.pattern.test(v)) {
      errors.push(`${field} is not valid`);
      continue;
    }
    data[field] = v;
  }

  return { errors, data };
}

// Sends a 400 response when validation fails. Returns true if it handled the response.
export function sendValidationError(res, errors) {
  if (errors.length === 0) return false;
  res.status(400).json({ error: "Validation failed", details: errors });
  return true;
}
