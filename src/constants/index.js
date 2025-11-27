/* public/templates 에 올라가 있는 RN 기본 템플릿 ZIP 경로 */
export const TEMPLATE_ZIP_PATH = "/templates/rnBaseTemplate.zip";

/* ZIP 내부 파일 경로들 */
export const WEBVIEW_CONFIG_PATH = "rnBaseTemplate/src/config/webview.ts";
export const STACK_WITH_PERMISSION_PATH =
  "rnBaseTemplate/src/navigations/Stack.with-permission.tsx";
export const STACK_WITHOUT_PERMISSION_PATH =
  "rnBaseTemplate/src/navigations/Stack.without-permission.tsx";
export const TARGET_STACK_PATH = "rnBaseTemplate/src/navigations/Stack.tsx";
export const PACKAGE_JSON_PATH = "rnBaseTemplate/package.json";

export const ON_MESSAGE_PATH = "rnBaseTemplate/src/handler/onMessage.ts";
export const PERMISSIONS_UTIL_PATH = "rnBaseTemplate/src/utils/permissions.ts";

export const MANIFEST_XML_PATH = "rnBaseTemplate/android/app/src/main/AndroidManifest.xml";
export const INFO_PLIST_PATH = "rnBaseTemplate/ios/rnBaseTemplate/Info.plist";
export const PODFILE_PATH = "rnBaseTemplate/ios/Podfile";

export const ANDROID_PERMISSION_SNIPPETS = {
  camera: '    <uses-permission android:name="android.permission.CAMERA" />\n',
  microphone: '    <uses-permission android:name="android.permission.RECORD_AUDIO" />\n',
  location: '    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />\n',
  photos:
    '    <uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />\n' +
    '    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" android:maxSdkVersion="32" />\n',
};

export const IOS_USAGE_DESCRIPTION_SNIPPETS = {
  camera: `
  <key>NSCameraUsageDescription</key>
  <string>이 앱은 카메라 기능을 사용하기 위해 권한이 필요합니다.</string>
`,
  microphone: `
  <key>NSMicrophoneUsageDescription</key>
  <string>이 앱은 녹음 기능을 사용하기 위해 마이크 권한이 필요합니다.</string>
`,
  photos: `
  <key>NSPhotoLibraryUsageDescription</key>
  <string>이 앱은 사진을 불러오기 위해 사진 보관함 접근 권한이 필요합니다.</string>
`,
  location: `
  <key>NSLocationWhenInUseUsageDescription</key>
  <string>이 앱은 위치 기반 서비스를 제공하기 위해 위치 정보가 필요합니다.</string>
`,
};

export const PODFILE_PERMISSION_KEYS = {
  camera: "Camera",
  microphone: "Microphone",
  location: "LocationWhenInUse",
  photos: "PhotoLibrary",
};

/* TODO: 권한 메타데이터 정의 */
export const PERMISSION_OPTIONS = [
  {
    id: "camera",
    label: "카메라 접근 권한(선택)",
    description: "프로필 촬영, 화상 통화 등을 위해 카메라 접근 권한이 필요합니다.",
    category: "권한요청",
  },
  {
    id: "microphone",
    label: "마이크 접근 권한(선택)",
    description: "음성 녹음, 통화 기능 등을 위해 마이크 접근 권한이 필요합니다.",
    category: "권한요청",
  },
  {
    id: "photos",
    label: "사진/갤러리 접근 권한(선택)",
    description: "사진 업로드를 위해 사진/미디어 접근 권한이 필요합니다.",
    category: "권한요청",
  },
  {
    id: "location",
    label: "위치 접근 권한(선택)",
    description: "주변 찾기, 지도 기능 등을 위해 위치 정보가 필요합니다.",
    category: "권한요청",
  },

  // ⚠️ 앞으로 권한이 늘어나면 여기 배열에만 계속 추가하면 됨
];
