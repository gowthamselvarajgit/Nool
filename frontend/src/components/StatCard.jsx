/**
 * Stat Card Component
 * Displays metrics with icon and optional trend
 */

export const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendUp = true,
  unit = '',
  description,
  color = 'primary',
  className = '',
}) => {
  const colorStyles = {
    primary: 'bg-primary-light border-l-4 border-primary',
    success: 'bg-success-light border-l-4 border-success',
    danger: 'bg-danger-light border-l-4 border-danger',
    warning: 'bg-warning-light border-l-4 border-warning',
    info: 'bg-info-light border-l-4 border-info',
  };

  const iconColorMap = {
    primary: 'text-primary',
    success: 'text-success',
    danger: 'text-danger',
    warning: 'text-warning',
    info: 'text-info',
  };

  return (
    <div className={`p-6 rounded-lg bg-white shadow-card hover:shadow-hover transition-shadow ${colorStyles[color]} ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-gray-text text-sm font-medium mb-2">{title}</p>
          <p className="text-3xl font-bold text-text-dark">
            {value}
            {unit && <span className="text-lg text-gray-text ml-1">{unit}</span>}
          </p>
          
          {description && (
            <p className="text-gray-text text-xs mt-2">{description}</p>
          )}
          
          {trend && (
            <div className="flex items-center gap-1 mt-3">
              <span className={`text-sm font-semibold ${trendUp ? 'text-success' : 'text-danger'}`}>
                {trendUp ? '↑' : '↓'} {trend}
              </span>
              <span className="text-gray-text text-xs">vs last month</span>
            </div>
          )}
        </div>
        
        {Icon && (
          <div className={`p-3 rounded-lg ${colorStyles[color]}`}>
            <Icon size={24} className={iconColorMap[color]} />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
