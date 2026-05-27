---
name: react-native-best-practices
description: React Native best practices for performance, list rendering, animations, architecture, profiling, and app sizing.
---

# React Native Best Practices

## Overview

High-performance, production-ready React Native development guidelines to build fluid, 60fps applications across iOS and Android. This covers rendering optimization, thread management, and bundling efficiency.

## 1. Thread and Rendering Optimization

- **JS vs. UI Thread**: Keep the JS thread free of expensive synchronous operations. Offload animations to the native UI thread.
- **Memoization**: Prevent unnecessary re-renders using `React.memo`, `useMemo`, and `useCallback` for expensive components, calculations, and callbacks passed as props.
- **Hermes Engine**: Always enable the Hermes JavaScript engine in `android/app/build.gradle` and `ios/Podfile` for faster startup and lower memory footprint.

## 2. List Rendering Performance (FlatList / FlashList)

- **Do NOT**: Use anonymous arrow functions or inline objects in render props (e.g., `renderItem={({ item }) => <View ... />}`). These create new function instances every render.
- **Do**: Extract `renderItem` and `keyExtractor` to standalone functions or memoized callbacks.
- **Optimizations**:
  - `initialNumToRender`: Keep it small (e.g., 5-10) to speed up initial mount.
  - `maxToRenderPerBatch`: Set conservatively to prevent blocking the main thread.
  - `windowSize`: Set to a moderate value (e.g., 5 or 7) to limit memory overhead of off-screen items.
  - `getItemLayout`: Implement if items have a fixed height to bypass dynamic measurement passes.

```typescript
import React, { useCallback } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

const ListItem = React.memo(({ title }: { title: string }) => (
  <View style={styles.item}>
    <Text>{title}</Text>
  </View>
));

export function OptimizedList({ data }: { data: Array<{ id: string; title: string }> }) {
  const renderItem = useCallback(({ item }: { item: { title: string } }) => (
    <ListItem title={item.title} />
  ), []);

  const keyExtractor = useCallback((item: { id: string }) => item.id, []);

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      windowSize={5}
      getItemLayout={(data, index) => ({
        length: 60,
        offset: 60 * index,
        index,
      })}
    />
  );
}

const styles = StyleSheet.create({
  item: {
    height: 60,
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
});
```

## 3. Styling & Layout

- **Stylesheet.create**: Always use `StyleSheet.create` instead of inline styles. Inline styles recreate object references on every render, triggering child re-renders.
- **Flexbox**: Prefer Flexbox for layouts rather than absolute positioning where possible to ensure clean responsive scaling.
- **Safe Area**: Wrap top-level layouts in `SafeAreaView` from `react-native-safe-area-context`.

## 4. Resource and Asset Optimization

- **FastImage**: Use `react-native-fast-image` instead of the default `Image` component for aggressive disk/memory caching and flickering elimination.
- **Vector Graphics**: Use SVG icons (`react-native-svg` and `react-native-svg-transformer`) rather than heavy PNG assets to reduce bundle size.
- **Bundle Analysis**: Use React Native Bundle Visualizer (`react-native-bundle-visualizer`) to identify large dependencies and optimize code-splitting.
