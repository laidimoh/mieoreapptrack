# WorkTrack - Professional Time Tracking Application

A modern, feature-rich time tracking application built with React, Firebase, and professional PDF reporting capabilities.

![WorkTrack](https://img.shields.io/badge/React-18-blue) ![Firebase](https://img.shields.io/badge/Firebase-Latest-orange) ![Vite](https://img.shields.io/badge/Vite-6.3-purple)

## 🚀 Features

### ⏱️ Time Tracking
- **Live Timer** - Real-time work session tracking
- **Manual Entry** - Add time entries manually with start/end times
- **Bulk Entry** - Create multiple entries for a full month quickly
- **Calendar View** - Visual calendar interface for easy navigation

### 📊 Reporting & Analytics
- **Professional PDF Reports** - Clean, professional timesheet exports
- **CSV Export** - Data export for external analysis
- **Dashboard Charts** - Visual representation of work patterns
- **Monthly Overview** - Comprehensive monthly summaries

### 👤 User Management
- **Firebase Authentication** - Secure user registration and login
- **User Profiles** - Personal information and settings management
- **Company Information** - Professional branding in reports

### 🎨 Modern UI/UX
- **Responsive Design** - Works perfectly on all devices
- **Dark/Light Mode** - Adaptive theme support
- **Professional UI** - Built with shadcn/ui and Tailwind CSS
- **Intuitive Navigation** - Easy-to-use interface

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite 6.3
- **Styling**: Tailwind CSS, shadcn/ui
- **Backend**: Firebase (Firestore, Authentication)
- **PDF Generation**: jsPDF with autoTable
- **Date Management**: date-fns
- **Icons**: Lucide React
- **Charts**: Recharts

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or pnpm
- Firebase project

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/laidimoh/mieoreapptrack.git
   cd mieoreapptrack
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your Firebase configuration:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open browser**
   Navigate to `http://localhost:5173`

## 🔥 Firebase Setup

1. **Create Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Authentication and Firestore

2. **Configure Authentication**
   - Enable Email/Password authentication
   - Configure authorized domains

3. **Setup Firestore**
   - Create Firestore database
   - Configure security rules (see `FIRESTORE_RULES.md`)

## 📦 Build & Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Netlify
1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables in Netlify dashboard

### Deploy to Vercel
```bash
npm i -g vercel
vercel
```

## 📋 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── calendar/       # Calendar-related components
│   ├── dashboard/      # Dashboard charts and widgets
│   ├── layout/         # Layout components
│   ├── reports/        # Reporting components
│   ├── time-tracker/   # Time tracking components
│   └── ui/             # Base UI components (shadcn/ui)
├── contexts/           # React contexts
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries
├── pages/              # Page components
└── assets/             # Static assets
```

## 🎯 Key Features Walkthrough

### Time Entry
- Navigate to **Daily Input** page
- Use the live timer or manual entry
- Bulk create entries for entire months

### Reporting
- Go to **Calendar Reports** page
- Select date range
- Export as PDF or CSV with professional formatting

### Dashboard
- View work patterns and statistics
- Track productivity trends
- Monitor time allocation

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Mohammed Laidi**
- GitHub: [@laidimoh](https://github.com/laidimoh)

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [Firebase](https://firebase.google.com/) for backend services
- [Vite](https://vitejs.dev/) for the blazing fast build tool
- [React](https://reactjs.org/) for the amazing framework

---

⭐ Star this repository if you find it helpful!