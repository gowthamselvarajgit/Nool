// Local-timezone "YYYY-MM-DD" string. Use this for any date the user thinks of
// in local terms (today, first of month, etc.). Why not toISOString().split('T')[0]?
// In IST (+05:30), midnight local is yesterday's 18:30 UTC — so toISOString() shifts
// the date back a day and would show, e.g., April for a May 1st query.
export const toLocalISODate = (date) => {
  const d = date instanceof Date ? date : new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

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
