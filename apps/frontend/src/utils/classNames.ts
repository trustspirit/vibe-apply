type ClassValue = string | number | boolean | null | undefined | ClassArray | ClassObject;
type ClassArray = ClassValue[];
type ClassObject = Record<string, boolean | null | undefined>;

const normalize = (value: ClassValue): string => {
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

export const classNames = (...values: ClassValue[]): string =>
  values
    .map(normalize)
    .filter(Boolean)
    .join(' ');

export default classNames;
