# Firebase Firestore Security Rules

## Setup Instructions

1. Go to Firebase Console: https://console.firebase.google.com/
2. Select your project: worktrack-8240e
3. Go to Firestore Database → Rules
4. Replace the rules with the following:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // Allow access to user's sub-collections
      match /{collection=**} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
    
    // Deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## What these rules do:

1. **User Data Protection**: Users can only read/write their own data under `/users/{userId}`
2. **Sub-collections**: Time entries, projects, settings are stored under user documents
3. **Authentication Required**: All operations require authentication
4. **Security**: No access to other users' data

## Data Structure:

```
/users/{userId}
  ├── (user profile data)
  ├── /timeEntries/{entryId}
  ├── /projects/{projectId}
  └── /settings/userSettings
```

## After updating rules:

1. Click "Publish" in the Firebase Console
2. The rules will take effect immediately
3. Your app should work without security errors

## If you get permission errors:

1. Check the browser console for specific errors
2. Verify the user is authenticated (check DebugInfo component)
3. Ensure the rules are published in Firebase Console