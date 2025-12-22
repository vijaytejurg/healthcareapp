# 🔥 Deploy Firestore Security Rules to Firebase

## Step 1: Login to Firebase (if not already logged in)

Open a **new terminal window** (PowerShell or Command Prompt) and run:

```bash
cd C:\Users\vijay\Desktop\MediDoc\healthcareapp
firebase login
```

This will open a browser window for you to login with your Google account.

## Step 2: Deploy Firestore Rules

After logging in, run:

```bash
firebase deploy --only firestore:rules
```

This will deploy the `firestore.rules` file to your Firebase project.

## Step 3: Verify Deployment

You should see a success message like:
```
✔  Deploy complete!
```

## Alternative: Deploy via Firebase Console

If CLI doesn't work, you can also:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `healthcare-287c1`
3. Go to **Firestore Database** → **Rules** tab
4. Copy the contents of `firestore.rules` file
5. Paste into the rules editor
6. Click **Publish**

## Important Notes

- The rules allow users to create their own profile during signup
- Users can only read/update their own data
- Medical data is protected and only accessible to authorized users
- All rules are properly secured for a healthcare app

