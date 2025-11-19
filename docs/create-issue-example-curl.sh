#!/bin/bash
# Example: Create a single GitHub issue using curl and the GitHub REST API
# This demonstrates how to use the API payloads from github-issues-api-payloads.json
#
# Usage:
#   export GITHUB_TOKEN=your_personal_access_token
#   ./docs/create-issue-example-curl.sh

GITHUB_TOKEN="${GITHUB_TOKEN:-}"
REPO="hussen612/nextjs_gemeente"

if [ -z "$GITHUB_TOKEN" ]; then
    echo "❌ Error: GITHUB_TOKEN environment variable not set"
    echo "Usage: export GITHUB_TOKEN=your_token"
    exit 1
fi

# Example: Create Issue #1 - User Authentication System
echo "Creating issue via GitHub REST API..."

curl -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  "https://api.github.com/repos/$REPO/issues" \
  -d '{
    "title": "User Authentication & Authorization System",
    "body": "## Feature Overview\nThis issue documents the user authentication and authorization system implemented in the Gemeente Meldpunt application.\n\n## Description\nThe application uses Clerk for user authentication, providing secure sign-in/sign-up functionality for citizens reporting issues.\n\n## Implementation Details\n- **Technology**: Clerk authentication service\n- **Location**: \n  - `my-app/src/app/providers.tsx` - ClerkProvider wrapper\n  - `my-app/src/middleware.ts` - Route protection\n  - Integration across all pages using SignedIn/SignedOut components\n\n## Features\n- User sign-in and sign-up\n- Session management\n- Protected routes for authenticated users\n- User context available throughout the application\n- Integration with Convex backend for user identity\n\n## Files Involved\n- `my-app/src/app/providers.tsx`\n- `my-app/src/middleware.ts`\n- `convex/auth.config.js`\n\n## Related Features\n- Links to user dashboard access control\n- Required for alert submission\n- Foundation for admin authorization\n\n## Status\n✅ Implemented and functional\n\n## Due Date\n2025-12-31",
    "labels": ["feature", "authentication"]
  }'

echo ""
echo "✅ Issue creation request sent!"
echo ""
echo "To create all issues, you can:"
echo "1. Use the bash script: ./docs/github-issues-bulk-create.sh"
echo "2. Use the Python script: python docs/github-issues-create.py"
echo "3. Parse github-issues-api-payloads.json and loop through issues with curl"
