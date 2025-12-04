import { memo } from "react";

import "../styles/WebviewSettingsSection.css";

/**
 * @description 웹뷰 설정 카드 컴포넌트
 * @param webviewUri - 웹뷰 URL
 * @param onChangeWebviewUri - 웹뷰 URL 변경 핸들러
 * @param extraHostInput - 추가 허용 도메인 입력
 * @param onChangeExtraHostInput - 추가 허용 도메인 변경 핸들러
 * @param onAddHost - 추가 허용 도메인 추가 핸들러
 * @param onRemoveHost - 추가 허용 도메인 삭제 핸들러
 * @param extraHosts - 추가 허용 도메인 목록
 * @param enableDebug - 디버깅 여부
 * @param onChangeEnableDebug - 디버깅 여부 변경 핸들러
 */

export default memo(function WebviewSettingsSection({
  webviewUri,
  onChangeWebviewUri,
  extraHostInput,
  onChangeExtraHostInput,
  onAddHost,
  onRemoveHost,
  extraHosts,
  enableDebug,
  onChangeEnableDebug,
}) {
  return (
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
            onChange={(e) => onChangeWebviewUri(e.target.value)}
            className="form-input"
          />
        </div>

        {/* 추가 허용 도메인 (ALLOW_HOSTS 용) */}
        <div className="form-field">
          <label className="form-label">추가 허용 도메인 (웹뷰에서 외부 도메인 접근 허용)</label>
          <div className="form-inline">
            <input
              type="text"
              placeholder="예) www.example.com"
              value={extraHostInput}
              onChange={(e) => onChangeExtraHostInput(e.target.value)}
              className="form-input"
              onKeyDown={(e) => e.key === "Enter" && onAddHost()}
            />
            <button type="button" onClick={onAddHost} className="form-inline-button">
              추가
            </button>
          </div>

          {/* 추가 허용 도메인 목록 */}
          {extraHosts.length > 0 && (
            <ul className="tag-list">
              {extraHosts.map((host) => (
                <li key={host} className="tag-pill">
                  {host}
                  <button
                    type="button"
                    className="tag-pill-remove-button"
                    onClick={() => onRemoveHost(host)}
                  >
                    x
                  </button>
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
              onChange={(e) => onChangeEnableDebug(e.target.checked)}
              className="debug-checkbox"
            />
            <label htmlFor="debug-checkbox" className="debug-checkbox-label">
              Chrome Inspector, Safari 등 디버깅 도구에서 WebView 콘솔/네트워크를 확인할 수 있게
              합니다.
            </label>
          </div>
        </div>
      </div>
    </section>
  );
});
