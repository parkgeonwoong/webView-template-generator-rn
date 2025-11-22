import { useState } from "react";
import { saveAs } from "file-saver";
import JSZip from "jszip";

import "./App.css";

function App() {
  const [isDownloading, setIsDownloading] = useState(false);

  const [webviewUri, setWebviewUri] = useState("");

  const downloadTemplate = async () => {
    try {
      // TODO: 예외처리

      setIsDownloading(true);

      // public 폴더의 템플릿 가져오기
      const response = await fetch("/templates/rnBaseTemplate.zip");

      // arrayBuffer 생성

      const blob = await response.blob();

      // JSZip 으로 ZIP 열기

      // RN 템플릿 안의 웹뷰 설정 파일 경로

      // 원본 파일 내용일기

      // 플레이스 홀더 치환

      // 수정된 내용으로 다시 파일 덮어쓰기

      // 수정된 zip 생성

      // 다운로드
      saveAs(blob, "rn-webview-app.zip");

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

        {/* TODO: 라벨 및 스타일 */}
        <input
          type="text"
          placeholder="https://www.google.com 처럼 웹뷰 URL을 입력하세요."
          value={webviewUri}
          onChange={(e) => setWebviewUri(e.target.value)}
          className="webview-uri-input"
        />

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
