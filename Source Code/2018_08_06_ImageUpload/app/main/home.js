/**
ANDROID iOS Fonts Setup :: https://medium.com/react-native-training/react-native-custom-fonts-ccc9aacf9e5e
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 dynamic Image : source={{ uri: imagebaseURL+responseData.data[i].item_icon }}

 */

import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    Image,
    Alert,
    BackHandler,
    Platform,
    Animated,
    Dimensions,
    TouchableOpacity,
    ImageBackground,
    ListView
} from 'react-native';
import Icon from 'react-native-vector-icons/Entypo';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import CardView from 'react-native-cardview'
import {BubblesLoader, TextLoader} from 'react-native-indicator';
import Toast from 'react-native-simple-toast';
import RadioForm from 'react-native-radio-form-custom';
import GridView from 'react-native-gridview';
import ModalWrapper from "react-native-modal-wrapper";
import ImagePicker from 'react-native-image-crop-picker';
import DatePicker from 'react-native-datepicker'
var SharedPreferences = require('react-native-shared-preferences');
var RNFS = require('react-native-fs');
import RNFetchBlob from 'react-native-fetch-blob'
import _global from '../global';

const DEVICE_SCREEN = Dimensions.get('window');

const instructions = Platform.select({
    ios: 'Press Cmd+R to reload,\n' +
    'Cmd+D or shake for dev menu',
    android: 'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu',
});

var radio_props = [
    {label: 'ALL', value: '0' },
    {label: 'TOP', value: '1' },
    {label: 'BOTTOM', value: '2' },
    {label: 'ACCESSORIES', value: '3' }
];

var image_props = [
    {label: 'TOP', value: '1' },
    {label: 'BOTTOM', value: '2' },
    {label: 'ACCESSORIES', value: '3' }
];

const itemsPerRow = 3;
let data = [];
let longIndexStatus = [0,0,0,0];
export default class homeScreen extends React.Component {

    static navigationOptions = {
        title: 'Home',
        header: null
    };


    constructor(props) {
        super(props);
        this.state = {
            animation: new Animated.Value(0),
            scroll: true,
            imagedata:[],
            currentIndex:0,
            longIndex:[],
            longIndexStatus:[],
            isDetail:false,
            detailIndex:[],
            isLoading:false,
            sort_type:0,
            isModalVisible:false,
            isImageModalVisible:false,
            image:[],
            image_type:'1',
            commenttext:'',
            imagedate:''
        }
        this.contentView = this.contentView.bind(this);
        this.setLike = this._setLike.bind(this);
        this.delete = this._delete.bind(this);
        this.imageSave = this._imageSave.bind(this);
        this.photoUpload= this._photoUpload.bind(this);
        this.imageSelect = this._imageSelect.bind(this);
    }

    _imageSelect(flag) {
        if (flag){
            ImagePicker.openCamera({
                width: 300,
                height: 400,
                cropping: true
            }).then(image => {
                this.setState({
                    image:image,
                    isImageModalVisible:true
                });

            });
        } else {
            ImagePicker.openPicker({
                width: 300,
                height: 400,
                cropping: true
            }).then(image => {
                this.setState({
                    image:image,
                    isImageModalVisible:true
                });
            });
        }
    }

    _photoUpload(){
        this.setState({isLoading:false});
        console.log(this.state.imagedate);
        let formdata = new FormData();
        var timeStamp = Math.floor(Date.now() / 1000);
        formdata.append("param",JSON.stringify({
            "comment":this.state.commenttext,
            "dateoftaken":this.state.imagedate,
            "user_id":_global.loggedUserID,
            "type":this.state.image_type,
            "flaglike":"0",
            "image_url":timeStamp + ".jpg"
        }));
        formdata.append("sampleFile", {
            uri: this.state.image.path,
            type: 'image/jpeg', // or photo.type
            name: timeStamp + ".jpg"
        })

        fetch(_global.baseURL + "upload", {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            method: 'post',
            body: formdata
        }).then((response) => response.json())
            .then((responseJson) => {
                console.log(JSON.stringify(responseJson));
                this.setState({
                    imagedata:responseJson,
                    isLoading:true,
                });

                //console.log(this.state.imagedata)
            })
            .catch((error) => {
                console.error(error);
            });
    }

