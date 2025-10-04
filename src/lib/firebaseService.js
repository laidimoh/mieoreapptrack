import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  setDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore'
import { db } from './firebase.js'
import { generateId } from './utils.js'

/**
 * Firebase service for WorkTrack application
 * Handles all Firestore operations with real-time updates and error handling
 */

class FirebaseService {
  constructor() {
    this.currentUser = null
    this.unsubscribes = new Map() // Store unsubscribe functions for cleanup
  }

  // Set current user for scoped operations
  setCurrentUser(user) {
    this.currentUser = user
    this.cleanup() // Clean up previous subscriptions
  }

  // Get current user ID for debugging
  getCurrentUserId() {
    return this.currentUser?.uid || null;
  }

  // Debug function to check ID mismatches in existing data
  async debugIdMismatches() {
    const sessionId = Date.now();
    console.log(`[FIREBASE ID DEBUG ${sessionId}] === CHECKING ID MISMATCHES ===`);
    
    try {
      const entriesRef = this.getUserCollection('timeEntries');
      const snapshot = await getDocs(entriesRef);
      
      console.log(`[FIREBASE ID DEBUG ${sessionId}] Total documents:`, snapshot.size);
      
      let mismatches = 0;
      let samples = 0;
      
      snapshot.docs.slice(0, 10).forEach((doc, index) => {
        const data = doc.data();
        const docId = doc.id;
        const dataId = data.id;
        
        samples++;
        if (dataId && dataId !== docId) {
          mismatches++;
          console.log(`[FIREBASE ID DEBUG ${sessionId}] MISMATCH ${index + 1}:`, {
            documentId: docId,
            dataId: dataId,
            date: data.date
          });
        } else {
          console.log(`[FIREBASE ID DEBUG ${sessionId}] OK ${index + 1}:`, {
            documentId: docId,
            dataId: dataId || 'null',
            date: data.date
          });
        }
      });
      
      console.log(`[FIREBASE ID DEBUG ${sessionId}] Summary: ${mismatches}/${samples} mismatches found`);
      return { mismatches, samples };
    } catch (error) {
      console.error(`[FIREBASE ID DEBUG ${sessionId}] Debug failed:`, error);
      return { error: error.message };
    }
  }

  // Debug function to check user permissions and collection access
  async debugUserAccess() {
    const sessionId = Date.now();
    console.log(`[FIREBASE DEBUG ${sessionId}] === USER ACCESS DEBUG ===`);
    
    try {
      const userId = this.getCurrentUserId();
      console.log(`[FIREBASE DEBUG ${sessionId}] Current user ID:`, userId);
      
      if (!userId) {
        console.error(`[FIREBASE DEBUG ${sessionId}] No authenticated user`);
        return false;
      }
      
      const entriesRef = this.getUserCollection('timeEntries');
      console.log(`[FIREBASE DEBUG ${sessionId}] Collection reference:`, entriesRef.path);
      
      const snapshot = await getDocs(entriesRef);
      console.log(`[FIREBASE DEBUG ${sessionId}] Total documents in collection:`, snapshot.size);
      
      snapshot.docs.slice(0, 3).forEach((doc, index) => {
        console.log(`[FIREBASE DEBUG ${sessionId}] Sample doc ${index + 1}:`, {
          id: doc.id,
          data: doc.data()
        });
      });
      
      return true;
    } catch (error) {
      console.error(`[FIREBASE DEBUG ${sessionId}] Debug access failed:`, error);
      return false;
    }
  }

