import { useState } from "react";
import { saveAs } from "file-saver";
import JSZip from "jszip";

import "./App.css";

function App() {
  const [isDownloading, setIsDownloading] = useState(false);

  /* 웹 제너레이터에서 웹뷰 관련 옵션들(URI, 허용 도메인, 디버깅 여부, 권한 안내 화면 여부) */
  const [webviewUri, setWebviewUri] = useState(""); // 웹뷰 URL
  const [extraHostInput, setExtraHostInput] = useState(""); // 추가 허용 도메인 입력
  const [extraHosts, setExtraHosts] = useState([]); // 추가 허용 도메인 목록
  const [enableDebug, setEnableDebug] = useState(false); // 디버깅 여부
  const [usePermissionGuide, setUsePermissionGuide] = useState(false); // 권한 안내 화면 여부

  const handleAddHost = () => {
    const value = extraHostInput.trim();
    if (!value) return;
    if (extraHosts.includes(value)) {
      setExtraHostInput("");
      return;
    }
    setExtraHosts([...extraHosts, value]);
    setExtraHostInput("");
  };

  /* 템플릿 다운로드 */
  const downloadTemplate = async () => {
    try {
      // TODO: 예외처리

      setIsDownloading(true);

      // 1. public 폴더의 템플릿 가져오기
      const response = await fetch("/templates/rnBaseTemplate.zip");
      const arrayBuffer = await response.arrayBuffer(); // arrayBuffer 생성

      // 2. JSZip 으로 ZIP 열기
      const zip = await JSZip.loadAsync(arrayBuffer);

      // 3. RN 템플릿 안의 웹뷰 설정 파일 경로
      const webviewConfigPath = "rnBaseTemplate/src/config/webview.ts";

      const configFile = zip.file(webviewConfigPath);
      if (!configFile) {
        console.error("ZIP 안에서 파일을 찾을 수 없습니다:", webviewConfigPath);
        alert("템플릿 내부 파일을 찾지 못했습니다.");
        return;
      }

      // 4. 원본 파일 내용 읽기
      const originalContent = await configFile.async("string");

      // 5-1. WEBVIEW_URI 플레이스홀더 치환
      let replacedContent = originalContent
        .replace("__WEBVIEW_URI__", webviewUri)
        .replace("__WEBVIEW_DEBUGGING_ENABLED__", enableDebug ? "true" : "false")
        .replace("__USE_PERMISSION_GUIDE__", usePermissionGuide ? "true" : "false");

      // 5-2. ALLOW_HOSTS 내 추가 도메인 치환
      if (extraHosts.length > 0) {
        const SENTINEL = " // __EXTRA_ALLOW_HOSTS__";
        const extraHostLines = extraHosts.map((host) => `  '${host}',`).join("\n");

        // 토큰을 "도메인 목록 + 다시 토큰" 으로 교체해서 다음에도 재사용 가능하게
        replacedContent = replacedContent.replace(SENTINEL, `${extraHostLines}\n${SENTINEL}`);
      }

      // 6. 수정된 내용으로 다시 파일 덮어쓰기
      zip.file(webviewConfigPath, replacedContent);

      // // 7. package.json 파일 수정 TODO: 고민해보기
      // const packagePath = "rnBaseTemplate/package.json";
      // const packageFile = zip.file(packagePath); // 파일 읽기

      // if (packageFile) {
      //   const packageContent = await packageFile.async("string"); // 실제 텍스트 내용
      //   const packageJson = JSON.parse(packageContent);

      //   // 권한안내 화면 옵션
      //   if (usePermissionGuide) {
      //     packageJson.dependencies["@react-native-async-storage/async-storage"] = "^1.24.0";
      //   } else {
      //     // TODO: 삭제 하는게 맞나?
      //     delete packageJson.dependencies["@react-native-async-storage/async-storage"];
      //   }

      //   const newPackageContent = JSON.stringify(packageJson, null, 2);
      //   zip.file(packagePath, newPackageContent);
      // }

      // 8. 수정된 zip 생성
      const newZipBlob = await zip.generateAsync({ type: "blob" });

      // 다운로드
      saveAs(newZipBlob, "rn-webview-app.zip");

      alert("다운로드 완료! ZIP 파일 압축 해제 후 npm install 실행하세요.");
    } catch (error) {
      console.error("다운로드 실패:", error);
      alert("다운로드 중 오류가 발생했습니다.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      <div className="App">
        <h1 className="app-title">React Native Webview 템플릿 생성기</h1>

        {/* 웹뷰 관련 카테고리 카드 */}
        <section className="category-card">
          <h2 className="category-title">웹뷰 설정</h2>
          <p className="category-description">
            앱에서 처음 열릴 웹뷰 URL 등 기본 웹뷰 옵션을 설정합니다.
          </p>

          <div className="category-body">
            {/* 웹뷰 URL */}
            <div className="form-field">
              <label className="form-label">웹뷰 URL</label>
              <input
                type="text"
                placeholder="https://www.google.com 처럼 웹뷰 URL을 입력하세요."
                value={webviewUri}
                onChange={(e) => setWebviewUri(e.target.value)}
                className="form-input"
              />
            </div>

            {/* 추가 허용 도메인 (ALLOW_HOSTS 용) */}
            <div className="form-field">
              <label className="form-label">
                추가 허용 도메인 (웹뷰에서 외부 도메인 접근 허용)
              </label>
              <div className="form-inline">
                <input
                  type="text"
                  placeholder="예) www.example.com"
                  value={extraHostInput}
                  onChange={(e) => setExtraHostInput(e.target.value)}
                  className="form-input"
                  onKeyDown={(e) => e.key === "Enter" && handleAddHost()}
                />
                <button type="button" onClick={handleAddHost} className="form-inline-button">
                  추가
                </button>
              </div>

              {extraHosts.length > 0 && (
                <ul className="tag-list">
                  {extraHosts.map((host) => (
                    <li key={host} className="tag-pill">
                      {host}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* WebView 디버깅 모드 */}
            <div className="form-field">
              <label className="form-label">WebView 디버깅</label>
              <div className="debug-checkbox-row">
                <input
                  id="debug-checkbox"
                  type="checkbox"
                  checked={enableDebug}
                  onChange={(e) => setEnableDebug(e.target.checked)}
                  className="debug-checkbox"
                />
                <label htmlFor="debug-checkbox" className="debug-checkbox-label">
                  Chrome Inspector, Safari 등 디버깅 도구에서 WebView 콘솔/네트워크를 확인할 수 있게
                  합니다.
                </label>
              </div>
            </div>

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

        {/* TODO: 다운로드 버튼 (향후 위치 변경) */}
        <button onClick={downloadTemplate} disabled={isDownloading} className="download-button">
          {isDownloading ? "다운로드 중..." : "생성하기"}
        </button>

        {/* TODO: 임시 다운로드 후 설명 카드 */}
        <div className="download-instructions">
          <p className="download-instructions-title">다운로드 후</p>
          <ol className="download-instructions-list">
            <li>ZIP 파일 압축 해제</li>
            <li>터미널에서 폴더로 이동</li>
            <li>npm install 실행</li>
            <li>npm run ios 또는 npm run android</li>
          </ol>
        </div>

        {/* 환경세팅 설명 */}
      </div>
    </>
  );
}

export default App;
