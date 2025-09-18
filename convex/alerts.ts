// convex/alerts.ts
import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

export const createAlert = mutation({
  args: {
    type: v.string(),
    description: v.string(),
    location: v.string(),
    userId: v.string(),
    lat: v.optional(v.number()),
    lng: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Ensure the user is authenticated if you want to perform server-side auth
    // const identity = await ctx.auth.getUserIdentity();
    // if (!identity) {
    //   throw new Error("Unauthenticated call to createAlert");
    // }

    const newAlertId = await ctx.db.insert('alerts', {
      type: args.type,
      description: args.description,
      location: args.location,
      userId: args.userId, // Use the provided userId, which should come from Clerk client-side
      timestamp: Date.now(),
      status: 'new', // Set initial status for new alerts
      lat: args.lat ?? undefined,
      lng: args.lng ?? undefined,
    });
    return newAlertId;
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