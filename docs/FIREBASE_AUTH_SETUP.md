# Firebase Authentication Setup Guide

This guide provides step-by-step instructions for enabling Email/Password authentication in the Firebase Console for the **myaudit-59914983-2ad0f** project.

## Prerequisites

- Access to Firebase Console with appropriate permissions
- Project **myaudit-59914983-2ad0f** must be accessible in your Firebase account

## Part 2: Console Actions (Manual Steps)

### Step 2.1: Navigate to Firebase Console

1. Open [Firebase Console](https://console.firebase.google.com) in your browser
2. Ensure you are logged in with an account that has access to the project
3. Select project: **myaudit-59914983-2ad0f** from the project dropdown

### Step 2.2: Initialize Authentication

1. In the left sidebar, click **Authentication** (or find it under "Build" section)
2. If Authentication has not been initialized:
   - You will see a **Get started** button
   - Click **Get started**
   - This performs the one-time Identity Platform initialization
   - Wait for the initialization to complete (usually a few seconds)

### Step 2.3: Enable Email/Password Provider

1. Once on the Authentication page, click the **Sign-in method** tab at the top
2. Scroll through the list of sign-in providers to find **Email/Password**
3. Click on the **Email/Password** row (not just the toggle)
4. In the configuration panel that opens:
   - Toggle the **Enable** switch to **ON** (top of the panel)
   - Optionally enable **Email link (passwordless sign-in)** if you want passwordless authentication
   - Leave other settings as default unless you have specific requirements
5. Click **Save** at the bottom of the panel

### Step 2.4: Verify Provider Status

1. Return to the **Sign-in method** tab
2. Confirm **Email/Password** shows as **Enabled** in the provider list
3. The status should display a green checkmark or "Enabled" indicator

## Important Notes

- **This step cannot be done via CLI**: Email/Password provider enablement is a security-sensitive administrative action that must be performed through the Firebase Console UI
- **One-time setup**: Once enabled, the provider remains enabled unless manually disabled
- **Required for app functionality**: The app will receive "provider disabled" or "auth/configuration-not-found" errors if this step is skipped

## Next Steps

After enabling Email/Password:
1. Verify the configuration (see verification steps in runbook)
2. Seed test users using `firebase auth:import` (see auth import documentation)
3. Update app code to use Email/Password authentication methods

## Troubleshooting

- **"Get started" button not visible**: Authentication may already be initialized. Proceed to Step 2.3
- **Cannot find Email/Password provider**: Ensure you're on the "Sign-in method" tab, not "Users" or "Templates"
- **Save button grayed out**: Check that the "Enable" toggle is actually switched ON
- **Changes not saving**: Refresh the page and try again, or check browser console for errors
