import React, { Fragment } from 'react';
import { StatusBar, YellowBox } from 'react-native';

import Routes from './src/routes';

YellowBox.ignoreWarnings([
  'Unrecognized WebSocket'
]);

export default function App() {
  return (
    <Fragment>
      <StatusBar barStyle="light-content" />

      <Routes />
    </Fragment>
  );
};
