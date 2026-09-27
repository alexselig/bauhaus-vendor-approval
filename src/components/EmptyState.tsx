export function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div className="empty-state">
      <h2>No vendors match these filters</h2>
      <p>Clear the current filters to return to the full approval queue.</p>
      <button className="button button-secondary" onClick={onClear}>Clear filters</button>
    </div>
  );
}
