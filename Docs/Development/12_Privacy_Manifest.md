# 12 — iOS Privacy Manifest

← [11_Performance](./11_Performance.md) | Next → [13_Account_Deletion](./13_Account_Deletion.md)

---

## Why This Is Required

Apple requires a `PrivacyInfo.xcprivacy` file for any app using certain system APIs. **Missing this file will cause App Store rejection.** TripNode uses `expo-secure-store` (Keychain) and several Expo internal APIs that trigger this requirement.

This file is added to the Xcode project in **Phase 5** via EAS Build's `app.json` plugin config.

---

## `PrivacyInfo.xcprivacy` Full Content

File location: `ios/TripNode/PrivacyInfo.xcprivacy`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
  "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>

  <key>NSPrivacyAccessedAPITypes</key>
  <array>

    <!-- expo-secure-store uses the Keychain (UserDefaults API category) -->
    <dict>
      <key>NSPrivacyAccessedAPIType</key>
      <string>NSPrivacyAccessedAPICategoryUserDefaults</string>
      <key>NSPrivacyAccessedAPITypeReasons</key>
      <array>
        <string>CA92.1</string>
      </array>
    </dict>

    <!-- System boot time — used by Expo internals -->
    <dict>
      <key>NSPrivacyAccessedAPIType</key>
      <string>NSPrivacyAccessedAPICategorySystemBootTime</string>
      <key>NSPrivacyAccessedAPITypeReasons</key>
      <array>
        <string>35F9.1</string>
      </array>
    </dict>

    <!-- File timestamp APIs — used by expo-file-system (indirect dep) -->
    <dict>
      <key>NSPrivacyAccessedAPIType</key>
      <string>NSPrivacyAccessedAPICategoryFileTimestamp</string>
      <key>NSPrivacyAccessedAPITypeReasons</key>
      <array>
        <string>C617.1</string>
      </array>
    </dict>

    <!-- Disk space — used by expo-image disk cache -->
    <dict>
      <key>NSPrivacyAccessedAPIType</key>
      <string>NSPrivacyAccessedAPICategoryDiskSpace</string>
      <key>NSPrivacyAccessedAPITypeReasons</key>
      <array>
        <string>E174.1</string>
      </array>
    </dict>

  </array>

  <!-- Data types collected by TripNode -->
  <key>NSPrivacyCollectedDataTypes</key>
  <array>

    <!-- Email address — linked to user identity, used for account functionality -->
    <dict>
      <key>NSPrivacyCollectedDataType</key>
      <string>NSPrivacyCollectedDataTypeEmailAddress</string>
      <key>NSPrivacyCollectedDataTypeLinked</key>
      <true/>
      <key>NSPrivacyCollectedDataTypeTracking</key>
      <false/>
      <key>NSPrivacyCollectedDataTypePurposes</key>
      <array>
        <string>NSPrivacyCollectedDataTypePurposeAppFunctionality</string>
      </array>
    </dict>

    <!-- User ID — linked, used for account functionality -->
    <dict>
      <key>NSPrivacyCollectedDataType</key>
      <string>NSPrivacyCollectedDataTypeUserID</string>
      <key>NSPrivacyCollectedDataTypeLinked</key>
      <true/>
      <key>NSPrivacyCollectedDataTypeTracking</key>
      <false/>
      <key>NSPrivacyCollectedDataTypePurposes</key>
      <array>
        <string>NSPrivacyCollectedDataTypePurposeAppFunctionality</string>
      </array>
    </dict>

  </array>

  <!-- TripNode does not use tracking domains -->
  <key>NSPrivacyTrackingDomains</key>
  <array/>

  <!-- TripNode does not track users across apps/websites -->
  <key>NSPrivacyTracking</key>
  <false/>

</dict>
</plist>
```

---

## EAS Build Integration (`app.json`)

When using EAS Build (managed workflow), declare privacy manifest entries via `expo-build-properties` plugin. This is the alternative to manually editing the `ios/` folder.

```json
{
  "expo": {
    "plugins": [
      [
        "expo-build-properties",
        {
          "ios": {
            "privacyManifests": {
              "NSPrivacyAccessedAPITypes": [
                {
                  "NSPrivacyAccessedAPIType": "NSPrivacyAccessedAPICategoryUserDefaults",
                  "NSPrivacyAccessedAPITypeReasons": ["CA92.1"]
                },
                {
                  "NSPrivacyAccessedAPIType": "NSPrivacyAccessedAPICategorySystemBootTime",
                  "NSPrivacyAccessedAPITypeReasons": ["35F9.1"]
                },
                {
                  "NSPrivacyAccessedAPIType": "NSPrivacyAccessedAPICategoryFileTimestamp",
                  "NSPrivacyAccessedAPITypeReasons": ["C617.1"]
                },
                {
                  "NSPrivacyAccessedAPIType": "NSPrivacyAccessedAPICategoryDiskSpace",
                  "NSPrivacyAccessedAPITypeReasons": ["E174.1"]
                }
              ]
            }
          }
        }
      ]
    ]
  }
}
```

---

## Checklist Before Submission

- [ ] `PrivacyInfo.xcprivacy` is present in the Xcode project (visible in Xcode file navigator)
- [ ] All four `NSPrivacyAccessedAPITypes` entries are declared
- [ ] `NSPrivacyCollectedDataTypes` lists email and user ID
- [ ] `NSPrivacyTracking` is `false`
- [ ] Privacy policy URL is set in App Store Connect (must describe the data collection)
- [ ] Run `npx expo prebuild` after any change to privacy manifest entries
- [ ] Verify file is included in the EAS build by checking the generated `ios/` folder before submission

> **Note:** Apple's automated review will flag missing entries during the submission pipeline. Fix these before manual review begins to avoid delays.
