# Firebase Auth User Import Guide

This guide explains how to import users into Firebase Authentication using the `firebase auth:import` command.

## Overview

The `firebase auth:import` command allows you to bulk import users into Firebase Authentication. This is useful for:
- Seeding initial test users
- Migrating users from another system
- Setting up development/staging environments

## Prerequisites

1. Firebase CLI installed and authenticated
2. Active project set to `myaudit-59914983-2ad0f`
3. Email/Password provider enabled in Firebase Console (see `FIREBASE_AUTH_SETUP.md`)
4. User import template file prepared

## Import Methods

Firebase supports two methods for importing users:

### Method 1: Plain Text Passwords (Recommended for Testing)

Firebase can automatically hash plain text passwords during import. This is the simplest method for test users.

**Template File:** `scripts/auth-import-template-plaintext.json`

```json
[
  {
    "localId": "test-auditor-001",
    "email": "auditor@myaudit.test",
    "emailVerified": true,
    "password": "TestPassword123!",
    "displayName": "Test Auditor",
    "disabled": false
  }
]
```

**Command:**
```bash
firebase auth:import scripts/auth-import-template-plaintext.json \
  --hash-algo=SCRYPT \
  --hash-key=<base64-encoded-key> \
  --salt-separator=<base64-encoded-separator> \
  --rounds=8 \
  --mem-cost=14
```

**Note:** For plain text passwords, you can use a simplified command (Firebase will handle hashing):
```bash
firebase auth:import scripts/auth-import-template-plaintext.json
```

### Method 2: Pre-hashed Passwords (Production)

For production imports, you should pre-hash passwords using Firebase's SCRYPT algorithm.

**Template File:** `scripts/auth-import-template.json`

The template includes placeholders for `passwordHash` and `salt` which must be generated using Firebase's hashing algorithm.

## Password Hashing Requirements

Firebase uses **SCRYPT** for password hashing with the following parameters:

- **Algorithm:** SCRYPT
- **Rounds:** 8 (default)
- **Memory Cost:** 14 (default)
- **Hash Key:** Base64-encoded key (obtain from Firebase project settings)
- **Salt Separator:** Base64-encoded separator (obtain from Firebase project settings)

### Obtaining Hash Parameters

1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate New Private Key" (if needed)
3. The hash parameters are also available via Firebase Admin SDK

### Generating Password Hashes

You can use the Firebase Admin SDK to generate proper password hashes:

```javascript
const admin = require('firebase-admin');
const crypto = require('crypto');

// Initialize Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Generate hash (example - actual implementation requires proper SCRYPT)
const password = "TestPassword123!";
// Use Firebase Admin SDK's hash generation utilities
```

**Note:** For test users, using plain text passwords with Firebase's automatic hashing is acceptable.

## Import Command Syntax

```bash
firebase auth:import <file> [options]
```

### Options

- `--project <project-id>`: Specify project (defaults to active project)
- `--hash-algo <algorithm>`: Hash algorithm (SCRYPT, STANDARD_SCRYPT, HMAC_SHA512, HMAC_SHA256, MD5, SHA1, PBKDF_SHA1, BCRYPT, PBKDF2_SHA256, SHA256, SHA512)
- `--hash-key <key>`: Base64-encoded hash key
- `--salt-separator <separator>`: Base64-encoded salt separator
- `--rounds <number>`: Number of rounds (default: 8)
- `--mem-cost <number>`: Memory cost (default: 14)

## Step-by-Step Import Process

### Step 1: Prepare Template File

1. Copy `scripts/auth-import-template-plaintext.json` or `scripts/auth-import-template.json`
2. Update user details:
   - `localId`: Unique identifier (can be any string)
   - `email`: User's email address
   - `password`: Plain text password (for plaintext template)
   - `displayName`: User's display name (optional)
   - `emailVerified`: Set to `true` to skip email verification
   - `customAttributes`: JSON string with custom user metadata

### Step 2: Verify Project

```bash
firebase use myaudit-59914983-2ad0f
firebase projects:list
```

### Step 3: Run Import Command

**For plain text passwords (testing):**
```bash
firebase auth:import scripts/auth-import-template-plaintext.json \
  --project myaudit-59914983-2ad0f
```

**For pre-hashed passwords (production):**
```bash
firebase auth:import scripts/auth-import-template.json \
  --project myaudit-59914983-2ad0f \
  --hash-algo=SCRYPT \
  --hash-key=<your-hash-key> \
  --salt-separator=<your-salt-separator> \
  --rounds=8 \
  --mem-cost=14
```

### Step 4: Verify Import

1. Check command output for success message
2. Go to Firebase Console → Authentication → Users
3. Verify imported users appear in the list
4. Test sign-in with imported credentials

## Template File Structure

### Required Fields

- `localId`: Unique identifier for the user
- `email`: User's email address
- `password` OR `passwordHash` + `salt`: Password (plain text or hashed)

### Optional Fields

- `emailVerified`: Boolean (default: false)
- `displayName`: User's display name
- `photoUrl`: Profile photo URL
- `disabled`: Boolean (default: false)
- `createdAt`: Timestamp (ISO 8601)
- `lastLoginAt`: Timestamp (ISO 8601)
- `providerUserInfo`: Array of provider information
- `customAttributes`: JSON string with custom metadata

### Example with Custom Attributes

```json
{
  "localId": "auditor-001",
  "email": "auditor@myaudit.test",
  "password": "SecurePassword123!",
  "emailVerified": true,
  "displayName": "Test Auditor",
  "customAttributes": "{\"role\":\"auditor\",\"department\":\"tax\",\"permissions\":[\"read\",\"write\"]}"
}
```

## Testing Imported Users

After importing, test authentication in your app:

```typescript
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase';

// Test sign-in
signInWithEmailAndPassword(auth, 'auditor@myaudit.test', 'TestPassword123!')
  .then((userCredential) => {
    console.log('Sign-in successful:', userCredential.user);
  })
  .catch((error) => {
    console.error('Sign-in error:', error);
  });
```

## Troubleshooting

### Error: "Provider disabled"
- **Solution:** Enable Email/Password provider in Firebase Console (see `FIREBASE_AUTH_SETUP.md`)

### Error: "Invalid hash algorithm"
- **Solution:** Verify hash algorithm matches Firebase requirements (use SCRYPT)

### Error: "Invalid password hash"
- **Solution:** For pre-hashed passwords, ensure hash and salt are correctly formatted

### Error: "Email already exists"
- **Solution:** User with that email already exists. Delete from Console or use different email.

### Users not appearing in Console
- **Solution:** Refresh the Console page, verify import command completed successfully

## Security Considerations

1. **Never commit passwords to version control**: Use `.gitignore` for template files with real passwords
2. **Use environment variables**: Store sensitive data in environment variables
3. **Rotate passwords**: Change default test passwords after initial setup
4. **Limit test accounts**: Only create test accounts needed for development
5. **Use strong passwords**: Even for test accounts, use strong passwords

## Best Practices

1. **Separate templates**: Keep test and production templates separate
2. **Version control**: Commit template structure (without passwords) for reference
3. **Documentation**: Document any custom attributes or user roles
4. **Cleanup**: Remove test users before production deployment
5. **Audit**: Regularly review imported users in Firebase Console

## References

- [Firebase Auth Import Documentation](https://firebase.google.com/docs/cli/auth#import-users)
- [Firebase Password Hashing](https://firebase.google.com/docs/auth/admin/import-users#password_hashing)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
