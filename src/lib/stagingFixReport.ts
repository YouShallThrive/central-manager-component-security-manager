/**
 * Labels and the plain-text report for Fix on staging, grouped into the
 * sections from convex/fixSections.ts. Pure, so it can be tested directly.
 *
 * The per-action/status labels live in convex/fixSections.ts and are
 * re-exported here, so the activity log (written server-side) and this report
 * render a run the same way.
 */
import {
  actionLabel,
  actionLine,
  coversText,
  groupBySection,
  sectionSummary,
  statusLabel,
  targetVersion,
  vulnText,
} from "../../convex/fixSections";

export type FixAction = {
  kind: "update_plugin" | "activate_wordfence" | "update_theme" | "update_core";
  slug: string;
  name?: string;
  fixedIn?: string;
  vuln?: boolean;
  offered?: string;
  status: "pending" | "done" | "failed" | "skipped" | "needs_check";
  fromVersion?: string;
  toVersion?: string;
  prodVersion?: string;
  note?: string;
  reason?: string;
  detail?: string;
  tone?: "attention" | "ok";
  covers?: string[];
};

export type ReportJob = {
  _creationTime: number;
  status: "running" | "done";
  items: {
    domain: string;
    stagingSiteId?: number;
    status: string;
    error?: string;
    actions: FixAction[];
  }[];
};

export { actionLabel, coversText, statusLabel, targetVersion, vulnText };

const indent = (pad: string, label: string, text: string) =>
  `${pad}${label}: ${text.trim().split("\n").join(`\n${pad}  `)}`;

/** Plain-text report of a job, for pasting into Asana. */
export function jobReport(job: ReportJob, when?: string): string {
  const lines = [
    `Fix on staging — ${when ?? new Date(job._creationTime).toLocaleString()} — ${job.status === "running" ? "running" : "finished"}`,
  ];
  for (const i of job.items) {
    lines.push(
      "",
      `${i.domain}${i.stagingSiteId ? ` (staging #${i.stagingSiteId})` : ""} — ${statusLabel(i.status)}`,
    );
    if (i.error)
      lines.push(
        indent("  ", i.status === "skipped" ? "Reason" : "Error", i.error),
      );
    if (i.status === "skipped") continue;
    for (const g of groupBySection(i.actions)) {
      const counts = sectionSummary(g, "run");
      lines.push(`  ${g.label}${counts ? ` (${counts})` : ""}`);
      for (const a of g.actions) {
        lines.push(`  ${actionLine(a)}`);
        if (a.detail) lines.push(indent("    ", "Detail", a.detail));
      }
    }
  }
  return lines.join("\n");
}
