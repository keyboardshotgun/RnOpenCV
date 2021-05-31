import React, { Component } from "react";
import ImagePicker, { Image } from "react-native-image-crop-picker";

import {
  Alert,
  View,
  TouchableOpacity,
  Text,
  Image as RnImage,
  StyleSheet,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  TouchableHighlight, Keyboard, TouchableWithoutFeedback
} from "react-native";
import {
  requestPermission,
  rnOpenCvEventEmitter,
  RnOpenCV,
  RNQrCode,
  rnQrEventEmitter,
  RnOcr,
  rnOcrEventEmitter
} from "./RnOpenCV";

type cropImgType = {
  "cropRect" : {
    "height": number
    , "width": number
    , "x": number
    , "y": number
  }
  , "data": string
  , "height": 300
  , "mime": "image/jpeg"
  , "modificationDate": string
  , "path": string
  , "size": number
  , "width": number
}

interface PickerCameraState {
  mode : "ocr" | "opencv",
  modalShow : boolean,
  modalShow2: boolean,
  modalShow3: boolean,
  cameraPermission: boolean,
  previewPath : string,
  objectList : string[],
  qrResult : string,
  qrImgPath : string,
  textForQr : any,
  language : ["kor","eng","jpn"],
  nowLang : number,
  ocrResult : string,
  photoAsBase64: {
    content: string | undefined | null,
    isPhotoPreview: boolean,
    photoPath: string,
  }
}

interface PickerCameraProps {

}

const classNamesKor = ["배경",
  "비행기", "자전거", "새", "보트",
  "병", "버스", "자동차", "고양이", "의자",
  "소", "테이블", "강아지", "말",
  "오토바이", "사람", "화초",
  "양", "소파", "기차", "모니터"];

class PickerCamera extends Component<PickerCameraProps, PickerCameraState> {

  constructor(props: PickerCameraProps) {
    super(props);
    this.state = {
      mode : "opencv",
      modalShow: false,
      modalShow2: false,
      modalShow3: false,
      language : ["kor","eng","jpn"],
      nowLang : 0,
      cameraPermission: false,
      previewPath : "",
      objectList : [],
      qrResult : "",
      textForQr : "",
      qrImgPath : "",
      ocrResult : "",
      photoAsBase64: {
        content: "",
        isPhotoPreview: false,
        photoPath: ""
      }
    };
  }

  componentDidMount() {
    requestPermission().then((res) => {
      if (res) {
        this.setState({
          cameraPermission: true
        });
        this.startListner();
      } else {
        this.setState({
          cameraPermission: false
        });
      }
    }).catch((err) => {
      console.warn("Camera Permission Error :", err);
    });
  }

  componentWillUnmount() {
    rnOpenCvEventEmitter.removeAllListeners("ImgPath");
    rnOpenCvEventEmitter.removeAllListeners("DataInfo");
    rnQrEventEmitter.removeAllListeners("QrCodeReadResult");
    rnQrEventEmitter.removeAllListeners("QrImgPath");
    this.cleanupImages();
  }

  upDataImgPath = (event: any) => {
    if(event){
      this.setState({
        previewPath : "file://"+event
      })
    }
    console.log("upDataImgPath ", this.state.previewPath);
  }

  dataInfoFromDevice = (data : any) => {
    if(data){
      this.setState({
        ...this.state,
        objectList : data
      });
    }
  }

  qrCodeReadResult = (event: any) => {
    if(event){
      console.log("[JS] qrCodeReadResult ", event);
      this.setState({
        qrResult : event
      })
    }
  }

  startListner = () => {
    rnOpenCvEventEmitter.addListener("ImgPath", this.upDataImgPath);
    rnOpenCvEventEmitter.addListener("DataInfo", this.dataInfoFromDevice);
    rnQrEventEmitter.addListener("QrCodeReadResult", this.qrCodeReadResult);
    rnQrEventEmitter.addListener("QrImgPath", this.qrImagePath);
    rnOcrEventEmitter.addListener("changeLanguage", this.changeLanguage)
    rnOcrEventEmitter.addListener("ocrResult", this.ocrResult)
  }

  qrImagePath = (event: any) => {
    console.log("[JS] qrImagePath event", event);
    if(event){
      this.upDataImgPath(event);
    }
  }

  //ssd object detector
  toAndorid = async () => {
      const { photoAsBase64 } = this.state;
      if(photoAsBase64.content){
        try {
          await RnOpenCV.imageDetectWithSSD(photoAsBase64.content);
        }catch(e){
          console.log("[Error] toAndorid", e)
        }
      }
  };

  // ocr read
  toAndoridForOcr = async () => {
    const { photoAsBase64 } = this.state;
    if(photoAsBase64.content){
      try {
        await RnOcr.getStart(photoAsBase64.content);
      }catch(e){
        console.log("[Error] toAndoridForOcr", e)
      }
    }
  };

