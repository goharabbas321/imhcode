---
name: react-native-brownfield-migration
description: Incremental migration strategy to adopt React Native or Expo in native apps with setup, packaging, and integration steps.
---

# React Native Brownfield Migration

## Overview

Brownfield integration allows developers to incrementally embed React Native views or features into an existing native iOS or Android application. This reduces migration risk and allows teams to share components without rewriting the entire host application.

## 1. Architecture Strategy

- **Shared Bridge**: Instantiate a single, global `RCTBridge` (iOS) or `ReactInstanceManager` (Android) and reuse it across multiple screens to save startup time and memory.
- **Micro-Frontends**: Design separate React components as distinct entry points registered via `AppRegistry.registerComponent`.
- **Cross-Platform Communication**: Use native modules (`RCTEventEmitter` or Custom Modules) to pass events and data boundaries between Native host view controllers and React Native views.

## 2. iOS Integration

### Podfile Setup

Add React Native dependencies to your native iOS `Podfile`:

```ruby
platform :ios, '15.0'

require_relative '../node_modules/react-native/scripts/react_native_pods'
require_relative '../node_modules/@react-native-community/cli-platform-ios/native_modules'

target 'MyNativeApp' do
  use_react_native!(
    :path => "../node_modules/react-native",
    :hermes_enabled => true
  )
end
```

### RCTRootView Initialization

```objc
// SharedBridgeManager.h
#import <React/RCTBridge.h>

@interface SharedBridgeManager : NSObject
+ (instancetype)sharedInstance;
@property (nonatomic, strong) RCTBridge *bridge;
@end

// EmbeddedViewController.m
#import "SharedBridgeManager.h"
#import <React/RCTRootView.h>

@implementation EmbeddedViewController
- (void)viewDidLoad {
    [super viewDidLoad];
    
    RCTBridge *bridge = [SharedBridgeManager sharedInstance].bridge;
    RCTRootView *rootView = [[RCTRootView alloc] initWithBridge:bridge
                                                    moduleName:@"MyEmbeddedFeature"
                                             initialProperties:@{@"tenantId": @"123"}];
    rootView.frame = self.view.bounds;
    [self.view addSubview:rootView];
}
@end
```

## 3. Android Integration

### Gradle Configuration

Configure your native `settings.gradle` and `app/build.gradle`:

```groovy
// settings.gradle
includeBuild('../node_modules/@react-native/gradle-plugin')

// app/build.gradle
apply plugin: "com.facebook.react"

dependencies {
    implementation("com.facebook.react:react-android")
    implementation("com.facebook.react:hermes-android")
}
```

### ReactRootView Setup

```java
public class EmbeddedFragment extends Fragment {
    private ReactRootView mReactRootView;
    private ReactInstanceManager mReactInstanceManager;

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        mReactRootView = new ReactRootView(getContext());
        mReactInstanceManager = ((MainApplication) getActivity().getApplication()).getReactInstanceManager();
        
        Bundle initialProperties = new Bundle();
        initialProperties.putString("tenantId", "123");
        
        mReactRootView.startReactApplication(
            mReactInstanceManager,
            "MyEmbeddedFeature",
            initialProperties
        );
        return mReactRootView;
    }
}
```

## 4. Best Practices

1. **Pre-warm the Bridge**: Initialize the react bridge early in the native application lifecycle (e.g., `AppDelegate` or `Application.onCreate()`) to eliminate view load delays.
2. **Handle Back Press**: Wire Android's native back button dispatch to React Native's back handler using the `ReactInstanceManager` hooks.
3. **Memory management**: Unmount and release `ReactRootView` instances when views are popped from the navigation stack to avoid native memory leaks.
