import type { ActivityEvent } from "../domain/model";

export function ActivityTimeline({ events }: { events: ActivityEvent[] }) {
  return (
    <section className="workspace-section">
      <div className="section-heading"><div><p className="eyebrow">04 / Record</p><h2>Activity</h2></div></div>
      <ol className="timeline">
        {[...events].sort((a, b) => b.at.localeCompare(a.at)).map((event) => (
          <li key={event.id}>
            <span className="timeline-dot" />
            <div><strong>{event.description}</strong><span>{event.actor} · {new Intl.DateTimeFormat("en", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(event.at))}</span></div>
          </li>
        ))}
      </ol>
    </section>
  );
}