    _imageSave() {
        let count = this.state.longIndex.length;
        longIndexStatus = [0,0,0,0];
        if (count >= 2 && count <= 4){
            this.state.longIndex.forEach(function (element, index) {
                const {image_url} = data[element];
                //let path = RNFS.ExternalStorageDirectoryPath + "/myImages/" + image_url;
                //let path = RNFS.DocumentDirectoryPath + "/myImages/" + image_url;
                let dirs = RNFetchBlob.fs.dirs;
                let timeStamp = Math.floor(Date.now() / 1000);
                let path = dirs.SDCardApplicationDir + '/' +timeStamp + '/' + image_url;
                console.log(path);
                RNFetchBlob
                    .config({
                        // response data will be saved to this path if it has access right.
                        path : dirs.SDCardApplicationDir + '/' + timeStamp + '/' + image_url
                    })
                    .fetch('GET',  _global.baseURL + image_url, {
                        //some headers ..
                    })
                    .then((res) => {
                        // the path should be dirs.DocumentDir + 'path-to-file.anything'
                        Toast.show('The file saved to ' + res.path(), Toast.LONG);
                        console.log('The file saved to ', res.path())
                    })

            })


        } else{
            Toast.show("Please long press to save any item", Toast.LONG);
        }
    }

    _setLike(index, flaglike){
        console.log(_global.baseURL + 'set_like/' + _global.loggedUserID + "/" + index + "/" + flaglike);
        this.setState({isLoading:false});
        fetch(_global.baseURL + 'set_like/' + _global.loggedUserID + "/" + index + "/" + flaglike, {
            method: 'get',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            }
        }).then((response) => response.json())
            .then((responseJson) => {
                console.log(JSON.stringify(responseJson));
                this.setState({
                    imagedata:responseJson,
                    isLoading:true
                });

                //console.log(this.state.imagedata)
            })
            .catch((error) => {
                console.error(error);
            });
    }

    _delete(index, flaglike){
        console.log(_global.baseURL + 'delete_picture/' + _global.loggedUserID + "/" + index);
        this.setState({isLoading:false});
        fetch(_global.baseURL + 'delete_picture/' + _global.loggedUserID + "/" + index, {
            method: 'get',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            }
        }).then((response) => response.json())
            .then((responseJson) => {
                console.log(JSON.stringify(responseJson));
                this.setState({
                    imagedata:responseJson,
                    isLoading:true
                });
            })
            .catch((error) => {
                console.error(error);
            });
    }

    contentView() {
        data = [];
        for (let i = 0; i < this.state.imagedata.length; i++) {
            if (this.state.imagedata[i].type == this.state.sort_type || this.state.sort_type == '0'){
                data.push(this.state.imagedata[i]);
            }
        }
        if ( data.length === 0)console.log("noimage");
        if (data.length % 3 === 2)data.push("");
        const randomData = [];
        for (let i = 0; i < data.length; i+=itemsPerRow) {
            randomData.push(data.slice(i, itemsPerRow + i));
        }
        const dataSource = new ListView.DataSource({
            rowHasChanged: (r1, r2) => r1 !== r2,
        }).cloneWithRows(randomData);
        return <View style={styles.container}>
            <View style={{width:'100%',flexDirection: 'row', justifyContent:'center',alignItems:'center',backgroundColor:'white', paddingLeft:5, paddingRight:5}}>
                <RadioForm
                    dataSource={radio_props}
                    itemShowKey="label"
                    itemRealKey="value"
                    circleSize={13}
                    initial={0}
                    formHorizontal={true}
                    labelHorizontal={true}
                    outerColor = {'black'}
                    innerColor = {'black'}
                    customTextStyle = {{fontFamily: "CenturyGothic", color: 'black', fontSize: 12}}
                    customViewStyle = {{flex:1, flexDirection:'column', padding: 0.5, height:60, borderColor:'#e2e2e2', backgroundColor:'#FFFFFF', alignItems: 'center', borderBottomWidth:0.5, width:'100%' }}
                    animation={true}
                    onPress={(item) => {
                        const{label, value} = item;
                        console.log(value);
                        this.setState({sort_type:value});
                    }}
                />
            </View>
            <View style={{flex:1,backgroundColor:'white', justifyContent:'center', alignItems:'center', width:'100%', height:'100%'}}>
                <View style={{ backgroundColor:'white', width:'100%', height:DEVICE_SCREEN.width + 60,justifyContent:'center', alignItems:'center'}}>
                    {
                        data.length !==0?<GridView
                            data={data}
                            dataSource={dataSource}
                            itemsPerRow={itemsPerRow}
                            style={{flex:1,width:'100%', height:DEVICE_SCREEN.width + 60}}
                            fillMissingItems={true}
                            renderItem={(item, sectionID, rowID, itemIndex, itemID) => {
                                const {id,image_url,comment, dateoftaken,flaglike,type} = item;
                                return (
                                    type==this.state.sort_type || this.state.sort_type == '0'?<View style={{flexDirection:'column', width:DEVICE_SCREEN.width/3, height:DEVICE_SCREEN.width/3 + 20}}>
                                        <TouchableOpacity style={{flex:1}}
                                                          onPress={() => this.setState({isModalVisible:!this.state.isModalVisible, currentIndex: itemID})}
                                                          onLongPress={() => {
                                                              console.log("longpress");
                                                              let index = this.state.longIndex.indexOf(itemID);
                                                              if (index !== -1){
                                                                  this.state.longIndex.splice(index,1);
                                                                  this.setState({longIndex:this.state.longIndex})
                                                              } else{
                                                                  if (this.state.longIndex.length < 4){
                                                                      this.state.longIndex.push(itemID);
                                                                      this.setState({longIndex:this.state.longIndex})
                                                                  } else {
                                                                      Toast.show("You can create college with 4 images at one time at max.", Toast.LONG);
                                                                  }
                                                              }

                                                          }}   >
                                            <CardView
                                                id={item.id}
                                                style={{ flex:1, margin:6}}
                                                cardElevation={2}
                                                cardMaxElevation={2}
                                                cornerRadius={5}>

                                                <ImageBackground  source={{uri: _global.baseURL + image_url}}
                                                                  resizeMode='cover'
                                                                  style={{flex:1,alignSelf: 'stretch', justifyContent: 'center', alignItems: 'center'}}  >
                                                    {
                                                        this.state.longIndex.indexOf(itemID) !== -1?<Icon name={'check'} color="#1e90ff" size={30} />:<View/>
                                                    }
                                                </ImageBackground>

                                            </CardView>
                                        </TouchableOpacity>

                                        <View style={{height:20, width:50,alignSelf:'flex-end', flexDirection:'row', alignItems:'flex-end', justifyContent: 'center'}}>
                                            <TouchableOpacity style={{flex:1}} onPress={() => this.setLike(item.id, flaglike=="0"?"1":"0")}>
                                                {
                                                    flaglike=="1"?<Icon name={'heart'} color="black" size={20} style={{marginRight:6}}/>
                                                        :<Icon name={'heart-outlined'} color="black" size={20} style={{marginRight:6}}/>
                                                }
                                            </TouchableOpacity>
                                            <TouchableOpacity style={{flex:1}} onPress={() => this.delete(item.id)}>
                                                <MaterialCommunityIcons name={'delete'} color="black" size={20} style={{marginRight:10}}/>
                                            </TouchableOpacity>
                                        </View>

                                    </View>:null
                                );
                            }}
                        />:<View style={{width:'30%', height:'20%',justifyContent:'center', alignItems:'center'}}>
                            <ImageBackground source={require('../images/noimage.png')} resizeMode={'cover'}
                                             style={{width:'100%', height:'100%'}}/>
                        </View>
                    }
                </View>
            </View>
            <ModalWrapper
                isNative={false}
                onRequestClose={this.onCloseModal}
                position='top'
                shouldAnimateOnRequestClose={false}
                showOverlay={true}
                containerStyle={{backgroundColor:'rgba(0,0,0,0.8)', width:DEVICE_SCREEN.width, height:DEVICE_SCREEN.height}}
                overlayStyle={{ opacity: .7, }}
                style={[{ width: DEVICE_SCREEN.width * 5/7, backgroundColor: 'rgba(255, 255, 255, 0)', position: 'absolute', justifyContent: 'center', alignItems: 'center' }]}
                visible={this.state.isImageModalVisible}>

                <View style={{ width: DEVICE_SCREEN * 5/7, backgroundColor: 'white', flexDirection: 'column', borderRadius: 4, borderWidth: 0, }}>
                    <View style={{
                        flex:1, flexDirection:'column', justifyContent: 'center', alignItems: 'center', borderBottomWidth: .5, borderBottomColor: '#999',
                        paddingBottom: 10, paddingTop: 10, paddingLeft: 30, paddingRight: 30,
                    }}>
                        <View style={styles.typeContainer}>
                            <RadioForm
                                style={{}}
                                dataSource={image_props}
                                itemShowKey="label"
                                itemRealKey="value"
                                circleSize={12}
                                initial={0}
                                formHorizontal={true}
                                labelHorizontal={true}
                                animation={true}
                                outerColor={'black'}
                                innerColor={'black'}
                                customTextStyle = {{fontFamily: "CenturyGothic", color: 'black', fontSize: 12}}
                                customViewStyle = {{flexDirection:'column', height:50, backgroundColor:'#FFFFFF', alignItems: 'center',justifyContent:'flex-start', width:'30%' }}
                                onPress={(item) => {
                                    const{label, value} = item;
                                    this.setState({image_type:value});
                                }}
                            />
                        </View>
                        <View style={styles.dateContainer}>
                            <DatePicker
                                style={{width: '80%'}}
                                date={this.state.imagedate}
                                mode="date"
                                placeholder="select date"
                                format="DD/MM/YYYY"
                                minDate="01/01/1970"
                                maxDate="01/01/2020"
                                confirmBtnText="Confirm"
                                cancelBtnText="Cancel"
                                customStyles={{dateIcon: {
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
                                onDateChange={(date) => {this.setState({imagedate: date})}}
                            />
                        </View>
                        <View style={styles.commentContainer}>
                            <TextInput
                                style={{height: 50,flex:1, width:'100%',borderColor: 'black'}}
                                onChangeText={(text) => this.setState({commenttext:text})}
                                placeholder={'Comment'}
                            />
                        </View>
                    </View>
                    <View style={{ width:'100%',height:40, flexDirection: 'row',alignSelf:'center' }} >
                        <TouchableOpacity style={{ flex: 1 }} onPress={() => {
                            this.setState({isImageModalVisible:false});
                            this.photoUpload();
                        }} >
                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                <Text style={{ textAlign: 'center', fontFamily: "hiragino", fontSize: 16, color: '#1e90ff' }} >OK</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity style={{ flex: 1 }} onPress={() => {
                            this.setState({isImageModalVisible:false});
                        }} >
                            <View style={{ flex: 1,borderLeftColor:'#999',borderLeftWidth:.8, justifyContent: 'center', alignItems: 'center' }}>
                                <Text style={{ textAlign: 'center', fontFamily: "hiragino", fontSize: 16, color: '#1e90ff' }} >Close</Text>
                            </View>
                        </TouchableOpacity>

                    </View>
                </View>
            </ModalWrapper>
            <ModalWrapper
                isNative={false}
                onRequestClose={this.onCloseModal}
                position='bottom'
                shouldAnimateOnRequestClose={false}
                showOverlay={true}
                containerStyle={{backgroundColor:'rgba(0,0,0,0.8)', width:Dimensions.width, height:Dimensions.height}}
                overlayStyle={{ opacity: .7, }}
                style={[{ width: DEVICE_SCREEN.width * 5/7, flex:1, backgroundColor: 'rgba(255, 255, 255, 0)', position: 'absolute', justifyContent: 'center', alignItems: 'center' }]}
                visible={this.state.isModalVisible}>

                <View style={{ width: DEVICE_SCREEN.width * 5/7, flex:1 , backgroundColor: 'white', flexDirection: 'column', borderRadius: 4, borderWidth: 0, }}>
                    <View style={{
                        flex:1, flexDirection:'column', justifyContent: 'center', alignItems: 'center', borderBottomWidth: .5, borderBottomColor: '#999',
                        paddingBottom: 10, paddingTop: 10, paddingLeft: 30, paddingRight: 30,
                    }}>
                        <CardView

                            style={{flex:1,margin:4, height:250, width:250}}
                            cardElevation={2}
                            cardMaxElevation={2}
                            cornerRadius={5}>

                            {
                                data.length > 0 ?<Image  source={{uri: _global.baseURL + data[this.state.currentIndex].image_url}}
                                        style={{flex:1,alignSelf: 'stretch', justifyContent: 'center', alignItems: 'center'}}  />:<View/>
                            }

                        </CardView>
                        <View style={{ width:280, marginTop:10, justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={{ textAlign: 'center', fontFamily: "hiragino", fontSize: 16, color: '#000000' }} >
                                {
                                    data.length > 0 ?data[this.state.currentIndex].comment:""
                                }
                            </Text>
                        </View>
                        <View style={{ width:280,marginTop:10, justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={{ textAlign: 'center', fontFamily: "hiragino", fontSize: 16, color: '#000000' }} >
                                {
                                    data.length > 0 ?data[this.state.currentIndex].dateoftaken:""
                                }
                            </Text>
                        </View>
                    </View>
                    <View style={{ width:100,height:40, flexDirection: 'row',alignSelf:'flex-end' }} >
                        <TouchableOpacity style={{ flex: 1 }} onPress={() => {
                            this.setState({isModalVisible:false});
                        }} >
                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                <Text style={{ textAlign: 'center', fontFamily: "hiragino", fontSize: 16, color: '#1e90ff' }} >Close</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </ModalWrapper>
            <View style={{flexDirection:'row', width:'100%', height:50,backgroundColor:'white', borderTopColor:'#e2e2e2',borderTopWidth:.5}}>
                <TouchableOpacity style={{flex:1,justifyContent:'center',alignItems:'center'}}
                                  onPress={()=> {
                                      const { navigate } = this.props.navigation;
                                      navigate('Home');
                                  }}>
                    <Icon name={'home'} color="black" size={30}/>
                </TouchableOpacity>
                <TouchableOpacity style={{flex:1,justifyContent:'center',alignItems:'center'}}
                    onPress={()=> {this.imageSelect(true)}}>
                    <Icon name={'camera'} color="black" size={30}/>
                </TouchableOpacity>
                <TouchableOpacity style={{flex:1,justifyContent:'center',alignItems:'center'}}
                    onPress={()=> {this.imageSelect(false)}}>
                    <Icon name={'image'} color="black" size={30}/>
                </TouchableOpacity>
                <TouchableOpacity style={{flex:1,justifyContent:'center',alignItems:'center'}}
                    onPress={()=> {this.imageSave(false)}}>
                    <Icon name={'shopping-basket'} color="black" size={30}/>
                </TouchableOpacity>
                <TouchableOpacity style={{flex:1,justifyContent:'center',alignItems:'center'}}
                                  onPress={()=> {
                                      SharedPreferences.clear();
                                      const { navigate } = this.props.navigation;
                                      navigate('Login');
                                  }}>
                    <Icon name={'log-out'} color="black" size={30}/>
                </TouchableOpacity>
            </View>

        </View>
    }

    getImageList(){
        this.setState({isLoading:false});
        //console.log(_global.baseURL + 'get_picture/' + _global.loggedUserID);
        fetch(_global.baseURL + 'get_picture/' + _global.loggedUserID, {
            method: 'get',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            }
        }).then((response) => response.json())
            .then((responseJson) => {
                //console.log(JSON.stringify(responseJson));
                this.setState({
                    imagedata:responseJson,
                    isLoading:true,
                });

                //console.log(this.state.imagedata)
            })
            .catch((error) => {
                console.error(error);
            });

    }

    componentWillMount(){
        this.getImageList();
    }

    componentDidMount() {
        /*setInterval(() => {
            console.log("Interval");
            NetInfo.isConnected.fetch().then( (isConnected) => {
                console.log("Detecting.....");
                if (!isConnected && !this.state.isDetected){
                    this.setState({
                        isDetected : true,
                    });
                    alert("NetWork Status : Offline");
                }
            });
        },1000);*/
        BackHandler.addEventListener("hardwareBackPress", () => { Alert.alert(
            'Exit App',
            'Are you sure you want to exit app ?',
            [
                {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
                {text: 'OK', onPress: () => BackHandler.exitApp() },
            ],
            {
                cancelable: false
            }
        )
            return true;
        });
    }

    render() {
        return this.state.isLoading?this.contentView():
            <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
                <BubblesLoader color={'#1e90ff'}/>
            </View>
        //return this.advancedMenu()
    }
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection:'column',
        backgroundColor: 'white',
    },
    button: {
        width: 44,
        height: 44,
        justifyContent:'center',
        alignSelf:'center'
    },
    scrollView: {
        flex: 1,
        backgroundColor: 'white',
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
    typeContainer:{
        flexDirection:'row',
        height:60,
        paddingLeft:40,
        paddingRight:40,
        justifyContent:'center',
        alignItems:'center',
    },
    dateContainer:{
        flexDirection:'row',
        height:50,
        marginTop:20,
        paddingLeft:40,
        paddingRight:40,
        justifyContent:'center',
        alignItems:'center',
    },
    commentContainer:{
        flexDirection:'row',
        width:'80%',
        height:50,
        marginTop:20,
        paddingLeft:40,
        paddingRight:40,
        justifyContent:'center',
        alignItems:'center',
    },
});