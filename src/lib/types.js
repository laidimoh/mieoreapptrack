// Data types and interfaces for WorkTrack application

/**
 * User Profile Data Structure
 */
export const UserProfile = {
  id: '',
  email: '',
  firstName: '',
  lastName: '',
  company: '',
  hourlyRate: 0,
  currency: 'USD',
  timezone: 'UTC',
  dateFormat: 'MM/dd/yyyy',
  timeFormat: '12h',
  createdAt: '',
  updatedAt: ''
};

/**
 * Time Entry Data Structure
 */
export const TimeEntry = {
  id: '',
  userId: '',
  date: '',
  startTime: '',
  endTime: '',
  breakDuration: 0, // in minutes
  totalHours: 0,
  project: '',
  task: '',
  description: '',
  category: 'work', // work, meeting, break, other
  status: 'completed', // completed, in-progress, draft
  earnings: 0,
  createdAt: '',
  updatedAt: ''
};

/**
 * Project Data Structure
 */
export const Project = {
  id: '',
  userId: '',
  name: '',
  description: '',
  color: '#3B82F6',
  isActive: true,
  createdAt: '',
  updatedAt: ''
};

/**
 * Report Configuration
 */
export const ReportConfig = {
  id: '',
  userId: '',
  name: '',
  dateRange: {
    start: '',
    end: ''
  },
  filters: {
    projects: [],
    categories: [],
    status: []
  },
  format: 'pdf', // pdf, excel, csv
  includeDetails: true,
  includeSummary: true,
  includeCharts: true,
  emailSettings: {
    enabled: false,
    recipients: [],
    subject: '',
    message: ''
  }
};

/**
 * Dashboard Statistics
 */
export const DashboardStats = {
  today: {
    hours: 0,
    earnings: 0,
    entries: 0
  },
  week: {
    hours: 0,
    earnings: 0,
    entries: 0,
    target: 40
  },
  month: {
    hours: 0,
    earnings: 0,
    entries: 0,
    target: 160
  },
  productivity: {
    score: 0,
    trend: 'stable', // up, down, stable
    comparison: 0 // percentage change
  }
};

/**
 * Application Settings
 */
export const AppSettings = {
  theme: 'light', // light, dark, system
  notifications: {
    enabled: true,
    breakReminders: true,
    dailyGoals: true,
    weeklyReports: true
  },
  workSchedule: {
    hoursPerDay: 8,
    daysPerWeek: 5,
    startTime: '09:00',
    endTime: '17:00',
    breakDuration: 60
  },
  privacy: {
    shareAnalytics: false,
    autoBackup: true
  }
};

/**
 * Predefined Categories
 */
export const CATEGORIES = [
  { id: 'work', name: 'Work', color: '#3B82F6', icon: 'Briefcase' },
  { id: 'meeting', name: 'Meeting', color: '#10B981', icon: 'Users' },
  { id: 'break', name: 'Break', color: '#F59E0B', icon: 'Coffee' },
  { id: 'training', name: 'Training', color: '#8B5CF6', icon: 'BookOpen' },
  { id: 'admin', name: 'Administrative', color: '#EF4444', icon: 'FileText' },
  { id: 'other', name: 'Other', color: '#6B7280', icon: 'MoreHorizontal' }
];

/**
 * Currency Options
 */
export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' }
];

/**
 * Time Format Options
 */
export const TIME_FORMATS = [
  { value: '12h', label: '12-hour (AM/PM)' },
  { value: '24h', label: '24-hour' }
];

/**
 * Date Format Options
 */
export const DATE_FORMATS = [
  { value: 'MM/dd/yyyy', label: 'MM/DD/YYYY' },
  { value: 'dd/MM/yyyy', label: 'DD/MM/YYYY' },
  { value: 'yyyy-MM-dd', label: 'YYYY-MM-DD' },
  { value: 'MMM dd, yyyy', label: 'MMM DD, YYYY' }
];

/**
 * Report Templates
 */
export const REPORT_TEMPLATES = [
  {
    id: 'daily',
    name: 'Daily Report',
    description: 'Detailed breakdown of daily activities',
    defaultRange: 'today'
  },
  {
    id: 'weekly',
    name: 'Weekly Summary',
    description: 'Weekly hours and productivity overview',
    defaultRange: 'week'
  },
  {
    id: 'monthly',
    name: 'Monthly Report',
    description: 'Comprehensive monthly analysis',
    defaultRange: 'month'
  },
  {
    id: 'payroll',
    name: 'Payroll Report',
    description: 'Hours and earnings for payroll processing',
    defaultRange: 'month'
  },
  {
    id: 'project',
    name: 'Project Report',
    description: 'Time tracking by project',
    defaultRange: 'custom'
  }
];

/**
 * Validation Rules
 */
export const VALIDATION_RULES = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: false
  },
  hourlyRate: {
    min: 0,
    max: 1000
  },
  timeEntry: {
    maxHoursPerDay: 24,
    maxBreakDuration: 480 // 8 hours in minutes
  }
};

/**
 * API Endpoints (for future backend integration)
 */
export const API_ENDPOINTS = {
  auth: {
    login: '/api/auth/login',
    register: '/api/auth/register',
    logout: '/api/auth/logout',
    refresh: '/api/auth/refresh'
  },
  users: {
    profile: '/api/users/profile',
    settings: '/api/users/settings'
  },
  timeEntries: {
    list: '/api/time-entries',
    create: '/api/time-entries',
    update: '/api/time-entries/:id',
    delete: '/api/time-entries/:id'
  },
  projects: {
    list: '/api/projects',
    create: '/api/projects',
    update: '/api/projects/:id',
    delete: '/api/projects/:id'
  },
  reports: {
    generate: '/api/reports/generate',
    export: '/api/reports/export',
    email: '/api/reports/email'
  },
  analytics: {
    dashboard: '/api/analytics/dashboard',
    productivity: '/api/analytics/productivity',
    trends: '/api/analytics/trends'
  }
};

/**
 * Local Storage Keys
 */
export const STORAGE_KEYS = {
  user: 'worktrack_user',
  timeEntries: 'worktrack_time_entries',
  projects: 'worktrack_projects',
  settings: 'worktrack_settings',
  reports: 'worktrack_reports',
  authToken: 'worktrack_auth_token'
};

/**
 * Application Constants
 */
export const APP_CONSTANTS = {
  name: 'WorkTrack',
  version: '1.0.0',
  maxFileSize: 10 * 1024 * 1024, // 10MB
  supportedImageFormats: ['jpg', 'jpeg', 'png', 'gif'],
  supportedDocumentFormats: ['pdf', 'doc', 'docx', 'txt'],
  defaultPagination: {
    page: 1,
    limit: 20
  },
  chartColors: [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', 
    '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'
  ]
};

export default {
  UserProfile,
  TimeEntry,
  Project,
  ReportConfig,
  DashboardStats,
  AppSettings,
  CATEGORIES,
  CURRENCIES,
  TIME_FORMATS,
  DATE_FORMATS,
  REPORT_TEMPLATES,
  VALIDATION_RULES,
  API_ENDPOINTS,
  STORAGE_KEYS,
  APP_CONSTANTS
};
