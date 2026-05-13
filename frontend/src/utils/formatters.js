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
  }).format(value || 0);
};

export const getInitials = (name) => {
  if (!name || typeof name !== 'string') return '?';
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase() || '?';
};

// Plain-language status labels for senior users
export const friendlyStatus = (status) => {
  const map = {
    ACTIVE: 'Active',
    INACTIVE: 'Not Working',
    LEFT: 'Left Job',
    ON_LEAVE: 'On Leave',
    SUSPENDED: 'Paused',
    PRESENT: 'Present',
    ABSENT: 'Absent',
    LEAVE: 'On Leave',
    HALF_DAY: 'Half Day',
    HOLIDAY: 'Holiday',
    WEEKEND: 'Weekend',
  };
  return map[status] || status || '—';
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
    LEFT: 'default',
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
