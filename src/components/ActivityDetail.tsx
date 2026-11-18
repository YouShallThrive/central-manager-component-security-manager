import { Badge } from "@/components/ui/badge";
import { detailLines, parseItem, STATUS_CLASS } from "@/lib/activityDetail";

/**
 * Readable rendering of an activity log `details` string: item names in mono
 * with a coloured status pill, reasons as muted text, section headings
 * separated. Parsing lives in src/lib/activityDetail.ts.
 */

function StatusPill({ status }: { status: string }) {
  return (
    <Badge
      variant="outline"
      className={`text-[11px] ${STATUS_CLASS[status] ?? ""}`}
    >
      {status.replace(/_/g, " ")}
    </Badge>
  );
}

function Line({ line, index }: { line: string; index: number }) {
  const trimmed = line.trim();
  if (!trimmed) return <div className="h-1.5" />;

  const item = parseItem(line);
  if (item) {
    return (
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 py-0.5">
        <span className="font-mono text-xs">{item.name}</span>
        <StatusPill status={item.status} />
        {item.extra && (
          <span className="text-xs text-muted-foreground">{item.extra}</span>
        )}
        {item.why && (
          <span className="text-xs text-muted-foreground">{item.why}</span>
        )}
      </div>
    );
  }

  if (/^Detail:/.test(trimmed)) {
    return (
      <p className="whitespace-pre-wrap break-words pl-6 font-mono text-[11px] text-muted-foreground">
        {trimmed}
      </p>
    );
  }

  // Section heading ("Plugins (29 updated, 5 skipped)") — indented, no bullet.
  if (index > 0 && line !== trimmed) {
    return (
      <p className="pt-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {trimmed}
      </p>
    );
  }

  return <p className="text-sm font-medium break-words">{trimmed}</p>;
}

export default function ActivityDetail({ details }: { details: string }) {
  const [head, ...rest] = detailLines(details);

  return (
    <div className="min-w-0">
      <Line line={head ?? ""} index={0} />
      {rest.length > 0 && (
        <div className="mt-1 border-l pl-3">
          {rest.map((line, i) => (
            <Line key={`${i}-${line.slice(0, 24)}`} line={line} index={i + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
