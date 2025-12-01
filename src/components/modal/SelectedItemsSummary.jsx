/**
 * @description 선택된 항목 요약을 표시하는 재사용 가능한 컴포넌트
 * @param title 요약 섹션 제목
 * @param selectedIds 선택된 항목 ID 배열
 * @param getLabel ID로부터 라벨을 가져오는 함수
 * @param emptyMessage 선택된 항목이 없을 때 표시할 메시지
 */
export default function SelectedItemsSummary({ title, selectedIds, getLabel, emptyMessage }) {
  return (
    <div className="permission-modal-summary">
      <div className="permission-modal-summary-title">{title}</div>
      <ul className="tag-list">
        {selectedIds.length === 0 ? (
          <li className="tag-pill tag-pill--empty">{emptyMessage}</li>
        ) : (
          selectedIds.map((id) => (
            <li key={id} className="tag-pill">
              {getLabel(id)}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
