import { useState } from "react";
import { saveAs } from "file-saver";

import "./styles/App.css";

import WebviewSettingsSection from "./components/WebviewSettingsSection";
import DownloadInstructions from "./components/DownloadInstructions";
import PermissionSelectorModal from "./components/modal/PermissionSelectorModal";

import { PERMISSION_OPTIONS, BRIDGE_FEATURE_OPTIONS } from "./constants";
import {
  loadBaseTemplateZip,
  updateWebviewConfig,
  updateNavigationStack,
  updatePackageJson,
  updateAndroidManifest,
  updateInfoPlist,
  updatePodfile,
  updatePermissionFeatureFiles,
} from "./utils/loadAndUpdateZip";

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
      await updatePackageJson(zip, { usePermissionGuide, hasPermissionScopes });

      // TODO: onMessage.ts, permissions.ts 파일 수정
      await updatePermissionFeatureFiles(zip, { hasPermissionScopes });

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

  /* 권한 요약 문자열 생성 */
  const getPermissionSummary = (scopeCount, bridgeCount) => {
    // 아무것도 선택 안 했을 때
    if (scopeCount === 0 && bridgeCount === 0) {
      return "선택된 권한 없음";
    }

    // 총 개수 계산
    const totalCount = scopeCount + bridgeCount;

    // 상세 정보 생성
    const details = [];
    if (scopeCount > 0) details.push(`OS ${scopeCount}개`);
    if (bridgeCount > 0) details.push(`브릿지 ${bridgeCount}개`);

    return `${totalCount}개 선택됨 (${details.join(", ")})`;
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
          <p className="category-description">앱 권한 관련 옵션을 설정합니다.</p>

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

            {/* TODO: 권한 선택 옵션, 팝업 + 설명?, select으로 갈건지?  */}
            <div className="form-field">
              <label className="form-label">웹에서 요청할 권한 선택</label>
              <div className="form-inline">
                <button
                  type="button"
                  className="form-inline-button"
                  onClick={() => setIsPermissionModalOpen(true)}
                >
                  권한 선택하기
                </button>

                <span className="form-inline-summary">
                  {getPermissionSummary(selectedScopes.length, selectedBridgeFeatures.length)}
                </span>
              </div>

              {/* 선택된 권한 목록 */}
              <ul className="tag-list">
                {selectedScopes.length === 0 && selectedBridgeFeatures.length === 0 ? (
                  <li className="tag-pill tag-pill--empty">아직 선택된 권한이 없습니다.</li>
                ) : (
                  <>
                    {/* OS 권한 표시 */}
                    {selectedScopes.map((id) => (
                      <li key={`scope-${id}`} className="tag-pill">
                        {PERMISSION_MAP[id]?.label || id}
                      </li>
                    ))}

                    {/* 브릿지 기능 표시 */}
                    {selectedBridgeFeatures.map((id) => {
                      const feature = BRIDGE_FEATURE_OPTIONS.find((opt) => opt.id === id);
                      return (
                        <li key={`bridge-${id}`} className="tag-pill">
                          {feature?.label || id}
                        </li>
                      );
                    })}
                  </>
                )}
              </ul>
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

      {/* 권한 선택 모달 */}
      <PermissionSelectorModal
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
