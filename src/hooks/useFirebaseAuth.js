import { useState, useEffect } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth'
import { auth } from '../lib/firebase.js'
import firebaseService from '../lib/firebaseService.js'

export const useFirebaseAuth = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          console.log('Firebase user authenticated:', firebaseUser.email)
          
          // User is signed in
          const userData = {
            uid: firebaseUser.uid,
            id: firebaseUser.uid, // Add id for compatibility
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            emailVerified: firebaseUser.emailVerified
          }
          
          setUser(userData)
          firebaseService.setCurrentUser(userData)
          
          // Get additional user profile data from Firestore
          console.log('Fetching user profile from Firestore...')
          const profileResult = await firebaseService.getUserProfile()
          if (profileResult.success) {
            console.log('User profile loaded:', profileResult.data)
            setUser(prev => ({ ...prev, ...profileResult.data }))
          } else {
            console.warn('Failed to load user profile:', profileResult.error)
            // Set default values if profile doesn't exist
            const defaultProfile = {
              firstName: firebaseUser.displayName?.split(' ')[0] || 'User',
              lastName: firebaseUser.displayName?.split(' ').slice(1).join(' ') || '',
              hourlyRate: 25,
              currency: 'USD'
            }
            setUser(prev => ({ ...prev, ...defaultProfile }))
          }
        } else {
          console.log('No Firebase user authenticated')
          // User is signed out
          setUser(null)
          firebaseService.setCurrentUser(null)
        }
      } catch (error) {
        console.error('Error in auth state change:', error)
        setError(error.message)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  // Register new user
  const register = async (userData) => {
    try {
      setLoading(true)
      setError(null)

      const { email, password, firstName, lastName, company, hourlyRate } = userData

      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const firebaseUser = userCredential.user

      // Update display name
      await updateProfile(firebaseUser, {
        displayName: `${firstName} ${lastName}`
      })

      // Save additional profile data to Firestore
      const profileData = {
        email,
        firstName,
        lastName,
        company: company || '',
        hourlyRate: parseFloat(hourlyRate) || 25,
        currency: 'USD',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        dateFormat: 'MM/dd/yyyy',
        timeFormat: '12h'
      }

      await firebaseService.saveUserProfile(profileData)

      return { success: true, user: firebaseUser }
    } catch (error) {
      console.error('Registration error:', error)
      setError(getErrorMessage(error))
      return { success: false, error: getErrorMessage(error) }
    } finally {
      setLoading(false)
    }
  }

  // Sign in user
  const login = async (email, password) => {
    try {
      setLoading(true)
      setError(null)

      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      return { success: true, user: userCredential.user }
    } catch (error) {
      console.error('Login error:', error)
      setError(getErrorMessage(error))
      return { success: false, error: getErrorMessage(error) }
    } finally {
      setLoading(false)
    }
  }

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      setLoading(true)
      setError(null)

      const provider = new GoogleAuthProvider()
      const userCredential = await signInWithPopup(auth, provider)
      const firebaseUser = userCredential.user

      // Check if this is a new user and save profile data
      const profileResult = await firebaseService.getUserProfile()
      if (!profileResult.success) {
        // New user - save basic profile data
        const profileData = {
          email: firebaseUser.email,
          firstName: firebaseUser.displayName?.split(' ')[0] || '',
          lastName: firebaseUser.displayName?.split(' ').slice(1).join(' ') || '',
          company: '',
          hourlyRate: 25,
          currency: 'USD',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          dateFormat: 'MM/dd/yyyy',
          timeFormat: '12h'
        }

        await firebaseService.saveUserProfile(profileData)
      }

      return { success: true, user: firebaseUser }
    } catch (error) {
      console.error('Google sign-in error:', error)
      setError(getErrorMessage(error))
      return { success: false, error: getErrorMessage(error) }
    } finally {
      setLoading(false)
    }
  }

  // Sign out user
  const logout = async () => {
    try {
      setLoading(true)
      await signOut(auth)
      return { success: true }
    } catch (error) {
      console.error('Logout error:', error)
      setError(getErrorMessage(error))
      return { success: false, error: getErrorMessage(error) }
    } finally {
      setLoading(false)
    }
  }

  // Update user profile
  const updateUserProfile = async (updates) => {
    try {
      setLoading(true)
      setError(null)

      // Update Firebase Auth profile if needed
      if (updates.firstName || updates.lastName) {
        await updateProfile(auth.currentUser, {
          displayName: `${updates.firstName || user.firstName} ${updates.lastName || user.lastName}`
        })
      }

      // Update Firestore profile
      const result = await firebaseService.saveUserProfile(updates)
      
      if (result.success) {
        setUser(prev => ({ ...prev, ...updates }))
        return { success: true }
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Profile update error:', error)
      setError(getErrorMessage(error))
      return { success: false, error: getErrorMessage(error) }
    } finally {
      setLoading(false)
    }
  }

  // Send password reset email
  const resetPassword = async (email) => {
    try {
      setLoading(true)
      setError(null)

      await sendPasswordResetEmail(auth, email)
      return { success: true }
    } catch (error) {
      console.error('Password reset error:', error)
      setError(getErrorMessage(error))
      return { success: false, error: getErrorMessage(error) }
    } finally {
      setLoading(false)
    }
  }

  // Clear error
  const clearError = () => {
    setError(null)
  }

  return {
    user,
    loading,
    error,
    register,
    login,
    signInWithGoogle,
    logout,
    updateUserProfile,
    resetPassword,
    clearError,
    isAuthenticated: !!user
  }
}

// Helper function to get user-friendly error messages
const getErrorMessage = (error) => {
  switch (error.code) {
    case 'auth/user-not-found':
      return 'No account found with this email address'
    case 'auth/wrong-password':
      return 'Incorrect password'
    case 'auth/email-already-in-use':
      return 'An account with this email already exists'
    case 'auth/weak-password':
      return 'Password should be at least 6 characters'
    case 'auth/invalid-email':
      return 'Invalid email address'
    case 'auth/user-disabled':
      return 'This account has been disabled'
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later'
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection'
    case 'auth/popup-closed-by-user':
      return 'Sign-in was cancelled'
    case 'auth/popup-blocked':
      return 'Popup was blocked by your browser'
    default:
      return error.message || 'An unexpected error occurred'
  }
}