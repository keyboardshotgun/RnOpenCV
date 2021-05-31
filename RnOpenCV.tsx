import { Alert, NativeEventEmitter, NativeModules, PermissionsAndroid, Platform } from "react-native";

type callBack = ( msg: any ) => void

interface IRnOpenCV {
  checkForBlurImage : (imageAsBase64: string, Error : callBack , Success: callBack ) => void
  imageDetectWithSSD : (imageAsBase64: string) => void,
}

interface IRnQrCode {
  startQrCode  : () => void,
  qrCodeBuild : (textForQr: String) => void,
}

interface IRnOcr {
  getStart  : (imageAsBase64: string) => void,
  changeLanguage : (language: string) => void,
}

export const requestPermission = async () => {
  try {
    if (Platform.OS === "android") {

      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.CAMERA,
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
      ]);

      if (granted) {
        return granted;
      }

    } else {
      Alert.alert("현재는 안드로이드 전용 입니다.");
      return false;
    }
  } catch (e) {
    console.log("granted : ", e);
    return false;
  }
};

// OpenCV
export const rnOpenCvEventEmitter = new NativeEventEmitter(NativeModules.RnOpenCV);
export const RnOpenCV : IRnOpenCV = NativeModules.RnOpenCV;

// Qr Code
export const rnQrEventEmitter = new NativeEventEmitter(NativeModules.RNQrCode);
export const RNQrCode : IRnQrCode = NativeModules.RNQrCode;

export const rnOcrEventEmitter = new NativeEventEmitter(NativeModules.RnOpenCVOcrModule);
export const RnOcr : IRnOcr = NativeModules.RnOpenCVOcrModule;
