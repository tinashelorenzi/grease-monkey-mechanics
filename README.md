# Grease Monkey Mechanics

A React Native app with NativeWind and Tailwind CSS v3 integration.

## ✅ Setup Complete

This project uses NativeWind v2 with Tailwind CSS v3 for styling React Native components.

### Dependencies

- `nativewind@2.0.11` - NativeWind for React Native (stable version)
- `tailwindcss@3.4.0` - Tailwind CSS v3
- `autoprefixer` - Required for PostCSS processing

### Configuration Files

- `tailwind.config.js` - Tailwind CSS configuration
- `metro.config.js` - Metro bundler configuration
- `babel.config.js` - Babel configuration with NativeWind plugin
- `postcss.config.js` - PostCSS configuration for Tailwind processing
- `global.css` - Global CSS with Tailwind directives
- `nativewind-env.d.ts` - TypeScript declarations for NativeWind

## 🚀 Usage

### Basic Styling

Instead of using `StyleSheet`, you can now use Tailwind CSS classes:

```tsx
// Before (StyleSheet)
<View style={styles.container}>
  <Text style={styles.text}>Hello World</Text>
</View>

// After (NativeWind)
<View className="flex-1 bg-white items-center justify-center">
  <Text className="text-lg text-gray-800 font-semibold">Hello World</Text>
</View>
```

### Available Classes

All standard Tailwind CSS classes are available:

- **Layout**: `flex`, `flex-1`, `items-center`, `justify-center`, `flex-row`
- **Spacing**: `p-4`, `m-2`, `px-6`, `py-3`, `space-y-3`
- **Colors**: `bg-blue-500`, `text-white`, `border-gray-300`
- **Typography**: `text-lg`, `font-bold`, `text-center`, `text-2xl`
- **Borders**: `rounded-lg`, `border`, `border-2`, `shadow-lg`
- **Interactive**: `active:bg-indigo-700` (pseudo-classes)
- **And many more...**

### Custom Colors

You can add custom colors in `tailwind.config.js`:

```js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#007AFF',
        secondary: '#5856D6',
      },
    },
  },
}
```

## 🧪 Testing

The app includes a comprehensive test component (`components/NativeWindTest.tsx`) that demonstrates:

- Layout and spacing classes
- Color and background variations
- Typography scales
- Interactive elements
- Borders and shadows
- Pseudo-classes

## 🛠️ Development

```bash
# Start the development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run on Web
npm run web
```

## 🔧 Troubleshooting

### Cache Issues

If you encounter cache-related errors:

1. Clear the cache:
   ```bash
   rm -rf node_modules/.cache
   ```

2. Restart the development server:
   ```bash
   npm start
   ```

### Babel Configuration

The `babel.config.js` file is required for NativeWind to work:

```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'nativewind/babel',
    ],
  };
};
```

### PostCSS Configuration

NativeWind v2 requires a `postcss.config.js` file:

```js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

### TypeScript Support

Make sure `nativewind-env.d.ts` is included in your `tsconfig.json`:

```json
{
  "include": [
    "**/*.ts",
    "**/*.tsx",
    "nativewind-env.d.ts"
  ]
}
```

## 📝 Notes

- Using NativeWind v2 (stable) instead of v3 (beta) for better reliability
- Make sure to restart the Metro bundler after configuration changes
- The `className` prop works on all React Native components
- Hot reload works seamlessly with NativeWind
- All Tailwind CSS v3 features are supported
