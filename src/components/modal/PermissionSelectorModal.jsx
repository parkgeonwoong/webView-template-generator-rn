import { useState } from "react";

/**
 * @description 권한 선택 모달 컴포넌트
 * @param open 모달 열림 여부
 * @param onClose 모달 닫기 핸들러
 * @param selectedScopes 선택된 권한 목록
 * @param onChangeSelectedScopes 선택된 권한 목록 변경 핸들러
 * @param permissionOptions 권한 옵션 목록
 * @param permissionMap 권한 id → 메타데이터 빠른 조회용
 */
export default function PermissionSelectorModal({
  open,
  onClose,
  selectedScopes,
  onChangeSelectedScopes,
  permissionOptions,
  permissionMap,
}) {
  const [query, setQuery] = useState("");

  if (!open) return null;

  const lowerQuery = query.toLowerCase();

  /* 검색 필터링 */
  const filteredOptions = permissionOptions.filter((opt) => {
    if (!lowerQuery) return true;
    return (
      opt.label.toLowerCase().includes(lowerQuery) ||
      opt.id.toLowerCase().includes(lowerQuery) ||
      (opt.category || "").toLowerCase().includes(lowerQuery)
    );
  });

  /* 권한 선택 토글 */
  const toggleScope = (id) => {
    if (selectedScopes.includes(id)) {
      onChangeSelectedScopes(selectedScopes.filter((s) => s !== id));
    } else {
      onChangeSelectedScopes([...selectedScopes, id]);
    }
  };

  return (
    <div className="permission-modal-backdrop">
      <div className="permission-modal">
        <div className="permission-modal-header">
          <div>
            <h3 className="permission-modal-title">웹에서 요청할 권한 선택</h3>
            <p className="permission-modal-subtitle">
              웹에서 window.ReactNativeBridge.post("PERM", ...) 로 사용할 권한들을 선택하세요.
            </p>
          </div>
          <button type="button" className="permission-modal-close-button" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="permission-modal-body">
          {/* 검색 박스 */}
          <div className="permission-modal-search">
            <input
              className="form-input"
              placeholder="카메라, 위치, photos 같은 키워드로 검색"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ width: "60%", fontSize: "12px" }}
            />
          </div>

          {/* 권한 목록 */}
          <div className="permission-modal-content">
            <ul className="permission-list">
              {filteredOptions.map((opt) => {
                const checked = selectedScopes.includes(opt.id);
                return (
                  <li
                    key={opt.id + opt.label}
                    className={"permission-item" + (checked ? " permission-item--selected" : "")}
                    onClick={() => toggleScope(opt.id)}
                  >
                    <label className="permission-item-label-row">
                      <input
                        type="checkbox"
                        checked={checked}
                        readOnly
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="permission-item-text">
                        <div className="permission-item-title-row">
                          <span className="permission-item-title">{opt.label}</span>
                          <span className="permission-item-id">({opt.id})</span>
                        </div>
                        <div className="permission-item-description">{opt.description}</div>
                        {opt.category && (
                          <span className="permission-item-category">{opt.category}</span>
                        )}
                      </div>
                    </label>
                  </li>
                );
              })}

              {/* 검색어에 해당하는 권한이 없을 때 */}
              {filteredOptions.length === 0 && (
                <li className="permission-item-empty">검색어에 해당하는 권한이 없습니다.</li>
              )}
            </ul>

            {/* 선택된 권한 목록 */}
            <div className="permission-modal-summary">
              <div className="permission-modal-summary-title">선택된 권한</div>
              <ul className="tag-list">
                {selectedScopes.length === 0 ? (
                  <li className="tag-pill tag-pill--empty">아직 선택된 권한이 없습니다.</li>
                ) : (
                  selectedScopes.map((id) => (
                    <li key={id} className="tag-pill">
                      {permissionMap[id]?.label || id}
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        </div>

        <div className="permission-modal-footer">
          <button type="button" className="permission-modal-footer-button" onClick={onClose}>
            완료
          </button>
        </div>
      </div>
    </div>
  );
}
