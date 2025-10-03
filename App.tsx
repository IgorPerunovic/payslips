import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PayslipsProvider } from "./src/context/mainContext";
import * as MediaLibrary from 'expo-media-library';

import HomeScreen from './src/screens/HomeScreen';
import DetailsScreen from './src/screens/DetailsScreen';

export type RootStackParamList = {
  Home: undefined;
  Details: {payslipIndex: number};
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();

  requestPermission();
  return (
    <PayslipsProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Details" component={DetailsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </PayslipsProvider>
  );
}
