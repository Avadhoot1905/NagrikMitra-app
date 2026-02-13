# Google OAuth Setup Instructions for NagrikMitra2

## Files Created/Modified

✅ **Info.plist** - Configuration file with Google OAuth settings
✅ **GoogleSignInManager.swift** - Helper class for Google Sign-In
✅ **LoginView.swift** - Updated with Google Sign-In implementation  
✅ **NagrikMitra2App.swift** - Updated to handle Google Sign-In callbacks

---

## Setup Steps

### Step 1: Add Google Sign-In Swift Package

1. Open `NagrikMitra2.xcodeproj` in Xcode
2. Select the project in the navigator
3. Select the `NagrikMitra2` target
4. Go to **Package Dependencies** tab
5. Click the **+** button
6. Enter package URL: `https://github.com/google/GoogleSignIn-iOS`
7. Select version: **7.0.0** or later
8. Click **Add Package**
9. Select **GoogleSignIn** and **GoogleSignInSwift** libraries
10. Click **Add Package**

### Step 2: Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable **Google Sign-In API**:
   - Go to **APIs & Services** > **Library**
   - Search for "Google Sign-In"
   - Click **Enable**

4. Create OAuth 2.0 Client ID:
   - Go to **APIs & Services** > **Credentials**
   - Click **Create Credentials** > **OAuth client ID**
   - Select **iOS** as application type
   - Enter your app's Bundle ID (e.g., `com.yourname.NagrikMitra2`)
   - Click **Create**

5. **Copy your Client ID** - it looks like:
   ```
   123456789-abcdefghijklmnop.apps.googleusercontent.com
   ```

### Step 3: Configure Info.plist

Open `Info.plist` and replace the placeholder values:

1. Find `<key>GIDClientID</key>`
2. Replace `YOUR_CLIENT_ID.apps.googleusercontent.com` with your actual Client ID

3. Find `<string>com.googleusercontent.apps.YOUR_CLIENT_ID</string>`  
4. Replace `YOUR_CLIENT_ID` with just the numeric part (before `.apps.googleusercontent.com`)

**Example:**
If your Client ID is: `123456789-abcdefg.apps.googleusercontent.com`

Then:
```xml
<key>GIDClientID</key>
<string>123456789-abcdefg.apps.googleusercontent.com</string>

<key>CFBundleURLSchemes</key>
<array>
    <string>com.googleusercontent.apps.123456789-abcdefg</string>
</array>
```

### Step 4: Verify Info.plist is Added to Target

1. Select `Info.plist` in Project Navigator
2. In File Inspector (right sidebar), verify **Target Membership**
3. Make sure `NagrikMitra2` is checked

### Step 5: Build and Run

1. Build the project (⌘ + B)
2. Run on simulator or device (⌘ + R)
3. Navigate to Login screen
4. Click **"Continue with Google"** or **"Sign up with Google"**
5. Complete Google Sign-In flow
6. User should be logged in automatically

---

## Testing

### Test on Simulator
- Google Sign-In works on iOS Simulator
- You'll be redirected to Safari for authentication
- After signing in, you'll be redirected back to the app

### Test on Device
- Make sure your device is added to your Apple Developer account
- Google Sign-In works the same way as simulator

---

## Troubleshooting

### Issue: "Client ID not found"
**Solution:** Make sure you've replaced `YOUR_CLIENT_ID` in Info.plist with your actual Google Client ID

### Issue: "The operation couldn't be completed"
**Solution:** 
- Verify your Bundle ID matches what you configured in Google Cloud Console
- Check that URL scheme in Info.plist matches your reversed client ID

### Issue: Package build errors
**Solution:**
- Clean build folder: **Product** > **Clean Build Folder** (⌘ + Shift + K)
- Delete DerivedData: `~/Library/Developer/Xcode/DerivedData/`
- Restart Xcode

### Issue: "Cannot find 'GIDSignIn' in scope"
**Solution:**
- Make sure GoogleSignIn package is properly added
- Check that both **GoogleSignIn** and **GoogleSignInSwift** are selected in package dependencies
- Add `import GoogleSignIn` at the top of files that use it

### Issue: App doesn't receive callback after signing in
**Solution:**
- Verify URL scheme is correctly configured in Info.plist
- Make sure `.onOpenURL` modifier is present in App file
- Check that reversed client ID matches format: `com.googleusercontent.apps.XXXXX`

---

## Backend Integration

The app sends the Google ID token to your backend at:
```
POST /users/google-auth/
Body: { "token": "google_id_token_here" }
```

Make sure your Django backend:
1. Has the Google Auth endpoint configured
2. Verifies the Google ID token
3. Returns user data and JWT tokens in the same format as regular login

---

## Security Notes

- ⚠️ Never commit your actual Client ID to public repositories
- Use environment variables for sensitive configuration
- The ID token is sent securely to your backend for verification
- Backend should verify the token with Google's servers

---

## Additional Resources

- [Google Sign-In for iOS Documentation](https://developers.google.com/identity/sign-in/ios)
- [GoogleSignIn-iOS GitHub Repo](https://github.com/google/GoogleSignIn-iOS)
- [Google Cloud Console](https://console.cloud.google.com/)

---

## What Happens When User Signs In

1. User taps "Continue with Google" button
2. App opens Google Sign-In sheet
3. User selects Google account and authorizes
4. Google returns an ID token
5. App sends token to backend (`/users/google-auth/`)
6. Backend verifies token with Google
7. Backend creates/finds user and returns JWT tokens
8. App stores tokens and logs user in
9. User is redirected to main app

---

## File Structure

```
NagrikMitra2/
├── Info.plist                    # OAuth configuration
├── GoogleSignInManager.swift     # Sign-In logic
├── LoginView.swift               # UI with Google button
├── NagrikMitra2App.swift         # App entry & URL handling
├── AuthManager.swift             # Auth state management
└── NetworkManager.swift          # API communication
```

---

**Need help?** Check the SETUP_GUIDE.md for more details or review the code comments in GoogleSignInManager.swift.
