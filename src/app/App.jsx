import { useCallback, useState } from "react";
import { saveAs } from "file-saver";

import "./App.css";

import { WebviewSettingsSection } from "../features/webview-settings";
import { DownloadInstructions } from "../features/template-generator";
import {
  FeatureSelectorModal,
  PermissionSettingsSection,
  BRIDGE_FEATURE_OPTIONS,
  PERMISSION_OPTIONS,
} from "../features/permission";

import {
  loadBaseTemplateZip,
  updateWebviewConfig,
  updateNavigationStack,
  updatePackageJson,
  updateAndroidManifest,
  updateInfoPlist,
  updatePodfile,
  updatePermissionFeatureFiles,
  updateBridgeFeatureFiles,
} from "../features/template-generator";

// ----------------------
// 템플릿 관련 상수 & 헬퍼
// ----------------------

// TODO: 권한 id → 메타데이터 빠른 조회용
const PERMISSION_MAP = PERMISSION_OPTIONS.reduce((acc, item) => {
  acc[item.id] = item;
  return acc;
}, {});

function App() {
  const [isDownloading, setIsDownloading] = useState(false);

  /* 웹뷰 관련 옵션(URI, 허용 도메인, 디버깅 여부, 권한 안내 화면 여부) */
  const [webviewUri, setWebviewUri] = useState(""); // 웹뷰 URL
  const [extraHostInput, setExtraHostInput] = useState(""); // 추가 허용 도메인 입력
  const [extraHosts, setExtraHosts] = useState([]); // 추가 허용 도메인 목록
  const [enableDebug, setEnableDebug] = useState(false); // 디버깅 여부

  /* 권한 관련 옵션 */
  const [usePermissionGuide, setUsePermissionGuide] = useState(false); // 권한 안내 화면 여부
  const [selectedScopes, setSelectedScopes] = useState([]); // 선택된 OS 권한 목록

  const hasPermissionScopes = selectedScopes.length > 0; // PERM 기능 활성 여부

  /* 브릿지 기능 관련 옵션 */
  const [selectedBridgeFeatures, setSelectedBridgeFeatures] = useState([]); // 선택된 브릿지 기능 목록

  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);

  // ----------------------
  // 핸들러
  // ----------------------

  /* 추가 허용 도메인 추가 */
  const handleAddHost = useCallback(() => {
    const value = extraHostInput.trim();
    if (!value) return;

    // 이미 추가된 도메인은 중복 추가하지 않음
    if (extraHosts.includes(value)) {
      setExtraHostInput("");
      return;
    }

    setExtraHosts([...extraHosts, value]);
    setExtraHostInput("");
  }, [extraHostInput, extraHosts]);

  /* 추가 허용 도메인 삭제 */
  const handleRemoveHost = useCallback((hostToRemove) => {
    setExtraHosts((prev) => prev.filter((host) => host !== hostToRemove));
  }, []);

  /* 권한 선택 모달 열기 */
  const handleOpenPermissionModal = useCallback(() => {
    setIsPermissionModalOpen(true);
  }, []);

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
      await updatePackageJson(zip, {
        usePermissionGuide,
        hasPermissionScopes,
        selectedBridgeFeatures,
      });

      // PERM 기능 토글
      await updatePermissionFeatureFiles(zip, { hasPermissionScopes });

      // 브릿지 기능 토글
      await updateBridgeFeatureFiles(zip, { selectedBridgeFeatures });

      // 5. Android / iOS 권한 파일 수정 (선택한 scopes 기반)
      if (hasPermissionScopes) {
        await updateAndroidManifest(zip, { selectedScopes });
        await updateInfoPlist(zip, { selectedScopes });
      }
      await updatePodfile(zip, { selectedScopes, hasPermissionScopes });

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
        <PermissionSettingsSection
          usePermissionGuide={usePermissionGuide}
          onChangeUsePermissionGuide={setUsePermissionGuide}
          onOpenPermissionModal={handleOpenPermissionModal}
          selectedScopes={selectedScopes}
          selectedBridgeFeatures={selectedBridgeFeatures}
          permissionMap={PERMISSION_MAP}
          bridgeFeatureOptions={BRIDGE_FEATURE_OPTIONS}
        />

        {/* 템플릿 생성(다운로드) 버튼 */}
        <button onClick={downloadTemplate} disabled={isDownloading} className="download-button">
          {isDownloading ? "다운로드 중..." : "생성하기"}
        </button>

        {/* TODO: 다운로드 후 안내 카드 */}
        <DownloadInstructions />

        {/* 환경세팅 설명 */}
      </div>

      {/* 권한 선택 모달 */}
      <FeatureSelectorModal
        open={isPermissionModalOpen}
        onClose={() => setIsPermissionModalOpen(false)}
        selectedScopes={selectedScopes}
        onChangeSelectedScopes={setSelectedScopes}
        permissionOptions={PERMISSION_OPTIONS}
        permissionMap={PERMISSION_MAP}
        selectedBridgeFeatures={selectedBridgeFeatures}
        onChangeSelectedBridgeFeatures={setSelectedBridgeFeatures}
        bridgeFeatureOptions={BRIDGE_FEATURE_OPTIONS}
      />
    </>
  );
}

export default App;
