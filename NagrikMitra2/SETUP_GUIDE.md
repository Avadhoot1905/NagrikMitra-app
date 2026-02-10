# NagrikMitra Setup Guide

## New Features Added

### 1. 🔐 Google OAuth Login
- Added Google Sign-In option on login screen
- Requires Google Sign-In SDK integration (see instructions below)

### 2. 📧 OTP-based Login
- Email-based OTP authentication
- No password required for login
- 10-minute OTP expiration

### 3. 🆔 Aadhaar Verification
- Verify your Aadhaar on the Profile page
- Required before submitting reports
- Secure encrypted storage

### 4. 📍 Location Detection
- Automatic location detection for reports
- GPS-based address resolution
- Manual location entry also available

### 5. 🔍 Enhanced Report Tracking
- Track reports using generated tracking ID
- View complete report status and details
- Public tracking (no login required)

---

## Xcode Project Configuration

### Adding Location Permissions

**Important:** Modern Xcode projects don't use a separate Info.plist file. Add permissions through Xcode:

1. Open `NagrikMitra2.xcodeproj` in Xcode
2. Select the `NagrikMitra2` target in the project navigator
3. Go to the **Info** tab
4. Under **Custom iOS Target Properties**, click the **+** button to add new keys:

**Required Keys to Add:**

| Key | Type | Value |
|-----|------|-------|
| `Privacy - Location When In Use Usage Description` | String | NagrikMitra needs your location to automatically detect and report civic issues in your area. |
| `Privacy - Photo Library Usage Description` | String | NagrikMitra needs access to your photos to attach evidence to issue reports. |
| `Privacy - Camera Usage Description` | String | NagrikMitra needs access to your camera to capture photos of civic issues. |

**Alternative Method (if you see raw key names):**

| Key | Type | Value |
|-----|------|-------|
| `NSLocationWhenInUseUsageDescription` | String | NagrikMitra needs your location to automatically detect and report civic issues in your area. |
| `NSPhotoLibraryUsageDescription` | String | NagrikMitra needs access to your photos to attach evidence to issue reports. |
| `NSCameraUsageDescription` | String | NagrikMitra needs access to your camera to capture photos of civic issues. |

### Google Sign-In SDK Setup (Optional)

To enable Google OAuth login:

#### 1. Install Google Sign-In SDK

Add to your `Package.swift` or use Swift Package Manager:

```swift
dependencies: [
    .package(url: "https://github.com/google/GoogleSignIn-iOS", from: "7.0.0")
]
```

#### 2. Configure Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google Sign-In API
4. Create OAuth 2.0 Client ID (iOS)
5. Download `GoogleService-Info.plist`
6. Add to your Xcode project

#### 3. Update App Configuration

Add to your `Info.plist`:

```xml
<key>GIDClientID</key>
<string>YOUR_CLIENT_ID_HERE</string>

<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>com.googleusercontent.apps.YOUR_CLIENT_ID</string>
        </array>
    </dict>
</array>
```

#### 4. Update LoginView

Replace the `handleGoogleAuth()` function in `LoginView.swift`:

```swift
import GoogleSignIn

private func handleGoogleAuth() {
    guard let presentingViewController = (UIApplication.shared.windows.first?.rootViewController) else {
        return
    }
    
    GIDSignIn.sharedInstance.signIn(withPresenting: presentingViewController) { signInResult, error in
        guard let signInResult = signInResult, error == nil else {
            errorMessage = error?.localizedDescription ?? "Google Sign-In failed"
            showError = true
            return
        }
        
        guard let idToken = signInResult.user.idToken?.tokenString else {
            errorMessage = "Failed to get ID token"
            showError = true
            return
        }
        
        // Send to your backend
        Task {
            do {
                try await authManager.googleAuth(token: idToken)
                await MainActor.run {
                    dismiss()
                }
            } catch {
                await MainActor.run {
                    errorMessage = error.localizedDescription
                    showError = true
                }
            }
        }
    }
}
```

---

## Backend API Configuration

Make sure your backend URL is correctly configured in `APIConfig.swift`:

```swift
static let baseURL = "http://YOUR_BACKEND_URL:8000"
```

For local development:
- Simulator: `http://localhost:8000`
- Physical device: `http://YOUR_COMPUTER_IP:8000`

---

## Testing the New Features

### 1. OTP Login
1. Open the app
2. Tap "Login with OTP instead"
3. Enter email
4. Tap "Send OTP"
5. Check email for OTP code
6. Enter OTP and verify

### 2. Aadhaar Verification
1. Login to the app
2. Go to Profile tab
3. Tap "Verify Aadhaar"
4. Enter 12-digit Aadhaar number
5. Tap "Verify Aadhaar"

### 3. Location Detection
1. Go to Report tab
2. Fill in issue title
3. Tap the location icon 📍 next to location field
4. Allow location access when prompted
5. Wait for address to auto-fill

### 4. Report Tracking
1. Go to Track tab
2. Enter tracking ID (received after submitting report)
3. Tap "Search"
4. View complete report details and status

---

## Troubleshooting

### Location Not Working
- Check Location Services are enabled in iOS Settings
- Verify location permissions for NagrikMitra
- Ensure you're not in Airplane Mode
- Try on a physical device (simulators can be unreliable)

### Google Sign-In Not Working
- Verify Google Sign-In SDK is properly installed
- Check `GoogleService-Info.plist` is added to project
- Ensure OAuth client ID is correctly configured
- Check bundle identifier matches Google Cloud Console

### Aadhaar Verification Fails
- Verify backend is reachable
- Check Aadhaar number is 12 digits
- Ensure backend Aadhaar validation service is running
- Check API logs for error details

### OTP Not Received
- Check email address is correct
- Look in spam/junk folder
- Verify backend email service is configured
- Check backend logs for email sending status

---

## UI Consistency

All new features follow the existing design system:

- **Colors**: Theme.Colors (emerald primary, gray scale)
- **Typography**: System fonts with proper weights
- **Spacing**: 8, 12, 16, 20, 24 point spacing
- **Corner Radius**: 12pt for cards, 20pt for badges
- **Shadows**: Light shadows with 0.05 opacity

---

## Security Notes

- All API calls use JWT authentication
- Aadhaar data is encrypted in transit and at rest
- Location data is only used for report submission
- OTP codes expire after 10 minutes
- Google OAuth tokens are validated server-side

---

## Next Steps

1. ✅ Configure location permissions in Xcode
2. ✅ Update backend URL in APIConfig.swift
3. ⏳ (Optional) Set up Google Sign-In SDK
4. ✅ Test all features on physical device
5. ✅ Deploy backend with all endpoints active

---

For any issues or questions, please create an issue in the repository.
