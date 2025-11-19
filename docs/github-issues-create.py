#!/usr/bin/env python3
"""
Bulk create GitHub issues for Gemeente Meldpunt features using PyGithub.

Usage:
    pip install PyGithub
    export GITHUB_TOKEN=your_token
    python docs/github-issues-create.py

Or:
    GITHUB_TOKEN=your_token python docs/github-issues-create.py
"""

import os
import sys
from datetime import datetime
from github import Github, GithubException

# Configuration
REPO_NAME = "hussen612/nextjs_gemeente"
PROJECT_NAME = "Gemeente Meldpunt Features"
DEFAULT_DUE_DATE = "2025-12-31"

# Issue definitions
ISSUES = [
    {
        "title": "User Authentication & Authorization System",
        "body": """## Feature Overview
This issue documents the user authentication and authorization system implemented in the Gemeente Meldpunt application.

## Description
The application uses Clerk for user authentication, providing secure sign-in/sign-up functionality for citizens reporting issues.

## Implementation Details
- **Technology**: Clerk authentication service
- **Location**: 
  - `my-app/src/app/providers.tsx` - ClerkProvider wrapper
  - `my-app/src/middleware.ts` - Route protection
  - Integration across all pages using SignedIn/SignedOut components

## Features
- User sign-in and sign-up
- Session management
- Protected routes for authenticated users
- User context available throughout the application
- Integration with Convex backend for user identity

## Files Involved
- `my-app/src/app/providers.tsx`
- `my-app/src/middleware.ts`
- `convex/auth.config.js`

## Related Features
- Links to user dashboard access control
- Required for alert submission
- Foundation for admin authorization

## Status
✅ Implemented and functional

## Due Date
{due_date}""",
        "labels": ["feature", "authentication"]
    },
    {
        "title": "Alert/Issue Submission Feature",
        "body": """## Feature Overview
Citizens can submit alerts/reports about issues in Rotterdam through an interactive form with map integration.

## Description
Users can report various types of issues (broken street lamps, vandalism, garbage, road damage, etc.) with detailed descriptions, photos, and precise location data.

## Implementation Details
- **Location**: `my-app/src/app/submit-alert/page.tsx`
- **Backend**: `convex/alerts.ts` - createAlert mutation

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
- Device location detection ("Use my current location" button)
- Image upload (up to 5 photos, max 5MB each)
- Image preview with removal option

## Technical Implementation
- Google Maps API integration for location selection
- Reverse geocoding for address lookup
- Coordinates stored as lat/lng pairs
- Real-time validation and error handling
- Responsive form design

## Data Stored
- Alert type, Description, Location (address string)
- Coordinates (latitude, longitude)
- User ID (from Clerk), Timestamp
- Status (automatically set to "open")
- Images array (storage IDs)

## Status
✅ Implemented and functional

## Due Date
{due_date}""",
        "labels": ["feature", "core-functionality"]
    },
    {
        "title": "User Dashboard - Personal Alert Management",
        "body": """## Feature Overview
Authenticated users can view their submitted alerts on a personalized dashboard with map visualization.

## Description
The dashboard provides users with an overview of their reported issues, displayed on an interactive map showing all active alerts in the system.

## Implementation Details
- **Location**: `my-app/src/app/dashboard/page.tsx`
- **Component**: `my-app/src/components/UserMap.jsx`
- **Backend**: `convex/alerts.ts` - getMyAlerts query

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
- Uses `useQuery` to fetch user-specific alerts
- Filtered by userId on backend
- Google Maps integration for visualization
- Real-time updates when new alerts are submitted

## Status
✅ Implemented and functional

## Due Date
{due_date}""",
        "labels": ["feature", "ui"]
    },
    {
        "title": "Admin Dashboard & Management System",
        "body": """## Feature Overview
Comprehensive admin panel for managing all alerts, updating statuses, adding notes, and managing administrator access.

## Description
Authorized administrators can view, manage, and update all alerts submitted by citizens. The dashboard includes advanced filtering, search, and bulk management capabilities.

## Implementation Details
- **Location**: `my-app/src/app/admin-dashboard/page.tsx`
- **Backend**: `convex/admin.ts` - Admin authorization, `convex/alerts.ts` - Alert management mutations

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
- Click markers to open detailed alert view
- Zoom and pan for geographic overview

### Alert Details Modal
- Full alert information display, Status update dropdown
- Add notes interface, View all historical notes
- Photo gallery with lightbox, Embedded Google Maps for location

### Admin Management
- Add/remove administrators by email address
- Email validation and user existence verification
- List of current administrators

## Authorization
Dual authorization model: Clerk Roles + Database Table

## Status
✅ Implemented and functional

## Due Date
{due_date}""",
        "labels": ["feature", "admin", "core-functionality"]
    },
    {
        "title": "Map Integration & Visualization with Google Maps",
        "body": """## Feature Overview
Google Maps integration throughout the application for location selection, visualization, and alert display.

## Description
The application uses Google Maps API to provide interactive mapping features for both alert submission and viewing.

## Implementation Details
- **Technology**: `@react-google-maps/api` package
- **Components**: `my-app/src/components/MapWithAlerts.jsx`, `my-app/src/components/UserMap.jsx`
- **API Key**: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`

## Features
### Location Selection (Submit Alert)
- Interactive map for clicking to place markers
- Google Places Autocomplete for address search
- Draggable markers for precise positioning
- Real-time geocoding (address ↔ coordinates)
- Device location detection

### Alert Visualization
- Display all active alerts as map markers
- Clickable markers for alert details
- Zoom controls and map navigation
- Fallback center coordinates (Rotterdam: 51.9244, 4.4777)

## Integration Points
- Home Page: Shows all active alerts
- Submit Alert: Location selection interface
- Dashboard: User's alert locations
- Admin Dashboard: All alerts with filtering
- Alert Details: Individual alert location

## Technical Details
- Uses `useLoadScript` hook for API loading
- Libraries: `['places']` for autocomplete
- Marker components with drag support
- Geocoder service for address lookups
- Error handling for API failures

## Status
✅ Implemented and functional

## Due Date
{due_date}""",
        "labels": ["feature", "maps", "integration"]
    },
    {
        "title": "Image Upload & Storage System",
        "body": """## Feature Overview
Citizens can attach photos to alert submissions, with secure upload and storage using Convex file storage.

## Description
Users can upload up to 5 photos per alert to provide visual evidence of reported issues.

## Implementation Details
- **Backend**: `convex/files.ts`
- **Frontend**: `my-app/src/app/submit-alert/page.tsx`
- **Storage**: Convex `_storage` table

## Features
### Upload Interface
- File input for multiple image selection
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
3. Preview generated using `URL.createObjectURL`
4. On submit: Request upload URL, Upload images, Receive storage IDs

### Viewing Images
- Grid display of thumbnails
- Click to view full-size
- Lightbox modal for viewing
- Admin view with thumbnails in table

## Technical Implementation
- `generateUploadUrl` mutation for secure uploads
- `getImageUrl` and `getImageUrls` queries for retrieval
- Authorization checks for admin-only access
- Content-Type preservation

## Security
- Authentication required for upload
- Admin authorization for bulk image retrieval
- Storage IDs are not guessable

## Status
✅ Implemented and functional

## Due Date
{due_date}""",
        "labels": ["feature", "storage"]
    },
    {
        "title": "Alert Status Management Workflow",
        "body": """## Feature Overview
Structured workflow for tracking the lifecycle of reported alerts from submission to resolution.

## Description
Alerts progress through defined status states, allowing administrators to track and communicate the handling of citizen reports.

## Status Values
### 1. Open (Initial)
- Set automatically when alert is submitted
- New alert awaiting review

### 2. In Progress (in_progress)
- Set manually by administrator
- Alert is being actively addressed

### 3. Resolved
- Set manually by administrator
- Issue has been fixed/addressed

## Implementation Details
- **Location**: `convex/alerts.ts` - updateAlertStatus mutation
- **Schema**: `convex/schema.ts` - status field (string)
- **Admin UI**: `my-app/src/app/admin-dashboard/page.tsx`

## Features
### Status Updates
- Admin-only modification
- Dropdown selection in admin dashboard
- Immediate database update
- Real-time reflection across all views

### Status Display
- Human-readable labels (Dutch)
- Filter by status in admin dashboard
- Status shown in alert lists and detailed views

### Authorization
- Only administrators can update status
- Checks both Clerk role and database table
- Error handling for unauthorized attempts

## User Interface
Status Dropdown: Open, In behandeling (In Progress), Opgelost (Resolved)
Filter Options: Alle (All), Open, In behandeling, Opgelost

## Future Enhancements
- Automatic status transitions
- Email notifications on status change
- Status change history log
- Custom status values

## Status
✅ Implemented and functional

## Due Date
{due_date}""",
        "labels": ["feature", "workflow"]
    },
    {
        "title": "Admin Access Control & Management System",
        "body": """## Feature Overview
Email-based administrator management system allowing secure control over who can access admin features.

## Description
The application provides a dual authorization model for administrators, combining Clerk organization roles with a database-backed email whitelist.

## Implementation Details
- **Backend**: `convex/admin.ts`
- **Schema**: `convex/schema.ts` - admins table
- **UI**: `my-app/src/app/admin-dashboard/page.tsx` - AdminManager component
- **Bootstrap**: `my-app/src/app/admin-bootstrap/page.tsx` - Initial setup

## Authorization Methods
### Method 1: Clerk Organization Role
- Admin role set in Clerk dashboard
- Checked via `orgRole` or `publicMetadata.role`
- Organization-level permissions

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
- Authorization: Only existing admins can add

### Remove Admin
- Select admin from list
- Remove from admins table
- Authorization: Only existing admins can remove

### List Admins
- Display all current administrators
- Show email addresses and creation timestamps

### Bootstrap Process
- `/admin-bootstrap` route for initial setup
- Allows first admin creation when none exist
- One-time use functionality

## Backend Queries & Mutations
- `isAdmin`: Check if current user is admin (DB)
- `isAdminClerk`: Check Clerk role
- `listAdmins`: Get all administrators
- `hasAnyAdmin`: Check if any admin exists
- `addAdmin`: Add new administrator by email
- `removeAdmin`: Remove administrator
- `checkUserExists`: Verify user email exists

## Security Features
- Email validation before adding
- User existence verification
- Only admins can modify admin list
- Dual authorization prevents lockout

## Status
✅ Implemented and functional

## Due Date
{due_date}""",
        "labels": ["feature", "admin", "security"]
    },
    {
        "title": "Alert Details View & Individual Alert Pages",
        "body": """## Feature Overview
Detailed view pages for individual alerts, showing complete information, location maps, photos, and admin notes.

## Description
Each alert has a dedicated detail page accessible via unique URL, providing comprehensive information to both citizens and administrators.

## Implementation Details
- **Location**: `my-app/src/app/alerts/[id]/page.tsx`
- **Backend**: `convex/alerts.ts` - getAlertById query
- **Route**: `/alerts/[alertId]`

## Features
### Public Information
- Alert Type, Description, Location
- Coordinates (latitude, longitude)
- Timestamp, Status

### Map Display
- Google Maps embed showing exact location
- Single marker at alert coordinates
- Zoom level: 15 (detailed view)
- Falls back gracefully if coordinates missing

### Photo Gallery
- All attached images displayed
- Grid layout for multiple images
- Thumbnail display with click-to-enlarge
- Lightbox modal for full-size viewing

### Admin-Only Features
- Notes Section visible only to administrators
- View all internal notes
- Chronological display (newest first)
- Author and timestamp for each note

## User Experience
### Navigation
- Back link to dashboard
- Breadcrumb-style navigation
- Deep linking support (shareable URLs)

### Responsive Design
- Mobile-friendly layout
- Card-based sections
- Responsive map sizing
- Touch-friendly image gallery

### Loading & Error States
- "Melding laden…" (Loading alert)
- "Kaart laden…" (Loading map)
- "Melding niet gevonden" (Alert not found)
- Graceful handling of missing data

## Technical Implementation
- Dynamic Routing: `/alerts/[id]/page.tsx`
- Real-time query with Convex
- Automatic updates on data changes
- Conditional rendering based on auth

## SEO & Accessibility
- Semantic HTML structure
- Proper heading hierarchy
- Alt text for images
- Accessible navigation

## Status
✅ Implemented and functional

## Due Date
{due_date}""",
        "labels": ["feature", "ui"]
    },
    {
        "title": "Search & Filter Functionality for Admin Dashboard",
        "body": """## Feature Overview
Powerful search and filter capabilities in the admin dashboard for efficiently managing large numbers of alerts.

## Description
Administrators can quickly find specific alerts using real-time search and status filtering, improving workflow efficiency.

## Implementation Details
- **Location**: `my-app/src/app/admin-dashboard/page.tsx`
- **Implementation**: Client-side filtering with React state
- **Performance**: Optimized for 100+ alerts

## Search Features
### Search Fields
Searches across: Type, Description, Location

### Search Behavior
- Real-time: Filters as you type
- Case-insensitive matching
- Partial matching (substring search)
- Multiple field search simultaneously
- Whitespace handling

## Filter Features
### Status Filter
Dropdown options:
- Alle (All): Show all alerts
- Open: Only new/unaddressed alerts
- In behandeling (In Progress): Currently being worked on
- Opgelost (Resolved): Completed alerts

### Filter Behavior
- Independent of search (can combine)
- Immediate application on selection
- Persists during search operations

## Combined Functionality
### Search + Filter
- Apply both simultaneously
- Filter first, then search within results
- Efficient client-side processing
- No server round-trips

### Clear Filters
- Button: "Wis filters" (Clear filters)
- Shows only when filters active
- Resets both search and status filter

## User Interface
Layout: [Search Input: Wide field] [Status: Dropdown] [Clear Button]

### Results Display
- Updates table in real-time
- Shows count of matching alerts
- "Geen meldingen gevonden" when no matches
- Context-aware messaging

## Technical Implementation
Uses `useMemo` hook to prevent unnecessary re-renders
Client-side filtering (no API calls)
Efficient for expected data volumes

## Future Enhancements
- Date range filtering
- Multiple status selection
- Save filter presets
- Export filtered results
- Advanced query syntax
- Autocomplete suggestions

## Accessibility
- Keyboard navigation support
- Screen reader announcements
- Focus management
- ARIA attributes

## Status
✅ Implemented and functional

## Due Date
{due_date}""",
        "labels": ["feature", "admin", "ui"]
    }
]


