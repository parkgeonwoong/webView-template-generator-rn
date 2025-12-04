import { memo } from "react";

/**
 * @description 권한/브릿지 기능 목록을 표시하는 재사용 가능한 컴포넌트
 * @param items 표시할 항목 목록 (필터링된 상태)
 * @param selectedItems 선택된 항목 ID 배열
 * @param onToggle 항목 토글 핸들러
 */
export default memo(function FeatureList({ items, selectedItems, onToggle }) {
  return (
    <ul className="permission-list">
      {items.map((opt) => {
        const checked = selectedItems.includes(opt.id);

        return (
          <li
            key={opt.id + opt.label}
            className={"permission-item" + (checked ? " permission-item--selected" : "")}
            onClick={() => onToggle(opt.id)}
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
                {opt.category && <span className="permission-item-category">{opt.category}</span>}
              </div>
            </label>
          </li>
        );
      })}

      {/* 검색어에 해당하는 기능이 없을 때 */}
      {items.length === 0 && (
        <li className="permission-item-empty">검색어에 해당하는 기능이 없습니다.</li>
      )}
    </ul>
  );
});
