// convex/alerts.ts
import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

export const createAlert = mutation({
  args: {
    type: v.string(),
    description: v.string(),
    location: v.string(),
    userId: v.string(),
    lat: v.number(),
    lng: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity || identity.subject !== args.userId) throw new Error("Unauthorized");
    await ctx.db.insert("alerts", {
      type: args.type,
      description: args.description,
      location: args.location,
      userId: identity.subject,
      timestamp: Date.now(),
      status: "open",
      lat: args.lat,
      lng: args.lng,
    });
  },
});

// Public query to list recent alerts (limit 100) for map & dashboard
export const getAlerts = query({
  args: {},
  handler: async (ctx) => {
    const alerts = await ctx.db.query('alerts').collect();
    // Sort newest first
    alerts.sort((a, b) => b.timestamp - a.timestamp);
    return alerts.slice(0, 100).map(a => ({
      _id: a._id,
      type: a.type,
      description: a.description,
      location: a.location,
      userId: a.userId,
      timestamp: a.timestamp,
      status: a.status,
      lat: a.lat,
      lng: a.lng,
    }));
  },
});