import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  admins: defineTable({
    email: v.optional(v.string()),
    userId: v.optional(v.string()),
    createdAt: v.number(),
  }).index('by_email', ['email']).index('by_userId', ['userId']),
  alerts: defineTable({
    type: v.string(),
    description: v.string(),
    location: v.string(),
    userId: v.string(),
    timestamp: v.number(),
    status: v.string(),
    lat: v.number(),
    lng: v.number(), 
    images: v.optional(v.array(v.object({
      storageId: v.id("_storage"),
      contentType: v.string(),
      uploadedAt: v.number(),
    }))),
    notes: v.optional(v.array(v.object({
      text: v.string(),
      authorId: v.string(),
      timestamp: v.number(),
    }))),
  }).index('by_userId', ['userId']),
});