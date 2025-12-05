/* OS 권한 메타데이터 정의 */
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

/* 브릿지 기능 옵션 (웹 선택기능) */
export const BRIDGE_FEATURE_OPTIONS = [
  {
    id: "WEBVIEW_CLEAR_CACHE",
    label: "웹뷰 캐시 삭제 기능",
    description: "웹에서 CLEAR_CACHE 요청으로 네이티브 캐시 삭제를 호출할 수 있습니다.",
    category: "WebView 기능",
  },
  {
    id: "NAV_GO_BACK",
    label: "웹뷰 내 뒤로가기",
    description: "type: 'NAV', action: 'GO_BACK' 으로 WebView 뒤로가기를 호출합니다.",
    category: "네비게이션",
  },
  {
    id: "NAV_TO_TMP",
    label: "임시 페이지 이동",
    description: "type: 'NAV', action: 'TO_TMP' 으로 'Tmp' 스택 화면으로 이동합니다.",
    category: "네비게이션",
  },
  {
    id: "APP_OPEN_URL",
    label: "외부 앱 실행",
    description: "type: 'APP', action: 'OPEN_URL', payload: { url } 로 외부 브라우저/앱을 엽니다.",
    category: "앱 기능",
  },
  {
    id: "APP_GET_VERSION",
    label: "앱 버전 조회",
    description: "type: 'APP', action: 'GET_VERSION' 으로 네이티브 앱 버전 정보를 조회합니다.",
    category: "앱 기능",
  },
  {
    id: "CALL_PHONE_SMS_EMAIL",
    label: "전화, 문자, 이메일 기능",
    description: "웹에서 CALL 브릿지 요청으로 전화, 문자, 이메일을 호출할 수 있습니다.",
    category: "통화/메시징",
  },
  {
    id: "MEDIA_KEYBOARD",
    label: "키보드 기능",
    description:
      "type: 'MEDIA', action: 'KEYBOARD_SHOW', payload: { selector } 으로 키보드를 보여주고, type: 'MEDIA', action: 'KEYBOARD_HIDE' 으로 키보드를 숨깁니다.",
    category: "미디어",
  },
  {
    id: "MEDIA_VOLUME",
    label: "볼륨 기능",
    description: "type: 'MEDIA', action: 'CHANGE_VOLUME' 으로 볼륨을 변경합니다.",
    category: "미디어",
  },

  // 나중에 NAV, APP, CALL 같은 것도 여기 계속 추가 가능
];
