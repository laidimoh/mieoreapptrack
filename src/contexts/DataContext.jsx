import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { calculateWorkingHours, calculateEarnings } from '../lib/utils.js'
import firebaseService from '../lib/firebaseService.js'
import { useAuth } from './AuthContext.jsx'

// Initial state
const initialState = {
  timeEntries: [],
  projects: [],
  isLoading: false,
  error: null,
  statistics: {
    today: { hours: 0, earnings: 0, entries: 0 },
    week: { hours: 0, earnings: 0, entries: 0, target: 40 },
    month: { hours: 0, earnings: 0, entries: 0, target: 160 },
    productivity: { score: 0, trend: 'stable', comparison: 0 }
  }
}

// Action types
const DATA_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_TIME_ENTRIES: 'SET_TIME_ENTRIES',
  SET_PROJECTS: 'SET_PROJECTS',
  SET_STATISTICS: 'SET_STATISTICS',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR'
}

// Reducer
function dataReducer(state, action) {
  switch (action.type) {
    case DATA_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      }
    
    case DATA_ACTIONS.SET_TIME_ENTRIES:
      return {
        ...state,
        timeEntries: action.payload,
        isLoading: false,
        error: null
      }

    case DATA_ACTIONS.SET_PROJECTS:
      return {
        ...state,
        projects: action.payload,
        error: null
      }
    
    case DATA_ACTIONS.SET_STATISTICS:
      return {
        ...state,
        statistics: action.payload
      }
    
    case DATA_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false
      }
    
    case DATA_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      }
    
    default:
      return state
  }
}

// Create context
const DataContext = createContext()

// Custom hook to use data context
export const useData = () => {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}

