# Table of Contents
- C:\Users\a\Documents\TCR_GEMEENTE_NEXTJS\nextjs_gemeente\convex\admin.ts
- C:\Users\a\Documents\TCR_GEMEENTE_NEXTJS\nextjs_gemeente\convex\alerts.ts
- C:\Users\a\Documents\TCR_GEMEENTE_NEXTJS\nextjs_gemeente\convex\auth.config.js
- C:\Users\a\Documents\TCR_GEMEENTE_NEXTJS\nextjs_gemeente\convex\schema.ts
- C:\Users\a\Documents\TCR_GEMEENTE_NEXTJS\nextjs_gemeente\convex\_generated\api.d.ts
- C:\Users\a\Documents\TCR_GEMEENTE_NEXTJS\nextjs_gemeente\convex\_generated\api.js
- C:\Users\a\Documents\TCR_GEMEENTE_NEXTJS\nextjs_gemeente\convex\_generated\dataModel.d.ts
- C:\Users\a\Documents\TCR_GEMEENTE_NEXTJS\nextjs_gemeente\convex\_generated\server.d.ts
- C:\Users\a\Documents\TCR_GEMEENTE_NEXTJS\nextjs_gemeente\convex\_generated\server.js

## File: C:\Users\a\Documents\TCR_GEMEENTE_NEXTJS\nextjs_gemeente\convex\admin.ts

- Extension: .ts
- Language: typescript
- Size: 2163 bytes
- Created: 2025-10-15 09:21:49
- Modified: 2025-10-15 09:40:00

### Code

```typescript
import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

// Query: list all admins (userIds)
export const listAdmins = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query('admins').collect();
    return rows.map(r => ({ _id: r._id, userId: r.userId, createdAt: r.createdAt }));
  },
});

// Query: is current user an admin
export const isAdmin = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return false;
    const row = await ctx.db
      .query('admins')
      .withIndex('by_userId', q => q.eq('userId', identity.subject))
      .unique();
    return !!row;
  },
});

// Mutation: add an admin by Clerk userId
export const addAdmin = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthorized');
    // Only existing admins can add others
    const me = await ctx.db
      .query('admins')
      .withIndex('by_userId', q => q.eq('userId', identity.subject))
      .unique();
    if (!me) throw new Error('Forbidden');

    const existing = await ctx.db
      .query('admins')
      .withIndex('by_userId', q => q.eq('userId', args.userId))
      .unique();
    if (existing) return;
    await ctx.db.insert('admins', { userId: args.userId, createdAt: Date.now() });
  },
});

// Mutation: remove an admin by Clerk userId
export const removeAdmin = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthorized');
    const me = await ctx.db
      .query('admins')
      .withIndex('by_userId', q => q.eq('userId', identity.subject))
      .unique();
    if (!me) throw new Error('Forbidden');

    const existing = await ctx.db
      .query('admins')
      .withIndex('by_userId', q => q.eq('userId', args.userId))
      .unique();
    if (!existing) return;
    await ctx.db.delete(existing._id);
  },
});

```

## File: C:\Users\a\Documents\TCR_GEMEENTE_NEXTJS\nextjs_gemeente\convex\alerts.ts

- Extension: .ts
- Language: typescript
- Size: 4055 bytes
- Created: 2025-09-15 10:38:27
- Modified: 2025-10-15 09:40:00

### Code

```typescript
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
      notes: [],
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

export const getMyAlerts = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const userId = identity.subject;
    const alerts = await ctx.db
      .query('alerts')
      .withIndex('by_userId', (q) => q.eq('userId', userId))
      .collect();

    alerts.sort((a, b) => b.timestamp - a.timestamp);
    return alerts.map(a => ({
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

// Get a single alert by id (for detail pages)
export const getAlertById = query({
  args: { id: v.id("alerts") },
  handler: async (ctx, args) => {
    const alert = await ctx.db.get(args.id);
    if (!alert) return null;
    return alert;
  },
});

// Admin: list all alerts (same as getAlerts but without slicing)
export const getAllAlerts = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query('alerts').collect();
    rows.sort((a, b) => b.timestamp - a.timestamp);
    return rows;
  },
});

// Admin: update status
export const updateAlertStatus = mutation({
  args: {
    id: v.id("alerts"),
    status: v.string(), // expected: open|in_progress|resolved (freeform for now)
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    const admin = await ctx.db
      .query('admins')
      .withIndex('by_userId', q => q.eq('userId', identity.subject))
      .unique();
    if (!admin) throw new Error('Forbidden');
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Not found");
    await ctx.db.patch(args.id, { status: args.status });
  },
});

// Admin: append a note
export const addAlertNote = mutation({
  args: {
    id: v.id("alerts"),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    const admin = await ctx.db
      .query('admins')
      .withIndex('by_userId', q => q.eq('userId', identity.subject))
      .unique();
    if (!admin) throw new Error('Forbidden');
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Not found");
    const notes = existing.notes ?? [];
    notes.push({ text: args.text, authorId: identity.subject, timestamp: Date.now() });
    await ctx.db.patch(args.id, { notes });
  },
});
```

