import { Platform } from 'react-native';
import ImageGalleryNative from './ImageGallery.native';
import ImageGalleryWeb from './ImageGallery.web';

// Choose the correct component per platform using ES module imports
const Comp = Platform.OS === 'web' ? ImageGalleryWeb : ImageGalleryNative;

export default Comp;
