import { useState } from "react";
import { saveAs } from "file-saver";
import JSZip from "jszip";

import "./styles/App.css";

import WebviewSettingsSection from "./components/WebviewSettingsSection";
import DownloadInstructions from "./components/DownloadInstructions";
import PermissionSelectorModal from "./components/modal/PermissionSelectorModal";

// ----------------------
// 템플릿 관련 상수 & 헬퍼
// ----------------------

/* public/templates 에 올라가 있는 RN 기본 템플릿 ZIP 경로 */
const TEMPLATE_ZIP_PATH = "/templates/rnBaseTemplate.zip";

/* ZIP 내부 파일 경로들 */
const WEBVIEW_CONFIG_PATH = "rnBaseTemplate/src/config/webview.ts";
const STACK_WITH_PERMISSION_PATH = "rnBaseTemplate/src/navigations/Stack.with-permission.tsx";
const STACK_WITHOUT_PERMISSION_PATH = "rnBaseTemplate/src/navigations/Stack.without-permission.tsx";
const TARGET_STACK_PATH = "rnBaseTemplate/src/navigations/Stack.tsx";
const PACKAGE_JSON_PATH = "rnBaseTemplate/package.json";

const MANIFEST_XML_PATH = "rnBaseTemplate/android/app/src/main/AndroidManifest.xml";
const INFO_PLIST_PATH = "rnBaseTemplate/ios/rnBaseTemplate/Info.plist";
const PODFILE_PATH = "rnBaseTemplate/ios/Podfile";

const ANDROID_PERMISSION_SNIPPETS = {
  camera: '    <uses-permission android:name="android.permission.CAMERA" />\n',
  microphone: '    <uses-permission android:name="android.permission.RECORD_AUDIO" />\n',
  location: '    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />\n',
  photos:
    '    <uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />\n' +
    '    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" android:maxSdkVersion="32" />\n',
};

