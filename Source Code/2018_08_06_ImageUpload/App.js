/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
    ViewPropTypes
} from 'react-native';

import {
    StackNavigator,
} from 'react-navigation';

import splash from './app/splash';
import home from './app/main/home';
import login from './app/user_manage/login';
import register from './app/user_manage/signup';

const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' +
    'Cmd+D or shake for dev menu',
  android: 'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu',
});

const Nav = StackNavigator({
    /*Splash : {screen: splash},*/
    Login : {screen: login},
    Register : {screen: register},
    Home : {screen: home},
}, {
    headerMode: 'none',
});

export default class App extends Component{
  render() {
    return (
      <Nav/>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