  // Debug function to identify ID mismatches between Firebase IDs and data IDs
  async debugIdMismatches() {
    const sessionId = Date.now();
    console.log(`[FIREBASE DEBUG ${sessionId}] === ID MISMATCH DETECTION ===`);
    
    try {
      const userId = this.getCurrentUserId();
      console.log(`[FIREBASE DEBUG ${sessionId}] Current user ID:`, userId);
      
      if (!userId) {
        console.error(`[FIREBASE DEBUG ${sessionId}] No authenticated user`);
        return false;
      }
      
      const entriesRef = this.getUserCollection('timeEntries');
      console.log(`[FIREBASE DEBUG ${sessionId}] Collection reference:`, entriesRef.path);
      
      const snapshot = await getDocs(entriesRef);
      console.log(`[FIREBASE DEBUG ${sessionId}] Total documents in collection:`, snapshot.size);
      
      let mismatches = 0;
      snapshot.docs.forEach((doc, index) => {
        const data = doc.data();
        const firebaseId = doc.id;
        const dataId = data.id;
        
        console.log(`[FIREBASE DEBUG ${sessionId}] Doc ${index + 1}:`, {
          firebaseId: firebaseId,
          dataId: dataId,
          mismatch: dataId && dataId !== firebaseId,
          date: data.date
        });
        
        if (dataId && dataId !== firebaseId) {
          mismatches++;
          console.warn(`[FIREBASE DEBUG ${sessionId}] ID MISMATCH FOUND:`, {
            firebaseId,
            dataId,
            date: data.date
          });
        }
      });
      
      console.log(`[FIREBASE DEBUG ${sessionId}] Total mismatches found: ${mismatches}`);
      return { total: snapshot.size, mismatches };
    } catch (error) {
      console.error(`[FIREBASE DEBUG ${sessionId}] Debug access failed:`, error);
      return false;
    }
  }

  // Fix ID mismatches by updating entries to use Firebase document IDs
  async fixIdMismatches() {
    const sessionId = Date.now();
    console.log(`[FIREBASE FIX ${sessionId}] Starting ID mismatch fix...`);
    
    try {
      const userId = this.getCurrentUserId();
      if (!userId) {
        throw new Error('User not authenticated');
      }
      
      const entriesRef = this.getUserCollection('timeEntries');
      const snapshot = await getDocs(entriesRef);
      
      let fixCount = 0;
      const batch = writeBatch(this.db);
      
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        const firebaseId = doc.id;
        const dataId = data.id;
        
        if (dataId && dataId !== firebaseId) {
          console.log(`[FIREBASE FIX ${sessionId}] Fixing ID mismatch:`, {
            firebaseId,
            dataId,
            date: data.date
          });
          
          // Update the document to use the Firebase document ID
          const docRef = doc.ref;
          batch.update(docRef, {
            id: firebaseId,
            updatedAt: serverTimestamp()
          });
          
          fixCount++;
        }
      });
      
      if (fixCount > 0) {
        await batch.commit();
        console.log(`[FIREBASE FIX ${sessionId}] Fixed ${fixCount} ID mismatches`);
      } else {
        console.log(`[FIREBASE FIX ${sessionId}] No ID mismatches found`);
      }
      
