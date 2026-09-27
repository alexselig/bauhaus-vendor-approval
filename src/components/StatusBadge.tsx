export function StatusBadge({ value }: { value: string }) {
  const tone = value.toLowerCase().replaceAll(" ", "-");
  return <span className={`status status-${tone}`}>{value}</span>;
}
