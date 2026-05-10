/**
 * Reusable Card Component
 * Container for content with consistent styling
 */

export const Card = ({
  children,
  className = '',
  padding = 'md',
  hover = false,
  border = false,
}) => {
  const paddingStyles = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={`
        bg-white rounded-lg
        ${paddingStyles[padding]}
        ${border ? 'border border-gray-border' : ''}
        ${hover ? 'hover:shadow-hover transition-shadow duration-200' : 'shadow-card'}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default Card;
