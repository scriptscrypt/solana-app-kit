import 'fast-text-encoding';
import 'react-native-get-random-values';
import '@ethersproject/shims';

import {Buffer} from 'buffer';
global.Buffer = Buffer;

// Import polyfills early
import './src/shared/utils/polyfills';

if (typeof Settings === 'undefined') {
  global.Settings = {};
}

import {registerRootComponent} from 'expo';
import App from './App';

registerRootComponent(App);
