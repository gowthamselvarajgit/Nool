/**
 * Input Field Component
 * Wrapper for form inputs with label and error handling
 */

export const Input = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  disabled = false,
  required = false,
  fullWidth = true,
  size = 'md',
  className = '',
  icon: Icon,
  ...props
}) => {
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-4 py-3 text-lg',
  };

  return (
    <div className={`w-full ${fullWidth ? '' : 'w-auto'}`}>
      {label && (
        <label className="block text-sm font-medium text-text-dark mb-2">
          {label}
          {required && <span className="text-danger ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-text" size={18} />
        )}
        
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          className={`
            w-full
            ${sizeStyles[size]}
            border border-gray-border rounded-base
            focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1
            transition-all duration-200
            disabled:bg-light-gray disabled:cursor-not-allowed
            ${Icon ? 'pl-10' : ''}
            ${error ? 'border-danger focus:ring-danger' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      
      {error && (
        <p className="text-danger text-sm mt-1 font-medium">{error}</p>
      )}
    </div>
  );
};

export default Input;
