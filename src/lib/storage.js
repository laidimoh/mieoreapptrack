import { storage } from './utils.js'
import { STORAGE_KEYS } from './types.js'

/**
 * Storage service for WorkTrack application
 * Handles all localStorage operations with error handling and data validation
 */

class StorageService {
  constructor() {
    this.keys = STORAGE_KEYS
  }

  // User Management
  getUser() {
    return storage.get(this.keys.user)
  }

  setUser(user) {
    return storage.set(this.keys.user, user)
  }

  removeUser() {
    return storage.remove(this.keys.user)
  }

  // Time Entries Management
  getTimeEntries() {
    return storage.get(this.keys.timeEntries, [])
  }

  setTimeEntries(entries) {
    return storage.set(this.keys.timeEntries, entries)
  }

  addTimeEntry(entry) {
    const entries = this.getTimeEntries()
    entries.push(entry)
    return this.setTimeEntries(entries)
  }

  updateTimeEntry(id, updatedEntry) {
    const entries = this.getTimeEntries()
    const index = entries.findIndex(entry => entry.id === id)
    
    if (index !== -1) {
      entries[index] = { ...entries[index], ...updatedEntry, updatedAt: new Date().toISOString() }
      return this.setTimeEntries(entries)
    }
    
    return false
  }

  deleteTimeEntry(id) {
    const entries = this.getTimeEntries()
    const filteredEntries = entries.filter(entry => entry.id !== id)
    return this.setTimeEntries(filteredEntries)
  }

  getTimeEntriesForDate(date) {
    const entries = this.getTimeEntries()
    return entries.filter(entry => entry.date === date)
  }

  getTimeEntriesForDateRange(startDate, endDate) {
    const entries = this.getTimeEntries()
    return entries.filter(entry => {
      const entryDate = new Date(entry.date)
      const start = new Date(startDate)
      const end = new Date(endDate)
      return entryDate >= start && entryDate <= end
    })
  }

  // Projects Management
  getProjects() {
    return storage.get(this.keys.projects, [])
  }

  setProjects(projects) {
    return storage.set(this.keys.projects, projects)
  }

  addProject(project) {
    const projects = this.getProjects()
    projects.push(project)
    return this.setProjects(projects)
  }

  updateProject(id, updatedProject) {
    const projects = this.getProjects()
    const index = projects.findIndex(project => project.id === id)
    
    if (index !== -1) {
      projects[index] = { ...projects[index], ...updatedProject, updatedAt: new Date().toISOString() }
      return this.setProjects(projects)
    }
    
    return false
  }

  deleteProject(id) {
    const projects = this.getProjects()
    const filteredProjects = projects.filter(project => project.id !== id)
    return this.setProjects(filteredProjects)
  }

  getActiveProjects() {
    const projects = this.getProjects()
    return projects.filter(project => project.isActive)
  }

  // Settings Management
  getSettings() {
    return storage.get(this.keys.settings, {
      theme: 'light',
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
    })
  }

  setSettings(settings) {
    return storage.set(this.keys.settings, settings)
  }

  updateSettings(partialSettings) {
    const currentSettings = this.getSettings()
    const updatedSettings = { ...currentSettings, ...partialSettings }
    return this.setSettings(updatedSettings)
  }

  // Reports Management
  getReports() {
    return storage.get(this.keys.reports, [])
  }

  setReports(reports) {
    return storage.set(this.keys.reports, reports)
  }

  addReport(report) {
    const reports = this.getReports()
    reports.push(report)
    return this.setReports(reports)
  }

  deleteReport(id) {
    const reports = this.getReports()
    const filteredReports = reports.filter(report => report.id !== id)
    return this.setReports(filteredReports)
  }

  // Authentication Token Management
  getAuthToken() {
    return storage.get(this.keys.authToken)
  }

  setAuthToken(token) {
    return storage.set(this.keys.authToken, token)
  }

  removeAuthToken() {
    return storage.remove(this.keys.authToken)
  }

  // Data Export/Import
  exportAllData() {
    return {
      user: this.getUser(),
      timeEntries: this.getTimeEntries(),
      projects: this.getProjects(),
      settings: this.getSettings(),
      reports: this.getReports(),
      exportedAt: new Date().toISOString()
    }
  }

  importAllData(data) {
    try {
      if (data.user) this.setUser(data.user)
      if (data.timeEntries) this.setTimeEntries(data.timeEntries)
      if (data.projects) this.setProjects(data.projects)
      if (data.settings) this.setSettings(data.settings)
      if (data.reports) this.setReports(data.reports)
      return true
    } catch (error) {
      console.error('Error importing data:', error)
      return false
    }
  }

  // Data Validation
  validateTimeEntry(entry) {
    const required = ['id', 'date', 'startTime', 'endTime']
    return required.every(field => entry[field] !== undefined && entry[field] !== '')
  }

