export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(value);
};

export const getInitials = (name) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();
};

export const getAttendanceColor = (status) => {
  const colors = {
    PRESENT: 'success',
    ABSENT: 'error',
    LEAVE: 'warning',
    HALF_DAY: 'info',
    WEEKEND: 'info',
    HOLIDAY: 'primary',
  };
  return colors[status] || 'default';
};

export const getEmployeeStatusColor = (status) => {
  const colors = {
    ACTIVE: 'success',
    INACTIVE: 'default',
    ON_LEAVE: 'warning',
  };
  return colors[status] || 'default';
};

export const getOwnerStatusColor = (status) => {
  const colors = {
    ACTIVE: 'success',
    INACTIVE: 'default',
    SUSPENDED: 'error',
  };
  return colors[status] || 'default';
};