      return { success: true, fixedCount: fixCount };
    } catch (error) {
      console.error(`[FIREBASE FIX ${sessionId}] Error fixing ID mismatches:`, error);
      return { success: false, error: error.message };
    }
  }

  // Cleanup all subscriptions
  cleanup() {
    this.unsubscribes.forEach(unsubscribe => unsubscribe())
    this.unsubscribes.clear()
  }

  // Get user document reference
  getUserRef() {
    if (!this.currentUser?.uid) {
      throw new Error('No authenticated user')
    }
    return doc(db, 'users', this.currentUser.uid)
  }

  // Get collection reference for user data
  getUserCollection(collectionName) {
    if (!this.currentUser?.uid) {
      throw new Error('No authenticated user')
    }
    return collection(db, 'users', this.currentUser.uid, collectionName)
  }

  // User Profile Management
  async saveUserProfile(userData) {
    try {
      const userRef = this.getUserRef()
      await setDoc(userRef, {
        ...userData,
        updatedAt: serverTimestamp()
      }, { merge: true }) // Use merge to update existing or create new
      return { success: true }
    } catch (error) {
      console.error('Error saving user profile:', error)
      return { success: false, error: error.message }
    }
  }

  async getUserProfile() {
    try {
      const userRef = this.getUserRef()
      const userSnap = await getDoc(userRef)
      
      if (userSnap.exists()) {
        return { success: true, data: userSnap.data() }
      } else {
        return { success: false, error: 'User profile not found' }
      }
    } catch (error) {
      console.error('Error getting user profile:', error)
      return { success: false, error: error.message }
    }
  }

  // Time Entries Management
  async addTimeEntry(entryData) {
    const sessionId = Date.now();
    console.log(`[FIREBASE ADD ${sessionId}] Adding time entry:`, entryData);
    
    try {
      const entriesRef = this.getUserCollection('timeEntries');
      
      // Remove any custom id field from the data to avoid conflicts
      const { id, ...cleanEntryData } = entryData;
      
      const docRef = await addDoc(entriesRef, {
        ...cleanEntryData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      console.log(`[FIREBASE ADD ${sessionId}] Document created with ID:`, docRef.id);
      
      return { success: true, id: docRef.id, entry: { ...cleanEntryData, id: docRef.id } };
    } catch (error) {
      console.error(`[FIREBASE ADD ${sessionId}] Error adding time entry:`, error);
      return { success: false, error: error.message };
    }
  }

  async updateTimeEntry(entryId, updates) {
    try {
      const entryRef = doc(this.getUserCollection('timeEntries'), entryId)
      await updateDoc(entryRef, {
        ...updates,
        updatedAt: serverTimestamp()
      })
      
      return { success: true }
    } catch (error) {
      console.error('Error updating time entry:', error)
      return { success: false, error: error.message }
    }
  }

  async deleteTimeEntry(entryId) {
    const sessionId = Date.now();
    console.log(`[FIREBASE DELETE ${sessionId}] Starting deletion of entry:`, entryId);
    
    try {
      if (!entryId) {
        throw new Error('Entry ID is required for deletion');
      }
      
      const userId = this.getCurrentUserId();
      if (!userId) {
        throw new Error('User not authenticated');
      }
      
      console.log(`[FIREBASE DELETE ${sessionId}] User ID:`, userId);
      console.log(`[FIREBASE DELETE ${sessionId}] Entry ID to delete:`, entryId, typeof entryId);
      
      // FIRST: Try to delete by the provided ID (normal case)
      let entryRef = doc(this.getUserCollection('timeEntries'), String(entryId));
      console.log(`[FIREBASE DELETE ${sessionId}] Document reference created:`, entryRef.path);
      
      let docSnapshot = await getDoc(entryRef);
      console.log(`[FIREBASE DELETE ${sessionId}] Document exists by ID:`, docSnapshot.exists());
      
      // IF document not found by ID, search for it by data.id field (legacy entries)
      if (!docSnapshot.exists()) {
        console.log(`[FIREBASE DELETE ${sessionId}] Document not found by ID, searching by data.id...`);
        
        const entriesRef = this.getUserCollection('timeEntries');
        const querySnapshot = await getDocs(entriesRef);
        
        let foundDocId = null;
        querySnapshot.docs.forEach((doc) => {
          const data = doc.data();
          if (data.id === entryId) {
            foundDocId = doc.id;
            console.log(`[FIREBASE DELETE ${sessionId}] Found entry by data.id: ${entryId} -> doc.id: ${doc.id}`);
          }
        });
        
        if (foundDocId) {
          entryRef = doc(this.getUserCollection('timeEntries'), foundDocId);
          docSnapshot = await getDoc(entryRef);
          console.log(`[FIREBASE DELETE ${sessionId}] Found document by data search:`, docSnapshot.exists());
        }
      }
      
      if (!docSnapshot.exists()) {
        console.warn(`[FIREBASE DELETE ${sessionId}] Document does not exist anywhere:`, entryId);
        return { success: false, error: 'Document not found' };
      }
      
      console.log(`[FIREBASE DELETE ${sessionId}] Document data:`, docSnapshot.data());
      
      await deleteDoc(entryRef);
      console.log(`[FIREBASE DELETE ${sessionId}] Document deleted successfully`);
      
      // Verify deletion
      const verifySnapshot = await getDoc(entryRef);
      console.log(`[FIREBASE DELETE ${sessionId}] Verification - document still exists:`, verifySnapshot.exists());
      
      return { success: true };
    } catch (error) {
      console.error(`[FIREBASE DELETE ${sessionId}] Error deleting time entry:`, error);
      console.error(`[FIREBASE DELETE ${sessionId}] Error details:`, {
        name: error.name,
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      return { success: false, error: error.message };
    }
  }

  async getTimeEntries() {
    try {
      const entriesRef = this.getUserCollection('timeEntries')
      const q = query(entriesRef, orderBy('date', 'desc'))
      const querySnapshot = await getDocs(q)
      
      const entries = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      
      return { success: true, data: entries }
    } catch (error) {
      console.error('Error getting time entries:', error)
      return { success: false, error: error.message }
    }
  }

  async getTimeEntriesForDate(date) {
    try {
      const entriesRef = this.getUserCollection('timeEntries')
      const q = query(entriesRef, where('date', '==', date), orderBy('startTime'))
      const querySnapshot = await getDocs(q)
      
      const entries = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      
      return { success: true, data: entries }
    } catch (error) {
      console.error('Error getting time entries for date:', error)
      return { success: false, error: error.message }
    }
  }

  async getTimeEntriesForDateRange(startDate, endDate) {
    try {
      const entriesRef = this.getUserCollection('timeEntries')
      const q = query(
        entriesRef,
        where('date', '>=', startDate),
        where('date', '<=', endDate),
        orderBy('date', 'desc')
      )
      const querySnapshot = await getDocs(q)
      
      const entries = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      
      return { success: true, data: entries }
    } catch (error) {
      console.error('Error getting time entries for date range:', error)
      return { success: false, error: error.message }
    }
  }

  // Real-time subscriptions
  subscribeToTimeEntries(callback) {
    if (!this.currentUser?.uid) {
      console.error('No authenticated user for subscription')
      return () => {}
    }

    const entriesRef = this.getUserCollection('timeEntries')
    const q = query(entriesRef, orderBy('date', 'desc'))
    
    const unsubscribe = onSnapshot(q, 
      (querySnapshot) => {
        const entries = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        callback({ success: true, data: entries })
      },
      (error) => {
        console.error('Error in time entries subscription:', error)
        callback({ success: false, error: error.message })
      }
    )

    this.unsubscribes.set('timeEntries', unsubscribe)
    return unsubscribe
  }

  // Projects Management
  async addProject(projectData) {
    try {
      const projectsRef = this.getUserCollection('projects')
      const docRef = await addDoc(projectsRef, {
        ...projectData,
        id: projectData.id || generateId(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
      
      return { success: true, id: docRef.id, project: projectData }
    } catch (error) {
      console.error('Error adding project:', error)
      return { success: false, error: error.message }
    }
  }

  async updateProject(projectId, updates) {
    try {
      const projectRef = doc(this.getUserCollection('projects'), projectId)
      await updateDoc(projectRef, {
        ...updates,
        updatedAt: serverTimestamp()
      })
      
      return { success: true }
    } catch (error) {
      console.error('Error updating project:', error)
      return { success: false, error: error.message }
    }
  }

  async deleteProject(projectId) {
    try {
      const projectRef = doc(this.getUserCollection('projects'), projectId)
      await deleteDoc(projectRef)
      
      return { success: true }
    } catch (error) {
      console.error('Error deleting project:', error)
      return { success: false, error: error.message }
    }
  }

  async getProjects() {
    try {
      const projectsRef = this.getUserCollection('projects')
      const q = query(projectsRef, orderBy('name'))
      const querySnapshot = await getDocs(q)
      
      const projects = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      
      return { success: true, data: projects }
    } catch (error) {
      console.error('Error getting projects:', error)
      return { success: false, error: error.message }
    }
  }

  subscribeToProjects(callback) {
    if (!this.currentUser?.uid) {
      console.error('No authenticated user for subscription')
      return () => {}
    }

    const projectsRef = this.getUserCollection('projects')
    const q = query(projectsRef, orderBy('name'))
    
    const unsubscribe = onSnapshot(q,
      (querySnapshot) => {
        const projects = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        callback({ success: true, data: projects })
      },
      (error) => {
        console.error('Error in projects subscription:', error)
        callback({ success: false, error: error.message })
      }
    )

    this.unsubscribes.set('projects', unsubscribe)
    return unsubscribe
  }

  // Settings Management
  async saveSettings(settings) {
    try {
      const settingsRef = doc(this.getUserCollection('settings'), 'userSettings')
      await updateDoc(settingsRef, {
        ...settings,
        updatedAt: serverTimestamp()
      })
      
      return { success: true }
    } catch (error) {
      if (error.code === 'not-found') {
        // Create settings document if it doesn't exist
        await setDoc(settingsRef, {
          ...settings,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        })
        return { success: true }
      }
      console.error('Error saving settings:', error)
      return { success: false, error: error.message }
    }
  }

  async getSettings() {
    try {
      const settingsRef = doc(this.getUserCollection('settings'), 'userSettings')
      const settingsSnap = await getDoc(settingsRef)
      
      if (settingsSnap.exists()) {
        return { success: true, data: settingsSnap.data() }
      } else {
        // Return default settings
        const defaultSettings = {
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
        }
        return { success: true, data: defaultSettings }
      }
    } catch (error) {
      console.error('Error getting settings:', error)
      return { success: false, error: error.message }
    }
  }

  // Data Migration from localStorage
  async migrateFromLocalStorage(localData) {
    try {
      const batch = writeBatch(db)
      
      // Migrate time entries
      if (localData.timeEntries && localData.timeEntries.length > 0) {
        const entriesRef = this.getUserCollection('timeEntries')
        localData.timeEntries.forEach(entry => {
          const docRef = doc(entriesRef, entry.id)
          batch.set(docRef, {
            ...entry,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          })
        })
      }

      // Migrate projects
      if (localData.projects && localData.projects.length > 0) {
        const projectsRef = this.getUserCollection('projects')
        localData.projects.forEach(project => {
          const docRef = doc(projectsRef, project.id)
          batch.set(docRef, {
            ...project,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          })
        })
      }

      // Migrate settings
      if (localData.settings) {
        const settingsRef = doc(this.getUserCollection('settings'), 'userSettings')
        batch.set(settingsRef, {
          ...localData.settings,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        })
      }

      await batch.commit()
      return { success: true }
    } catch (error) {
      console.error('Error migrating data:', error)
      return { success: false, error: error.message }
    }
  }

  // Export data for backup
  async exportData() {
    try {
      const [timeEntriesResult, projectsResult, settingsResult] = await Promise.all([
        this.getTimeEntries(),
        this.getProjects(),
        this.getSettings()
      ])

      return {
        success: true,
        data: {
          timeEntries: timeEntriesResult.success ? timeEntriesResult.data : [],
          projects: projectsResult.success ? projectsResult.data : [],
          settings: settingsResult.success ? settingsResult.data : {},
          exportedAt: new Date().toISOString()
        }
      }
    } catch (error) {
      console.error('Error exporting data:', error)
      return { success: false, error: error.message }
    }
  }
}

// Create and export singleton instance
const firebaseService = new FirebaseService()
export default firebaseService