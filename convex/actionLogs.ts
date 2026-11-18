import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server";

export const list = query({
  args: {
    siteId: v.optional(v.id("sites")),
    limit: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
      _id: v.id("actionLogs"),
      _creationTime: v.number(),
      siteId: v.optional(v.id("sites")),
      action: v.string(),
      details: v.string(),
      status: v.union(
        v.literal("success"),
        v.literal("error"),
        v.literal("info"),
      ),
    }),
  ),
  handler: async (ctx, args) => {
    let q;
    if (args.siteId) {
      q = ctx.db
        .query("actionLogs")
        .withIndex("by_site", q => q.eq("siteId", args.siteId!));
    } else {
      q = ctx.db.query("actionLogs");
    }
    const logs = await q.order("desc").collect();
    return logs.slice(0, args.limit ?? 100);
  },
});

export const add = internalMutation({
  args: {
    siteId: v.optional(v.id("sites")),
    action: v.string(),
    details: v.string(),
    status: v.union(
      v.literal("success"),
      v.literal("error"),
      v.literal("info"),
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.insert("actionLogs", {
      siteId: args.siteId,
      action: args.action,
      details: args.details,
      status: args.status,
    });
    return null;
  },
});

/**
 * Listing for the Activity page: same rows as list(), plus the site domain so
 * the shared activity-log template can filter and label by site.
 */
export const listEnriched = query({
  args: { limit: v.optional(v.number()) },
  returns: v.array(
    v.object({
      _id: v.id("actionLogs"),
      _creationTime: v.number(),
      siteId: v.optional(v.id("sites")),
      siteDomain: v.optional(v.string()),
      action: v.string(),
      details: v.string(),
      status: v.union(
        v.literal("success"),
        v.literal("error"),
        v.literal("info"),
      ),
    }),
  ),
  handler: async (ctx, args) => {
    const logs = await ctx.db.query("actionLogs").order("desc").collect();
    const batch = logs.slice(0, args.limit ?? 200);

    const siteIds = [
      ...new Set(batch.filter(l => l.siteId).map(l => l.siteId!)),
    ];
    const domains = new Map<string, string>();
    await Promise.all(
      siteIds.map(async id => {
        const site = await ctx.db.get(id);
        if (site) domains.set(id, site.domain);
      }),
    );

    return batch.map(l => ({
      _id: l._id,
      _creationTime: l._creationTime,
      siteId: l.siteId,
      siteDomain: l.siteId ? domains.get(l.siteId) : undefined,
      action: l.action,
      details: l.details,
      status: l.status,
    }));
  },
});
