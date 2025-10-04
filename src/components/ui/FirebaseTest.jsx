import React, { useEffect, useState } from 'react'
import { auth, db } from '../../lib/firebase.js'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'

const FirebaseTest = () => {
  const [status, setStatus] = useState('Testing Firebase connection...')
  const [details, setDetails] = useState([])

  const addDetail = (message) => {
    setDetails(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  useEffect(() => {
    const testFirebase = async () => {
      try {
        addDetail('✅ Firebase modules imported successfully')
        
        // Test Firebase config
        if (!import.meta.env.VITE_FIREBASE_API_KEY) {
          throw new Error('❌ Firebase API key not found in environment variables')
        }
        addDetail('✅ Environment variables loaded')

        // Test auth initialization
        if (auth) {
          addDetail('✅ Firebase Auth initialized')
        } else {
          throw new Error('❌ Firebase Auth failed to initialize')
        }

        // Test Firestore initialization  
        if (db) {
          addDetail('✅ Firestore initialized')
        } else {
          throw new Error('❌ Firestore failed to initialize')
        }

        // Test auth state
        auth.onAuthStateChanged((user) => {
          if (user) {
            addDetail(`✅ User authenticated: ${user.email}`)
          } else {
            addDetail('ℹ️ No user authenticated')
          }
        })

        setStatus('Firebase connection test completed')
        
      } catch (error) {
        addDetail(`❌ Error: ${error.message}`)
        setStatus('Firebase connection failed')
        console.error('Firebase test error:', error)
      }
    }

    testFirebase()
  }, [])

  if (!import.meta.env.DEV) return null

  return (
    <div className="fixed top-4 left-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-lg shadow-lg max-w-md text-sm z-50">
      <h3 className="font-bold mb-2 text-gray-900 dark:text-white">Firebase Connection Test</h3>
      <p className="mb-2 text-gray-700 dark:text-gray-300">{status}</p>
      <div className="space-y-1 max-h-40 overflow-y-auto">
        {details.map((detail, index) => (
          <div key={index} className="text-xs text-gray-600 dark:text-gray-400 font-mono">
            {detail}
          </div>
        ))}
      </div>
    </div>
  )
}

export default FirebaseTest