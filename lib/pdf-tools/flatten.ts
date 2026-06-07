// Form-related PDF tools.
//   - flattenForm: bake all form fields into static page content
//   - listFormFields: enumerate fields + values (for the /forms inspect page)
//   - exportFormData / importFormData: FDF round-trip
//
// pdf-lib's form API is JS-only and works on any runtime.

import { PDFDocument } from "pdf-lib";

export interface FlattenResult {
  bytes: Uint8Array;
  fieldCount: number;
}

/** Bake every form field on every page into static graphics. */
export async function flattenForm(buffer: Uint8Array): Promise<FlattenResult> {
  const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
  const form = doc.getForm();
  const fields = form.getFields();
  form.flatten();
  const bytes = await doc.save({ useObjectStreams: true });
  return { bytes, fieldCount: fields.length };
}

export interface FormFieldInfo {
  name: string;
  type: string; // "Text" | "CheckBox" | "Radio" | "Dropdown" | "OptionList" | "Button" | "Signature" | "Unknown"
  value: string;
  options?: string[]; // for Dropdown / OptionList
}

/**
 * List every form field with its current value. Returns an empty array
 * if the document has no form.
 */
export async function listFormFields(
  buffer: Uint8Array
): Promise<{ fields: FormFieldInfo[]; hasForm: boolean }> {
  const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
  const form = doc.getForm();
  const fields = form.getFields();
  if (fields.length === 0) {
    return { fields: [], hasForm: false };
  }
  const out: FormFieldInfo[] = fields.map((f) => {
    const type = f.constructor.name.replace(/^PDF/, "").replace("Field", "");
    const info: FormFieldInfo = {
      name: f.getName(),
      type,
      value: safeGetValue(f),
    };
    if (type === "Dropdown" || type === "OptionList") {
      try {
        info.options = (f as unknown as { getOptions(): string[] }).getOptions();
      } catch {
        /* ignore */
      }
    }
    return info;
  });
  return { fields: out, hasForm: true };
}

function safeGetValue(f: unknown): string {
  try {
    const v = (f as { getValue?: () => unknown }).getValue?.();
    if (v === undefined || v === null) return "";
    if (typeof v === "string") return v;
    if (Array.isArray(v)) return v.join(", ");
    return String(v);
  } catch {
    return "";
  }
}

/** Serialize form values to a minimal FDF blob (text). */
export async function exportFormData(buffer: Uint8Array): Promise<string> {
  const { fields } = await listFormFields(buffer);
  const lines = ["%FDF-1.2", "1 0 obj", "<<"];
  for (const f of fields) {
    lines.push(`/T (${escapeFdfString(f.name)})`);
    lines.push(`/V (${escapeFdfString(f.value)})`);
  }
  lines.push(">>", "endobj", "trailer", "<< /Root 1 0 R >>", "%%EOF");
  return lines.join("\n");
}

function escapeFdfString(s: string): string {
  // FDF parens-style escaping: \\, \(, \)
  return s.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}