## File: C:\Users\a\Documents\TCR_GEMEENTE_NEXTJS\nextjs_gemeente\convex\auth.config.js

- Extension: .js
- Language: javascript
- Size: 139 bytes
- Created: 2025-09-11 11:30:23
- Modified: 2025-09-11 11:30:41

### Code

```javascript
export default {
  providers: [
    {
      domain: process.env.CLERK_FRONTEND_API_URL,
      applicationID: 'convex',
    },
  ],
}
```

## File: C:\Users\a\Documents\TCR_GEMEENTE_NEXTJS\nextjs_gemeente\convex\schema.ts

- Extension: .ts
- Language: typescript
- Size: 1006 bytes
- Created: 2025-09-15 10:32:47
- Modified: 2025-10-16 11:31:12

### Code

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  admins: defineTable({
    userId: v.string(),
    createdAt: v.number(),
  }).index('by_userId', ['userId']),
  alerts: defineTable({
    type: v.string(),        // alert type
    description: v.string(), // description of the alert
    location: v.string(),    // Location information (coordinates/address)
    userId: v.string(),      // ID of the user who submitted the alert (from Clerk)
    timestamp: v.number(),   // Time of submission
    status: v.string(),      // e.g., "new", "in progress", "resolved"
    lat: v.number(),         // Latitude (WGS84) 
    lng: v.number(),         // Longitude (WGS84) 
    notes: v.optional(v.array(v.object({
      text: v.string(),
      authorId: v.string(),
      timestamp: v.number(),
    }))),
  }).index('by_userId', ['userId']), // Add an index for efficient querying by user
});
```

## File: C:\Users\a\Documents\TCR_GEMEENTE_NEXTJS\nextjs_gemeente\convex\_generated\api.d.ts

- Extension: .ts
- Language: typescript
- Size: 778 bytes
- Created: 2025-10-15 09:21:52
- Modified: 2025-10-15 09:21:52

### Code

```typescript
/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as admin from "../admin.js";
import type * as alerts from "../alerts.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  alerts: typeof alerts;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

```

## File: C:\Users\a\Documents\TCR_GEMEENTE_NEXTJS\nextjs_gemeente\convex\_generated\api.js

- Extension: .js
- Language: javascript
- Size: 414 bytes
- Created: 2025-09-11 11:29:00
- Modified: 2025-09-11 11:29:00

### Code

```javascript
/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import { anyApi } from "convex/server";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export const api = anyApi;
export const internal = anyApi;

```

## File: C:\Users\a\Documents\TCR_GEMEENTE_NEXTJS\nextjs_gemeente\convex\_generated\dataModel.d.ts

- Extension: .ts
- Language: typescript
- Size: 1725 bytes
- Created: 2025-09-15 10:41:12
- Modified: 2025-09-15 10:41:12

### Code

```typescript
/* eslint-disable */
/**
 * Generated data model types.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  DataModelFromSchemaDefinition,
  DocumentByName,
  TableNamesInDataModel,
  SystemTableNames,
} from "convex/server";
import type { GenericId } from "convex/values";
import schema from "../schema.js";

/**
 * The names of all of your Convex tables.
 */
export type TableNames = TableNamesInDataModel<DataModel>;

/**
 * The type of a document stored in Convex.
 *
 * @typeParam TableName - A string literal type of the table name (like "users").
 */
export type Doc<TableName extends TableNames> = DocumentByName<
  DataModel,
  TableName
>;

/**
 * An identifier for a document in Convex.
 *
 * Convex documents are uniquely identified by their `Id`, which is accessible
 * on the `_id` field. To learn more, see [Document IDs](https://docs.convex.dev/using/document-ids).
 *
 * Documents can be loaded using `db.get(id)` in query and mutation functions.
 *
 * IDs are just strings at runtime, but this type can be used to distinguish them from other
 * strings when type checking.
 *
 * @typeParam TableName - A string literal type of the table name (like "users").
 */
