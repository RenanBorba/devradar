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
