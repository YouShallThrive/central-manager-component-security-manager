import { useQuery } from "convex/react";
import ActivityDetail from "@/components/ActivityDetail";
import ActivityLog from "@/components/activity-log/ActivityLog";
import { isStructuredDetails } from "@/lib/activityDetail";
import { api } from "../../convex/_generated/api";

/** Action labels for this component; unknown actions are title-cased. */
const ACTION_LABELS: Record<string, string> = {
  full_sync: "Full Sync",
  sync_sites: "Site Sync",
  batched_scan: "Batched Scan",
  vuln_scan: "Vulnerability Scan",
  scan_error: "Scan Error",
  php_version_sync: "PHP Version Sync",
  staging_fix: "Fix on Staging",
};

export default function ActivityPage() {
  const entries = useQuery(api.actionLogs.listEnriched, { limit: 500 });

  return (
    <ActivityLog
      entries={entries}
      subtitle="Recent sync, scan and fix activity across all sites"
      actionLabels={ACTION_LABELS}
      searchPlaceholder="Search actions, details, domains..."
      emptyMessage="No activity yet. Sync a Rocket.net account to see logs here."
      renderDetails={entry =>
        isStructuredDetails(entry.details) ? (
          <ActivityDetail
            details={entry.details}
            rowDomain={entry.siteDomain}
          />
        ) : null
      }
    />
  );
}