export type Id<TableName extends TableNames | SystemTableNames> =
  GenericId<TableName>;

/**
 * A type describing your Convex data model.
 *
 * This type includes information about what tables you have, the type of
 * documents stored in those tables, and the indexes defined on them.
 *
 * This type is used to parameterize methods like `queryGeneric` and
 * `mutationGeneric` to make them type-safe.
 */
export type DataModel = DataModelFromSchemaDefinition<typeof schema>;

```

## File: C:\Users\a\Documents\TCR_GEMEENTE_NEXTJS\nextjs_gemeente\convex\_generated\server.d.ts

- Extension: .ts
- Language: typescript
- Size: 5539 bytes
- Created: 2025-09-11 11:29:00
- Modified: 2025-09-11 11:29:00

### Code

```typescript
/* eslint-disable */
/**
 * Generated utilities for implementing server-side Convex query and mutation functions.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import {
  ActionBuilder,
  HttpActionBuilder,
  MutationBuilder,
  QueryBuilder,
  GenericActionCtx,
  GenericMutationCtx,
  GenericQueryCtx,
  GenericDatabaseReader,
  GenericDatabaseWriter,
} from "convex/server";
import type { DataModel } from "./dataModel.js";

/**
 * Define a query in this Convex app's public API.
 *
 * This function will be allowed to read your Convex database and will be accessible from the client.
 *
 * @param func - The query function. It receives a {@link QueryCtx} as its first argument.
 * @returns The wrapped query. Include this as an `export` to name it and make it accessible.
 */
export declare const query: QueryBuilder<DataModel, "public">;

/**
 * Define a query that is only accessible from other Convex functions (but not from the client).
 *
 * This function will be allowed to read from your Convex database. It will not be accessible from the client.
 *
 * @param func - The query function. It receives a {@link QueryCtx} as its first argument.
 * @returns The wrapped query. Include this as an `export` to name it and make it accessible.
 */
export declare const internalQuery: QueryBuilder<DataModel, "internal">;

/**
 * Define a mutation in this Convex app's public API.
 *
 * This function will be allowed to modify your Convex database and will be accessible from the client.
 *
 * @param func - The mutation function. It receives a {@link MutationCtx} as its first argument.
 * @returns The wrapped mutation. Include this as an `export` to name it and make it accessible.
 */
export declare const mutation: MutationBuilder<DataModel, "public">;

/**
 * Define a mutation that is only accessible from other Convex functions (but not from the client).
 *
 * This function will be allowed to modify your Convex database. It will not be accessible from the client.
 *
 * @param func - The mutation function. It receives a {@link MutationCtx} as its first argument.
 * @returns The wrapped mutation. Include this as an `export` to name it and make it accessible.
 */
export declare const internalMutation: MutationBuilder<DataModel, "internal">;

/**
 * Define an action in this Convex app's public API.
 *
 * An action is a function which can execute any JavaScript code, including non-deterministic
 * code and code with side-effects, like calling third-party services.
 * They can be run in Convex's JavaScript environment or in Node.js using the "use node" directive.
 * They can interact with the database indirectly by calling queries and mutations using the {@link ActionCtx}.
 *
 * @param func - The action. It receives an {@link ActionCtx} as its first argument.
 * @returns The wrapped action. Include this as an `export` to name it and make it accessible.
 */
export declare const action: ActionBuilder<DataModel, "public">;

/**
 * Define an action that is only accessible from other Convex functions (but not from the client).
 *
 * @param func - The function. It receives an {@link ActionCtx} as its first argument.
 * @returns The wrapped function. Include this as an `export` to name it and make it accessible.
 */
export declare const internalAction: ActionBuilder<DataModel, "internal">;

/**
 * Define an HTTP action.
 *
 * This function will be used to respond to HTTP requests received by a Convex
 * deployment if the requests matches the path and method where this action
 * is routed. Be sure to route your action in `convex/http.js`.
 *
 * @param func - The function. It receives an {@link ActionCtx} as its first argument.
 * @returns The wrapped function. Import this function from `convex/http.js` and route it to hook it up.
 */
export declare const httpAction: HttpActionBuilder;

/**
 * A set of services for use within Convex query functions.
 *
 * The query context is passed as the first argument to any Convex query
 * function run on the server.
 *
 * This differs from the {@link MutationCtx} because all of the services are
 * read-only.
 */
export type QueryCtx = GenericQueryCtx<DataModel>;

