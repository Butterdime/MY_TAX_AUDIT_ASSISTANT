# Firebase Authentication Setup Runbook

Complete end-to-end guide for setting up Firebase Authentication with Email/Password provider for the **myaudit-59914983-2ad0f** project.

## Quick Start

This runbook is organized into four parts:

1. **Local Alignment** - Verify and configure local environment
2. **Console Actions** - Enable Email/Password in Firebase Console
3. **Verification** - Confirm Auth is working correctly
4. **User Seeding** - Import test users via CLI

## Part 1: Local Alignment

### Prerequisites Check

Run the verification script:
```bash
./scripts/verify-firebase-auth.sh
```

### Manual Steps

1. **Verify Firebase CLI**: Ensure `firebase-tools` is installed
   - Global: `firebase --version`
   - Or in project: `npm install --save-dev firebase-tools`

2. **Switch Project**: 
   ```bash
   firebase use myaudit-59914983-2ad0f
   firebase projects:list  # Verify "current" shows target project
   ```

3. **Verify Configuration**:
   - `.firebaserc` should point to `myaudit-59914983-2ad0f`
   - `src/firebase.ts` uses environment variables
   - Environment variables match target project

**Status**: ✅ Completed - `.firebaserc` updated, project verified

## Part 2: Console Actions

**Manual steps required** - These cannot be done via CLI.

Follow the detailed guide: **[FIREBASE_AUTH_SETUP.md](FIREBASE_AUTH_SETUP.md)**

### Quick Checklist

- [ ] Navigate to Firebase Console
- [ ] Select project: **myaudit-59914983-2ad0f**
- [ ] Click **Authentication** → **Get started** (if not initialized)
- [ ] Go to **Sign-in method** tab
- [ ] Enable **Email/Password** provider
- [ ] Click **Save**
- [ ] Verify provider shows as **Enabled**

## Part 3: Verification

### Automated Verification

Run the verification script:
```bash
./scripts/verify-firebase-auth.sh
```

### Manual Verification

1. **Start the app**:
   ```bash
   npm run dev
   ```

2. **Browser Console Checks**:
   - Open browser console (F12)
   - Check for `window._firebaseConfig`:
     ```javascript
     console.table(window._firebaseConfig);
     // Should show:
     // projectId: "myaudit-59914983-2ad0f"
     // authDomain: (matches Firebase project)
     // apiKey: true
     ```
   - Verify no errors:
     - ❌ "provider disabled"
     - ❌ "auth/configuration-not-found"

3. **Firebase Console Verification**:
   - Go to Authentication → Users
   - Tab should be accessible (indicates Auth initialized)
   - List may be empty until users are created

## Part 4: User Seeding

### Import Test Users

Follow the detailed guide: **[FIREBASE_AUTH_IMPORT.md](FIREBASE_AUTH_IMPORT.md)**

### Quick Import (Plain Text - Testing)

1. **Prepare template** (already created):
   - `scripts/auth-import-template-plaintext.json`

2. **Update credentials** (edit the file):
   - Change email if needed
   - Change password to a secure test password
   - Update displayName and customAttributes

3. **Run import**:
   ```bash
   firebase auth:import scripts/auth-import-template-plaintext.json \
     --project myaudit-59914983-2ad0f
   ```

4. **Verify in Console**:
   - Go to Authentication → Users
   - Imported user should appear in the list

5. **Test sign-in**:
   ```typescript
   import { signInWithEmailAndPassword } from 'firebase/auth';
   import { auth } from './firebase';
   
   signInWithEmailAndPassword(auth, 'auditor@myaudit.test', 'TestPassword123!')
     .then(user => console.log('Signed in:', user))
     .catch(error => console.error('Error:', error));
   ```

## Files Created

### Documentation
- `docs/FIREBASE_AUTH_RUNBOOK.md` - This file (overview)
- `docs/FIREBASE_AUTH_SETUP.md` - Console setup guide
- `docs/FIREBASE_AUTH_IMPORT.md` - User import guide

### Scripts
- `scripts/verify-firebase-auth.sh` - Verification script
- `scripts/auth-import-template.json` - Import template (pre-hashed)
- `scripts/auth-import-template-plaintext.json` - Import template (plain text)

### Configuration
- `.firebaserc` - Updated to point to `myaudit-59914983-2ad0f`
- `package.json` - Added `firebase-tools` to devDependencies

## Troubleshooting

### "Provider disabled" error
- **Solution**: Complete Part 2 (Console Actions) - Enable Email/Password in Firebase Console

### "auth/configuration-not-found" error
- **Solution**: Ensure Authentication is initialized (click "Get started" in Console)

### Import command fails
- **Solution**: Verify Email/Password is enabled, check template file format

### Users not appearing after import
- **Solution**: Refresh Firebase Console, verify import command completed successfully

## Next Steps

After completing this runbook:

1. **Update app code** to use Email/Password authentication:
   - Replace or supplement `signInAnonymously` with `signInWithEmailAndPassword`
   - Add sign-up functionality with `createUserWithEmailAndPassword`
   - Implement password reset with `sendPasswordResetEmail`

2. **Set up production users**:
   - Use production-grade password hashing for user imports
   - Implement proper user management workflows
   - Set up email verification flows

3. **Security hardening**:
   - Configure password policies in Firebase Console
   - Set up email templates for verification/reset
   - Implement proper error handling for auth flows

## References

- [Firebase Authentication Documentation](https://firebase.google.com/docs/auth)
- [Firebase Auth Import](https://firebase.google.com/docs/cli/auth#import-users)
- [Firebase Console](https://console.firebase.google.com)
