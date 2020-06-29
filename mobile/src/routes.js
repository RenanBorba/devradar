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