// Data provider component
export const DataProvider = ({ children }) => {
  const [state, dispatch] = useReducer(dataReducer, initialState)
  const { user, isAuthenticated } = useAuth()

  // Set up real-time subscriptions when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('Setting up Firebase subscriptions for user:', user.uid)
      
      // Subscribe to real-time updates
      const unsubscribeTimeEntries = firebaseService.subscribeToTimeEntries((result) => {
        console.log('Time entries update:', result)
        if (result.success) {
          dispatch({ type: DATA_ACTIONS.SET_TIME_ENTRIES, payload: result.data })
        } else {
          console.error('Time entries error:', result.error)
          dispatch({ type: DATA_ACTIONS.SET_ERROR, payload: result.error })
        }
      })

      const unsubscribeProjects = firebaseService.subscribeToProjects((result) => {
        console.log('Projects update:', result)
        if (result.success) {
          dispatch({ type: DATA_ACTIONS.SET_PROJECTS, payload: result.data })
        } else {
          console.error('Projects error:', result.error)
          dispatch({ type: DATA_ACTIONS.SET_ERROR, payload: result.error })
        }
      })

      return () => {
        console.log('Cleaning up Firebase subscriptions')
        unsubscribeTimeEntries()
        unsubscribeProjects()
      }
    } else {
      console.log('User not authenticated, clearing data')
      // Clear data when user is not authenticated
      dispatch({ type: DATA_ACTIONS.SET_TIME_ENTRIES, payload: [] })
      dispatch({ type: DATA_ACTIONS.SET_PROJECTS, payload: [] })
    }
  }, [isAuthenticated, user])

  // Recalculate statistics when time entries change
  useEffect(() => {
    if (user && state.timeEntries.length >= 0) {
      calculateStatistics()
    }
  }, [state.timeEntries, user])

  // Calculate statistics
  const calculateStatistics = () => {
    if (!user) {
      dispatch({ type: DATA_ACTIONS.SET_STATISTICS, payload: initialState.statistics })
      return
    }

    const entries = state.timeEntries || []
    const hourlyRate = user.hourlyRate || 25

    const now = new Date()
    const todayFormatted = now.toISOString().split('T')[0]
    
    // Start of week (Monday)
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay() + 1)
    const startOfWeekFormatted = startOfWeek.toISOString().split('T')[0]
    
    // End of week (Sunday)
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    const endOfWeekFormatted = endOfWeek.toISOString().split('T')[0]
    
    // Start of month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfMonthFormatted = startOfMonth.toISOString().split('T')[0]
    
    // End of month
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    const endOfMonthFormatted = endOfMonth.toISOString().split('T')[0]

    // Helper to filter and sum for a given period
    const getPeriodStats = (filterFn) => {
      const filteredEntries = entries.filter(filterFn)
      const hours = filteredEntries.reduce((sum, entry) => sum + (entry.totalHours || 0), 0)
      const earnings = hours * hourlyRate
      return { hours, earnings, entries: filteredEntries.length }
    }

    // Today's statistics
    const todayStats = getPeriodStats(entry => entry.date === todayFormatted)

    // This week's statistics
    const weekStats = getPeriodStats(entry => {
      return entry.date >= startOfWeekFormatted && entry.date <= endOfWeekFormatted
    })

    // This month's statistics
    const monthStats = getPeriodStats(entry => {
      return entry.date >= startOfMonthFormatted && entry.date <= endOfMonthFormatted
    })

    // Productivity calculation (simplified)
    const daysInMonth = now.getDate()
    const averageHoursPerDay = daysInMonth > 0 ? monthStats.hours / daysInMonth : 0
    const productivityScore = Math.min(100, (averageHoursPerDay / 8) * 100)
    
    // Trend calculation (comparing to previous period)
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)
    const previousMonthStartFormatted = previousMonthStart.toISOString().split('T')[0]
    const previousMonthEndFormatted = previousMonthEnd.toISOString().split('T')[0]

    const previousMonthStats = getPeriodStats(entry => {
      return entry.date >= previousMonthStartFormatted && entry.date <= previousMonthEndFormatted
    })
    
    const comparison = previousMonthStats.hours > 0 ? ((monthStats.hours - previousMonthStats.hours) / previousMonthStats.hours) * 100 : 0
    
    let trend = 'stable'
    if (comparison > 5) trend = 'up'
    else if (comparison < -5) trend = 'down'

    const statistics = {
      today: {
        hours: Math.round(todayStats.hours * 100) / 100,
        earnings: Math.round(todayStats.earnings * 100) / 100,
        entries: todayStats.entries
      },
      week: {
        hours: Math.round(weekStats.hours * 100) / 100,
        earnings: Math.round(weekStats.earnings * 100) / 100,
        entries: weekStats.entries,
        target: 40
      },
      month: {
        hours: Math.round(monthStats.hours * 100) / 100,
        earnings: Math.round(monthStats.earnings * 100) / 100,
        entries: monthStats.entries,
        target: 160
      },
      productivity: {
        score: Math.round(productivityScore),
        trend,
        comparison: Math.round(comparison * 100) / 100
      }
    }

    dispatch({ type: DATA_ACTIONS.SET_STATISTICS, payload: statistics })
  }

  // Time Entry Management
  const addTimeEntry = async (entryData) => {
    try {
      dispatch({ type: DATA_ACTIONS.CLEAR_ERROR })

      // Validate required fields
      if (!entryData.date || !entryData.startTime || !entryData.endTime) {
        throw new Error('Date, start time, and end time are required')
      }

      // Calculate total hours and earnings
      const totalHours = calculateWorkingHours(
        entryData.startTime,
        entryData.endTime,
        entryData.breakDuration || 0
      )

      const earnings = calculateEarnings(totalHours, user?.hourlyRate || 25)

      const newEntry = {
        ...entryData,
        totalHours: Math.round(totalHours * 100) / 100,
        earnings: Math.round(earnings * 100) / 100,
        status: entryData.status || 'completed'
      }

      const result = await firebaseService.addTimeEntry(newEntry)
      return result
    } catch (error) {
      dispatch({ type: DATA_ACTIONS.SET_ERROR, payload: error.message })
      return { success: false, error: error.message }
    }
  }

  const updateTimeEntry = async (entryId, updates) => {
    try {
      dispatch({ type: DATA_ACTIONS.CLEAR_ERROR })

      // Recalculate if time-related fields are updated
      if (updates.startTime || updates.endTime || updates.breakDuration !== undefined) {
        const existingEntry = state.timeEntries.find(entry => entry.id === entryId)
        if (existingEntry) {
          const updatedEntry = { ...existingEntry, ...updates }
          const totalHours = calculateWorkingHours(
            updatedEntry.startTime,
            updatedEntry.endTime,
            updatedEntry.breakDuration || 0
          )
          const earnings = calculateEarnings(totalHours, user?.hourlyRate || 25)

          updates.totalHours = Math.round(totalHours * 100) / 100
          updates.earnings = Math.round(earnings * 100) / 100
        }
      }

      const result = await firebaseService.updateTimeEntry(entryId, updates)
      return result
    } catch (error) {
      dispatch({ type: DATA_ACTIONS.SET_ERROR, payload: error.message })
      return { success: false, error: error.message }
    }
  }

  const deleteTimeEntry = async (entryId) => {
    const sessionId = Date.now();
    console.log(`[DATA CONTEXT DELETE ${sessionId}] Starting deletion of entry:`, entryId);
    
    try {
      dispatch({ type: DATA_ACTIONS.CLEAR_ERROR });
      
      if (!entryId) {
        throw new Error('Entry ID is required');
      }
      
      console.log(`[DATA CONTEXT DELETE ${sessionId}] Calling Firebase service...`);
      const result = await firebaseService.deleteTimeEntry(entryId);
      console.log(`[DATA CONTEXT DELETE ${sessionId}] Firebase result:`, result);
      
      if (!result.success) {
        console.error(`[DATA CONTEXT DELETE ${sessionId}] Firebase deletion failed:`, result.error);
        dispatch({ type: DATA_ACTIONS.SET_ERROR, payload: result.error });
      }
      
      return result;
    } catch (error) {
      console.error(`[DATA CONTEXT DELETE ${sessionId}] Exception in deleteTimeEntry:`, error);
      dispatch({ type: DATA_ACTIONS.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    }
  }

  // Project Management
  const addProject = async (projectData) => {
    try {
      dispatch({ type: DATA_ACTIONS.CLEAR_ERROR })

      if (!projectData.name) {
        throw new Error('Project name is required')
      }

      const newProject = {
        ...projectData,
        isActive: projectData.isActive !== undefined ? projectData.isActive : true
      }

      const result = await firebaseService.addProject(newProject)
      return result
    } catch (error) {
      dispatch({ type: DATA_ACTIONS.SET_ERROR, payload: error.message })
      return { success: false, error: error.message }
    }
  }

  const updateProject = async (projectId, updates) => {
    try {
      dispatch({ type: DATA_ACTIONS.CLEAR_ERROR })
      const result = await firebaseService.updateProject(projectId, updates)
      return result
    } catch (error) {
      dispatch({ type: DATA_ACTIONS.SET_ERROR, payload: error.message })
      return { success: false, error: error.message }
    }
  }

  const deleteProject = async (projectId) => {
    try {
      dispatch({ type: DATA_ACTIONS.CLEAR_ERROR })
      const result = await firebaseService.deleteProject(projectId)
      return result
    } catch (error) {
      dispatch({ type: DATA_ACTIONS.SET_ERROR, payload: error.message })
      return { success: false, error: error.message }
    }
  }

  // Data Queries
  const getTimeEntriesForDate = (date) => {
    return state.timeEntries.filter(entry => entry.date === date)
  }

  const getTimeEntriesForDateRange = (startDate, endDate) => {
    return state.timeEntries.filter(entry => {
      return entry.date >= startDate && entry.date <= endDate
    })
  }

  const getActiveProjects = () => {
    return state.projects.filter(project => project.isActive)
  }

  // Clear error
  const clearError = () => {
    dispatch({ type: DATA_ACTIONS.CLEAR_ERROR })
  }

  // Context value
  const value = {
    // State
    timeEntries: state.timeEntries,
    projects: state.projects,
    statistics: state.statistics,
    isLoading: state.isLoading,
    error: state.error,

    // Time Entry Actions
    addTimeEntry,
    updateTimeEntry,
    deleteTimeEntry,

    // Project Actions
    addProject,
    updateProject,
    deleteProject,

    // Queries
    getTimeEntriesForDate,
    getTimeEntriesForDateRange,
    getActiveProjects,

    // Utilities
    clearError
  }

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  )
}

export default DataContext
