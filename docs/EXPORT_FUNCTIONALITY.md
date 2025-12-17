# Export Data Functionality

## Overview
The export data functionality allows users to download their study data in CSV or JSON formats for backup, external analysis, or portfolio building purposes.

## Features

### 1. Export Courses (CSV)
**Location**: Settings > Export Your Data > Export Courses

**Fields Exported**:
- `id`: Unique course identifier
- `name`: Course name
- `color`: Color theme for the course
- `totalHoursTarget`: Target study hours
- `hoursCompleted`: Actual hours completed
- `totalAssignments`: Total number of assignments
- `completedAssignments`: Number of completed assignments
- `nextExamDate`: Upcoming exam date (ISO format)
- `knowledge`: Course notes and knowledge base content
- `weakConcepts`: List of weak concepts (semicolon-separated)

**Filename**: `semesterflow-courses.csv`

### 2. Export Assignments (CSV)
**Location**: Settings > Export Your Data > Export Assignments

**Fields Exported**:
- `id`: Unique assignment identifier
- `courseId`: Associated course ID
- `name`: Assignment name
- `dueDate`: Due date (ISO format)
- `estimatedHours`: Estimated time to complete
- `status`: Current status (NOT_STARTED, IN_PROGRESS, COMPLETED)
- `notes`: Assignment notes
- `attachments`: Linked attachments (semicolon-separated with URLs)
- `createdAt`: Creation timestamp (ISO format)
- `startedAt`: When work began (ISO format)

**Filename**: `semesterflow-assignments.csv`

### 3. Export Study Sessions (CSV)
**Location**: 
- Settings > Export Your Data > Export Study Sessions
- Analytics > Export CSV button (top right)

**Fields Exported**:
- `id`: Unique session identifier
- `courseId`: Associated course ID
- `courseName`: Course name (resolved from courseId)
- `date`: Session date (YYYY-MM-DD)
- `startTime`: Session start time (ISO format)
- `durationSeconds`: Duration in seconds
- `durationMinutes`: Duration in minutes (calculated)
- `durationHours`: Duration in hours (calculated, 2 decimals)
- `topic`: Study topic
- `difficulty`: Difficulty rating (1-5)
- `notes`: Session notes

**Filename**: `semesterflow-sessions.csv`

### 4. Complete Backup (JSON)
**Location**: Settings > Export Your Data > Complete Backup

**Structure**:
```json
{
  "exportDate": "2025-12-17T21:30:00.000Z",
  "version": "1.0",
  "courses": [...],
  "assignments": [...],
  "sessions": [...],
  "metadata": {
    "totalCourses": 4,
    "totalAssignments": 12,
    "totalSessions": 58,
    "totalStudyHours": "125.50"
  }
}
```

**Filename**: `semesterflow-backup-YYYY-MM-DD.json`

## Technical Implementation

### Dependencies
- **papaparse**: CSV parsing and generation library (already included)

### Files Created/Modified
1. **`utils/exportData.ts`** (NEW)
   - `exportCoursesToCSV()`: Export courses to CSV
   - `exportAssignmentsToCSV()`: Export assignments to CSV
   - `exportSessionsToCSV()`: Export study sessions to CSV
   - `exportAllDataAsJSON()`: Export complete backup as JSON
   - `downloadCSV()`: Helper for CSV downloads

2. **`components/SettingsView.tsx`** (MODIFIED)
   - Added import for export utilities
   - Added useAssignments and useSessions hooks
   - Added 4 export handler functions
   - Added "Export Your Data" section with 4 export buttons

3. **`components/Analytics.tsx`** (MODIFIED)
   - Added import for export utilities
   - Added useToast hook
   - Added handleExportSessions function
   - Added "Export CSV" button in the header

### Usage Example

```typescript
import { 
  exportCoursesToCSV, 
  exportAssignmentsToCSV, 
  exportSessionsToCSV, 
  exportAllDataAsJSON 
} from '../utils/exportData';

// Export courses
exportCoursesToCSV(courses);

// Export assignments
exportAssignmentsToCSV(assignments);

// Export sessions
exportSessionsToCSV(sessions, courses);

// Export complete backup
exportAllDataAsJSON(courses, assignments, sessions);
```

## User Experience

### Settings View
- **Section**: "Export Your Data" with Database icon
- **Layout**: 2x2 grid of export buttons
- **Styling**: Neo-brutalist design with colored shadows on hover
- **Buttons**:
  1. Export Courses (Emerald theme)
  2. Export Assignments (Blue theme)
  3. Export Study Sessions (Purple theme)
  4. Complete Backup (Indigo gradient)
- **Disabled State**: Buttons are disabled when no data exists
- **Feedback**: Shows count of items to be exported
- **Tip Box**: Explains use cases for CSV vs JSON exports

### Analytics View
- **Location**: Top right of the page
- **Button**: "Export CSV" with Download icon
- **Functionality**: Exports all study sessions
- **Feedback**: Toast notification on success/error

## Error Handling
- Try-catch blocks around all export operations
- Toast notifications for success/error states
- Console logging for debugging
- Graceful handling of empty data sets

## Browser Compatibility
- Uses standard Blob API (supported in all modern browsers)
- Uses URL.createObjectURL() for download links
- Properly cleans up object URLs after download
- Works in Chrome, Firefox, Safari, Edge

## Future Enhancements
- [ ] Add date range filters for exports
- [ ] Support for importing data from CSV/JSON
- [ ] Export to PDF format
- [ ] Export to Excel format (.xlsx)
- [ ] Schedule automatic backups
- [ ] Cloud backup integration
- [ ] Email export functionality
- [ ] Export specific date ranges
- [ ] Custom field selection for exports
- [ ] Compression for large exports

## Testing
To test the export functionality:
1. Navigate to Settings
2. Scroll to "Export Your Data" section
3. Click any export button (requires data in the system)
4. Verify the downloaded file contains correct data
5. Open CSV files in Excel/Google Sheets
6. Open JSON backup in a text editor or JSON viewer

## Related Files
- `types.ts`: Type definitions for Course, Assignment, StudySession
- `hooks/useCourses.ts`: Course data management
- `hooks/useAssignments.ts`: Assignment data management
- `hooks/useSessions.ts`: Study session data management
- `contexts/ToastContext.tsx`: Toast notification system
