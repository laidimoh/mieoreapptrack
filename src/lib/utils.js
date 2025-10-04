import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"
import { format, parseISO, startOfWeek, endOfWeek, startOfMonth, endOfMonth, differenceInMinutes, addMinutes } from 'date-fns'

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Generate unique ID
 */
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

/**
 * Format currency value
 */
export function formatCurrency(amount, currency = 'USD', locale = 'en-US') {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

/**
 * Format hours with proper decimal places
 */
export function formatHours(hours, decimals = 2) {
  return Number(hours).toFixed(decimals)
}

/**
 * Convert minutes to hours
 */
export function minutesToHours(minutes) {
  return minutes / 60
}

/**
 * Convert hours to minutes
 */
export function hoursToMinutes(hours) {
  return hours * 60
}

/**
 * Format time duration (e.g., "2h 30m")
 */
export function formatDuration(minutes) {
  if (minutes < 60) {
    return `${minutes}m`
  }
  
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  
  if (remainingMinutes === 0) {
    return `${hours}h`
  }
  
  return `${hours}h ${remainingMinutes}m`
}

/**
 * Calculate time difference between start and end time
 */
export function calculateTimeDifference(startTime, endTime) {
  const now = new Date();
  const [startHours, startMinutes] = startTime.split(':').map(Number);
  const [endHours, endMinutes] = endTime.split(':').map(Number);

  let start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), startHours, startMinutes);
  let end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), endHours, endMinutes);

  // Handle overnight shifts
  if (end < start) {
    end = addMinutes(end, 24 * 60); // Add 24 hours in minutes
  }
  
  return differenceInMinutes(end, start);
}

/**
 * Calculate total working hours (excluding breaks)
 */
export function calculateWorkingHours(startTime, endTime, breakDuration = 0) {
  const totalMinutes = calculateTimeDifference(startTime, endTime)
  const workingMinutes = totalMinutes - breakDuration
  return Math.max(0, workingMinutes / 60)
}

/**
 * Calculate hours from start time, end time, and break duration (alias for calculateWorkingHours)
 */
export function calculateHours(startTime, endTime, breakDuration = 0) {
  return calculateWorkingHours(startTime, endTime, breakDuration)
}

/**
 * Calculate earnings based on hours and hourly rate
 */
export function calculateEarnings(hours, hourlyRate) {
  return hours * hourlyRate
}

/**
 * Format date for display
 */
export function formatDate(date, formatString = 'MMM dd, yyyy') {
  if (!date) return ''
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return format(dateObj, formatString)
  } catch (error) {
    console.error('Error formatting date:', error)
    return ''
  }
}

/**
 * Format time for display
 */
export function formatTime(time, format24h = false) {
  if (!time) return ''
  
  try {
    const [hours, minutes] = time.split(':')
    const date = new Date()
    date.setHours(parseInt(hours), parseInt(minutes))
    
    return format(date, format24h ? 'HH:mm' : 'h:mm a')
  } catch (error) {
    console.error('Error formatting time:', error)
    return time
  }
}

/**
 * Get date range for different periods
 */
export function getDateRange(period) {
  const now = new Date()
  
  switch (period) {
    case 'today':
      return {
        start: format(now, 'yyyy-MM-dd'),
        end: format(now, 'yyyy-MM-dd')
      }
    
    case 'week':
      return {
        start: format(startOfWeek(now), 'yyyy-MM-dd'),
        end: format(endOfWeek(now), 'yyyy-MM-dd')
      }
    
    case 'month':
      return {
        start: format(startOfMonth(now), 'yyyy-MM-dd'),
        end: format(endOfMonth(now), 'yyyy-MM-dd')
      }
    
    default:
      return {
        start: format(now, 'yyyy-MM-dd'),
        end: format(now, 'yyyy-MM-dd')
      }
  }
}

/**
 * Validate email format
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate password strength
 */
