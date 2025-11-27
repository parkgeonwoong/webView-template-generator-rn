import JSZip from "jszip";

import {
  TEMPLATE_ZIP_PATH,
  WEBVIEW_CONFIG_PATH,
  STACK_WITH_PERMISSION_PATH,
  STACK_WITHOUT_PERMISSION_PATH,
  TARGET_STACK_PATH,
  PACKAGE_JSON_PATH,
  MANIFEST_XML_PATH,
  INFO_PLIST_PATH,
  PODFILE_PATH,
  ANDROID_PERMISSION_SNIPPETS,
  IOS_USAGE_DESCRIPTION_SNIPPETS,
  PODFILE_PERMISSION_KEYS,
} from "../constants";

/* 1. 기본 템플릿 ZIP 불러오기 */
export async function loadBaseTemplateZip() {
  const response = await fetch(TEMPLATE_ZIP_PATH);
  if (!response.ok) {
    throw new Error(`ZIP 파일을 불러오는데 실패했습니다.`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return JSZip.loadAsync(arrayBuffer);
}

/* 2. WebView 설정 파일(webview.ts) 수정 */
export async function updateWebviewConfig(
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
export async function updateNavigationStack(zip, { usePermissionGuide }) {
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
export async function updatePackageJson(zip, { usePermissionGuide, hasPermissionScopes }) {
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

  // PERM 기능
  if (hasPermissionScopes) {
    packageJson.dependencies["react-native-permissions"] = "^5.4.2";
  } else {
    // delete packageJson.dependencies["react-native-permissions"];
  }

  const newPackageContent = JSON.stringify(packageJson, null, 2);
  zip.file(PACKAGE_JSON_PATH, newPackageContent);
}

/* 5. AndroidManifest.xml 파일 수정 */
export async function updateAndroidManifest(zip, { selectedScopes }) {
  const file = zip.file(MANIFEST_XML_PATH);
  if (!file) return;

  let content = await file.async("string");
  const marker = "<!-- __ANDROID_PERMISSION_DECLS__ -->";

  const snippets = selectedScopes.map((scope) => ANDROID_PERMISSION_SNIPPETS[scope] || "").join("");

  content = content.replace(marker, snippets.trimEnd());
  zip.file(MANIFEST_XML_PATH, content);
}

/* 6. Info.plist 파일 수정 */
export async function updateInfoPlist(zip, { selectedScopes }) {
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
export async function updatePodfile(zip, { selectedScopes, hasPermissionScopes }) {
  const file = zip.file(PODFILE_PATH);
  if (!file) return;

  let content = await file.async("string");

  // PERM 기능을 전혀 쓰지 않으면, Podfile에서 permission 블록 자체를 제거
  if (!hasPermissionScopes) {
    const start = "# __PERMISSIONS_SETUP_START__";
    const end = "# __PERMISSIONS_SETUP_END__";
    const regex = new RegExp(`${start}[\\s\\S]*?${end}\\n?`, "m");
    content = content.replace(regex, "");
    zip.file(PODFILE_PATH, content);
    return;
  }

  // PERM 기능을 쓸 때만, 선택된 scopes 기반으로 setup_permissions 채우기
  const marker = "<!-- __IOS_SETUP_PERMISSIONS__ -->";
  const lines = selectedScopes
    .map((scope) => PODFILE_PERMISSION_KEYS[scope])
    .filter(Boolean)
    .map((key) => `    '${key}',`)
    .join("\n");

  content = content.replace(marker, lines);

  zip.file(PODFILE_PATH, content);
}
