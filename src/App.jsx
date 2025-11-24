import { useState } from "react";
import { saveAs } from "file-saver";
import JSZip from "jszip";

import "./App.css";

function App() {
  const [isDownloading, setIsDownloading] = useState(false);

  /* TODO: 웹뷰 변하는 부분은 이곳에서 관리해야 함 (여기 설명 뭐라고 적지) */
  const [webviewUri, setWebviewUri] = useState("");

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
