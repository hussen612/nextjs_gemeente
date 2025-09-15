// convex/alerts.ts
import { v } from 'convex/values';
import { mutation } from './_generated/server';

export const createAlert = mutation({
  args: {
    type: v.string(),
    description: v.string(),
    location: v.string(),
    userId: v.string(),
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
    });
    return newAlertId;
  },
});