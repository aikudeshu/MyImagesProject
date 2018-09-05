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
    TextInput, Dimensions
} from 'react-native';
import DatePicker from 'react-native-datepicker'
import * as Animatable from 'react-native-animatable';
import {BubblesLoader, TextLoader} from 'react-native-indicator';
import RadioForm from 'react-native-radio-form-custom';
import Toast from 'react-native-simple-toast';
import ModalWrapper from "react-native-modal-wrapper";
var SharedPreferences = require('react-native-shared-preferences');
import _global from '../global';
const DEVICE_SCREEN = Dimensions.get('window');
var radio_props = [
    {label: 'Male     ', value: 0 },
    {label: 'Female', value: 1 }
];
let verifyCode = '';

export default class RegisterScreen extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
        	emailtext:'',
            emailborderColor:'gray',
        	mobiletext:'',
            mobileborderColor:'gray',
        	passwordtext:'',
            passwordborderColor:'gray',
        	confirmpasswordtext:'',
            confirmpasswordborderColor:'gray',
            genderValue:0,
        	nicknametext:'',
            nicknameborderColor:'gray',
            date:"2016-05-15",
			isRegistering :false,
            verificationCode : '',
            verificationCodeborderColor : 'gray',
            isModalVisible:false
		}
        this.register = this._register.bind(this);
    }
	componentDidMount() {
        const { navigate } = this.props.navigation;

	}

    validateEmail = (email) => {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    };

    _register(flag){
        console.log('register clicked : ' + flag); // eslint-disable-line
        if (!flag){
            if (this.state.emailtext === ''){
                Toast.show('Email is required.', Toast.LONG);
                this.emailInput.focus();
                this.setState({emailborderColor:'red',emailtext:''});
                return;
            }else if (!this.validateEmail(this.state.emailtext)) {
                Toast.show("Email Validation Error", Toast.LONG);
                this.emailInput.focus();
                this.setState({emailborderColor:'red',emailtext:''});
                return;
            }else if (this.state.mobiletext === ''){
                Toast.show('Mobile Number is required.', Toast.LONG);
                this.mobileInput.focus();
                this.setState({mobileborderColor:'red',mobiletext:''});
                return;
            }else if (this.state.passwordtext === ''){
                Toast.show('Password is required.', Toast.LONG);
                this.passwordInput.focus();
                this.setState({passwordborderColor:'red',passwordtext:''});
                return;
            }else if (this.state.passwordtext !== this.state.confirmpasswordtext){
                Toast.show('Password Match Error.', Toast.LONG);
                this.passwordInput.focus();
                this.setState({passwordborderColor:'red',passwordtext:'',confirmpasswordborderColor:'red',confirmpasswordtext:''});
                return;
            }else if (this.state.nicknametext === ''){
                Toast.show('Nick Name is required.', Toast.LONG);
                this.nicknameInput.focus();
                this.setState({nicknameborderColor:'red',nicknametext:''});
                return;
            }else if (this.state.date === '') {
                Toast.show('Birthday is required.', Toast.LONG);
                return;
            }
            this.setState({
                isRegistering:true,
            });
            var random_num = Math.floor(Math.random()*90000) + 10000;
            fetch(_global.baseURL + 'api/'
                + this.state.emailtext + '/'
                + random_num, {
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
                        isModalVisible:true
                    });
                    const {message, data} = responseJson;
                    if (message === 'success'){
                        verifyCode = data;
                        console.log(data);
                    }else Toast.show("Failed Please try again", Toast.LONG);

                })
                .catch((error) => {
                    console.error(error);
                });
        } else{
            //fetch('http://127.0.0.1:8080/signup/', {
            fetch(_global.baseURL + 'signup', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    //'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: this.state.emailtext,
                    mobile: this.state.mobiletext,
                    password: this.state.passwordtext,
                    nickname: this.state.nicknametext,
                    gender: this.state.genderValue===0?"Male":"Female",
                    dateofbirth: this.state.date,
                }),
            }).then((response) => response.json())
                .then((responseJson) => {
                    this.setState({
                        isRegistering:false
                    });
                    console.log(JSON.stringify(responseJson));
                    const {message, userID} = responseJson;
                    if (message === "existed")Toast.show("The account have already existed, please try again.",  Toast.LONG);
                    else if (message === "success") {
                        const { navigate } = this.props.navigation;
                        Toast.show("Successfully Registered...", Toast.LONG);
                        _global.loggedUserID = userID;
                        SharedPreferences.setItem("user_id",userID + "");
                        SharedPreferences.setItem("isLoggedIn","true");
                        SharedPreferences.getItem("user_id", function (value) {
                            console.log("Saved UserID : " + value);
                        })
                        SharedPreferences.getItem("isLoggedIn", function (value) {
                            console.log("isLoggedIn : " + value);
                        })
                        navigate("Home");
                    }else{
                        this.setState({
                            emailtext:'',
                            emailborderColor:'red',
                            mobiletext:'',
                            mobileborderColor:'red',
                            passwordtext:'',
                            passwordborderColor:'red',
                            confirmpasswordtext:'',
                            confirmpasswordborderColor:'red',
                            nicknametext:'',
                            nicknameborderColor:'red',
                        });
                        this.emailInput.focus();
                    }
                })
                .catch((error) => {
                    console.error(error);
                });
        }



    };

	render() {
		return(
			<Animatable.View
                animation="fadeInRight"
                delay={1200}
                duration={700}
                ref={(ref) => { this.animationView = ref; }}
				style={styles.container}>
				<View style={styles.mainContainer}>
					<View style={styles.emailContainer}>
                        <TextInput
                            ref={(ref) => { this.emailInput = ref; }}
                            keyboardType={'email-address'}
                            underlineColorAndroid = {this.state.emailborderColor}
                            style={{height: 50,flex:1, width:'100%',fontSize:14,borderColor: 'gray'}}
                            value={this.state.emailtext}
                            onChangeText={(text) => this.setState({emailtext:text})}
                            placeholder={'Email'}
                        />
					</View>
                    <View style={styles.mobileContainer}>
                        <TextInput
                            ref={(ref) => { this.mobileInput = ref; }}
                            keyboardType={'numeric'}
                            value={this.state.mobiletext}
                            underlineColorAndroid = {this.state.mobileborderColor}
                            style={{height: 50,flex:1, width:'100%',borderColor: 'gray'}}
                            onChangeText={(text) => this.setState({mobiletext:text})}
                            placeholder={'Mobile Number'}
                        />
                    </View>
                    <View style={styles.passwordContainer}>
                        <TextInput
                            ref={(ref) => { this.passwordInput = ref; }}
                            secureTextEntry={true}
                            value={this.state.passwordtext}
                            underlineColorAndroid = {this.state.passwordborderColor}
                            style={{height: 50,flex:1, width:'100%',borderColor: 'gray'}}
                            onChangeText={(text) => this.setState({passwordtext:text})}
                            placeholder={'Password'}
                        />
                    </View>
                    <View style={styles.passwordContainer}>
                        <TextInput
                            ref={(ref) => { this.confirmpasswordInput = ref; }}
                            secureTextEntry={true}
                            value={this.state.confirmpasswordtext}
                            underlineColorAndroid = {this.state.confirmpasswordborderColor}
                            style={{height: 50,flex:1, width:'100%',borderColor: 'gray'}}
                            onChangeText={(text) => this.setState({confirmpasswordtext:text})}
                            placeholder={'Confirm Password'}
                        />
                    </View>
                    <View style={styles.nicknameContainer}>
                        <TextInput
                            ref={(ref) => { this.nicknameInput = ref; }}
                            value={this.state.nicknametext}
                            underlineColorAndroid = {this.state.nicknameborderColor}
                            style={{height: 50,flex:1, width:'100%',borderColor: 'gray'}}
                            onChangeText={(text) => this.setState({nicknametext:text})}
                            placeholder={'NickName'}
                        />
                    </View>
                    <View style={styles.nicknameContainer}>
                        <Text style={{width:'30%',fontSize:14,color:'grey'}}>Gender</Text>
                        <RadioForm
                            style={{ width: '70%' , alignSelf:'center'}}
                            dataSource={radio_props}
                            itemShowKey="label"
                            itemRealKey="value"
                            circleSize={16}
                            initial={0}
                            formHorizontal={true}
                            labelHorizontal={true}
                            animation={true}
                            outerColor={'black'}
                            innerColor={'black'}
                            customTextStyle = {{fontFamily: "CenturyGothic", color: 'black', fontSize: 12}}
                            customViewStyle = {{flex:1, flexDirection:'row', padding: 0.5, height:40, backgroundColor:'#FFFFFF', alignItems: 'center',width:'100%' }}
                            onPress={(item) => {
                                const{label, value} = item;
                                this.setState({genderValue:value});
                            }}
                        />
                    </View>
                    <View style={styles.nicknameContainer}>
                        <Text style={{width:'30%',fontSize:14,color:'grey'}}>Date of Birth</Text>
                        <DatePicker
                            style={{width: '70%'}}
                            date={this.state.date}
                            mode="date"
                            placeholder="select date"
                            format="YYYY-MM-DD"
                            minDate="1970-01-01"
                            maxDate="2020-01-01"
                            confirmBtnText="Confirm"
                            cancelBtnText="Cancel"
                            customStyles={{
                                dateIcon: {
                                    position: 'absolute',
                                    left: 0,
                                    top: 4,
                                    marginLeft: 0,
                                    width:0,
                                },
                                dateInput: {
                                    marginLeft: 0
                                }
                                // ... You can check the source to find the other keys.
                            }}
                            onDateChange={(date) => {this.setState({date: date})}}
                        />
                    </View>
					<View style={styles.loginContainer}>
						{
							this.state.isRegistering?
                                <BubblesLoader size={20} color={'white' } dotRadius={6}/>:
								<TouchableOpacity onPress={() => this._register(false)} style={{width:'100%',flex:1,flexDirection:'row',justifyContent:'center',alignItems:'center'}}>
                                    <Text style={{flex:1,color:'white',textAlign:'center',fontSize:18}}>Register</Text>
								</TouchableOpacity>
						}
					</View>
					<View style={{width:'80%',marginTop:20, height:40,flexDirection:'row',justifyContent:'center',alignItems:'center'}}>
                        <Text style={{color:'#0087e0',width:'80%',textAlign:'right',fontSize:16,justifyContent:'flex-end'}}>I have already one account?  </Text>
                        <TouchableOpacity onPress={() => {
                            const { navigate } = this.props.navigation;
                            navigate('Login');
                        }} style={{width:'20%',flex:1,flexDirection:'row',justifyContent:'flex-start'}}>
                            <Text style={{flex:1,color:'#1e90ff',textAlign:'left',fontSize:16,textDecorationLine: 'underline'}}>Login</Text>
                        </TouchableOpacity>
					</View>
				</View>
                <ModalWrapper
                    isNative={false}
                    onRequestClose={this.onCloseModal}
                    position='bottom'
                    shouldAnimateOnRequestClose={false}
                    showOverlay={true}
                    containerStyle={{backgroundColor:'rgba(0,0,0,0.9)', width:Dimensions.width, height:Dimensions.height}}
                    overlayStyle={{ opacity: .7, }}
                    style={[{ width: DEVICE_SCREEN.width * 5/7, flex:1, backgroundColor: 'rgba(255, 255, 255, 0)', position: 'absolute', justifyContent: 'center', alignItems: 'center' }]}
                    visible={this.state.isModalVisible}>

                    <View style={{ width: DEVICE_SCREEN.width * 5/7, flex:1 , backgroundColor: 'white', flexDirection: 'column', borderRadius: 6, borderWidth: 0, }}>
                        <View style={styles.commentContainer}>
                            <TextInput
                                style={{height: 50, width:'70%',borderColor: 'gray'}}
                                onChangeText={(text) => this.setState({verificationCode:text})}
                                placeholder={'Verification Code'}
                                underlineColorAndroid = {this.state.verificationCodeborderColor}
                            />
                            <TouchableOpacity style={{height: 50, width:'30%',alignItems:'center', justifyContent:'center'}} onPress={() => {
                                this._register(false);
                            }}>
                                <Text style={{ textAlign: 'center', fontFamily: "hiragino", fontSize: 16, color: '#1e90ff' }} >Resend</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={{ width:'100%',height:40,borderTopColor:'#1e90ff',borderTopWidth:.8, flexDirection: 'row',alignSelf:'center' }} >
                            <TouchableOpacity style={{ flex: 1 }} onPress={() => {
                                if (this.state.verificationCode == verifyCode){
                                    this.setState({isModalVisible:false, isRegistering:false});
                                    this._register(true);
                                } else{
                                    Toast.show("Verification Matching Error. Please try again", Toast.LONG);
                                }

                            }} >
                                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                    <Text style={{ textAlign: 'center', fontFamily: "hiragino", fontSize: 16, color: '#1e90ff' }} >OK</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity style={{ flex: 1 }} onPress={() => {
                                this.setState({
                                    isModalVisible:false,
                                    isRegistering:false,
                                    emailborderColor:'gray',
                                    mobileborderColor:'gray',
                                    passwordborderColor:'gray',
                                    confirmpasswordborderColor:'gray',
                                    nicknameborderColor:'gray',
                                });
                                this.emailInput.focus();
                            }} >
                                <View style={{ flex: 1,borderLeftColor:'#1e90ff',borderLeftWidth:.8, justifyContent: 'center', alignItems: 'center' }}>
                                    <Text style={{ textAlign: 'center', fontFamily: "hiragino", fontSize: 16, color: '#1e90ff' }} >Close</Text>
                                </View>
                            </TouchableOpacity>

                        </View>
                    </View>
                </ModalWrapper>

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
		height:50,
		paddingLeft:40,
		paddingRight:40,
        justifyContent:'center',
        alignItems:'center',
	},
	mobileContainer:{
        flexDirection:'row',
        height:50,
        marginTop:20,
        paddingLeft:40,
        paddingRight:40,
        justifyContent:'center',
        alignItems:'center',
	},
    passwordContainer:{
        flexDirection:'row',
        height:50,
        marginTop:20,
        paddingLeft:40,
        paddingRight:40,
        justifyContent:'center',
        alignItems:'center',
    },
    nicknameContainer:{
        flexDirection:'row',
        height:50,
        marginTop:20,
        paddingLeft:40,
        paddingRight:40,
        justifyContent:'center',
        alignItems:'center',
    },
	loginContainer:{
        flexDirection:'column',
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
	},
    commentContainer:{
        flexDirection:'row',
        width:'100%',
        height:100,
        paddingLeft:30,
        paddingRight:30,
        justifyContent:'center',
        alignItems:'center',
    },



});

AppRegistry.registerComponent('App', () => App);
