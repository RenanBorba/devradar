<div align="center">

## Rocketseat - Semana OmniStack 10.0
# Projeto - Aplicação DevRADAR Mobile React Native

</div>

<br>

<div align="center">

[![Generic badge](https://img.shields.io/badge/Made%20by-Renan%20Borba-purple.svg)](https://shields.io/) [![Build Status](https://img.shields.io/github/stars/RenanBorba/devradar.svg)](https://github.com/RenanBorba/devradar) [![Build Status](https://img.shields.io/github/forks/RenanBorba/devradar.svg)](https://github.com/RenanBorba/devradar) [![made-for-VSCode](https://img.shields.io/badge/Made%20for-VSCode-1f425f.svg)](https://code.visualstudio.com/) [![npm version](https://badge.fury.io/js/react-native.svg)](https://badge.fury.io/js/react-native) [![Open Source Love svg2](https://badges.frapsoft.com/os/v2/open-source.svg?v=103)](https://github.com/ellerbrock/open-source-badges/)

</div>

<br>

Aplicação Front-end desenvolvida em React Native para o aplicativo DevRADAR, voltada para cadastro (web) e busca de devs de acordo com as tecnologias filtradas no raio de até 10km, permitindo, assim, a atualização em tempo real na versão mobile (mobile) via WebSocket.

<br><br>

<div align="center">

![000](https://user-images.githubusercontent.com/48495838/80157764-4871d200-859d-11ea-9509-9535460a0204.jpg)

</div>

<br><br>

## :rocket: Tecnologias
<ul>
  <li>Expo</li>
  <li>Components</li>
  <li>Routes</li>
  <li>react-navigation-stack</li>
  <li>Services API</li>
  <li>Axios</li>
  <li>react-native-maps</li>
  <li>MapView</li>
  <li>Marker</li>
  <li>Callout</li>
  <li>expo-location</li>
  <li>useState</li>
  <li>useEffect</li>
  <li>socket.io-client WebSocket</li>
  <li>react-native-webview</li>
  <li>StyleSheet</li>
  <li>TextInput</li>
  <li>TouchableOpacity</li>
  <li>vector-icons</li>
</ul>

<br><br>

## :arrow_forward: Start
<ul>
  <li>npm install</li>
  <li>npm run start / npm start</li>
</ul>

<br><br><br>

## :mega: ⬇ Abaixo, as principais estruturas e interfaces:

<br><br><br>

## App.js
```js
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
```

<br><br>

## src/routes.js
```js
import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';

import Main from './pages/Main';
import Profile from './pages/Profile';

const Routes = createAppContainer(
  createStackNavigator({
    Main: {
      screen: Main,
      navigationOptions: {
        title: 'DevRADAR™'
      }
    },
    Profile: {
      screen: Profile,
      navigationOptions: {
        title: 'Perfil no Github'
      }
    }
  }, {
    defaultNavigationOptions: {
      headerStatusBarHeight: 0,
      headerTitleAlign: 'center',
      headerTintColor: '#FFD',
      headerStyle: {
        backgroundColor: '#3B5BFB'
      },
      headerBackTitleVisible: false
    }
  })
);

export default Routes;
```

<br><br>

## src/services/api.js
```js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3333'
});

export default api;
```

<br><br>

## src/pages/Main.js
```js
import
  React,
  {
    Fragment,
    useState,
    useEffect
  } from 'react';

import
  {
    Image,
    View,
    Text,
    TextInput,
    TouchableOpacity
  } from 'react-native';

import * as Location
  from 'expo-location';

import
  MapView,
  {
    Marker,
    Callout
  } from 'react-native-maps';

import { MaterialIcons } from '@expo/vector-icons';

import api from '../services/api';
import
  { 
    connect,
    disconnect,
    subscribeToNewDevs
  } from '../services/socket';

import styles from "./styles/mainStyles";

function Main({ navigation }) {
  const [devs, setDevs] = useState([]);
  const [currentRegion, setCurrentRegion] = useState(null);
  const [techs, setTechs] = useState('');

  useEffect(() => {
    // Carregar posição inicial
    async function loadInitialPosition() {
      // Requerir permissão do usuário
      const { granted }  = await Location.requestPermissionsAsync();

      // Se tiver permissão, buscar Posição atual
      if(granted) {
        const { coords } = await Location.getCurrentPositionAsync({
          // Com false, temos infos menos precisas, como do wifi, 3g
          enableHighAccuracy: true
        });

        // Destruturar coordenadas de location (coords)
        const { latitude, longitude } = coords

        setCurrentRegion({
          latitude,
          longitude,
          latitudeDelta: 0.0140,
          longitudeDelta: 0.0140
        })
      }
    }

    loadInitialPosition();
  }, []);

  useEffect(() => {
    subscribeToNewDevs(dev => setDevs([...devs, dev]));
  }, [devs]);

  async function setupWebsocket() {
    disconnect();

    const { latitude, longitude } = currentRegion;

    connect(
      latitude,
      longitude,
      techs
    );
  }

  async function loadDevs() {
    const { latitude, longitude } = currentRegion;

    // Obter params. na rota de Busca da api
    const response = await api.get('/search', {
      params: {
        latitude,
        longitude,
        techs
      }
    });

    setDevs(response.data.devs);

    setupWebsocket();
  }

  // Atualizar região navegada pelo usuário no mapa
  function handleRegionChanged( region ) {
    setCurrentRegion(region);
  }

  if(!currentRegion){
    return null;
  }

  return (
    <Fragment>
      <MapView
        onRegionChangeComplete={ handleRegionChanged }
        initialRegion={ currentRegion }
        style={ styles.map }
      >
        { devs.map(dev => (
          <Marker
          key={ dev._id }
          coordinate={{
            longitude: dev.location.coordinates[0],
            latitude: dev.location.coordinates[1]
          }}
        >
          <Image
            style={ styles.avatar }
            source={{ uri: dev.avatar_url }}
          />

          <Callout onPress={() => {
            // Navegação (navigation prop)
            navigation.navigate('Profile', { github_username: dev.github_username });
          }}>
            <View style={ styles.callout }>
              <Text style={ styles.devName }>{ dev.name }</Text>
              <Text style={ styles.devBio }>{ dev.bio }</Text>
              <Text style={ styles.devTechs }>{ dev.techs.join(', ') }</Text>
            </View>
          </Callout>
        </Marker>
        ))}
      </MapView>

      <View style={ styles.searchForm }>
        <TextInput
          style={ styles.searchInput }
          placeholder="Buscar devs por tecnologias.."
          placeholderTextColor="#999"
          autoCapitalize="words"
          autoCorrect={false}
          value={ techs }
          onChangeText={ setTechs }
        />

        <TouchableOpacity
          onPress={ loadDevs }
          style={ styles.loadButton }>
          <MaterialIcons
            name="my-location"
            size={20}
            color="#FFF"
          />
        </TouchableOpacity>
      </View>
    </Fragment>
  );
};

export default Main;
```

<br><br>

## src/pages/styles/mainStyles.js
```js
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  map: {
    flex: 1
  },

  avatar: {
    width: 54,
    height: 54,
    borderRadius: 4,
    borderWidth: 4,
    borderColor: '#FFF'
  },

  callout: {
    width: 260
  },
 
  devName: {
    fontWeight: 'bold',
    fontSize: 16
  },

  devBio: {
    color: '#666',
    marginTop: 5
  },

  devTechs: {
    marginTop: 5
  },

  searchForm: {
    // Form por cima do mapa
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    zIndex: 5,
    flexDirection: 'row'
  },

  searchInput: {
    flex: 1,
    height: 50,
    backgroundColor: '#FFF',
    borderRadius: 25,
    paddingHorizontal: 20,
    fontSize: 16,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: {
      width: 4,
      height: 4
    },
    elevation: 2
  },

  loadButton: {
    width: 50,
    height: 50,
    backgroundColor: '#3B5BFB',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 15

  }
});

export default styles;
```

<br><br>

## src/pages/Profile.js
```js
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
```

<br><br>

## src/services/socket.js
```js
import socketio from 'socket.io-client';

const socket = socketio('http://192.168.0.104:3333', {
  autoConnect: false
});

function subscribeToNewDevs( subscribeFunction ) {
  // Ouvir message 'new-dev' do websocket da api
  socket.on('new-dev', subscribeFunction)
};

// Conexão Websocket
function connect( latitude, longitude, techs ) {
  // Enviar params
  socket.io.opts.query = {
    latitude,
    longitude,
    techs
  };

  socket.connect();
}

function disconnect() {
  if (socket.connected) {
    socket.disconnect();
  }
}

export
  {
    connect,
    disconnect,
    subscribeToNewDevs
  };
```

<br><br>

## Interface inicial

![00](https://user-images.githubusercontent.com/48495838/76792966-e904f300-67a2-11ea-9d3e-13e4e6b13715.png)
<br><br><br>

## Interface após o usuário buscar desenvolvedor filtrado por tecnologia

![01](https://user-images.githubusercontent.com/48495838/76792970-ea362000-67a2-11ea-8497-c81db0426397.png)
<br><br>

![02](https://user-images.githubusercontent.com/48495838/76792974-eaceb680-67a2-11ea-84b5-c158e730bd5d.png)
<br><br><br>

## Callout card com as informações do desenvolvedor selecionado

![03](https://user-images.githubusercontent.com/48495838/76792976-eb674d00-67a2-11ea-93b6-7417b836d0d9.png)
<br><br><br>

## Perfil no Github do desenvolvedor selecionado após click no Callout (WebView)

![04](https://user-images.githubusercontent.com/48495838/76792979-ec987a00-67a2-11ea-8e1b-2b65783f39b4.png)
<br><br><br>

## Interface após cadastro do novo Dev (proj-react-web-devradar)

![05](https://user-images.githubusercontent.com/48495838/76792982-ed311080-67a2-11ea-875f-b1be3d03f2ba.png)
