// Flatten a PDF form: bake every form field into static page content.
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