  validateProject(project) {
    const required = ['id', 'name']
    return required.every(field => project[field] !== undefined && project[field] !== '')
  }

  validateUser(user) {
    const required = ['id', 'email', 'firstName', 'lastName']
    return required.every(field => user[field] !== undefined && user[field] !== '')
  }

  // Data Cleanup
  clearAllData() {
    const keys = Object.values(this.keys)
    keys.forEach(key => storage.remove(key))
    return true
  }

  clearUserData() {
    this.removeUser()
    this.removeAuthToken()
    return true
  }

  // Statistics and Analytics
  getStatistics() {
    const entries = this.getTimeEntries()
    const user = this.getUser()
    
    if (!entries.length || !user) {
      return {
        totalEntries: 0,
        totalHours: 0,
        totalEarnings: 0,
        averageHoursPerDay: 0,
        mostProductiveDay: null,
        currentStreak: 0
      }
    }

    const totalHours = entries.reduce((sum, entry) => sum + (entry.totalHours || 0), 0)
    const totalEarnings = entries.reduce((sum, entry) => sum + (entry.earnings || 0), 0)
    
    // Group entries by date
    const entriesByDate = entries.reduce((groups, entry) => {
      if (!groups[entry.date]) {
        groups[entry.date] = []
      }
      groups[entry.date].push(entry)
      return groups
    }, {})

    const dailyHours = Object.entries(entriesByDate).map(([date, dayEntries]) => ({
      date,
      hours: dayEntries.reduce((sum, entry) => sum + (entry.totalHours || 0), 0)
    }))

    const averageHoursPerDay = dailyHours.length > 0 
      ? dailyHours.reduce((sum, day) => sum + day.hours, 0) / dailyHours.length 
      : 0

    const mostProductiveDay = dailyHours.length > 0
      ? dailyHours.reduce((max, day) => day.hours > max.hours ? day : max)
      : null

    return {
      totalEntries: entries.length,
      totalHours: Math.round(totalHours * 100) / 100,
      totalEarnings: Math.round(totalEarnings * 100) / 100,
      averageHoursPerDay: Math.round(averageHoursPerDay * 100) / 100,
      mostProductiveDay,
      workingDays: dailyHours.length,
      currentStreak: this.calculateCurrentStreak(dailyHours)
    }
  }

  calculateCurrentStreak(dailyHours) {
    if (!dailyHours.length) return 0

    // Sort by date descending
    const sortedDays = dailyHours
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .filter(day => day.hours > 0)

    let streak = 0
    const today = new Date()
    
    for (let i = 0; i < sortedDays.length; i++) {
      const dayDate = new Date(sortedDays[i].date)
      const expectedDate = new Date(today)
      expectedDate.setDate(today.getDate() - i)
      
      if (dayDate.toDateString() === expectedDate.toDateString()) {
        streak++
      } else {
        break
      }
    }

    return streak
  }

  // Backup and Restore
  createBackup() {
    const backup = {
      ...this.exportAllData(),
      version: '1.0.0',
      backupDate: new Date().toISOString()
    }
    
    const backupString = JSON.stringify(backup, null, 2)
    const blob = new Blob([backupString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `worktrack-backup-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    URL.revokeObjectURL(url)
    return true
  }

  restoreFromBackup(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        try {
          const backup = JSON.parse(e.target.result)
          
          if (this.validateBackup(backup)) {
            const success = this.importAllData(backup)
            resolve(success)
          } else {
            reject(new Error('Invalid backup file format'))
          }
        } catch (error) {
          reject(error)
        }
      }
      
      reader.onerror = () => reject(new Error('Failed to read backup file'))
      reader.readAsText(file)
    })
  }

  validateBackup(backup) {
    return backup && 
           typeof backup === 'object' && 
           backup.version && 
           backup.backupDate &&
           (backup.user || backup.timeEntries || backup.projects)
  }
}

// Create and export singleton instance
const storageService = new StorageService()
export default storageService

// Export individual methods for convenience
export const {
  getUser,
  setUser,
  removeUser,
  getTimeEntries,
  setTimeEntries,
  addTimeEntry,
  updateTimeEntry,
  deleteTimeEntry,
  getTimeEntriesForDate,
  getTimeEntriesForDateRange,
  getProjects,
  setProjects,
  addProject,
  updateProject,
  deleteProject,
  getActiveProjects,
  getSettings,
  setSettings,
  updateSettings,
  getReports,
  setReports,
  addReport,
  deleteReport,
  getAuthToken,
  setAuthToken,
  removeAuthToken,
  exportAllData,
  importAllData,
  clearAllData,
  clearUserData,
  getStatistics,
  createBackup,
  restoreFromBackup
} = storageService
