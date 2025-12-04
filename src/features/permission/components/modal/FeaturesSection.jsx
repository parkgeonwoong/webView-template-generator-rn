import { memo } from "react";
import FeatureList from "./FeatureList";
import SelectedItemsSummary from "./SelectedItemsSummary";

/**
 * @description : 모달 권한/브릿지 기능 섹션 컴포넌트
 * @param title : 섹션 제목
 * @param items : 기능 목록
 * @param selectedScopes : 선택된 권한 목록
 * @param toggleScope : 권한 토글 핸들러
 * @param getLabel : 권한 라벨 가져오기
 */
function FeaturesSection({ title, items, selectedScopes, toggleScope, getLabel }) {
  return (
    <div className="permission-modal-content">
      <div style={{ marginBottom: 24 }}>
        <div className="permission-modal-summary-title">{title}</div>
        <FeatureList items={items} selectedItems={selectedScopes} onToggle={toggleScope} />
      </div>

      {/* 선택된 권한 목록 */}
      <SelectedItemsSummary title="선택된 권한" selectedIds={selectedScopes} getLabel={getLabel} />
    </div>
  );
}

export default memo(FeaturesSection);
