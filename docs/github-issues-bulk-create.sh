#!/bin/bash
# Bulk create GitHub issues for Gemeente Meldpunt features
# Usage: GH_TOKEN=your_token ./docs/github-issues-bulk-create.sh
# Or with gh CLI authenticated: ./docs/github-issues-bulk-create.sh

REPO="hussen612/nextjs_gemeente"
PROJECT_DATE="2025-12-31"  # Default due date

# Color codes for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Creating GitHub issues for Gemeente Meldpunt features...${NC}\n"

# Issue 1: User Authentication System
echo -e "${GREEN}Creating Issue 1: User Authentication & Authorization System${NC}"
gh issue create \
  --repo "$REPO" \
  --title "User Authentication & Authorization System" \
  --label "feature,authentication" \
  --body "## Feature Overview
This issue documents the user authentication and authorization system implemented in the Gemeente Meldpunt application.

## Description
The application uses Clerk for user authentication, providing secure sign-in/sign-up functionality for citizens reporting issues.

## Implementation Details
- **Technology**: Clerk authentication service
- **Location**: 
  - \`my-app/src/app/providers.tsx\` - ClerkProvider wrapper
  - \`my-app/src/middleware.ts\` - Route protection
  - Integration across all pages using SignedIn/SignedOut components

## Features
- User sign-in and sign-up
- Session management
- Protected routes for authenticated users
- User context available throughout the application
- Integration with Convex backend for user identity

## Files Involved
- \`my-app/src/app/providers.tsx\`
- \`my-app/src/middleware.ts\`
- \`convex/auth.config.js\`

## Related Features
- Links to user dashboard access control
- Required for alert submission
- Foundation for admin authorization

## Status
✅ Implemented and functional

## Due Date
$PROJECT_DATE"

# Issue 2: Alert Submission System
echo -e "${GREEN}Creating Issue 2: Alert/Issue Submission Feature${NC}"
gh issue create \
  --repo "$REPO" \
  --title "Alert/Issue Submission Feature" \
  --label "feature,core-functionality" \
  --body "## Feature Overview
Citizens can submit alerts/reports about issues in Rotterdam through an interactive form with map integration.

## Description
Users can report various types of issues (broken street lamps, vandalism, garbage, road damage, etc.) with detailed descriptions, photos, and precise location data.

## Implementation Details
- **Location**: \`my-app/src/app/submit-alert/page.tsx\`
- **Backend**: \`convex/alerts.ts\` - createAlert mutation

## Features
### Alert Types Supported
- Beschadigde Weg (Damaged Road)
- Overmatige Afval (Excessive Waste)
- Graffiti
- Putdeksel (Manhole Cover)
- Straatlantaarn Storing (Street Lamp Malfunction)
- Stoplicht Storing (Traffic Light Malfunction)
- Vandalisme (Vandalism)
- Verkeersbord Beschadiging (Traffic Sign Damage)
- Boomschade (Tree Damage)
- Illegale Dump (Illegal Dumping)
- Water Lek (Water Leak)
- Geluidsoverlast (Noise Nuisance)
- Publieke Veiligheidsrisico (Public Safety Risk)
- Overig (Other)

### Form Components
- Alert type dropdown selection
- Text description field (required)
- Location input with Google Maps autocomplete
- Interactive map for precise location selection
- Draggable marker for fine-tuning location
- Device location detection (\"Use my current location\" button)
- Image upload (up to 5 photos, max 5MB each)
- Image preview with removal option

## Technical Implementation
- Google Maps API integration for location selection
- Reverse geocoding for address lookup
- Coordinates stored as lat/lng pairs
- Real-time validation and error handling
- Responsive form design

## Data Stored
- Alert type
- Description
- Location (address string)
- Coordinates (latitude, longitude)
- User ID (from Clerk)
- Timestamp
- Status (automatically set to \"open\")
- Images array (storage IDs)

## Status
✅ Implemented and functional

## Due Date
$PROJECT_DATE"

# Issue 3: User Dashboard
echo -e "${GREEN}Creating Issue 3: User Dashboard${NC}"
gh issue create \
  --repo "$REPO" \
  --title "User Dashboard - Personal Alert Management" \
  --label "feature,ui" \
  --body "## Feature Overview
Authenticated users can view their submitted alerts on a personalized dashboard with map visualization.

## Description
The dashboard provides users with an overview of their reported issues, displayed on an interactive map showing all active alerts in the system.

## Implementation Details
- **Location**: \`my-app/src/app/dashboard/page.tsx\`
- **Component**: \`my-app/src/components/UserMap.jsx\`
- **Backend**: \`convex/alerts.ts\` - getMyAlerts query

## Features
- Map view of user's submitted alerts
- Quick access to submit new alerts (button link)
- Alerts filtered by authenticated user
- Visual representation of alert locations
- Footer with contact information

## User Experience
- Clean, intuitive interface
- Direct link to alert submission page
- Integration with authentication (SignedIn wrapper)
- Map-centric design for spatial awareness

## Technical Details
- Uses \`useQuery\` to fetch user-specific alerts
- Filtered by userId on backend
- Google Maps integration for visualization
- Real-time updates when new alerts are submitted

## Status
✅ Implemented and functional

## Due Date
$PROJECT_DATE"

# Issue 4: Admin Dashboard
echo -e "${GREEN}Creating Issue 4: Admin Dashboard & Management System${NC}"
gh issue create \
  --repo "$REPO" \
  --title "Admin Dashboard & Management System" \
  --label "feature,admin,core-functionality" \
  --body "## Feature Overview
Comprehensive admin panel for managing all alerts, updating statuses, adding notes, and managing administrator access.

## Description
Authorized administrators can view, manage, and update all alerts submitted by citizens. The dashboard includes advanced filtering, search, and bulk management capabilities.

## Implementation Details
- **Location**: \`my-app/src/app/admin-dashboard/page.tsx\`
- **Backend**: 
  - \`convex/admin.ts\` - Admin authorization
  - \`convex/alerts.ts\` - Alert management mutations

## Key Features

### Alert Management
- View all submitted alerts in a table format
- Update alert status (Open → In Progress → Resolved)
- Add internal notes to alerts
- View detailed information per alert
- Click map markers to view alert details

### Search & Filter
- Real-time search by type, description, or location
- Filter by status (All, Open, In Progress, Resolved)
- Combined search and filter functionality
- Clear filters button

### Map Visualization
- Interactive Google Maps showing all alerts
- Color-coded or labeled markers
- Click markers to open detailed alert view
- Zoom and pan for geographic overview

### Alert Details Modal
- Full alert information display
- Status update dropdown
- Add notes interface
- View all historical notes
- Photo gallery with lightbox
- Embedded Google Maps for location
- Timestamp and user information

### Admin Management
- Add administrators by email address
- Remove administrator access
- Email validation before adding
- User existence verification
- List of current administrators

### Image Handling
- View all attached photos
- Thumbnail grid display
- Click to view full-size images
- Lightbox modal for photo viewing
- Support for multiple images per alert

## Authorization
Dual authorization model:
1. **Clerk Roles**: Admin role in organization
2. **Database Table**: Email-based admin list

Users must have either authorization method to access.

## Technical Implementation
- React hooks for state management
- Convex real-time queries and mutations
- Google Maps API integration
- Responsive table and card layouts
- Modal dialogs for detailed views
- Image lazy loading and optimization

## Access Control
- Checks \`isAdminClerk\` and \`isAdmin\` queries
- Redirects unauthorized users
- Secure mutation endpoints
- Admin-only file access

## Status
✅ Implemented and functional

## Due Date
$PROJECT_DATE"

# Issue 5: Map Integration
echo -e "${GREEN}Creating Issue 5: Map Integration & Visualization${NC}"
gh issue create \
  --repo "$REPO" \
  --title "Map Integration & Visualization with Google Maps" \
  --label "feature,maps,integration" \
  --body "## Feature Overview
Google Maps integration throughout the application for location selection, visualization, and alert display.

## Description
The application uses Google Maps API to provide interactive mapping features for both alert submission and viewing, enabling precise location selection and geographic visualization of issues.

## Implementation Details
- **Technology**: \`@react-google-maps/api\` package
- **Components**: 
  - \`my-app/src/components/MapWithAlerts.jsx\`
  - \`my-app/src/components/UserMap.jsx\`
- **API Key**: \`NEXT_PUBLIC_GOOGLE_MAPS_API_KEY\`

## Features

### Location Selection (Submit Alert)
- Interactive map for clicking to place markers
- Google Places Autocomplete for address search
- Draggable markers for precise positioning
- Real-time geocoding (address ↔ coordinates)
- Device location detection
- Manual address entry with geocoding
- Coordinate validation

### Alert Visualization
- Display all active alerts as map markers
- Color-coded or typed markers
- Clickable markers for alert details
- Clustered markers for dense areas
- Zoom controls and map navigation
- Fallback center coordinates (Rotterdam)

### Map Features
- Default center: Rotterdam (51.9244, 4.4777)
- Responsive zoom levels
- Disabled default UI (customized controls)
- Zoom controls enabled
- Type controls based on view

## Integration Points
- **Home Page**: Shows all active alerts
- **Submit Alert**: Location selection interface
- **Dashboard**: User's alert locations
- **Admin Dashboard**: All alerts with filtering
- **Alert Details**: Individual alert location

## Technical Details
- Uses \`useLoadScript\` hook for API loading
- Libraries: \`['places']\` for autocomplete
- Marker components with drag support
- Geocoder service for address lookups
- Error handling for API failures
- Loading states during map initialization

## Data Flow
1. User selects location on map
2. Coordinates extracted (lat, lng)
3. Reverse geocoding for address
4. Both stored in database
5. Retrieved for display on various pages

## Status
✅ Implemented and functional

## Dependencies
- Valid Google Maps API key
- Places API enabled
- Geocoding API enabled

## Due Date
$PROJECT_DATE"

# Issue 6: Image Upload System
echo -e "${GREEN}Creating Issue 6: Image Upload & Storage System${NC}"
gh issue create \
  --repo "$REPO" \
  --title "Image Upload & Storage System" \
  --label "feature,storage" \
  --body "## Feature Overview
Citizens can attach photos to alert submissions, with secure upload and storage using Convex file storage.

## Description
Users can upload up to 5 photos per alert to provide visual evidence of reported issues. Images are stored securely and can be viewed by the user and administrators.

## Implementation Details
- **Backend**: \`convex/files.ts\`
- **Frontend**: \`my-app/src/app/submit-alert/page.tsx\`
- **Storage**: Convex \`_storage\` table

## Features

### Upload Interface
- File input for multiple image selection
- Drag-and-drop support
- Image preview thumbnails
- Remove button for each preview
- Real-time validation
- Progress indication during upload

### Validation Rules
- **Maximum files**: 5 images per alert
- **Maximum size**: 5MB per image
- **Allowed types**: JPG, PNG, GIF (image/*)
- **Client-side validation**: Before upload
- **Error messages**: Clear feedback to user

### Upload Process
1. User selects images from device
2. Client validates file type and size
3. Preview generated using \`URL.createObjectURL\`
4. On submit:
   - Request upload URL from Convex
   - Upload each image to storage
   - Receive storage ID for each
   - Store IDs with alert record

### Storage Schema
Images stored as array in alert document:
\`\`\`typescript
images: [
  {
    storageId: Id<\"_storage\">,
    contentType: string,
    uploadedAt: number
  }
]
\`\`\`

## Viewing Images

### User View (Alert Details)
- Grid display of thumbnails
- Click to view full-size
- Lightbox modal for viewing
- Multiple images scrollable

### Admin View
- Thumbnails in alert table (first 4)
- Full gallery in alert details modal
- Click to enlarge
- Download capability

## Technical Implementation
- \`generateUploadUrl\` mutation for secure uploads
- \`getImageUrl\` and \`getImageUrls\` queries for retrieval
- Authorization checks for admin-only access
- Content-Type preservation
- Automatic cleanup of preview URLs
- Error handling for upload failures

## Security
- Authentication required for upload
- Admin authorization for bulk image retrieval
- Storage IDs are not guessable
- Content-Type validation

## Error Handling
- Upload size errors
- Network failure handling
- Invalid file type messages
- Retry capability
- Partial upload handling

## Status
✅ Implemented and functional

## Due Date
$PROJECT_DATE"

# Issue 7: Alert Status Management
echo -e "${GREEN}Creating Issue 7: Alert Status Management Workflow${NC}"
gh issue create \
  --repo "$REPO" \
  --title "Alert Status Management Workflow" \
  --label "feature,workflow" \
  --body "## Feature Overview
Structured workflow for tracking the lifecycle of reported alerts from submission to resolution.

## Description
Alerts progress through defined status states, allowing administrators to track and communicate the handling of citizen reports.

## Status Values

### 1. Open (Initial)
- **Set**: Automatically when alert is submitted
- **Meaning**: New alert awaiting review
- **User view**: Visible as \"Open\"
- **Admin view**: Filterable and sortable

### 2. In Progress (in_progress)
- **Set**: Manually by administrator
- **Meaning**: Alert is being actively addressed
- **User view**: Shows work is ongoing
- **Admin view**: Can filter to see active work

### 3. Resolved
- **Set**: Manually by administrator
- **Meaning**: Issue has been fixed/addressed
- **User view**: Completed status
- **Admin view**: Historical record

## Implementation Details
- **Location**: \`convex/alerts.ts\` - updateAlertStatus mutation
- **Schema**: \`convex/schema.ts\` - status field (string)
- **Admin UI**: \`my-app/src/app/admin-dashboard/page.tsx\`

## Features

### Status Updates
- Admin-only modification
- Dropdown selection in admin dashboard
- Immediate database update
- Real-time reflection across all views
- Status history (via notes)

### Status Display
- Human-readable labels (Dutch)
- Color coding (implementation ready)
- Filter by status in admin dashboard
- Status shown in alert lists
- Status in detailed views

### Authorization
- Only administrators can update status
- Checks both Clerk role and database table
- Error handling for unauthorized attempts
- Audit trail via notes system

## User Interface

### Admin Dashboard
\`\`\`
Status Dropdown:
- Open
- In behandeling (In Progress)
- Opgelost (Resolved)
\`\`\`

### Filter Interface
\`\`\`
Filter Options:
- Alle (All)
- Open
- In behandeling
- Opgelost
\`\`\`

## Technical Implementation
\`\`\`typescript
mutation updateAlertStatus {
  args: { id: v.id(\"alerts\"), status: v.string() }
  handler: async (ctx, args) => {
    // Check admin authorization
    // Validate alert exists
    // Update status field
  }
}
\`\`\`

## Future Enhancements
- Automatic status transitions
- Email notifications on status change
- Status change history log
- Custom status values
- Status-based SLA tracking

## Status
✅ Implemented and functional

## Due Date
$PROJECT_DATE"

# Issue 8: Admin Management System
echo -e "${GREEN}Creating Issue 8: Admin Access Control & Management${NC}"
gh issue create \
  --repo "$REPO" \
  --title "Admin Access Control & Management System" \
  --label "feature,admin,security" \
  --body "## Feature Overview
Email-based administrator management system allowing secure control over who can access admin features.

## Description
The application provides a dual authorization model for administrators, combining Clerk organization roles with a database-backed email whitelist for flexible access control.

## Implementation Details
- **Backend**: \`convex/admin.ts\`
- **Schema**: \`convex/schema.ts\` - admins table
- **UI**: \`my-app/src/app/admin-dashboard/page.tsx\` - AdminManager component
- **Bootstrap**: \`my-app/src/app/admin-bootstrap/page.tsx\` - Initial setup

## Admin Table Schema
\`\`\`typescript
admins: {
  email: v.optional(v.string()),
  userId: v.optional(v.string()),
  createdAt: v.number()
}
Indexes: by_email, by_userId
\`\`\`

## Authorization Methods

### Method 1: Clerk Organization Role
- Admin role set in Clerk dashboard
- Checked via \`orgRole\` or \`publicMetadata.role\`
- Organization-level permissions
- Managed outside application

### Method 2: Database Admin List
- Email-based whitelist in Convex
- Checked against authenticated user email
- Managed within application
- Can be bootstrapped without existing admins

## Features

### Add Admin
- Input: Email address
- Validation: Email format check
- Verification: User existence in system
- Action: Add to admins table
- Authorization: Only existing admins can add

### Remove Admin
- Select admin from list
- Confirmation (recommended)
- Remove from admins table
- Authorization: Only existing admins can remove

### List Admins
- Display all current administrators
- Show email addresses
- Show creation timestamps
- Admin-only view

### Bootstrap Process
- \`/admin-bootstrap\` route for initial setup
- Allows first admin creation when none exist
- One-time use functionality
- Creates admin record for current user

## Backend Queries & Mutations

### Queries
- \`isAdmin\`: Check if current user is admin (DB)
- \`isAdminClerk\`: Check Clerk role
- \`listAdmins\`: Get all administrators
- \`hasAnyAdmin\`: Check if any admin exists

### Mutations
- \`addAdmin\`: Add new administrator by email
- \`removeAdmin\`: Remove administrator
- Authorization checks on all mutations

### Actions
- \`checkUserExists\`: Verify user email exists in Clerk

## Security Features
- Email validation before adding
- User existence verification
- Only admins can modify admin list
- Dual authorization prevents lockout
- Bootstrap safety check

## User Interface

### Admin Manager Component
\`\`\`
Current Admins:
- user1@example.com [Remove]
- user2@example.com [Remove]

Add Administrator:
[Email Input] [Add Button]
\`\`\`

### Error Handling
- \"User does not exist\" for unregistered emails
- \"Invalid email format\" for malformed input
- \"Forbidden\" for unauthorized attempts
- Modal dialogs for error display

## Access Control Flow
\`\`\`
User attempts admin action
  ↓
Check Clerk role (isAdminClerk)
  ↓
Check DB admin table (isAdmin)
  ↓
If either true → Grant access
If both false → Deny access
\`\`\`

## Bootstrap Flow
\`\`\`
No admins exist (hasAnyAdmin = false)
  ↓
User visits /admin-bootstrap
  ↓
Adds self as admin
  ↓
Can now access admin dashboard
  ↓
Can add other admins
\`\`\`

## Status
✅ Implemented and functional

## Due Date
$PROJECT_DATE"

# Issue 9: Alert Details View
echo -e "${GREEN}Creating Issue 9: Alert Details View & Navigation${NC}"
gh issue create \
  --repo "$REPO" \
  --title "Alert Details View & Individual Alert Pages" \
  --label "feature,ui" \
  --body "## Feature Overview
Detailed view pages for individual alerts, showing complete information, location maps, photos, and admin notes.

## Description
Each alert has a dedicated detail page accessible via unique URL, providing comprehensive information to both citizens and administrators.

## Implementation Details
- **Location**: \`my-app/src/app/alerts/[id]/page.tsx\`
- **Backend**: \`convex/alerts.ts\` - getAlertById query
- **Route**: \`/alerts/[alertId]\`

## Features

### Public Information
- **Alert Type**: Category of the issue
- **Description**: Full text description
- **Location**: Address string
- **Coordinates**: Latitude and longitude
- **Timestamp**: Submission date and time
- **Status**: Current status (Open, In Progress, Resolved)

### Map Display
- Google Maps embed showing exact location
- Single marker at alert coordinates
- Zoom level: 15 (detailed view)
- Static map (non-interactive)
- Falls back gracefully if coordinates missing

### Photo Gallery
- All attached images displayed
- Grid layout for multiple images
- Thumbnail display with click-to-enlarge
- Lightbox modal for full-size viewing
- Click outside or close button to dismiss
- Lazy loading for performance

### Admin-Only Features
- **Notes Section**: Visible only to administrators
- View all internal notes
- Chronological display (newest first)
- Author and timestamp for each note
- Read-only view (editing in admin dashboard)

## User Experience

### Navigation
- Back link to dashboard
- Breadcrumb-style navigation
- Deep linking support (shareable URLs)
- Browser back button support

### Responsive Design
- Mobile-friendly layout
- Card-based sections
- Responsive map sizing
- Touch-friendly image gallery

### Loading States
- \"Melding laden…\" (Loading alert)
- \"Kaart laden…\" (Loading map)
- Graceful handling of missing data

### Error States
- \"Geen ID opgegeven\" (No ID provided)
- \"Melding niet gevonden\" (Alert not found)
- Map loading errors
- Missing coordinate handling

## Technical Implementation

### Dynamic Routing
\`\`\`typescript
Route: /alerts/[id]/page.tsx
Params: { id: alertId }
Query: getAlertById({ id: alertId })
\`\`\`

### Authorization Checks
- Public information visible to all
- Notes section requires admin check
- Uses both isAdminClerk and isAdmin queries
- Conditional rendering based on auth

### Data Fetching
- Real-time query with Convex
- Automatic updates on data changes
- Handles undefined, null, and error states
- Image URLs fetched separately for optimization

## Layout Structure
\`\`\`
Page Header
  ← Back to dashboard
  Alert Type (h1)
  Status • Timestamp

Details Card
  Description
  Location
  Coordinates

Map Card (if coordinates available)
  Google Maps embed
  Marker at alert location

Photos Card (if images exist)
  Image grid
  Lightbox on click

Notes Card (admin only)
  List of notes
  Author and timestamp
\`\`\`

## SEO & Accessibility
- Semantic HTML structure
- Proper heading hierarchy
- Alt text for images
- Descriptive page titles
- Accessible navigation

## Status
✅ Implemented and functional

## Due Date
$PROJECT_DATE"

# Issue 10: Search and Filter
echo -e "${GREEN}Creating Issue 10: Search & Filter Functionality${NC}"
gh issue create \
  --repo "$REPO" \
  --title "Search & Filter Functionality for Admin Dashboard" \
  --label "feature,admin,ui" \
  --body "## Feature Overview
Powerful search and filter capabilities in the admin dashboard for efficiently managing large numbers of alerts.

## Description
Administrators can quickly find specific alerts using real-time search and status filtering, improving workflow efficiency and response times.

## Implementation Details
- **Location**: \`my-app/src/app/admin-dashboard/page.tsx\`
- **Implementation**: Client-side filtering with React state
- **Performance**: Optimized for 100+ alerts

## Search Features

### Search Fields
Searches across multiple alert fields:
- **Type**: Alert category (e.g., \"Graffiti\", \"Straatlantaarn\")
- **Description**: Full text of alert description
- **Location**: Address and location string

### Search Behavior
- **Real-time**: Filters as you type
- **Case-insensitive**: \"graffiti\" matches \"Graffiti\"
- **Partial matching**: \"straat\" matches \"Straatlantaarn Storing\"
- **Multiple field**: Searches all three fields simultaneously
- **Whitespace handling**: Trims input automatically

## Filter Features

### Status Filter
Dropdown options:
- **Alle** (All): Show all alerts
- **Open**: Only new/unaddressed alerts
- **In behandeling** (In Progress): Currently being worked on
- **Opgelost** (Resolved): Completed alerts

### Filter Behavior
- Independent of search (can combine)
- Immediate application on selection
- Persists during search operations
- Default: \"Alle\" (show all)

## Combined Functionality

### Search + Filter
- Apply both simultaneously
- Filter first, then search within results
- Efficient client-side processing
- No server round-trips

### Clear Filters
- **Button**: \"Wis filters\" (Clear filters)
- **Visibility**: Shows only when filters active
- **Action**: Resets both search and status filter
- **Result**: Returns to full alert list

## User Interface

### Layout
\`\`\`
[Search Input: Wide field]  [Status: Dropdown]  [Clear Button]
                Results: X alerts
\`\`\`

### Search Input
- Full-width on mobile
- Placeholder: \"Zoek op type, beschrijving of locatie...\"
- Instant feedback
- Clear button (browser default)

### Status Dropdown
- Compact design
- Dutch labels
- Current selection highlighted
- Keyboard navigable

### Results Display
- Updates table in real-time
- Shows count of matching alerts
- \"Geen meldingen gevonden\" when no matches
- Context-aware messaging

## Technical Implementation

### State Management
\`\`\`typescript
const [searchQuery, setSearchQuery] = useState('');
const [filter, setFilter] = useState('all');

const displayed = useMemo(() => {
  let filtered = alerts;
  
  // Apply status filter
  if (filter !== 'all') {
    filtered = filtered.filter(a => a.status === filter);
  }
  
  // Apply search
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(a =>
      a.type.toLowerCase().includes(query) ||
      a.description.toLowerCase().includes(query) ||
      a.location.toLowerCase().includes(query)
    );
  }
  
  return filtered;
}, [alerts, filter, searchQuery]);
\`\`\`

### Performance
- \`useMemo\` hook prevents unnecessary re-renders
- Client-side filtering (no API calls)
- Efficient for expected data volumes
- Debouncing not needed (instant is better UX)

## User Experience

### Empty States
- **No filters active**: \"Geen meldingen gevonden.\"
- **Filters active**: \"Geen meldingen gevonden met de huidige filters.\"
- Clear call-to-action to adjust filters

### Visual Feedback
- Immediate results update
- Filter pill/badge (future enhancement)
- Result count display
- Highlighting matches (future enhancement)

## Future Enhancements
- Date range filtering
- Multiple status selection
- Save filter presets
- Export filtered results
- Advanced query syntax
- Autocomplete suggestions
- Search history
- Filter by submitter/admin

## Accessibility
- Keyboard navigation support
- Screen reader announcements
- Focus management
- Label associations
- ARIA attributes

## Status
✅ Implemented and functional

## Due Date
$PROJECT_DATE"

echo -e "\n${BLUE}✅ All 10 issues created successfully!${NC}"
echo -e "\n${GREEN}Next steps:${NC}"
echo "1. View issues: gh issue list --repo $REPO"
echo "2. Create project: gh project create --owner hussen612 --title 'Gemeente Meldpunt Features'"
echo "3. Link issues to project using the GitHub web interface"
echo "4. Set due dates in the project board"
