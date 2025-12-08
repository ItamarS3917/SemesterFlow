# 📸 How to Add Screenshots to SemesterFlow

This guide will help you capture and add screenshots to showcase your app.

---

## 🎯 What Screenshots to Take

### 1. **Dashboard View** (Priority: High)
- Show the main dashboard with:
  - Course cards with progress
  - Streak counter
  - Weekly progress bar
  - Upcoming assignments list

### 2. **Study Timer** (Priority: High)
- Capture the timer in action:
  - Timer running
  - Course selected
  - Topic entered
  - AI chat panel visible (optional)

### 3. **Analytics Dashboard** (Priority: Medium)
- Display the analytics page:
  - Study time charts
  - Course breakdown pie chart
  - Weekly trends graph
  - Difficulty analysis

### 4. **AI Study Partner** (Priority: High)
- Show the AI chat in action:
  - Conversation with the AI
  - Context-aware responses
  - Clean chat interface

### 5. **Assignment Manager** (Priority: Medium)
- Assignments view with:
  - Multiple assignments
  - Different statuses (To Do, In Progress, Completed)
  - Due dates visible

### 6. **Planner/Calendar** (Priority: Medium)
- Calendar view showing:
  - Multiple assignments
  - Color-coded by course
  - Current day highlighted

### 7. **Procrastination Widget** (Priority: Low)
- Capture when procrastination is detected
- Show the micro-sprint suggestion

### 8. **Dark Mode** (Priority: Medium)
- Take at least one screenshot in dark mode
- Preferably the dashboard

---

## 🛠️ How to Take Screenshots

### **macOS**
- **Full Screen**: `Cmd + Shift + 3`
- **Selection**: `Cmd + Shift + 4` (drag to select area)
- **Window**: `Cmd + Shift + 4`, then press `Space`, click window

### **Windows**
- **Full Screen**: `Win + PrtScn`
- **Snipping Tool**: `Win + Shift + S`
- **Window**: `Alt + PrtScn`

### **Linux**
- **Full Screen**: `PrtScn`
- **Selection**: `Shift + PrtScn`
- Use `gnome-screenshot` or `flameshot` for more options

---

## 📁 Where to Save Screenshots

Save all screenshots in: `docs/images/`

### Naming Convention
Use descriptive names with lowercase and hyphens:

```text
docs/images/
├── dashboard-light.png
├── dashboard-dark.png
├── study-timer.png
├── analytics-overview.png
├── ai-chat-demo.png
├── assignments-view.png
├── planner-calendar.png
├── procrastination-widget.png
└── settings-page.png
```

---

## 🖼️ Image Specifications

### **Recommended Settings**
- **Format**: PNG (better quality) or JPG (smaller file size)
- **Resolution**: 1920x1080 or higher
- **File Size**: Keep under 500KB per image (compress if needed)
- **Aspect Ratio**: 16:9 preferred

### **Compression Tools**
- **Online**: [TinyPNG](https://tinypng.com/) or [Squoosh](https://squoosh.app/)
- **macOS**: ImageOptim
- **Command Line**:
  ```bash
  # Install imagemagick
  brew install imagemagick

  # Compress image
  convert input.png -quality 85 -resize 1920x1080 output.png
  ```

---

## ✏️ How to Add Screenshots to README

Once you have the screenshots, replace the placeholder sections in `README.md`:

### Before:
```markdown
### Dashboard View
```
[Screenshot Placeholder: Dashboard showing courses, stats, and upcoming assignments]
```
```

### After:
```markdown
### Dashboard View
![Dashboard](docs/images/dashboard-light.png)
```

### Example with Multiple Images:

```markdown
## 🎮 Demo

### Dashboard View
<div align="center">
  <img src="docs/images/dashboard-light.png" alt="Dashboard Light Mode" width="45%">
  <img src="docs/images/dashboard-dark.png" alt="Dashboard Dark Mode" width="45%">
</div>

### Study Timer in Action
![Study Timer](docs/images/study-timer.png)

### Analytics Dashboard
![Analytics](docs/images/analytics-overview.png)

### AI Study Partner
![AI Chat](docs/images/ai-chat-demo.png)
```

---

## 🎨 Making Screenshots Look Professional

### Tips for Great Screenshots

1. **Clean Data**: Use realistic but clean sample data
2. **Full Screen**: Maximize the browser window
3. **Hide Personal Info**: Don't show real emails or sensitive data
4. **Good Lighting**: Use light mode for better visibility (or show both)
5. **Zoom Level**: 100% zoom (Cmd/Ctrl + 0)
6. **No Clutter**: Close unnecessary browser tabs/extensions

### Browser Dev Tools Trick

To take pixel-perfect screenshots at specific dimensions:

1. Open DevTools (`F12`)
2. Click the device toolbar icon (mobile view)
3. Set custom dimensions (e.g., 1920x1080)
4. Take screenshot: `Cmd/Ctrl + Shift + P` → "Capture screenshot"

---

## 🚀 Quick Start Commands

### Take Screenshots (macOS)
```bash
# Run the app
npm run dev

# Take screenshots using Cmd + Shift + 4
# Save them directly to docs/images/
```

### Process Images (Optional)
```bash
# Navigate to images folder
cd docs/images

# Compress all PNGs
for file in *.png; do
  convert "$file" -quality 85 "compressed-$file"
done
```

---

## 📋 Screenshot Checklist

Use this checklist to track your progress:

- [ ] Dashboard (Light Mode)
- [ ] Dashboard (Dark Mode)
- [ ] Study Timer (Active session)
- [ ] Analytics Overview
- [ ] AI Study Partner Chat
- [ ] Assignments View
- [ ] Planner/Calendar
- [ ] Procrastination Widget
- [ ] Settings Page
- [ ] Login Page

---

## 🎬 Bonus: Create a GIF

To create an animated GIF showing app usage:

### **macOS - Using Kap**
```bash
brew install --cask kap
```
Open Kap, select area, record, export as GIF.

### **Windows - Using ScreenToGif**
Download from [screentogif.com](https://www.screentogif.com/)

### **Online - Using EZGIF**
1. Record video
2. Upload to [ezgif.com](https://ezgif.com/video-to-gif)
3. Convert to GIF

### Add GIF to README:
```markdown
## ✨ See It in Action

![SemesterFlow Demo](docs/images/demo.gif)
```

---

## 🤝 Need Help?

If you have questions about taking screenshots or adding them to the README:

1. Check this guide again
2. Open an issue on GitHub
3. Ask in discussions

---

**Happy Screenshot-ing! 📸**
