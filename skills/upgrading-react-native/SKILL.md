---
name: upgrading-react-native
description: Upgrading React Native version workflow: tools, dependencies, and native deprecation mitigation.
---

# Upgrading React Native

## Overview

Upgrading React Native versions can be challenging due to tight coupling with native project templates, dependency lock-ins (like React versions), and platform-specific breaking changes (Xcode, Android Gradle Plugin). Follow these patterns to ensure safe, repeatable upgrades.

## 1. Pre-Upgrade Checklist

1. **Check the Upgrade Helper**: Always consult the [React Native Upgrade Helper](https://reactnative.dev/upgrade-helper) to see a diff of changes in native files (`ios/` and `android/`) between your current version and target version.
2. **Review peer dependencies**: Ensure key community libraries (e.g., `react-native-navigation`, `react-native-reanimated`) are compatible with the target version.
3. **Commit your state**: Make sure your working directory is absolutely clean. Create a temporary branch `chore/upgrade-react-native-[target-version]`.

## 2. Upgrade Execution Workflow

```bash
# 1. Update React Native and its matching React peer dependency
npm install react-native@0.X.Y react@Y.Y.Y --save

# 2. Run the React Native Community upgrade CLI tool
npx react-native upgrade

# 3. Clean local native cache directories
cd android && ./gradlew clean
cd ../ios && rm -rf Build Pods Podfile.lock && pod install
```

## 3. Resolving Android Build Issues

- **Gradle Alignment**: Verify the Gradle wrapper version matches in `android/gradle/wrapper/gradle-wrapper.properties` and the Android Gradle Plugin version in `android/build.gradle`.
- **Namespace Error**: Since React Native 0.71+, native packages must declare a `namespace` in their `build.gradle` rather than relying on `package` in `AndroidManifest.xml`.
- **Kotlin Standard Library**: Align Kotlin standard library versions if libraries throw version conflict errors during assembly.

## 4. Resolving iOS Build Issues

- **Cocoapods Resolution**: If `pod install` fails, run `pod repo update` to sync regional specs.
- **Xcode Compatibility**: Upgrading to newer React Native versions might require updating Xcode to the latest SDK version.
- **Header Search Paths**: Clear custom header search paths if they overwrite React Native core imports.

## 5. Verification Gate

- Run **Metro bundler** with reset cache option:
  ```bash
  npx react-native start --reset-cache
  ```
- Build and run on simulator/emulator:
  ```bash
  # iOS
  npx react-native run-ios
  
  # Android
  npx react-native run-android
  ```
- Check runtime logs for redboxes or warnings about deprecations or native module mismatches.
