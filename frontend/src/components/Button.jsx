/**
 * Reusable Button Component
 * Variants: primary, secondary, danger, success, outline, ghost
 * Sizes: sm, md, lg
 */

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  fullWidth = false,
  loading = false,
  type = 'button',
  className = '',
  icon: Icon,
  ...props
}) => {
  const baseStyles = 'font-medium rounded transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const variantStyles = {
    primary: 'bg-primary text-white hover:bg-primary-dark shadow-soft hover:shadow-card',
    secondary: 'bg-light-gray text-text-dark border border-gray-border hover:bg-lighter-gray',
    danger: 'bg-danger text-white hover:bg-red-600 shadow-soft hover:shadow-card',
    success: 'bg-success text-white hover:bg-green-600 shadow-soft hover:shadow-card',
    warning: 'bg-warning text-text-dark hover:bg-amber-500',
    outline: 'border-2 border-primary text-primary hover:bg-primary-light',
    ghost: 'text-primary hover:bg-primary-light',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {Icon && <Icon size={size === 'sm' ? 16 : size === 'md' ? 18 : 20} />}
      {loading ? (
        <>
          <span className="animate-spin">⏳</span>
          {children}
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