const IOS_USAGE_DESCRIPTION_SNIPPETS = {
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

const PODFILE_PERMISSION_KEYS = {
  camera: "Camera",
  microphone: "Microphone",
  location: "LocationWhenInUse",
  photos: "PhotoLibrary",
};

/* TODO: 권한 메타데이터 정의 */
const PERMISSION_OPTIONS = [
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

// TODO: 권한 id → 메타데이터 빠른 조회용
const PERMISSION_MAP = PERMISSION_OPTIONS.reduce((acc, item) => {
  acc[item.id] = item;
  return acc;
}, {});

/* 1. 기본 템플릿 ZIP 불러오기 */
async function loadBaseTemplateZip() {
  const response = await fetch(TEMPLATE_ZIP_PATH);
  if (!response.ok) {
    throw new Error(`ZIP 파일을 불러오는데 실패했습니다.`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return JSZip.loadAsync(arrayBuffer);
}

/* 2. WebView 설정 파일(webview.ts) 수정 */
async function updateWebviewConfig(
  zip,
  { webviewUri, extraHosts, enableDebug, usePermissionGuide }
) {
  const configFile = zip.file(WEBVIEW_CONFIG_PATH);
  if (!configFile) {
    throw new Error(`ZIP 안에서 WebView 설정 파일을 찾을 수 없습니다. (${WEBVIEW_CONFIG_PATH})`);
  }

  // 원본 파일 내용 읽기
  const originalContent = await configFile.async("string");

  // 기본 플레이스홀더 치환
  let replacedContent = originalContent
    .replace("__WEBVIEW_URI__", webviewUri)
    .replace("__WEBVIEW_DEBUGGING_ENABLED__", enableDebug ? "true" : "false")
    .replace("__USE_PERMISSION_GUIDE__", usePermissionGuide ? "true" : "false");

  // 추가 허용 도메인(ALLOW_HOSTS) 치환
  if (extraHosts.length > 0) {
    const SENTINEL = " // __EXTRA_ALLOW_HOSTS__";
    const extraHostLines = extraHosts.map((host) => `  '${host}',`).join("\n");

    // 토큰을 "도메인 목록 + 다시 토큰" 으로 교체해서 다음에도 재사용 가능하게
    replacedContent = replacedContent.replace(SENTINEL, `${extraHostLines}\n${SENTINEL}`);
  }

  // 수정된 내용으로 다시 파일 덮어쓰기
  zip.file(WEBVIEW_CONFIG_PATH, replacedContent);
}

/* 3. 권한 안내 화면 사용 여부에 따라 Stack 네비게이션 파일 교체 */
async function updateNavigationStack(zip, { usePermissionGuide }) {
  const chosenStackPath = usePermissionGuide
    ? STACK_WITH_PERMISSION_PATH
    : STACK_WITHOUT_PERMISSION_PATH;

  const chosenStackFile = zip.file(chosenStackPath);
  if (!chosenStackFile) {
    throw new Error(`ZIP 안에서 Stack 템플릿 파일을 찾을 수 없습니다. (${chosenStackPath})`);
  }

  const chosenStackContent = await chosenStackFile.async("string");

  // 최종 프로젝트에서는 항상 Stack.tsx 라는 이름으로 사용
  zip.file(TARGET_STACK_PATH, chosenStackContent);
  zip.remove(STACK_WITH_PERMISSION_PATH);
  zip.remove(STACK_WITHOUT_PERMISSION_PATH);
}

/* 4. package.json 파일 수정 */
async function updatePackageJson(zip, { usePermissionGuide }) {
  const packageFile = zip.file(PACKAGE_JSON_PATH); // 파일 읽기

  if (!packageFile) return;

  const packageContent = await packageFile.async("string"); // 실제 텍스트 내용
  const packageJson = JSON.parse(packageContent);

  // 권한안내 화면 옵션
  if (usePermissionGuide) {
    packageJson.dependencies["@react-native-async-storage/async-storage"] = "^1.24.0";
  } else {
    delete packageJson.dependencies["@react-native-async-storage/async-storage"];
  }

  const newPackageContent = JSON.stringify(packageJson, null, 2);
  zip.file(PACKAGE_JSON_PATH, newPackageContent);
}

/* 5. AndroidManifest.xml 파일 수정 */
async function updateAndroidManifest(zip, { selectedScopes }) {
  const file = zip.file(MANIFEST_XML_PATH);
  if (!file) return;

  let content = await file.async("string");
  const marker = "<!-- __ANDROID_PERMISSION_DECLS__ -->";

  const snippets = selectedScopes.map((scope) => ANDROID_PERMISSION_SNIPPETS[scope] || "").join("");

  content = content.replace(marker, snippets.trimEnd());
  zip.file(MANIFEST_XML_PATH, content);
}

/* 6. Info.plist 파일 수정 */
async function updateInfoPlist(zip, { selectedScopes }) {
  const file = zip.file(INFO_PLIST_PATH);
  if (!file) return;

  let content = await file.async("string");
  const marker = "<!-- __IOS_PERMISSION_USAGE_DESCRIPTIONS__ -->";

  const snippets = selectedScopes
    .map((scope) => IOS_USAGE_DESCRIPTION_SNIPPETS[scope] || "")
    .join("");

  content = content.replace(marker, snippets.trim() + "\n");
  zip.file(INFO_PLIST_PATH, content);
}

/* 7. Podfile 파일 수정 */
async function updatePodfile(zip, { selectedScopes }) {
  const file = zip.file(PODFILE_PATH);
  if (!file) return;

  let content = await file.async("string");
  const marker = "<!-- __IOS_SETUP_PERMISSIONS__ -->";

  const lines = selectedScopes
    .map((scope) => PODFILE_PERMISSION_KEYS[scope])
    .filter(Boolean)
    .map((key) => `    '${key}',`)
    .join("\n");

  content = content.replace(marker, lines);

  zip.file(PODFILE_PATH, content);
}

function App() {
  const [isDownloading, setIsDownloading] = useState(false);

  /* 웹뷰 관련 옵션(URI, 허용 도메인, 디버깅 여부, 권한 안내 화면 여부) */
  const [webviewUri, setWebviewUri] = useState(""); // 웹뷰 URL
  const [extraHostInput, setExtraHostInput] = useState(""); // 추가 허용 도메인 입력
  const [extraHosts, setExtraHosts] = useState([]); // 추가 허용 도메인 목록
  const [enableDebug, setEnableDebug] = useState(false); // 디버깅 여부

  /* 권한 관련 옵션 */
  const [usePermissionGuide, setUsePermissionGuide] = useState(false); // 권한 안내 화면 여부
  const [selectedScopes, setSelectedScopes] = useState([]); // 선택된 권한 목록

  // ----------------------
  // 핸들러
  // ----------------------

  /* 추가 허용 도메인 추가 */
  const handleAddHost = () => {
    const value = extraHostInput.trim();
    if (!value) return;

    // 이미 추가된 도메인은 중복 추가하지 않음
    if (extraHosts.includes(value)) {
      setExtraHostInput("");
      return;
    }

    setExtraHosts([...extraHosts, value]);
    setExtraHostInput("");
  };

  /* 추가 허용 도메인 삭제 */
  const handleRemoveHost = (hostToRemove) => {
    setExtraHosts((prev) => prev.filter((host) => host !== hostToRemove));
  };

  /* 템플릿 ZIP 생성 & 다운로드 */
  const downloadTemplate = async () => {
    // TODO: 예외처리

    try {
      setIsDownloading(true);

      // 1. 기본 RN 템플릿 ZIP 불러오기
      const zip = await loadBaseTemplateZip();

      // 2. WebView 관련 설정 파일 수정
      await updateWebviewConfig(zip, { webviewUri, extraHosts, enableDebug, usePermissionGuide });

      // 3. 권한 안내 화면 사용 여부에 따라 Stack 네비게이션 파일 교체
      await updateNavigationStack(zip, { usePermissionGuide });

      // 4. package.json 파일 수정
      await updatePackageJson(zip, { usePermissionGuide });

      // 5. Android / iOS 권한 파일 수정 (선택한 scopes 기반)
      await updateAndroidManifest(zip, { selectedScopes });
      await updateInfoPlist(zip, { selectedScopes });
      await updatePodfile(zip, { selectedScopes });

      // 6. 수정된 zip 생성
      const newZipBlob = await zip.generateAsync({ type: "blob" });

      // 다운로드
      saveAs(newZipBlob, "rn-webview-app.zip");

      alert("다운로드 완료! ZIP 파일 압축 해제 후 npm install 실행하세요.");
    } catch (error) {
      console.error("다운로드 실패:", error);
      alert("템플릿 생성 중 오류가 발생했습니다. 콘솔 로그를 확인해 주세요.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      <div className="App">
        <h1 className="app-title">React Native Webview 템플릿 생성기</h1>

        {/* TODO: 앱 메타데이터? */}

        {/* 웹뷰 관련 카테고리 카드 */}
        <WebviewSettingsSection
          webviewUri={webviewUri}
          onChangeWebviewUri={setWebviewUri}
          extraHostInput={extraHostInput}
          onChangeExtraHostInput={setExtraHostInput}
          onAddHost={handleAddHost}
          onRemoveHost={handleRemoveHost}
          extraHosts={extraHosts}
          enableDebug={enableDebug}
          onChangeEnableDebug={setEnableDebug}
        />

        {/* 앱 권한 설정 카드 */}
        <section className="category-card">
          <h2 className="category-title">앱 권한 설정</h2>
          <p className="category-description">{/* TODO: 설명 */}앱 권한 관련 옵션을 설정합니다.</p>

          <div className="category-body">
            {/* 앱 최초 실행 시 권한 안내 화면 */}
            <div className="form-field">
              <label className="form-label">앱 실행 시 권한 안내 화면</label>
              <div className="debug-checkbox-row">
                <input
                  id="permission-guide-checkbox"
                  type="checkbox"
                  checked={usePermissionGuide}
                  onChange={(e) => setUsePermissionGuide(e.target.checked)}
                  className="debug-checkbox"
                />
                <label htmlFor="permission-guide-checkbox" className="debug-checkbox-label">
                  첫 실행 시 카메라/갤러리 등 앱 권한 안내 화면을 한 번 보여줍니다.
                </label>
              </div>
            </div>
          </div>
        </section>

        {/* 템플릿 생성(다운로드) 버튼 */}
        <button onClick={downloadTemplate} disabled={isDownloading} className="download-button">
          {isDownloading ? "다운로드 중..." : "생성하기"}
        </button>

        {/* TODO: 다운로드 후 안내 카드 */}
        <DownloadInstructions />

        {/* 환경세팅 설명 */}
      </div>
    </>
  );
}

export default App;
