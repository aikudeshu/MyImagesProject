/**
* Sample React Native App
* https://github.com/facebook/react-native
* @flow
*/

import React, { Component } from 'react';
import {
	AppRegistry,
	StyleSheet,
	Text,
	View,
	TouchableOpacity,
	TextInput
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Animatable from 'react-native-animatable';
import {BubblesLoader, TextLoader} from 'react-native-indicator';
import Toast from 'react-native-simple-toast';
import _global from '../global';
const FBSDK = require('react-native-fbsdk');
var SharedPreferences = require('react-native-shared-preferences');
const {
    LoginManager,
    LoginButton,
    AccessToken
} = FBSDK;

export default class LoginScreen extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
        	emailtext:'',
            emailborderColor:'gray',
        	passwordtext:'',
            passwordborderColor:'gray',
			isLogging :false,
		}

        this.login = this._login.bind(this);
        this.register = this._register.bind(this);
        this.onFacebookSignIn  = this._onFacebookSignIn.bind(this);
    }
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
                //navigate('Login');
            }
        });


	}
    validateEmail = (email) => {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    };

    _login(index){
        console.log('login clicked'); // eslint-disable-line
		if (index === 0){
			if (this.state.emailtext === ''){
                Toast.show('Email is required.', Toast.LONG);
                this.emailInput.focus();
                this.setState({emailborderColor:'red',emailtext:''});
                return;
			}else if (!this.validateEmail(this.state.emailtext)) {
                Toast.show("Email Validation Error", Toast.LONG);
                this.setState({emailborderColor:'red',emailtext:''});
                this.emailInput.focus();
                return;
            } else if (this.state.passwordtext === '') {
				Toast.show("Password is required", Toast.LONG);
                this.passwordInput.focus();
                this.setState({passwordborderColor:'red',passwordtext:''});
                return;
			}
			this.setState({
				isLogging:true
			});
            fetch(_global.baseURL + 'login/'
				+ this.state.emailtext + '/'
                + this.state.passwordtext + '/', {
                //fetch('http://facebook.github.io/react-native/movies.json', {
                method: 'get',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                }
            }).then((response) => response.json())
                .then((responseJson) => {
                    console.log(JSON.stringify(responseJson));
                    this.setState({
                        isLogging:false
                    });
                    const {message, userID} = responseJson;
                    if (message === 'success'){
                        SharedPreferences.setItem("user_id",userID + "");
                        SharedPreferences.setItem("isLoggedIn","true");
                        SharedPreferences.getItem("user_id", function (value) {
                            console.log("Saved UserID : " + value);
                        })
                        SharedPreferences.getItem("isLoggedIn", function (value) {
                            console.log("isLoggedIn : " + value);
                        })
                        _global.loggedUserID = userID;
                        const { navigate } = this.props.navigation;
                        navigate("Home");
					}else{
                        this.setState({
                            emailtext:'',
                            emailborderColor:'red',
                            passwordtext:'',
                            passwordborderColor:'red',
                        });
                        this.emailInput.focus();
                        Toast.show("Email and password input error!, Please try again.", Toast.LONG);
                    }

                })
                .catch((error) => {
                    console.error(error);
                    Toast.show("Login Failed! Please try again!", Toast.LONG);
                    this.setState({
                        emailtext:'',
                        emailborderColor:'red',
                        passwordtext:'',
                        passwordborderColor:'red',
                    });
                    this.emailInput.focus();
                });
		}
		else if (index === 1){
		    console.log("Index : " + index);
            this._onFacebookSignIn();
        }
    };

    _onFacebookSignIn = async() => {
        console.log("Facebook Login Starting...");
        LoginManager.logInWithReadPermissions(['email','public_profile']).then((result)=>{
            if (result.isCancelled) {
                alert('Login cancelled'+JSON.stringify(result));
            } else {
                AccessToken.getCurrentAccessToken().then((data)=>{
                    //alert('Login success with permissions:'+JSON.stringify(data))
                    let accessToken = data.accessToken;
                    console.log("Requesting");
                    fetch('https://graph.facebook.com/v2.5/me?fields=email,name&access_token=' + accessToken)
                        .then((response) => response.json())
                        .then((json) => {
                            console.log(JSON.stringify(json));
                            console.log(json.email + " : " + json.name);
                            //fetch('http://127.0.0.1:8080/signup/', {
                            fetch(_global.baseURL + 'signup', {
                                method: 'POST',
                                headers: {
                                    Accept: 'application/json',
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    email: json.email,
                                    nickname: json.name
                                }),
                            }).then((response) => response.json())
                                .then((responseJson) => {
                                    this.setState({
                                        isRegistering:false
                                    });
                                    console.log(JSON.stringify(responseJson));
                                    const {message, userID} = responseJson;
                                    if (message === "existed" || message === "success") {
                                        const { navigate } = this.props.navigation;
                                        _global.loggedUserID = userID;
                                        navigate("Home");
                                    }
                                })
                                .catch((error) => {
                                    console.error(error);

                                });
                        })
                        .catch(() => {
                            reject('ERROR GETTING DATA FROM FACEBOOK')
                        })
                })
            }
        }).catch((error)=>{
            alert('Login fail with error: ' + JSON.stringify(error));
        })
    }

    _register(){
        console.log('register clicked'); // eslint-disable-line
        const { navigate } = this.props.navigation;
        navigate('Register');
    };

	render() {
		return(
			<Animatable.View
                animation="fadeInRight"
                delay={1200}
                duration={700}
                ref={(ref) => { this.animationView = ref; }}
				style={styles.container}>
                <View style={{flex:1, width:'100%', justifyContent: 'center', alignItems: 'center'}}/>
				<View style={styles.mainContainer}>
					<View style={styles.emailContainer}>
                        <TextInput
                            ref={(ref) => { this.emailInput = ref; }}
                            keyboardType={'email-address'}
                            underlineColorAndroid = {this.state.emailborderColor}
                            style={{height: 50,flex:1, width:'100%'}}
                            onChangeText={(text) => this.setState({emailtext:text})}
                            placeholder={'Email'}
                            value={this.state.emailtext}
                        />
					</View>
                    <View style={styles.passwordContainer}>
                        <TextInput
                            ref={(ref) => { this.passwordInput = ref; }}
                            secureTextEntry={true}
                            underlineColorAndroid = {this.state.passwordborderColor}
                            style={{height: 50,flex:1, width:'100%'}}
                            onChangeText={(text) => this.setState({passwordtext:text})}
                            placeholder={'Password'}
                            value={this.state.passwordtext}
                        />
                    </View>
                    <View style={styles.loginContainer}>
                        {
                            this.state.isLogging?
                                <BubblesLoader size={20} color={'white' } dotRadius={6}/>:
                                <TouchableOpacity onPress={() => this._login(0)} style={{flex:1,flexDirection:'row',justifyContent:'center',alignItems:'center',marginLeft:40,marginRight:40}}>
                                    <Text style={{flex:1,color:'white',textAlign:'center',fontSize:18}}>Login</Text>
                                </TouchableOpacity>
                        }
                    </View>
				</View>
                <View style={[styles.mainContainer,{flex:1}]}>

                    <View style={styles.socialContainer}>
                        <TouchableOpacity onPress={() => this._login(1)} style={{flex:1,justifyContent:'center',alignItems:'center'}}>
                            <Icon name={'facebook-box'} color="#0087e0" size={40} />
                        </TouchableOpacity>
                        {/*<TouchableOpacity onPress={() => this._login(2)} style={{flex:1,justifyContent:'center',alignItems:'center'}}>
                            <Icon name={'email'} color="#0087e0" size={40} />
                        </TouchableOpacity>*/}
                    </View>
                    <View style={styles.signupContainer}>
                        <Text style={{color:'#0087e0',textAlign:'right',marginRight:10,fontSize:16}}>Don't you have an account?</Text>
                        <TouchableOpacity onPress={() => this._register()} style={{justifyContent:'flex-end',alignItems:'center'}}>
                            <Text style={{color:'#0087e0', textAlign:'left',fontSize:18,textDecorationLine: 'underline'}}>Register</Text>
                        </TouchableOpacity>
                    </View>
                </View>

			</Animatable.View>
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
	mainContainer:{
		backgroundColor:'#ffffff',
		flex:3,
		justifyContent:'center',
		alignItems:'center',
		flexDirection:'column',
		width:'100%'
	},
	emailContainer:{
		flexDirection:'row',
		height:40,
		paddingLeft:40,
		paddingRight:40,
        justifyContent:'center',
        alignItems:'center',
	},
	mobileContainer:{
        flexDirection:'row',
        height:40,
        marginTop:10,
        paddingLeft:40,
        paddingRight:40,
        justifyContent:'center',
        alignItems:'center',
	},
    passwordContainer:{
        flexDirection:'row',
        height:40,
        marginTop:10,
        paddingLeft:40,
        paddingRight:40,
        justifyContent:'center',
        alignItems:'center',
    },
	loginContainer:{
        flexDirection:'row',
		height:40,
        width:'80%',
		marginTop:20,
        justifyContent:'center',
        alignItems:'center',
		backgroundColor:'#0087e0',
		borderRadius:7
	},
	socialContainer:{
        flexDirection:'row',
		width:120,
        height:50,
        marginTop:20,
        justifyContent:'center',
        alignItems:'center',
	},
	signupContainer:{
        flexDirection:'row',
		width:300,
        height:50,
        justifyContent:'flex-end',
        alignItems:'center',
	}



});

AppRegistry.registerComponent('App', () => App);