export function validatePassword(password) {
  const minLength = 8
  const hasUppercase = /[A-Z]/.test(password)
  const hasLowercase = /[a-z]/.test(password)
  const hasNumbers = /\d/.test(password)
  
  const errors = []
  
  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters long`)
  }
  
  if (!hasUppercase) {
    errors.push('Password must contain at least one uppercase letter')
  }
  
  if (!hasLowercase) {
    errors.push('Password must contain at least one lowercase letter')
  }
  
  if (!hasNumbers) {
    errors.push('Password must contain at least one number')
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    strength: calculatePasswordStrength(password)
  }
}

/**
 * Calculate password strength score
 */
function calculatePasswordStrength(password) {
  let score = 0
  
  if (password.length >= 8) score += 1
  if (password.length >= 12) score += 1
  if (/[A-Z]/.test(password)) score += 1
  if (/[a-z]/.test(password)) score += 1
  if (/\d/.test(password)) score += 1
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1
  
  if (score <= 2) return 'weak'
  if (score <= 4) return 'medium'
  return 'strong'
}

/**
 * Debounce function for search and input handling
 */
export function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Sort array of objects by key
 */
export function sortBy(array, key, direction = 'asc') {
  return [...array].sort((a, b) => {
    const aVal = a[key]
    const bVal = b[key]
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1
    if (aVal > bVal) return direction === 'asc' ? 1 : -1
    return 0
  })
}

/**
 * Filter array of objects by search term
 */
export function filterBySearch(array, searchTerm, searchKeys) {
  if (!searchTerm) return array
  
  const term = searchTerm.toLowerCase()
  
  return array.filter(item => 
    searchKeys.some(key => 
      String(item[key]).toLowerCase().includes(term)
    )
  )
}

/**
 * Group array of objects by key
 */
export function groupBy(array, key) {
  return array.reduce((groups, item) => {
    const group = item[key]
    if (!groups[group]) {
      groups[group] = []
    }
    groups[group].push(item)
    return groups
  }, {})
}

/**
 * Calculate percentage change
 */
export function calculatePercentageChange(current, previous) {
  if (previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
}

/**
 * Round number to specified decimal places
 */
export function roundTo(number, decimals = 2) {
  return Math.round(number * Math.pow(10, decimals)) / Math.pow(10, decimals)
}

/**
 * Check if date is today
 */
export function isToday(date) {
  const today = new Date()
  const checkDate = typeof date === 'string' ? new Date(date) : date
  
  return checkDate.toDateString() === today.toDateString()
}

/**
 * Check if date is in current week
 */
export function isThisWeek(date) {
  const now = new Date()
  const checkDate = typeof date === 'string' ? new Date(date) : date
  
  const weekStart = startOfWeek(now)
  const weekEnd = endOfWeek(now)
  
  return checkDate >= weekStart && checkDate <= weekEnd
}

/**
 * Check if date is in current month
 */
export function isThisMonth(date) {
  const now = new Date()
  const checkDate = typeof date === 'string' ? new Date(date) : date
  
  return checkDate.getMonth() === now.getMonth() && 
         checkDate.getFullYear() === now.getFullYear()
}

/**
 * Export data to CSV format
 */
export function exportToCSV(data, filename = 'export.csv') {
  if (!data.length) return
  
  const headers = Object.keys(data[0])
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header]
        // Escape commas and quotes in CSV
        return typeof value === 'string' && (value.includes(',') || value.includes('"'))
          ? `"${value.replace(/"/g, '""')}"`
          : value
      }).join(',')
    )
  ].join('\n')
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

/**
 * Local storage helpers with error handling
 */
export const storage = {
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      console.error(`Error reading from localStorage (${key}):`, error)
      return defaultValue
    }
  },
  
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch (error) {
      console.error(`Error writing to localStorage (${key}):`, error)
      return false
    }
  },
  
  remove: (key) => {
    try {
      localStorage.removeItem(key)
      return true
    } catch (error) {
      console.error(`Error removing from localStorage (${key}):`, error)
      return false
    }
  },
  
  clear: () => {
    try {
      localStorage.clear()
      return true
    } catch (error) {
      console.error('Error clearing localStorage:', error)
      return false
    }
  }
}
