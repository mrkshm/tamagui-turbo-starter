module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      [
        'babel-preset-expo',
        {
          unstable_transformImportMeta: true,
        },
      ],
    ],
    plugins: [
      // Add Tamagui babel plugin
      [
        '@tamagui/babel-plugin',
        {
          components: ['tamagui', '@tamagui/lucide-icons'],
          config: '../../packages/ui/src/config/tamagui.config.ts',
          logTimings: true,
          disableExtraction: process.env.NODE_ENV === 'development',
        },
      ],
      // Add React Native Reanimated plugin
      'react-native-reanimated/plugin',
    ],
  };
};