  changeLanguage = (event : string) => {
    console.log("[JS] changeLanguage" , event);
  }

  ocrResult = (event : string) => {
    if(event && event.length > 0){
      console.log("[JS] ocrResult" , event);
      this.setState({
        modalShow3: true,
        ocrResult : event
      })
    }
  }

  openCamera = (type: "opencv" | "ocr") => {

    const opencv_opt = {
      width: 600,
      height: 600,
      cropping: true,
      includeBase64: true
    };

    const ocr_opt = {
      cropping: false,
      includeBase64: true
    }

    this.setState({
      mode : type
    });

    this.initState();

    ImagePicker.openCamera(type === "opencv" ? opencv_opt : ocr_opt )
      .then( async ( base64Img : cropImgType | Image | undefined ) => {
        if(base64Img && base64Img.hasOwnProperty("data"))
        {
          if(base64Img.data)
          {
            this.setState({
              photoAsBase64: {
                content: base64Img.data,
                isPhotoPreview: true,
                photoPath: base64Img.path
              }
            },()=>{
              if(type === "opencv"){
                this.toAndorid()
              }else{
                this.toAndoridForOcr();
              }
            })
          }
        }else{
          this.cleanupImages();
        }
      })
      .catch((e) => Alert.alert("취소"));
  };

  qrCodeMaker = async () => {
    if(this.state.textForQr && this.state.textForQr.trim().length > 0){
      try {
        await RNQrCode.qrCodeBuild(this.state.textForQr);
      }catch(e){
        console.log("[Error] qrCodeMaker", e)
      }
    }else{
      Alert.alert("알림","QR코드를 생성하기 위한 입력이 필요 합니다.");
    }
  }

  cleanupImages = () => {
    ImagePicker.clean()
      .then(() => {
        console.log("removed tmp images from tmp directory");
      })
      .catch((e) => {
        Alert.alert(e);
      });
  };

  renderInfo = (el: string) => {
    if(el){
      const info = el.split(":");
      const idx = info[0];
      const classId: number = parseInt(info[1]);
      const classNames = classNamesKor[classId];
      const confidence =  (parseFloat(info[3]) * 100).toFixed(2);
      return (
        <View
          key={idx+confidence}
          style={{width:'49%',height: 50, borderWidth:1, borderColor:"#808080",justifyContent:"center", alignItems:"flex-start",paddingLeft: 15}}>
          <Text style={{color:"#EEEEEE", fontSize: 12}}>{`${idx}. ${classNames} : ≒ ${confidence}% `}</Text>
        </View>
      )
    }else{
      return null;
    }
  }

  // QR
  openQr = async () => {
    this.initState();
    await RNQrCode.startQrCode();
  }

  initState = () => {
    this.setState({
      ...this.state,
      previewPath : "",
      objectList : [],
      qrResult : "",
      qrImgPath : "",
      textForQr : "",
      modalShow: false,
      modalShow2: false,
      modalShow3: false,
      ocrResult : "",
      photoAsBase64: {
        content: "",
        isPhotoPreview: false,
        photoPath: ""
      }
    })
  }

  modalDismiss = (event: any) => {
    console.log("modalDismiss", event);
  }

  showModal = (showHide: boolean) => {
    this.setState({
      ...this.state,
      modalShow : showHide
    },()=>{
      if(this.state.modalShow){
        this.setState({
          textForQr : ""
        })
      }
    })
  }

  updateText = (text: any) => {
      this.setState({
        ...this.state,
        textForQr : text
      })
  }

  DismissKeyboard = async () => {
    this.setState({
      modalShow : false
    });
    await Keyboard.dismiss();
  };

  showModal2 = () => {
    this.setState({
      modalShow2 : true
    })
  }

  closeModal2 = () => {
    this.setState({
      modalShow2 : false
    });
    const nowLang =  this.state.language[this.state.nowLang];
    RnOcr.changeLanguage(nowLang);
  }

  closeModal3 = () => {
    this.setState({
      modalShow3 : false
    });
  }

  selectLanguage = (type : number) => {
    if(type !== null){
      this.setState({
        nowLang : type
      })
    }
  }

