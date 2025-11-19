# Quick Reference: GitHub Issue Bulk Creation

## 🚀 Choose Your Method

### Method 1: GitHub CLI (Easiest)
```bash
gh auth login
./docs/github-issues-bulk-create.sh
```
✅ One command creates all 10 issues  
✅ Automatic labels  
✅ No dependencies to install  

---

### Method 2: Python (Most Automated)
```bash
pip install PyGithub
export GITHUB_TOKEN=ghp_xxxxxxxxxxxxx
python docs/github-issues-create.py
```
✅ Creates labels if missing  
✅ Error handling & progress  
✅ Full automation  

---

### Method 3: curl/REST API (Most Flexible)
```bash
export GITHUB_TOKEN=ghp_xxxxxxxxxxxxx
./docs/create-issue-example-curl.sh
```
✅ Works everywhere  
✅ No tools needed  
✅ Easy to customize  

---

### Method 4: Manual (Most Control)
1. See `docs/github-issues-api-payloads.json` for templates
2. Go to: https://github.com/hussen612/nextjs_gemeente/issues/new
3. Copy/paste title and body from JSON
4. Add labels manually
5. Repeat for each of 10 issues

---

## 📊 What Gets Created

| # | Issue Title | Labels |
|---|-------------|--------|
| 1 | User Authentication & Authorization System | `feature`, `authentication` |
| 2 | Alert/Issue Submission Feature | `feature`, `core-functionality` |
| 3 | User Dashboard - Personal Alert Management | `feature`, `ui` |
| 4 | Admin Dashboard & Management System | `feature`, `admin`, `core-functionality` |
| 5 | Map Integration & Visualization | `feature`, `maps`, `integration` |
| 6 | Image Upload & Storage System | `feature`, `storage` |
| 7 | Alert Status Management Workflow | `feature`, `workflow` |
| 8 | Admin Access Control & Management | `feature`, `admin`, `security` |
| 9 | Alert Details View | `feature`, `ui` |
| 10 | Search & Filter Functionality | `feature`, `admin`, `ui` |

---

## 🎯 After Issue Creation

### Create Project Board
```bash
# Web: https://github.com/hussen612/nextjs_gemeente/projects/new
# CLI:
gh project create --owner hussen612 --title "Gemeente Meldpunt Features"
```

### Add Issues to Project
1. Open your new project
2. Click "+ Add item"
3. Search for issue number or title
4. Add all 10 issues
5. Set due dates (suggested: 2025-12-31)

---

## ⚠️ Prerequisites

- GitHub account with access to `hussen612/nextjs_gemeente`
- Personal Access Token with `repo` scope
- For CLI method: GitHub CLI installed (`gh`)
- For Python method: Python 3.x + PyGithub

---

## 🔗 Quick Links

- **Repository**: https://github.com/hussen612/nextjs_gemeente
- **Full Docs**: [docs/README.md](README.md)
- **Summary**: [docs/SUMMARY.md](SUMMARY.md)
- **Create Token**: https://github.com/settings/tokens

---

## 💡 Tips

- Run `gh auth status` to check CLI authentication
- Test with one issue first before bulk creation
- Labels are case-sensitive
- Issues get sequential numbers when created
- Can edit issues after creation if needed

---

**Need Help?** See [docs/README.md](README.md) for detailed instructions.
