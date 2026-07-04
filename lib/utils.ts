// Shared helpers used by the API routes and tool pages.

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "0 B";
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  const value = bytes / Math.pow(1024, i);
  return `${value.toFixed(value >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
}

// Parse a page list like "1-3,5,7-9" into a 1-based sorted, deduped list of pages.
export function parsePageList(input: string, totalPages: number): number[] {
  const trimmed = (input || "").trim();
  if (!trimmed) return [];
  const out = new Set<number>();
  for (const raw of trimmed.split(",")) {
    const part = raw.trim();
    if (!part) continue;
    if (part.includes("-")) {
      const [a, b] = part.split("-").map((s) => parseInt(s.trim(), 10));
      if (Number.isFinite(a) && Number.isFinite(b)) {
        const lo = Math.max(1, Math.min(a, b));
        const hi = Math.min(totalPages, Math.max(a, b));
        for (let i = lo; i <= hi; i++) out.add(i);
      }
    } else {
      const n = parseInt(part, 10);
      if (Number.isFinite(n)) {
        if (n >= 1 && n <= totalPages) out.add(n);
      }
    }
  }
  return Array.from(out).sort((a, b) => a - b);
}

export function splitRanges(pageList: number[]): Array<[number, number]> {
  if (pageList.length === 0) return [];
  const ranges: Array<[number, number]> = [];
  let start = pageList[0];
  let prev = pageList[0];
  for (let i = 1; i < pageList.length; i++) {
    const p = pageList[i];
    if (p === prev + 1) {
      prev = p;
    } else {
      ranges.push([start, prev]);
      start = p;
      prev = p;
    }
  }
  ranges.push([start, prev]);
  return ranges;
}