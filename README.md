# Project Summary

> RN + OpenCV3 Object Detection, OCR ...

- 개발기간
  + 기획 및 API 결정 / UI 디자인 / 기본세팅 및 프로젝트 구조, 라이브러리 설치 : 2일
  + 코드작성 : 4일
  + 테스트 및 리팩토링: 10일
  
- 특징 및 기능 
  + 성능을 위해 Android 모듈형태로 개발
  + Object Detection : OpenCV3 + MobileNet-SSD
  + OCR : OpenCV3 + Tesseract (한글, 영문, 가타카나, 히라가나)
  + QR코드 생성 및 처리 : Zxing

- Project Common Dependencies

[![openCV3](https://img.shields.io/badge/OpenCV3-white?style=flat&labelColor=blue&logoColor=black&logo=opencv)](https://opencv.org)
[![MobileNet-SSD](https://img.shields.io/badge/MobileNet-SSD-white?style=flat&labelColor=blue&logoColor=black&logo=ssd)](https://github.com/chuanqi305/MobileNet-SSD)
[![Tesseract](https://img.shields.io/badge/Tesseract-white?style=flat&labelColor=blue&logoColor=black&logo=tess)](https://github.com/tesseract-ocr/tesseract)
[![Zxing](https://img.shields.io/badge/Zxing-white?style=flat&labelColor=blue&logoColor=black&logo=Zxing)](https://github.com/zxing/zxing)
[![React](https://img.shields.io/badge/React-v17.0.1-white?style=flat&labelColor=blue&logoColor=black&logo=react)](https://github.com/facebook/react)
[![RN](https://img.shields.io/badge/React--Native-v0.64.0-white?style=fla&labelColor=blue&logoColor=blackt&logo=react)](https://github.com/facebook/react-native)
[![react-native-camera](https://img.shields.io/badge/React--Native--camera-v3.43.0-white?style=fla&labelColor=blue&logoColor=blackt&logo=react)]()
[![react-native-image-crop-picker](https://img.shields.io/badge/React--Native--image--crop--picker-v^0.36.0-white?style=fla&labelColor=blue&logoColor=blackt&logo=react)]()
[![react-native-svg](https://img.shields.io/badge/React--Native--svg-v0.64.0-white?style=fla&labelColor=blue&logoColor=blackt&logo=react-native)]()
[![Typescript](https://img.shields.io/badge/Typescript-v4.1.3-white?style=flat&labelColor=blue&logoColor=black&logo=typescript)](https://github.com/microsoft/TypeScript)

***
# Object Detection

![opencv_1](https://user-images.githubusercontent.com/25360777/120133207-a80dc880-c206-11eb-8f82-9e3d47802447.gif)![opencv_1_result](https://user-images.githubusercontent.com/25360777/120133776-b9a3a000-c207-11eb-9d06-7488d039f857.png)

![opencv_2_result](https://user-images.githubusercontent.com/25360777/120133287-d1c6ef80-c206-11eb-86e3-e0b667e0083e.png)![opencv_3](https://user-images.githubusercontent.com/25360777/120133294-d4c1e000-c206-11eb-8f7c-627e949c57f9.png)

![opencv_4](https://user-images.githubusercontent.com/25360777/120133299-d7bcd080-c206-11eb-871f-8ed9e26705df.png)

![ssd_9782f59a-c542-441e-98d2-84e972c7eeff](https://user-images.githubusercontent.com/25360777/120133328-eacfa080-c206-11eb-8f87-c338206fc748.jpg)![ssd_df3ed32f-be83-46e4-a283-597008da322c](https://user-images.githubusercontent.com/25360777/120133337-f15e1800-c206-11eb-8448-361751b3c67b.jpg)![ssd_b00300be-1ffa-43ad-a8da-54bee4e0d334](https://user-images.githubusercontent.com/25360777/120133338-f3c07200-c206-11eb-948f-1f112450f23a.jpg)
***

# OCR

<img src="https://user-images.githubusercontent.com/25360777/120133400-1bafd580-c207-11eb-979a-e1874873ba13.png" width="35%" height="35%">![orc_3](https://user-images.githubusercontent.com/25360777/120133434-279b9780-c207-11eb-910f-b9b67c1d5197.png)

<img src="https://user-images.githubusercontent.com/25360777/120133413-1fdbf300-c207-11eb-9bf0-3ee712654759.png" width="35%" height="35%">![ocr_result2](https://user-images.githubusercontent.com/25360777/120133464-31bd9600-c207-11eb-9456-1bcaf5189c67.png)
***

# QR Code Maker
![keyboardshotgun_qrcode](https://user-images.githubusercontent.com/25360777/120133490-41d57580-c207-11eb-96f7-fc3bc71e5932.jpg)
![qr_read_keyboardshotgun](https://user-images.githubusercontent.com/25360777/120133704-9aa50e00-c207-11eb-86b1-04e4bd7b1f38.jpg)
***

## 참고
- https://opencv.org
- https://github.com/chuanqi305/MobileNet-SSD
- https://github.com/tesseract-ocr/tesseract
- https://github.com/zxing/zxing
- https://yeomko.tistory.com/20?category=888201

## 후기 및 계획
- 이미지 후처리, 보정을 통한 인식률 향상방법 습득.
- 사물 인식은 생각보다 잘 구별 되는 편
- ocr은 한글의 경우 빅스비 따라 가려면 많은 학습이 필요 할듯.
- YOLOv5 테스트 필요 (SSD와 비교)  
- https://github.com/ultralytics/yolov5
