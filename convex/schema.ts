// convex/schema.ts
import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  alerts: defineTable({
    type: v.string(),        // e.g., "damaged road", "excessive garbage"
    description: v.string(), // Detailed description of the alert
    location: v.string(),    // Location information (e.g., coordinates, address)
    userId: v.string(),      // ID of the user who submitted the alert (from Clerk)
    timestamp: v.number(),   // Time of submission
    status: v.string(),      // e.g., "new", "in progress", "resolved"
  }).index('by_userId', ['userId']), // Add an index for efficient querying by user
});