def get_github_client():
    """Get authenticated GitHub client."""
    token = os.environ.get('GITHUB_TOKEN')
    if not token:
        print("❌ Error: GITHUB_TOKEN environment variable not set")
        print("Usage: export GITHUB_TOKEN=your_token")
        sys.exit(1)
    
    try:
        return Github(token)
    except Exception as e:
        print(f"❌ Error authenticating with GitHub: {e}")
        sys.exit(1)


def create_labels_if_needed(repo):
    """Create labels if they don't exist."""
    existing_labels = {label.name for label in repo.get_labels()}
    
    label_definitions = {
        "feature": {"description": "Feature documentation", "color": "0E8A16"},
        "authentication": {"description": "Authentication related", "color": "FFA500"},
        "core-functionality": {"description": "Core system functionality", "color": "B60205"},
        "ui": {"description": "User interface features", "color": "1D76DB"},
        "admin": {"description": "Admin features", "color": "D93F0B"},
        "maps": {"description": "Map integration", "color": "006B75"},
        "integration": {"description": "Third-party integrations", "color": "5319E7"},
        "storage": {"description": "File/data storage", "color": "FBCA04"},
        "workflow": {"description": "Process workflows", "color": "0052CC"},
        "security": {"description": "Security features", "color": "D4C5F9"}
    }
    
    for label_name, label_info in label_definitions.items():
        if label_name not in existing_labels:
            try:
                repo.create_label(
                    name=label_name,
                    color=label_info["color"],
                    description=label_info["description"]
                )
                print(f"✅ Created label: {label_name}")
            except GithubException as e:
                print(f"⚠️  Warning: Could not create label '{label_name}': {e}")


