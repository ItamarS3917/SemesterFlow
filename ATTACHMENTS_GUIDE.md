# 📎 SemesterFlow Attachment System

## ✅ What We Built

A **secure, validation-based attachment system** that allows you to link files from trusted cloud storage services without needing Firebase Cloud Storage.

### Features:
- ✅ **Security-First**: Only accepts links from trusted domains
- ✅ **URL Validation**: Blocks malicious URLs, shorteners, and suspicious patterns
- ✅ **Multiple Services Supported**: Dropbox, OneDrive, Box, iCloud, MEGA
- ✅ **Clean UI**: Easy to add, view, and manage attachments
- ✅ **HTTPS Only**: All links must use secure connections
- ✅ **No Storage Limits**: Uses your existing cloud storage

---

## 🔒 Security Features

### Trusted Domains Only
```
✅ Dropbox (dropbox.com, dl.dropboxusercontent.com)
✅ OneDrive (onedrive.live.com, 1drv.ms)
✅ SharePoint (sharepoint.com)
✅ Box (box.com, app.box.com)
✅ iCloud (icloud.com)
✅ MEGA (mega.nz, mega.io)
```

### Blocked Patterns
```
❌ URL shorteners (bit.ly, tinyurl, goo.gl)
❌ JavaScript/data URLs
❌ Executable files (.exe, .bat, .cmd, .vbs)
❌ Non-HTTPS links
❌ Script injection attempts
```

---

## 📚 How to Use

### 1. Creating an Assignment with Attachments

1. Click **"+ New Assignment"**
2. Fill in assignment details (name, course, due date, hours)
3. Scroll to **"Attachments"** section
4. Click **"Add Link"**
5. Paste your Dropbox/OneDrive link
6. (Optional) Give it a custom display name
7. Click **"Add Attachment"**
8. Add more links if needed (up to 10)
9. Click **"Create Assignment"**

### 2. Viewing Attachments

In the assignments table, you'll see a **blue badge** with a 📎 icon showing the number of attachments.

Click the badge to open the **Attachments Viewer** modal where you can:
- See all attached files
- View the full URL
- Click **"Open"** to access the file in a new tab

---

## 🔗 Getting Share Links

### Dropbox
1. Right-click the file → **"Share"** → **"Create link"**
2. Copy the link
3. Paste into SemesterFlow

### OneDrive
1. Right-click the file → **"Share"**
2. Click **"Copy link"**
3. Paste into SemesterFlow

---

## 🛡️ What Happens Behind the Scenes

When you add a link, the system:

1. **Validates the URL format** - Must be a valid HTTPS URL
2. **Checks the domain** - Must be from a trusted service
3. **Scans for suspicious patterns** - Blocks URL shorteners, scripts, etc.
4. **Extracts service name** - Shows "Dropbox", "OneDrive", etc.
5. **Stores safely** - Saved in Firestore with your assignment data

If validation fails, you'll see a **clear error message** explaining why.

---

## 📂 File Structure

```
SemesterFlow/
├── utils/
│   ├── AttachmentLinks.tsx       # Attachment management component
│   └── AssignmentsView.tsx       # Updated with attachment support
└── types.ts                      # AttachmentLink interface added
```

---

## 🎨 UI Components

### Attachment Input
- Secure input form with validation
- Shows trusted domains list
- Real-time error feedback
- Optional custom naming

### Attachment List
- Shows service icon (Dropbox logo, etc.)
- Displays file name and URL
- Quick "Open" and "Remove" actions
- Clean, retro design matching your app

### Attachments Viewer Modal
- Full-screen modal for viewing all attachments
- Click badge (📎 x) in assignments table
- One-click access to all files
- Shows service, name, and URL

---

## 💡 Tips & Best Practices

### ✅ DO:
- Use direct links from trusted services
- Organize files in Dropbox/OneDrive folders
- Give attachments descriptive names
- Check link sharing permissions

### ❌ DON'T:
- Use URL shorteners (bit.ly, tinyurl)
- Share links to malicious sites
- Use non-HTTPS links
- Exceed 10 attachments per assignment

---

## 🧪 Testing Checklist

- [ ] Add a Dropbox link
- [ ] Try an invalid URL (should show error)
- [ ] Try a bit.ly link (should be blocked)
- [ ] View attachments in the table
- [ ] Open an attachment in new tab
- [ ] Remove an attachment
- [ ] Create assignment with multiple attachments

---

## 🔄 Future Enhancements (Optional)

- Edit assignment attachments after creation
- Drag-and-drop reordering
- Attachment preview thumbnails
- Attachment categories (lecture notes, homework, resources)
- Bulk link import from text file

---

## 🐛 Troubleshooting

**"Domain not in trusted list"**
→ Make sure you're using Dropbox, OneDrive, or another supported service

**"Only HTTPS URLs allowed"**
→ Your link must start with `https://` not `http://`

**"URL contains suspicious patterns"**
→ Don't use URL shorteners like bit.ly - use direct links instead

**Can't see attachments in table**
→ Make sure you saved the assignment after adding attachments

---

## 📞 Support

If you run into issues:
1. Check the browser console for error messages
2. Verify your link is from a trusted service
3. Make sure the link starts with https://
4. Try copying the link again from the source

---

**Built with security and simplicity in mind! 🔒✨**
