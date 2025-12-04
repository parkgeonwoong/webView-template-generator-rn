import React, { memo } from "react";

/**
 * @description : 앱 권한 설정 섹션 컴포넌트
 * - 권한 안내 화면 사용 여부
 * - OS 권한 및 브릿지 기능 선택
 *
 * @param usePermissionGuide - 권한 안내 화면 사용 여부
 * @param onChangeUsePermissionGuide - 권한 안내 화면 사용 여부 변경 핸들러
 * @param onOpenPermissionModal - 권한 선택 모달 열기 핸들러
 * @param selectedScopes - 선택된 OS 권한 목록
 * @param selectedBridgeFeatures - 선택된 브릿지 기능 목록
 * @param permissionMap - 권한 메타데이터
 * @param bridgeFeatureOptions - 브릿지 기능 옵션
 */
function PermissionSettingsSection({
  // 권한 안내 화면 관련
  usePermissionGuide,
  onChangeUsePermissionGuide,

  // 권한 선택 모달 관련
  onOpenPermissionModal,

  // 선택된 권한 목록
  selectedScopes,
  selectedBridgeFeatures,

  // 권한 메타데이터
  permissionMap,
  bridgeFeatureOptions,
}) {
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
              onChange={(e) => onChangeUsePermissionGuide(e.target.checked)}
              className="debug-checkbox"
            />
            <label htmlFor="permission-guide-checkbox" className="debug-checkbox-label">
              첫 실행 시 카메라/갤러리 등 앱 권한 안내 화면을 한 번 보여줍니다.
            </label>
          </div>
        </div>

        {/* 웹에서 요청할 권한 선택 */}
        <div className="form-field">
          <label className="form-label">웹에서 요청할 권한 선택</label>
          <div className="form-inline">
            <button type="button" className="form-inline-button" onClick={onOpenPermissionModal}>
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
                    {permissionMap[id]?.label || id}
                  </li>
                ))}

                {/* 브릿지 기능 표시 */}
                {selectedBridgeFeatures.map((id) => {
                  const feature = bridgeFeatureOptions.find((opt) => opt.id === id);
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
  );
}

export default memo(PermissionSettingsSection);
