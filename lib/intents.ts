/**
 * Lightweight intent matcher — no real AI. Maps a natural-language
 * request to one of our existing tools (or marks the request as
 * "coming soon" if it would need an actual LLM / OCR backend).
 *
 * Each rule is a list of regex patterns. The first rule that matches
 * wins. Order matters — put more specific rules before more general
 * ones (e.g. "password protect" before the generic "protect").
 *
 * To add a new tool, just add a { path, label, status, why } entry.
 * To add a new phrase, just add a regex to the right rule.
 */

export type IntentStatus = "ready" | "coming-soon";

export interface IntentMatch {
  path: string; // route within /[locale]
  label: string;
  status: IntentStatus;
  reason: string; // short explanation shown to the user
}

export interface IntentResult {
  match: IntentMatch | null;
  matchedRule: string | null;
}

interface Rule {
  id: string;
  patterns: RegExp[];
  match: Omit<IntentMatch, "status"> & { status: IntentStatus };
}

const RULES: Rule[] = [
  // --- READY: routes to a real tool we have today ---
  {
    id: "merge",
    patterns: [
      /\b(merge|combine|join|concatenate)\b.*\b(pdf|file|document|these|them|all)\b/i,
      /\b(pdf|file|document|these|them|all)\b.*\b(merge|combine|join)\b/i,
    ],
    match: {
      path: "/merge",
      label: "Merge PDFs",
      status: "ready",
      reason: "Combines several PDFs into one file in the order you choose.",
    },
  },
  {
    id: "split",
    patterns: [
      /\b(split|separate|break)\b.*\b(pdf|page|file|document|into)\b/i,
      /\b(into\s+(individual|single|separate)\s+pages?)\b/i,
    ],
    match: {
      path: "/split",
      label: "Split PDF",
      status: "ready",
      reason: "Splits the PDF into one or more separate files.",
    },
  },
  {
    id: "compress",
    patterns: [
      /\b(compress|shrink|reduce|smaller|minify|optimi[sz]e)\b.*\b(pdf|file|size)\b/i,
      /\b(make|pdf|file)\b.*\b(smaller|smaller|less\s+big|tiny)\b/i,
    ],
    match: {
      path: "/compress",
      label: "Compress PDF",
      status: "ready",
      reason: "Re-saves the PDF with packed object streams and stripped metadata.",
    },
  },
  {
    id: "rotate",
    patterns: [/\b(rotate|turn|spin|orient)\b.*\b(pdf|page)\b/i],
    match: {
      path: "/rotate",
      label: "Rotate PDF",
      status: "ready",
      reason: "Rotates every page by 90, 180 or 270 degrees.",
    },
  },
  {
    id: "watermark",
    patterns: [
      /\b(watermark|stamp|overlay)\b/i,
      /\badd\b.*\b(text|image|logo)\b.*\b(to|on|over)\b.*\b(pdf|page|every)\b/i,
    ],
    match: {
      path: "/watermark",
      label: "Add watermark",
      status: "ready",
      reason: "Stamps a text or image watermark across every page.",
    },
  },
  {
    id: "protect",
    patterns: [
      /\b(password|passphrase|encrypt)\b.*\b(pdf|file|document|protect|lock)\b/i,
      /\b(protect|lock|secure)\b.*\b(pdf|file|document)\b/i,
    ],
    match: {
      path: "/protect",
      label: "Protect PDF",
      status: "ready",
      reason: "Encrypts the PDF with AES-256. Set a password required to open it.",
    },
  },
  {
    id: "unlock",
    patterns: [
      /\b(unlock|remove|decrypt|strip)\b.*\b(password|protection|lock|encryption)\b/i,
    ],
    match: {
      path: "/unlock",
      label: "Unlock PDF",
      status: "ready",
      reason: "Removes the password from a protected PDF.",
    },
  },
  {
    id: "organize",
    patterns: [
      /\b(reorder|rearrange|reorgani[sz]e|sort)\b.*\b(page|pdf)\b/i,
      /\b(organi[sz]e|manage)\b.*\b(page|pdf)\b/i,
    ],
    match: {
      path: "/organize",
      label: "Organize PDF",
      status: "ready",
      reason: "Drag-and-drop reorder pages, or specify a new page order manually.",
    },
  },
  {
    id: "jpg-to-pdf",
    patterns: [
      /\b(jpg|jpeg|png|image|photo|picture)s?\b.*\b(to|into|as)\b.*\bpdf\b/i,
      /\b(convert|turn|change)\b.*\b(image|jpg|jpeg|png|photo)s?\b.*\bpdf\b/i,
    ],
    match: {
      path: "/jpg-to-pdf",
      label: "Images to PDF",
      status: "ready",
      reason: "Bundles one or more JPG/PNG images into a single PDF.",
    },
  },
  {
    id: "pdf-to-jpg",
    patterns: [
      /\b(pdf|page)\b.*\b(to|into|as)\b.*\b(jpg|jpeg|image|photo)\b/i,
      /\b(extract|save|render)\b.*\b(image|jpg|jpeg)\b.*\b(from)?\b.*\bpdf\b/i,
    ],
    match: {
      path: "/pdf-to-jpg",
      label: "PDF to JPG",
      status: "ready",
      reason: "Renders every page as a JPG image and zips them up.",
    },
  },
  {
    id: "extract-text",
    patterns: [
      /\b(extract|get|pull|grab|copy|dump|read)\b.*\b(text|content|words|all)\b.*\b(from|of)?\b.*\b(pdf|document|file)\b/i,
      /\b(pdf|document|file)\b.*\b(to|txt|text|plain)\b/i,
    ],
    match: {
      path: "/extract-text",
      label: "Extract text",
      status: "ready",
      reason: "Pulls every word out of the PDF and gives you a .txt file.",
    },
  },
  {
    id: "flatten",
    patterns: [
      /\b(flatten|bake|lock|freeze|disable)\b.*\b(form|fields?|fillable|interactive)\b/i,
    ],
    match: {
      path: "/flatten",
      label: "Flatten form",
      status: "ready",
      reason: "Bakes every form field into static page content so it can no longer be edited.",
    },
  },
  {
    id: "restrict-print",
    patterns: [
      /\b(restrict|prevent|stop|block|disable)\b.*\b(print|printing|copy|edit)\b/i,
    ],
    match: {
      path: "/protect",
      label: "Restrict printing (use Protect)",
      status: "ready",
      reason:
        "Use Protect with a strong password — encryption prevents the file from being opened (and thus printed) without it. Fine-grained per-permission restrictions (allow viewing but block print) need a richer PDF library; tracked for a future update.",
    },
  },

  // --- COMING SOON: needs an LLM or OCR backend ---
  {
    id: "summarize",
    patterns: [
      /\b(summari[sz]e|summary|tl;?dr|too long|key\s+points?)\b/i,
      /\bshort(en)?\b.*\b(this|pdf|document)\b/i,
    ],
    match: {
      path: "/chat",
      label: "Summarize",
      status: "coming-soon",
      reason:
        "Summarisation needs an LLM that can read your PDF. We're not calling an external API in this build — track this in the project roadmap.",
    },
  },
  {
    id: "translate",
    patterns: [
      /\b(translat(e|ion)|in\s+english|in\s+malay|to\s+(english|malay|french|spanish|german))\b/i,
    ],
    match: {
      path: "/chat",
      label: "Translate",
      status: "coming-soon",
      reason:
        "Document translation needs a translation API. Will plug in once an OpenAI/Anthropic key is available.",
    },
  },
  {
    id: "find-pages",
    patterns: [
      /\b(which|what)\s+pages?\b.*\b(contain|have|include|show)\b/i,
      /\b(find|locate|search)\b.*\b(page|pages|section)\b.*\b(with|containing|about)\b/i,
    ],
    match: {
      path: "/chat",
      label: "Find pages by content",
      status: "coming-soon",
      reason:
        "Semantic search over PDF content needs an LLM (or at least embeddings). Coming when chat backend lands.",
    },
  },
  {
    id: "to-word",
    patterns: [
      /\b(to|as|into)\b.*\b(word|docx|doc)\b/i,
      /\b(convert|export)\b.*\b(word|docx|doc)\b/i,
    ],
    match: {
      path: "/chat",
      label: "PDF to Word",
      status: "coming-soon",
      reason:
        "Layout-preserving PDF → Word round-trip is hard in pure JS. Planned for a future phase.",
    },
  },
  {
    id: "to-excel",
    patterns: [/\b(to|as|into)\b.*\b(excel|xlsx|spreadsheet|csv)\b/i],
    match: {
      path: "/chat",
      label: "PDF to Excel",
      status: "coming-soon",
      reason:
        "Table extraction from PDF to spreadsheet needs either table-detection ML or a heavy native lib. Roadmap item.",
    },
  },
  {
    id: "to-ppt",
    patterns: [/\b(to|as|into)\b.*\b(powerpoint|pptx|presentation|slides?)\b/i],
    match: {
      path: "/chat",
      label: "PDF to PowerPoint",
      status: "coming-soon",
      reason: "Slide reconstruction from PDF is non-trivial. Roadmap item.",
    },
  },
  {
    id: "pdfx",
    patterns: [/\b(pdf[\s/]?x|press[\s-]?ready|for\s+print(ing)?|cmyk)\b/i],
    match: {
      path: "/chat",
      label: "Convert to PDF/X",
      status: "coming-soon",
      reason:
        "PDF/X for print needs Ghostscript or similar. Roadmap item.",
    },
  },
  {
    id: "ocr",
    patterns: [/\b(ocr|recogni[sz]e|scan(ned)?|read\s+(the\s+)?text\s+in)\b/i],
    match: {
      path: "/chat",
      label: "OCR scanned PDF",
      status: "coming-soon",
      reason:
        "OCR is a heavy dependency (Tesseract.js ≈ 15 MB). Will land as a separate 'OCR' page once a worker budget allows it.",
    },
  },
];

export function matchIntent(input: string): IntentResult {
  const text = (input || "").trim();
  if (!text) return { match: null, matchedRule: null };
  for (const rule of RULES) {
    for (const pat of rule.patterns) {
      if (pat.test(text)) {
        return { match: rule.match, matchedRule: rule.id };
      }
    }
  }
  return { match: null, matchedRule: null };
}

/** All rules — used by the /chat page to show "what we know how to do". */
export function listIntents(): Array<Rule["match"] & { id: string; example: string }> {
  return RULES.map((r) => ({
    id: r.id,
    path: r.match.path,
    label: r.match.label,
    status: r.match.status,
    reason: r.match.reason,
    example: r.patterns[0].source.replace(/\\b/g, "").replace(/\\/g, ""),
  }));
}
