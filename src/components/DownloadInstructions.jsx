/**
 * @description 다운로드 후 안내 카드 컴포넌트
 */

import { memo } from "react";

function DownloadInstructions() {
  return (
    <div className="download-instructions">
      <p className="download-instructions-title">다운로드 후</p>
      <ol className="download-instructions-list">
        <li>ZIP 파일 압축 해제</li>
        <li>터미널에서 폴더로 이동</li>
        <li>npm install 실행</li>
        <li>npm run ios 또는 npm run android</li>
      </ol>
    </div>
  );
}

export default memo(DownloadInstructions);
