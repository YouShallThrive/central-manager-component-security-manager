/**
 * Parsing for activity log `details` text — pure (no React), so it can be
 * tested directly.
 *
 * Entries written by "Fix on staging" are multi-line, sectioned text (see
 * itemDetail() in convex/fixSections.ts):
 *
 *   Staging 248248 of www.capehart.com — done
 *     Plugins (29 updated, 1 need check, 5 skipped)
 *       - redux-framework 4.4.9 → 4.5.0: done
 *       - sassy-social-share: skipped — Plugin was closed on wordpress.org
 *
 * Older entries were one flat `a: b; c: d` string, so they're split back into
 * items here. Reason text itself may contain "; " — the split only breaks
 * where a new `slug: <status>` begins.
 */

export const STATUS_CLASS: Record<string, string> = {
  pending: "text-muted-foreground",
  queued: "text-muted-foreground",
  running: "border-blue-300 text-blue-700 bg-blue-50 dark:bg-blue-950/30",
  done: "border-emerald-300 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30",
  failed: "border-red-300 text-red-700 bg-red-50 dark:bg-red-950/30",
  skipped: "border-amber-300 text-amber-700 bg-amber-50 dark:bg-amber-950/30",
  needs_check:
    "border-orange-300 text-orange-700 bg-orange-50 dark:bg-orange-950/30",
};

const STATUSES = "pending|done|failed|skipped|needs[_ ]check|queued|running";

const ITEM_RE = new RegExp(
  `^\\s*-\\s+(.+?):\\s*(${STATUSES})\\b\\s*(?:\\((.*?)\\))?\\s*(?:—\\s*([\\s\\S]*))?$`,
);

const FLAT_SPLIT_RE = new RegExp(`;\\s+(?=[\\w./-]+:\\s*(?:${STATUSES})\\b)`);

export type DetailItem = {
  name: string;
  status: string;
  extra?: string;
  why?: string;
};

export function parseItem(text: string): DetailItem | undefined {
  const m = text.match(ITEM_RE);
  if (!m) return undefined;
  return {
    name: m[1],
    status: m[2].replace(/ /g, "_"),
    extra: m[3]?.trim() || undefined,
    why: m[4]?.trim() || undefined,
  };
}

/** Structured = a Fix-on-staging entry (multi-line, or the old flat
 *  "Staging 248248 of domain: …" shape). Everything else is plain text. */
const STAGING_RE = /^Staging (\d+) of ([^:\s]+):\s*([\s\S]*)$/;

export function isStructuredDetails(details: string): boolean {
  return details.includes("\n") || STAGING_RE.test(details);
}

/** Split a details string into display lines, recovering structure from the
 *  old single-line format when necessary. Unstructured text is returned as a
 *  single line, untouched. */
export function detailLines(details: string): string[] {
  if (details.includes("\n")) return details.split("\n");

  const head = details.match(STAGING_RE);
  if (!head) return [details];

  const items = head[3]
    .split(FLAT_SPLIT_RE)
    .map(part => `    - ${part.trim()}`);
  return [`Staging ${head[1]} of ${head[2]}`, ...items];
}
