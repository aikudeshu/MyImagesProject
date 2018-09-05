/**
* Sample React Native App
* https://github.com/facebook/react-native
* @flow
*/

import React, { Component } from 'react';
import {
	AppRegistry,
	StyleSheet,
	View,
    ImageBackground,
} from 'react-native';
import {BubblesLoader, TextLoader} from 'react-native-indicator';
var SharedPreferences = require('react-native-shared-preferences');
import _global from "./global";


export default class SplashScreen extends React.Component {
	componentDidMount() {
        const { navigate } = this.props.navigation;
        SharedPreferences.getItem("isLoggedIn", function (value) {
            console.log(value);
            if (value == "true"){
                SharedPreferences.getItem("user_id", function(value){
                    _global.loggedUserID = value;
                    navigate("Home");
                });

            }else{
                navigate('Login');
            }
        });
        //navigate('Register');
        //navigate('Home');
	}

	render() {
		return(
			<ImageBackground source={require('./images/splash.png')} style={styles.container}>
				<View style={{flex:1}}/>
				<View style={{flex:1,justifyContent:'center',
                    alignItems:'center',}}>
					<BubblesLoader
						color={'#1e90ff'}/>
					<TextLoader text="Loading" />
				</View>
			</ImageBackground>
		);
	}
}

const styles = StyleSheet.create({
	
	container: {
		backgroundColor: "#ffffff",
		flex: 1,
		justifyContent:'center',
		alignItems:'center',
		flexDirection: "column",
	},
	splashLogo: {
		flex:1,

	}

});

AppRegistry.registerComponent('App', () => App);