/**
 * A set of services for use within Convex mutation functions.
 *
 * The mutation context is passed as the first argument to any Convex mutation
 * function run on the server.
 */
export type MutationCtx = GenericMutationCtx<DataModel>;

/**
 * A set of services for use within Convex action functions.
 *
 * The action context is passed as the first argument to any Convex action
 * function run on the server.
 */
export type ActionCtx = GenericActionCtx<DataModel>;

/**
 * An interface to read from the database within Convex query functions.
 *
 * The two entry points are {@link DatabaseReader.get}, which fetches a single
 * document by its {@link Id}, or {@link DatabaseReader.query}, which starts
 * building a query.
 */
export type DatabaseReader = GenericDatabaseReader<DataModel>;

/**
 * An interface to read from and write to the database within Convex mutation
 * functions.
 *
 * Convex guarantees that all writes within a single mutation are
 * executed atomically, so you never have to worry about partial writes leaving
 * your data in an inconsistent state. See [the Convex Guide](https://docs.convex.dev/understanding/convex-fundamentals/functions#atomicity-and-optimistic-concurrency-control)
 * for the guarantees Convex provides your functions.
 */
export type DatabaseWriter = GenericDatabaseWriter<DataModel>;

```

## File: C:\Users\a\Documents\TCR_GEMEENTE_NEXTJS\nextjs_gemeente\convex\_generated\server.js

- Extension: .js
- Language: javascript
- Size: 3453 bytes
- Created: 2025-09-11 11:29:00
- Modified: 2025-09-11 11:29:00

### Code

```javascript
/* eslint-disable */
/**
 * Generated utilities for implementing server-side Convex query and mutation functions.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import {
  actionGeneric,
  httpActionGeneric,
  queryGeneric,
  mutationGeneric,
  internalActionGeneric,
  internalMutationGeneric,
  internalQueryGeneric,
} from "convex/server";

/**
 * Define a query in this Convex app's public API.
 *
 * This function will be allowed to read your Convex database and will be accessible from the client.
 *
 * @param func - The query function. It receives a {@link QueryCtx} as its first argument.
 * @returns The wrapped query. Include this as an `export` to name it and make it accessible.
 */
export const query = queryGeneric;

/**
 * Define a query that is only accessible from other Convex functions (but not from the client).
 *
 * This function will be allowed to read from your Convex database. It will not be accessible from the client.
 *
 * @param func - The query function. It receives a {@link QueryCtx} as its first argument.
 * @returns The wrapped query. Include this as an `export` to name it and make it accessible.
 */
export const internalQuery = internalQueryGeneric;

/**
 * Define a mutation in this Convex app's public API.
 *
 * This function will be allowed to modify your Convex database and will be accessible from the client.
 *
 * @param func - The mutation function. It receives a {@link MutationCtx} as its first argument.
 * @returns The wrapped mutation. Include this as an `export` to name it and make it accessible.
 */
export const mutation = mutationGeneric;

/**
 * Define a mutation that is only accessible from other Convex functions (but not from the client).
 *
 * This function will be allowed to modify your Convex database. It will not be accessible from the client.
 *
 * @param func - The mutation function. It receives a {@link MutationCtx} as its first argument.
 * @returns The wrapped mutation. Include this as an `export` to name it and make it accessible.
 */
export const internalMutation = internalMutationGeneric;

/**
 * Define an action in this Convex app's public API.
 *
 * An action is a function which can execute any JavaScript code, including non-deterministic
 * code and code with side-effects, like calling third-party services.
 * They can be run in Convex's JavaScript environment or in Node.js using the "use node" directive.
 * They can interact with the database indirectly by calling queries and mutations using the {@link ActionCtx}.
 *
 * @param func - The action. It receives an {@link ActionCtx} as its first argument.
 * @returns The wrapped action. Include this as an `export` to name it and make it accessible.
 */
export const action = actionGeneric;

/**
 * Define an action that is only accessible from other Convex functions (but not from the client).
 *
 * @param func - The function. It receives an {@link ActionCtx} as its first argument.
 * @returns The wrapped function. Include this as an `export` to name it and make it accessible.
 */
export const internalAction = internalActionGeneric;

/**
 * Define a Convex HTTP action.
 *
 * @param func - The function. It receives an {@link ActionCtx} as its first argument, and a `Request` object
 * as its second.
 * @returns The wrapped endpoint function. Route a URL path to this function in `convex/http.js`.
 */
export const httpAction = httpActionGeneric;

```

