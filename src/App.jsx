import { useState } from "react";
import { saveAs } from "file-saver";
import JSZip from "jszip";

import "./App.css";

function App() {
  const [isDownloading, setIsDownloading] = useState(false);

  /* TODO: 웹뷰 변하는 부분은 이곳에서 관리해야 함 (여기 설명 뭐라고 적지) */
  const [webviewUri, setWebviewUri] = useState("");
  const [extraHostInput, setExtraHostInput] = useState("");
  const [extraHosts, setExtraHosts] = useState([]);

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
      // const blob = await response.blob();

      // 2. JSZip 으로 ZIP 열기
      const zip = await JSZip.loadAsync(arrayBuffer);
      console.log("🚀 ~ downloadTemplate ~ zip:", zip);

      // 3. RN 템플릿 안의 웹뷰 설정 파일 경로
      const webviewConfigPath = "rnBaseTemplate/src/config/webview.ts";

      const file = zip.file(webviewConfigPath);
      if (!file) {
        console.error("ZIP 안에서 파일을 찾을 수 없습니다:", webviewConfigPath);
        alert("템플릿 내부 파일을 찾지 못했습니다.");
        return;
      }

      // 4. 원본 파일 내용 읽기
      const originalContent = await file.async("string");

      // 5-1. WEBVIEW_URI 플레이스홀더 치환
      let replacedContent = originalContent.replace("__WEBVIEW_URI__", webviewUri);

      // 5-2. ALLOW_HOSTS 내 추가 도메인 치환
      if (extraHosts.length > 0) {
        const SENTINEL = " // __EXTRA_ALLOW_HOSTS__";
        const extraHostLines = extraHosts.map((host) => `  '${host}',`).join("\n");

        // 토큰을 "도메인 목록 + 다시 토큰" 으로 교체해서 다음에도 재사용 가능하게
        replacedContent = replacedContent.replace(SENTINEL, `${extraHostLines}\n${SENTINEL}`);
      }

      // 6. 수정된 내용으로 다시 파일 덮어쓰기
      zip.file(webviewConfigPath, replacedContent);

      // 7. 수정된 zip 생성
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
            {/* 공통 필드 스타일 사용 */}
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
