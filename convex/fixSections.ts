/**
 * Sections for Fix on staging actions (Plugins, Themes, Core, Security):
 * run order, grouping and per-section counts. Pure — no Convex imports — so
 * the dialog can use it too and it can be tested directly.
 *
 * Run and display order: plugins, then themes, then WordPress core last (so
 * plugin/theme compatibility updates land before core moves), then Security
 * (Wordfence activation). Within a section, vulnerability fixes come first.
 */

export type Section = "plugins" | "themes" | "core" | "security";

export const SECTIONS: Section[] = ["plugins", "themes", "core", "security"];

export const SECTION_LABEL: Record<Section, string> = {
  plugins: "Plugins",
  themes: "Themes",
  core: "Core",
  security: "Security",
};

type ActionLike = {
  kind: string;
  slug: string;
  name?: string;
  status: string;
  fixedIn?: string;
  vuln?: boolean;
  fromVersion?: string;
  toVersion?: string;
  prodVersion?: string;
  offered?: string;
  note?: string;
  reason?: string;
  detail?: string;
  covers?: string[];
};

export const sectionOf = (kind: string): Section =>
  kind === "update_theme"
    ? "themes"
    : kind === "update_core"
      ? "core"
      : kind === "activate_wordfence"
        ? "security"
        : "plugins";

/** Planned because of an open vulnerability (older rows only have fixedIn). */
export const isVulnFix = (a: ActionLike) => !!a.vuln || !!a.fixedIn;

function cmp(a: string, b: string): number {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const d = (pa[i] || 0) - (pb[i] || 0);
    if (d) return d < 0 ? -1 : 1;
  }
  return 0;
}

/** An open vulnerability this update is meant to fix (not one staging
 *  already has the fix for). */
export const fixesVuln = (a: ActionLike) =>
  isVulnFix(a) &&
  !(a.fixedIn && a.fromVersion && cmp(a.fromVersion, a.fixedIn) >= 0);

/** Section order, vulnerability fixes first, then by name. */
export function orderActions<T extends ActionLike>(actions: T[]): T[] {
  const label = (a: T) => (a.name ?? a.slug).toLowerCase();
  return [...actions].sort(
    (a, b) =>
      SECTIONS.indexOf(sectionOf(a.kind)) -
        SECTIONS.indexOf(sectionOf(b.kind)) ||
      Number(isVulnFix(b)) - Number(isVulnFix(a)) ||
      label(a).localeCompare(label(b)),
  );
}

export type SectionGroup<T> = {
  section: Section;
  label: string;
  actions: T[];
};

/** Actions grouped by section, in section order; empty sections omitted. */
export function groupBySection<T extends ActionLike>(
  actions: T[],
): SectionGroup<T>[] {
  return SECTIONS.map(section => ({
    section,
    label: SECTION_LABEL[section],
    actions: actions.filter(a => sectionOf(a.kind) === section),
  })).filter(g => g.actions.length > 0);
}

/**
 * Per-section counts, e.g. "12 updated, 2 skipped" (run) or
 * "12 planned, 3 for vulnerabilities" (plan). Core and Security hold a
 * single action whose own status is shown, so they get no counts.
 */
export function sectionSummary<T extends ActionLike>(
  group: SectionGroup<T>,
  mode: "plan" | "run",
): string | undefined {
  if (group.section === "core" || group.section === "security")
    return undefined;
  const { actions } = group;
  if (mode === "plan") {
    const v = actions.filter(isVulnFix).length;
    return `${actions.length} planned${v ? `, ${v} for vulnerabilities` : ""}`;
  }
  const n = (s: string) => actions.filter(a => a.status === s).length;
  return [
    [n("done"), "updated"],
    [n("needs_check"), "need check"],
    [n("failed"), "failed"],
    [n("skipped"), "skipped"],
    [n("pending"), "pending"],
  ]
    .filter(([c]) => (c as number) > 0)
    .map(([c, w]) => `${c} ${w}`)
    .join(", ");
}

// ---------------------------------------------------------------------------
// Plain-text rendering, shared by the activity log (server) and the fix dialog
// (client) so a run reads the same in both places.
// ---------------------------------------------------------------------------

export const statusLabel = (status: string) => status.replace(/_/g, " ");

/** Name shown inside a section (the section says what kind it is). */
export const actionLabel = <T extends ActionLike>(a: T) =>
  a.kind === "activate_wordfence"
    ? "Activate Wordfence"
    : a.kind === "update_core"
      ? "WordPress"
      : (a.name ?? a.slug);

/** Target version: what staging ended on, else what's offered (not for
 *  skipped items, which didn't move). */
export const targetVersion = <T extends ActionLike>(a: T) =>
  a.toVersion ?? (a.status === "skipped" ? undefined : a.offered);

export const coversText = <T extends ActionLike>(a: T) =>
  a.covers?.length ? `covers bundled ${a.covers.join(", ")}` : undefined;

/** "fixes vulnerability, fixed in 11.1.0" and similar. */
export function vulnText<T extends ActionLike>(a: T): string | undefined {
  if (!isVulnFix(a)) return undefined;
  if (!fixesVuln(a))
    return a.fixedIn ? `vulnerability fixed in ${a.fixedIn}` : undefined;
  return a.fixedIn
    ? `fixes vulnerability, fixed in ${a.fixedIn}`
    : "open vulnerability, no fixed version released";
}

/** One action as `- name 1.2.3 → 1.3.0: done (fixes vulnerability… — reason)`. */
export function actionLine<T extends ActionLike>(a: T): string {
  const versions =
    a.kind === "activate_wordfence"
      ? ""
      : [a.fromVersion, targetVersion(a)].filter(Boolean).join(" → ");
  const extra = [
    vulnText(a),
    coversText(a),
    a.prodVersion &&
      a.fromVersion &&
      a.prodVersion !== a.fromVersion &&
      `live ${a.prodVersion}`,
  ]
    .filter(Boolean)
    .join(", ");
  const why = a.reason ?? a.note;
  return `- ${actionLabel(a)}${versions ? ` ${versions}` : ""}: ${statusLabel(a.status)}${extra ? ` (${extra})` : ""}${why ? ` — ${why}` : ""}`;
}

/**
 * Multi-line, sectioned summary of one site's run — the body of an activity
 * log entry:
 *
 *   Staging 248248 of www.capehart.com — finished
 *     Plugins (29 updated, 1 need check, 5 skipped)
 *       - redux-framework: done
 *       - sassy-social-share: skipped — Plugin was closed on wordpress.org
 */
export function itemDetail<T extends ActionLike>(
  head: string,
  actions: T[],
  error?: string,
): string {
  const lines = [head];
  if (error) lines.push(`  Error: ${error}`);
  for (const g of groupBySection(actions)) {
    const counts = sectionSummary(g, "run");
    lines.push(`  ${g.label}${counts ? ` (${counts})` : ""}`);
    for (const a of g.actions) {
      lines.push(`    ${actionLine(a)}`);
      if (a.detail) lines.push(`      Detail: ${a.detail.trim()}`);
    }
  }
  return lines.join("\n");
}