def create_issues(repo, due_date):
    """Create all issues in the repository."""
    created_issues = []
    
    for i, issue_def in enumerate(ISSUES, 1):
        try:
            # Format body with due date
            body = issue_def["body"].format(due_date=due_date)
            
            # Create issue
            issue = repo.create_issue(
                title=issue_def["title"],
                body=body,
                labels=issue_def["labels"]
            )
            
            created_issues.append(issue)
            print(f"✅ Created Issue #{issue.number}: {issue.title}")
            
        except GithubException as e:
            print(f"❌ Error creating issue '{issue_def['title']}': {e}")
            continue
    
    return created_issues


def main():
    """Main execution function."""
    print("🚀 GitHub Issues Bulk Creator for Gemeente Meldpunt")
    print("=" * 60)
    
    # Get GitHub client
    print("\n📡 Connecting to GitHub...")
    gh = get_github_client()
    
    # Get repository
    print(f"📦 Accessing repository: {REPO_NAME}...")
    try:
        repo = gh.get_repo(REPO_NAME)
        print(f"✅ Repository found: {repo.full_name}")
    except GithubException as e:
        print(f"❌ Error accessing repository: {e}")
        sys.exit(1)
    
    # Create labels
    print("\n🏷️  Checking and creating labels...")
    create_labels_if_needed(repo)
    
    # Create issues
    print(f"\n📝 Creating {len(ISSUES)} issues...")
    created_issues = create_issues(repo, DEFAULT_DUE_DATE)
    
    # Summary
    print("\n" + "=" * 60)
    print(f"✅ Successfully created {len(created_issues)} issues!")
    print("\n📋 Created Issues:")
    for issue in created_issues:
        print(f"   #{issue.number}: {issue.title}")
        print(f"   URL: {issue.html_url}")
    
    print(f"\n🎯 Next Steps:")
    print(f"1. View all issues: https://github.com/{REPO_NAME}/issues")
    print(f"2. Create a project board: https://github.com/{REPO_NAME}/projects")
    print(f"3. Add issues to the project")
    print(f"4. Set due dates in the project view")
    
    print("\n✨ Done!")


if __name__ == "__main__":
    main()
