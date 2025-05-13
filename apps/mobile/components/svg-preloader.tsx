import React from 'react';
import { View } from '@bbook/ui';
import { Svg, Path } from 'react-native-svg';

/**
 * SVG Preloader Component
 * 
 * This component ensures that the react-native-svg module 
 * is properly initialized before other SVG components are rendered.
 * 
 * It renders a tiny, invisible SVG to force the SVG module to initialize.
 */
export const SvgPreloader = () => {
  return (
    <View style={{ width: 0, height: 0, opacity: 0, position: 'absolute' }}>
      <Svg width={1} height={1} viewBox="0 0 1 1">
        <Path d="M0,0 L1,1" stroke="transparent" />
      </Svg>
    </View>
  );
};