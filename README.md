# Doctoral Dashboard - Your Research Cockpit

## 🎓 Overview
A secure, editable web-based dashboard designed specifically for doctoral research management. This application serves as your one-stop research cockpit for managing all aspects of your doctoral journey.

## ✨ Key Features

### 1. **Secure Authentication**
- Password-protected access
- Default password: `doctoral2026`
- Session management with auto-expiry

### 2. **Dashboard Home**
- Visual progress tracking for 6 research areas
- Next actions list
- Recent activity feed
- Quick statistics overview

### 3. **Research Sections** (All Editable)
- **Problem of Practice**: Define your core research problem
- **Literature Review Builder**: 
  - Create buckets and sub-buckets
  - Organize sources hierarchically
  - Switch between outline and narrative views
  - Synthesis notes for each bucket
- **Conceptual Framework**: Document theoretical foundations
- **Methods**: Research design and procedures
- **Data & Evidence**: 
  - Upload tracking
  - Qualitative coding (codes → excerpts → themes)
  - Evidence tagging
- **Stakeholders**: Identify and analyze key stakeholders
- **Writing Studio**:
  - Multiple chapter management
  - Word count targets and tracking
  - Rich-text editing
- **Timeline & Milestones**: Track research timeline
- **Tasks / Kanban Board**: Visual task management
- **Meetings & Notes**: Record important conversations

### 4. **Bibliography Section** (Read-Only)
- **Protected**: Your completed bibliography with Macro, Mega, and Micro lenses
- Clearly marked as read-only with lock icon
- Content preserved and unchanged
- Can be unlocked through data management if needed

### 5. **Export & Backup**
- Full backup export (JSON format)
- Individual section exports (text format)
- Easy data portability

## 🔧 Technical Stack
- **Framework**: Next.js 14 (Static Export)
- **Styling**: Tailwind CSS
- **Rich Text**: React Quill
- **Storage**: Browser LocalStorage (client-side)
- **Authentication**: Client-side session management

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation
```bash
cd doctoral-dashboard
npm install
```

### Development
```bash
npm run dev
# Open http://localhost:3000
```

### Production Build
```bash
npm run build
# Static files generated in /out directory
```

### Deployment
The application is a static site that can be deployed to:
- Any static hosting service (Netlify, Vercel, GitHub Pages)
- S3 + CloudFront
- Your own web server

Simply upload the contents of the `/out` directory after building.

## 🔐 Login Credentials
- **Password**: `doctoral2026`
- You can modify the password in `/lib/auth.js`

## 💾 Data Storage
- All data is stored in browser LocalStorage
- Data persists across sessions
- Use the Export feature regularly for backups
- To transfer data between browsers, use the export/import functionality

## 📱 Browser Compatibility
- Chrome/Edge (recommended)
- Firefox
- Safari
- Modern browsers with LocalStorage support

## 🎨 Features Highlights

### Auto-Save
All content editors include auto-save functionality (1-second delay after typing stops).

### Rich Text Editing
Full formatting support including:
- Headers (H1-H6)
- Bold, italic, underline, strikethrough
- Lists (ordered and unordered)
- Block quotes and code blocks
- Text colors and backgrounds
- Links

### Progress Tracking
Adjust progress sliders on the dashboard home to visualize your research journey.

### Search
Global search bar to find content across all sections (coming soon).

## 🔒 Security Notes
- Authentication is client-side only (suitable for single-user local use)
- For production deployment with multiple users, implement server-side authentication
- Consider adding SSL/TLS for production deployments
- Regular backups recommended

## 📝 Customization
To customize the dashboard:
1. Modify section components in `/components/sections/`
2. Update styling in `/app/globals.css` or Tailwind config
3. Adjust storage structure in `/lib/storage.js`
4. Change authentication logic in `/lib/auth.js`

## 🐛 Troubleshooting

### Data Not Saving
- Check browser LocalStorage is enabled
- Ensure you're not in private/incognito mode
- Check browser console for errors

### Login Issues
- Verify password is exactly `doctoral2026`
- Clear browser cache and try again
- Check browser console for authentication errors

### Bibliography Not Showing
- The Bibliography section is read-only by default
- Content can be updated through data management interface
- Check LocalStorage for `doctoral_dashboard_sections` key

## 📄 License
Private use for doctoral research purposes.

## 🤝 Support
For issues or questions, refer to the documentation or contact your administrator.

---

**Version**: 1.0.0  
**Last Updated**: January 2026  
**Built with**: Next.js, React, Tailwind CSS
