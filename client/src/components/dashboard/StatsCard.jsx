import "./StatsCard.css";

function StatsCard({
  title,
  value,
  subtitle,
  icon,
  color = "blue",
}) {
  return (
    <div className={`stats-card ${color}`}>
      <div className="stats-icon">
        {icon}
      </div>

      <div className="stats-content">
        <h2>{value}</h2>
        <h3>{title}</h3>
        <p>{subtitle}</p>
      </div>
    </div>
  );
}

export default StatsCard;