  render() {
    return (
      <View style={{ flex: 1 , justifyContent:"center", alignItems:"center" }}>

        <View style={{ height: "60%", width: '100%' , justifyContent:"center", alignItems:"center", backgroundColor: "#000000" }}>
          {this.state.previewPath.length > 0 ?
            <RnImage
              source={{ uri: this.state.previewPath }}
              style={{ width: '100%', height: '100%' }}
              resizeMode={"contain"}
            />
            :
            <View style={{ marginTop:160, width: 200, height: 200, borderWidth: 1, borderColor: "#00FF00", borderRadius : 20, justifyContent:"center", alignItems:"center" }}>
              <View style={{ width: 180, height: 180, borderWidth: StyleSheet.hairlineWidth, borderColor: "#00FF00", borderRadius : 18 , justifyContent:"center", alignItems:"center" }}>
                  <Text style={{color:"#ffc800", fontSize: 14}}>OpenCV DNN For RNM</Text>
                  <Text style={{color:"#949494", fontSize: 11}}>MobileNet SSD, Image Only</Text>
                  <Text style={{color:"#949494", fontSize: 30}} />
                  <Text style={{color:"#949494", fontSize: 10, fontWeight :'bold'}}>KeyBoardShowGun</Text>
              </View>
            </View>
          }
        </View>

        <View style={{ height: "15%", width: '100%' , justifyContent:"flex-start", alignItems:"flex-start", backgroundColor: "#000000", flexDirection:"row", flexWrap:"wrap" }}>
           { (this.state.objectList && this.state.objectList.length > 0 && !this.state.qrResult) ? this.state.objectList.map((el)=> this.renderInfo(el))
              : <View style={{width:'100%', height:'100%', justifyContent:"center", alignItems:"center"}}>
                 <Text style={{color:"#949494", fontSize: 13, fontStyle:"italic"}}>https://github.com/opencv</Text>
                 <Text style={{color:"#949494", fontSize: 13, fontStyle:"italic"}}>https://github.com/chuanqi305/MobileNet-SSD</Text>
                 <Text style={{color:"#daff00", fontSize: 16}}>{`QR: ${ (this.state.qrResult) ? this.state.qrResult : "Ready"} `}</Text>
                </View>
           }
        </View>

        <View style={{ height: "15%", width: '100%' , justifyContent:"flex-start", alignItems:"flex-start", backgroundColor: "#000000", flexDirection:"row", flexWrap:"wrap" }}>
            <TouchableHighlight
              onPress={()=>this.showModal(true)}
              style={{width:'100%', height:'100%', justifyContent:"center", alignItems:"center"}}>
              <Text style={{color:"#7395db", fontSize: 12}}>{`${this.state.textForQr ? this.state.textForQr : "Text for qr code"}`}</Text>
            </TouchableHighlight>
        </View>

        { this.state.cameraPermission ? (
          <View style={{height: "9%", width: '100%' , justifyContent:"space-between", alignItems:"flex-start", backgroundColor: "#000000", flexDirection:"row", flexWrap:"wrap" }}>
            <TouchableOpacity
              onPress={()=>this.openCamera("opencv")}
              style={{ height: '100%', flexDirection:"row" , width: '33%', borderWidth: 1, borderRadius: 5, borderColor:'#ffd500', backgroundColor: "#000000", justifyContent:"center", alignItems:"center"}}>
              <Text style={{ color: "#ffffff", fontSize: 20,paddingBottom: 5, paddingHorizontal: 5}}>{'📷'}</Text>
              <Text style={{ color: "#ffffff", fontSize: 15}}>{'Detector'}</Text>
            </TouchableOpacity>

            <View
              style={{ height: '100%', width: '33%'
                , borderWidth: 1, borderRadius: 5, borderColor:'#ffd500', backgroundColor: "#000000", justifyContent:"center", alignItems:"center"}}
            >
              <TouchableOpacity
                onPress={this.showModal2}
                style={{ height: '49%', flexDirection:"row" , width: '100%'
                  , borderBottomWidth: 1, borderColor:'#ffd500'
                  , backgroundColor: "#000000", justifyContent:"center", alignItems:"center"}}>
                <Text style={{ color: "#ffffff", fontSize: 13, borderRadius: 5 }}>{'Language : '}</Text>
                <Text style={{ color: "#ffffff", fontSize: 13, borderRadius: 5 ,paddingBottom: 0, paddingHorizontal: 5}}>{this.state.language[this.state.nowLang]}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={()=>this.openCamera("ocr")}
                style={{ flexDirection:"row" ,height: '49%'
                  , width: '100%', backgroundColor: "#000000"
                  , justifyContent:"flex-start", alignItems:"center"}}>
                <Text style={{ color: "#ffffff", fontSize: 15, borderRadius: 5 , paddingBottom: 0, paddingHorizontal: 5}}>{'📑'}</Text>
                <Text style={{ color: "#ffffff", fontSize: 13, borderRadius: 5 }}>{'OCR'}</Text>
              </TouchableOpacity>
            </View>

            <View
              style={{ height: '100%', width: '33%'
                , borderWidth: 1, borderRadius: 5, borderColor:'#ffd500', backgroundColor: "#000000", justifyContent:"center", alignItems:"center"}}
            >
              <TouchableOpacity
                onPress={this.qrCodeMaker}
                style={{ height: '49%', flexDirection:"row" , width: '100%'
                , borderBottomWidth : 1, borderColor : '#ffd500'
                  , backgroundColor: "#000000", justifyContent:"flex-start", alignItems:"center"}}>
                <Text style={{ color: "#ffffff", fontSize: 1, borderRadius: 5 ,paddingBottom: 0, paddingHorizontal: 5}}>{'🏳'}</Text>
                <Text style={{ color: "#ffffff", fontSize: 13, borderRadius: 5 }}>{'QR Maker'}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={this.openQr}
                style={{ flexDirection:"row" ,height: '49%', width: '100%'
                  , backgroundColor: "#000000", justifyContent:"flex-start", alignItems:"center"}}>
                <Text style={{ color: "#ffffff", fontSize: 15, borderRadius: 5 , paddingBottom: 0, paddingHorizontal: 5}}>{'🏁'}</Text>
                <Text style={{ color: "#ffffff", borderRadius: 5 , fontSize: 13}}>{'QR Reader'}</Text>
              </TouchableOpacity>
            </View>
          </View>
          )
          :
          null
        }

        <Modal
          animationType="slide"
          transparent={true}
          visible={this.state.modalShow}>
          <TouchableWithoutFeedback
            onPress={this.DismissKeyboard}
            accessible={true}>
              <KeyboardAvoidingView
                style={{
                  height:"100%"
                  ,justifyContent:'center'
                  ,alignItems:'center'
                  ,backgroundColor: '#333333'}}>
                  <TextInput
                    style={{width: '100%', height: 50, backgroundColor : "#ffffff", paddingLeft: 15, borderWidth : 1, borderColor : '#333333'}}
                    maxLength={50}
                    onChangeText={this.updateText}
                    autoFocus={true}
                    multiline={false}
                    placeholder={`Input text for qr : ${(this.state.textForQr) ? this.state.textForQr.length : 0 } / 20`}
                    value={this.state.textForQr}
                    numberOfLines={1}
                  />
                  <TouchableOpacity
                    style={{width: '100%', height: 50, backgroundColor : "#87c687",justifyContent:'center', alignItems:'center'}}
                    onPress={()=>this.showModal(false)}>
                    <Text style={{color:"#000000"}}>{`Save and Close`}</Text>
                  </TouchableOpacity>
              </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </Modal>

        <Modal
          animationType="slide"
          transparent={true}
          visible={this.state.modalShow2}>

          <TouchableOpacity
            onPress={this.closeModal2}
            style={{ flex:1 ,backgroundColor : "#404040"}}
            accessible={true}>

            <View style={{ position : 'absolute', bottom: 80, left : 0
              ,height: 200, width: "100%" , justifyContent:"space-between", alignItems:"center"
            }}>

              <TouchableOpacity
                onPress={()=>this.selectLanguage(0)}
                style={{  height: "31%", flexDirection:"row"
                  , width: '100%', borderRadius: 5
                  , backgroundColor: (this.state.nowLang === 0) ? "#ffffff" : "#000000"
                  , justifyContent:"center", alignItems:"center"}}>
                  <Text style={{color:"#323232"}}>한글 인식</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={()=>this.selectLanguage(1)}
                style={{ height: "31%", flexDirection:"row"
                  , width: '100%', borderRadius: 5
                  , backgroundColor: (this.state.nowLang === 1) ? "#ffffff" : "#000000"
                  , justifyContent:"center", alignItems:"center"}}>
                <Text style={{color:"#323232"}}>영어 인식</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={()=>this.selectLanguage(2)}
                style={{ height: "31%", flexDirection:"row"
                  , width: '100%', borderRadius: 5
                  , backgroundColor: (this.state.nowLang === 2) ? "#ffffff" : "#000000"
                  , justifyContent:"center", alignItems:"center"}}>
                <Text style={{color:"#292929"}}>일본어 인식</Text>
              </TouchableOpacity>

            </View>

          </TouchableOpacity>
        </Modal>

        <Modal
          animationType="slide"
          transparent={true}
          visible={ (this.state.ocrResult.length > 0) && this.state.modalShow3}>
          <TouchableOpacity
            onPress={this.closeModal3}
            style={{ flex:1 ,backgroundColor : "#ffffff"}}
            accessible={true}>
            <View style={{ height: "100%" , width: "100%"
              , justifyContent:"center", alignItems:"center"
              , padding: 10
            }}>
              <TextInput
                style={{fontSize: 18, height : "90%", width : "100%"}}
                multiline={true}
                value={this.state.ocrResult}
                editable={false}
              />
            </View>
          </TouchableOpacity>
        </Modal>

        <View style={{height: "1%", width: '100%', backgroundColor: "#000000"}}/>
      </View>
    );
  }
}

export default PickerCamera;
