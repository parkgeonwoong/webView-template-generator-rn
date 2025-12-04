import { useState } from "react";
import PermissionList from "./PermissionList";
import SelectedItemsSummary from "./SelectedItemsSummary";

import "../styles/Modal.css";

/* 검색 필터링 공통 함수 */
const filterOptionsByQuery = (options, query) => {
  if (!query) return options;

  const lowerQuery = query.toLowerCase();

  return options.filter((opt) => {
    return (
      opt.label.toLowerCase().includes(lowerQuery) ||
      opt.id.toLowerCase().includes(lowerQuery) ||
      (opt.category || "").toLowerCase().includes(lowerQuery)
    );
  });
};

/* 배열 토글을 위한 범용 함수 */
const createToggleHandler = (selectedItems, setSelectedItems) => {
  return (id) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter((item) => item !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };
};

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
  selectedBridgeFeatures,
  onChangeSelectedBridgeFeatures,
  bridgeFeatureOptions,
}) {
  const [query, setQuery] = useState("");

  if (!open) return null;

  /* 검색 필터링 - OS 권한 */
  const filteredOptions = filterOptionsByQuery(permissionOptions, query);

  /* 검색 필터링 - 브릿지 기능 */
  const filteredBridgeOptions = filterOptionsByQuery(bridgeFeatureOptions, query);

  /* 권한 선택 토글 */
  const toggleScope = createToggleHandler(selectedScopes, onChangeSelectedScopes);

  /* 브릿지 기능 선택 토글 */
  const toggleBridgeFeature = createToggleHandler(
    selectedBridgeFeatures,
    onChangeSelectedBridgeFeatures
  );

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

          {/* OS 권한 섹션 */}
          <div className="permission-modal-content">
            <div style={{ marginBottom: 24 }}>
              <div className="permission-modal-summary-title">앱 권한 선택</div>
              <PermissionList
                items={filteredOptions}
                selectedItems={selectedScopes}
                onToggle={toggleScope}
                emptyMessage="검색어에 해당하는 권한이 없습니다."
              />
            </div>

            {/* 선택된 권한 목록 */}
            <SelectedItemsSummary
              title="선택된 권한"
              selectedIds={selectedScopes}
              getLabel={(id) => permissionMap[id]?.label || id}
              emptyMessage="아직 선택된 권한이 없습니다."
            />
          </div>

          {/* 브릿지 기능 섹션 */}
          {bridgeFeatureOptions.length > 0 && (
            <div className="permission-modal-content">
              <div>
                <div className="permission-modal-summary-title">브릿지 기능 선택</div>
                <PermissionList
                  items={filteredBridgeOptions}
                  selectedItems={selectedBridgeFeatures}
                  onToggle={toggleBridgeFeature}
                  emptyMessage="검색어에 해당하는 브릿지 기능이 없습니다."
                />
              </div>

              {/* 선택된 브릿지 기능 요약 */}
              <SelectedItemsSummary
                title="선택된 브릿지 기능"
                selectedIds={selectedBridgeFeatures}
                getLabel={(id) => bridgeFeatureOptions.find((opt) => opt.id === id)?.label || id}
                emptyMessage="아직 선택된 브릿지 기능이 없습니다."
              />
            </div>
          )}
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
