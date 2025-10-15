// convex/schema.ts
import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  admins: defineTable({
    userId: v.string(),
    createdAt: v.number(),
  }).index('by_userId', ['userId']),
  alerts: defineTable({
    type: v.string(),        // e.g., "damaged road", "excessive garbage"
    description: v.string(), // Detailed description of the alert
    location: v.string(),    // Location information (e.g., coordinates, address)
    userId: v.string(),      // ID of the user who submitted the alert (from Clerk)
    timestamp: v.number(),   // Time of submission
    status: v.string(),      // e.g., "new", "in progress", "resolved"
    lat: v.number(),         // Latitude (WGS84) 
    lng: v.number(),         // Longitude (WGS84) 
    // Optional admin notes (history). Each note has text, authorId and timestamp
    notes: v.optional(v.array(v.object({
      text: v.string(),
      authorId: v.string(),
      timestamp: v.number(),
    }))),
  }).index('by_userId', ['userId']), // Add an index for efficient querying by user
});