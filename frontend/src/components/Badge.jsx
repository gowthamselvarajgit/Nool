/**
 * Badge Component
 * Status indicator badges
 */

export const Badge = ({
  children,
  variant = 'info',
  size = 'md',
  className = '',
}) => {
  const variantStyles = {
    success: 'bg-success-light text-success border border-success/20',
    danger: 'bg-danger-light text-danger border border-danger/20',
    warning: 'bg-warning-light text-text-dark border border-warning/20',
    info: 'bg-info-light text-info border border-info/20',
    primary: 'bg-primary-light text-primary border border-primary/20',
    gray: 'bg-light-gray text-gray-text border border-gray-border',
  };

  const sizeStyles = {
    sm: 'px-2.5 py-0.5 text-xs font-medium rounded-full',
    md: 'px-3 py-1 text-sm font-medium rounded-lg',
    lg: 'px-4 py-1.5 text-base font-medium rounded-lg',
  };

  return (
    <span className={`inline-flex items-center ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
