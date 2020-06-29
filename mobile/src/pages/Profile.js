import React from 'react';
import { WebView } from 'react-native-webview';

import styles from "./styles/profileStyles";

function Profile({ navigation }) {
  // Obter param. da rota de navegação recebida anteriormente (Main)
  const githubUsername = navigation.getParam('github_username');

  return <WebView style={ styles.profile }
    source={{ uri: `https://github.com/${githubUsername}` }} />
};

export default Profile;
