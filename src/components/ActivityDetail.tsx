import {
  detailLines,
  isStructuredDetails,
  parseItem,
} from "@/lib/activityDetail";

/**
 * Details body for Fix-on-staging activity entries — rendered inside the
 * shared activity log row (see src/components/activity-log/).
 *
 * The server writes one line per action (`- slug 1.0 → 1.1: done — reason`),
 * grouped under section headings; entries written before that change are a
 * single flat string and are split back into items by detailLines().
 */

const STATUS_TEXT: Record<string, string> = {
  pending: "text-muted-foreground",
  queued: "text-muted-foreground",
  running: "text-blue-600 dark:text-blue-400",
  done: "text-emerald-600 dark:text-emerald-400",
  failed: "text-red-600 dark:text-red-400",
  skipped: "text-amber-600 dark:text-amber-400",
  needs_check: "text-orange-600 dark:text-orange-400",
};

function ItemRow({ line }: { line: string }) {
  const item = parseItem(line);
  if (!item) return null;
  return (
    <div className="flex items-baseline gap-2 text-xs">
      <span className="font-mono text-foreground/80">{item.name}</span>
      <span
        className={`shrink-0 font-medium ${STATUS_TEXT[item.status] ?? ""}`}
      >
        {item.status.replace(/_/g, " ")}
      </span>
      {(item.extra || item.why) && (
        <span className="min-w-0 text-muted-foreground">
          {[item.extra, item.why].filter(Boolean).join(" — ")}
        </span>
      )}
    </div>
  );
}

export default function ActivityDetail({
  details,
  rowDomain,
}: {
  details: string;
  /** Domain already shown in the row chrome — a matching head line is dropped. */
  rowDomain?: string;
}) {
  if (!isStructuredDetails(details)) return null;

  const [head, ...rest] = detailLines(details);
  if (!head) return null;

  const showHead = !(rowDomain && head.includes(rowDomain));

  return (
    <div className="mt-0.5 space-y-0.5">
      {showHead && (
        <p className="text-xs text-muted-foreground break-words">
          {head.trim()}
        </p>
      )}
      {rest.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return null;

        if (/^Detail:/.test(trimmed)) {
          return (
            <p
              key={`d${i}`}
              className="whitespace-pre-wrap break-words pl-2 font-mono text-[11px] text-muted-foreground"
            >
              {trimmed}
            </p>
          );
        }

        if (parseItem(line)) {
          return <ItemRow key={`i${i}`} line={line} />;
        }

        // Section heading, e.g. "Plugins (29 updated, 5 skipped)"
        if (line !== trimmed) {
          return (
            <p
              key={`s${i}`}
              className="pt-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/80"
            >
              {trimmed}
            </p>
          );
        }

        return (
          <p
            key={`p${i}`}
            className="text-xs text-muted-foreground break-words"
          >
            {trimmed}
          </p>
        );
      })}
    </div>
  );
}
