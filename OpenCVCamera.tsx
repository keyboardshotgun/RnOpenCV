import React, { Component } from "react";
import { RNCamera } from "react-native-camera";
import {
  Alert,
  PermissionsAndroid,
  Platform,
  View,
  TouchableOpacity, Text, StyleSheet
} from "react-native";
import { requestPermission, RnOpenCV } from "./RnOpenCV";

const camStyle = StyleSheet.create({
  imagePreview: {
    position: "absolute",
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
  },
  container: {
    flex: 1,
    flexDirection: "row"
  },
  repeatPhotoContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "50%",
    height: 120,
    backgroundColor: "#000",
    alignItems: "flex-start",
    justifyContent: "center"
  },
  topButtonsContainer: {
    flexDirection: "row",
    alignItems: "center",
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    padding: 10,
    justifyContent: "space-between"
  },
  focusFrameContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%",
    width: "100%"
  },
  focusFrame: {
    height: 90,
    width: 90,
    borderWidth: 1,
    borderColor: "#fff",
    borderStyle: "dotted",
    borderRadius: 5
  },
  photoPreviewRepeatPhotoText: {
    color: "#abcfff",
    fontSize: 15,
    marginLeft: 10
  },
  usePhotoContainer: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: "50%",
    height: 120,
    backgroundColor: "#000",
    alignItems: "flex-end",
    justifyContent: "center"
  },
  photoPreviewUsePhotoText: {
    color: "#abcfff",
    fontSize: 15,
    marginRight: 10
  },
  preview: {
    position: "relative",
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center"
  },
  takePictureContainer: {
    position : 'absolute',
    bottom : 20,
    left : 170,
    paddingVertical: 20,
    justifyContent: "center",
    alignItems: "center"
  }
});

interface OpenCVCameraState {
  cameraPermission: boolean,
  photoAsBase64: {
    content: string,
    isPhotoPreview: boolean,
    photoPath: string,
  }
}

interface OpenCVCameraProps {

}

class OpenCVCamera extends Component<OpenCVCameraProps, OpenCVCameraState> {

  camera: any;

  constructor(props: OpenCVCameraProps) {
    super(props);
    this.state = {
      cameraPermission: false,
      photoAsBase64: {
        content: "",
        isPhotoPreview: false,
        photoPath: ""
      }
    };
    this.camera = null;
  }

  componentDidMount() {
    requestPermission().then((res) => {
      if (res) {
        this.setState({
          cameraPermission: true
        });
      } else {
        this.setState({
          cameraPermission: false
        });
      }
    }).catch((err) => {
      console.warn("Camera Permission Error :", err);
    });
  }

  takePicture = async () => {
    if (this.camera) {
      const options = { quality: 0.5, base64: true };
      const data = await this.camera.takePictureAsync(options);
      // console.log("takePicture data : ", data);
      if( data && data.hasOwnProperty("base64") ){
        this.setState({
          ...this.state,
          photoAsBase64: {
            content: data.base64,
            isPhotoPreview: false,
            photoPath: data.uri
          }
        },()=>{
          this.proceedWithCheckingBlurryImage();
        });
      }else{
        console.log("takePicture no data from camera");
      }
    }
  };

  chkForBlurryImage = (imageAsBase64: any) => {
    return new Promise((resolve, reject) => {
      if (Platform.OS === "android")
      {
        RnOpenCV.checkForBlurImage(imageAsBase64, (error: any) => {
          // error handling
          console.log("error check is blurry, reset state", error);
          reject(error);
          this.resetPhoto();
        }, (msg: any) => {
          resolve(msg);
        });
      }
      // } else { IOS
      //   RnOpenCV.checkForBlurryImage(imageAsBase64, (error: any, dataArray: any) => {
      //     resolve(dataArray[0]);
      //   });
      // }
    });
  };

  proceedWithCheckingBlurryImage = () => {
    const { content, photoPath } = this.state.photoAsBase64;
    // console.log("content :", content);
    // console.log("photoPath :", photoPath);
    this.chkForBlurryImage(content).then( (blurryPhoto: any) => {
      if (blurryPhoto) {
        console.log("Photo is blur : ", blurryPhoto);
        return this.resetPhoto();
      }
      console.log("Photo is clear!");
      this.setState({ photoAsBase64: { ...this.state.photoAsBase64, isPhotoPreview: true, photoPath } });
    }).catch(err => {
      console.log("err", err);
    });
  };

  resetPhoto = () => {
    console.log("reset photo");
    this.setState({
      ...this.state,
      photoAsBase64: {
        content: "",
        isPhotoPreview: false,
        photoPath: ""
      }
    });
  };

  render() {
    return (
      <View style={{ flex: 1, flexDirection: "row" }}>
        { this.state.cameraPermission ? (
          <RNCamera
            ref={(ref) => {
              this.camera = ref;
            }}
            style={camStyle.imagePreview}
            androidCameraPermissionOptions={{
              title: 'Permission to use camera',
              message: 'We need your permission to use your camera',
              buttonPositive: 'Ok',
              buttonNegative: 'Cancel',
            }}
            androidRecordAudioPermissionOptions={{
              title: 'Permission to use audio recording',
              message: 'We need your permission to use your audio',
              buttonPositive: 'Ok',
              buttonNegative: 'Cancel',
            }}
          >
            <View style={camStyle.takePictureContainer}>
              <TouchableOpacity
                onPress={this.takePicture}
              >
                <Text style={{ fontSize: 35, color: "#FFFF00" }}>{"📷"}</Text>
              </TouchableOpacity>
            </View>
          </RNCamera>
          )
          :
          null
        }
      </View>
    );
  }
}

export default OpenCVCamera;
