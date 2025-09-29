const normalize = (value) => {
  if (!value) {
    return '';
  }
  if (Array.isArray(value)) {
    return value.map(normalize).join(' ');
  }
  if (typeof value === 'string') {
    return value.trim();
  }
  if (typeof value === 'object') {
    return Object.entries(value)
      .filter(([, condition]) => Boolean(condition))
      .map(([key]) => key)
      .join(' ');
  }
  return String(value).trim();
};

export const classNames = (...values) =>
  values
    .map(normalize)
    .filter(Boolean)
    .join(' ');

export default classNames;
