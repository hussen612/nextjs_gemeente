# Gemeente Meldpunt - GitHub Issues Templates

This directory contains templates and scripts for creating GitHub issues that document the features of the Gemeente Meldpunt (Municipality Reporting System) application.

## 📁 Files

### 1. `github-issues-bulk-create.sh`
**Bash script for bulk issue creation using GitHub CLI**
- Creates all 10 feature issues at once
- Uses `gh issue create` command
- Adds appropriate labels to each issue
- Sets issue descriptions with detailed information

**Usage:**
```bash
# Make script executable
chmod +x docs/github-issues-bulk-create.sh

# Run with authenticated gh CLI
./docs/github-issues-bulk-create.sh

# Or with environment variable
GH_TOKEN=your_github_token ./docs/github-issues-bulk-create.sh
```

### 2. `github-issues-api-payloads.json`
**JSON payloads for GitHub REST API**
- Contains structured data for each issue
- Can be used with curl or programming language HTTP clients
- Includes titles, bodies, labels, and metadata

**Usage:**
```bash
# Create issue using curl
curl -X POST \
  -H "Authorization: token YOUR_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/hussen612/nextjs_gemeente/issues \
  -d @issue_payload.json
```

### 3. `github-issues-create.py`
**Python script for automated issue creation**
- Uses PyGithub library
- Includes error handling and progress tracking
- Can create project and link issues automatically

**Usage:**
```bash
# Install requirements
pip install PyGithub

# Set GitHub token
export GITHUB_TOKEN=your_token

# Run script
python docs/github-issues-create.py
```

### 4. `issue-templates/`
**Individual markdown templates for manual creation**
- One file per feature
- Copy-paste into GitHub web interface
- Includes all formatting and structure

## 🚀 Quick Start

### Option 1: GitHub CLI (Recommended)
```bash
# Install GitHub CLI if not already installed
# On macOS: brew install gh
# On Ubuntu: sudo apt install gh
# On Windows: winget install --id GitHub.cli

# Authenticate
gh auth login

# Run the script
./docs/github-issues-bulk-create.sh
```

### Option 2: Python Script
```bash
pip install PyGithub
export GITHUB_TOKEN=your_github_personal_access_token
python docs/github-issues-create.py
```

### Option 3: Manual Creation
1. Navigate to the `issue-templates/` directory
2. Open each `.md` file
3. Go to GitHub Issues: https://github.com/hussen612/nextjs_gemeente/issues/new
4. Copy the title from the template
5. Paste the content into the issue body
6. Add appropriate labels
7. Submit the issue
8. Repeat for all 10 templates

### Option 4: GitHub API with curl
```bash
# See github-issues-api-payloads.json for payload structure
# Create each issue with:
curl -X POST \
  -H "Authorization: token YOUR_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/hussen612/nextjs_gemeente/issues \
  -d '{"title":"Issue Title","body":"Issue body","labels":["feature"]}'
```

## 📋 Issues to Create

1. **User Authentication & Authorization System** (labels: `feature`, `authentication`)
2. **Alert/Issue Submission Feature** (labels: `feature`, `core-functionality`)
3. **User Dashboard - Personal Alert Management** (labels: `feature`, `ui`)
4. **Admin Dashboard & Management System** (labels: `feature`, `admin`, `core-functionality`)
5. **Map Integration & Visualization with Google Maps** (labels: `feature`, `maps`, `integration`)
6. **Image Upload & Storage System** (labels: `feature`, `storage`)
7. **Alert Status Management Workflow** (labels: `feature`, `workflow`)
8. **Admin Access Control & Management System** (labels: `feature`, `admin`, `security`)
9. **Alert Details View & Individual Alert Pages** (labels: `feature`, `ui`)
10. **Search & Filter Functionality for Admin Dashboard** (labels: `feature`, `admin`, `ui`)

## 🎯 Creating a Project Board

After creating the issues, organize them in a GitHub Project:

### Using GitHub CLI:
```bash
# Create project
gh project create --owner hussen612 --title "Gemeente Meldpunt Features" --body "Feature documentation and tracking"

# Link issues (replace PROJECT_ID and ISSUE_NUMBERS)
gh project item-add PROJECT_ID --owner hussen612 --url https://github.com/hussen612/nextjs_gemeente/issues/1
```

### Using GitHub Web Interface:
1. Go to: https://github.com/hussen612/nextjs_gemeente/projects
2. Click "New project"
3. Choose "Board" or "Table" view
4. Name it "Gemeente Meldpunt Features"
5. Add description
6. Click "Create"
7. Add issues to the project:
   - Click "+ Add item"
   - Search for and select each issue
   - Set status, due dates, and other fields

## 📅 Setting Due Dates

Due dates can be set in the project board:
1. Open your project
2. Add a "Due Date" field (if not exists)
3. For each issue card, set the due date
4. Suggested default: 2025-12-31

Or via GitHub CLI:
```bash
# Add due date field to project items
# (Requires project field configuration)
```

## 🏷️ Labels Used

Make sure these labels exist in your repository:
- `feature` - Main feature documentation
- `authentication` - Authentication related
- `core-functionality` - Essential system features
- `ui` - User interface features
- `admin` - Admin panel features
- `maps` - Map integration
- `integration` - Third-party integrations
- `storage` - File/data storage
- `workflow` - Process workflows
- `security` - Security features

Create missing labels:
```bash
gh label create "feature" --description "Feature documentation" --color "0E8A16"
gh label create "admin" --description "Admin features" --color "D93F0B"
gh label create "core-functionality" --description "Core system functionality" --color "B60205"
```

## 🔗 Additional Resources

- [GitHub CLI Documentation](https://cli.github.com/manual/)
- [GitHub REST API Documentation](https://docs.github.com/en/rest/issues/issues)
- [GitHub Projects Documentation](https://docs.github.com/en/issues/planning-and-tracking-with-projects)
- [PyGithub Documentation](https://pygithub.readthedocs.io/)

## ⚠️ Important Notes

- All scripts require a GitHub Personal Access Token with `repo` and `project` permissions
- Issue numbers will be assigned sequentially as they are created
- Labels must exist before assignment (or will be created automatically by some methods)
- Project board setup is separate from issue creation
- Due dates are managed at the project level, not issue level

## 🤝 Contributing

If you find errors in the templates or have suggestions for improvement, please update the templates and regenerate the scripts.
