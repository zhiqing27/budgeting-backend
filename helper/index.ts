export const isValidString = (str: string | null | undefined): boolean => {
  return typeof str === 'string' && str.trim() !== '';
};

export function parseToNumericId(id: string | number): number {
  if (typeof id === 'string') {
    return parseInt(id, 10);
  }
  return id;
}
