export const isValidString = (str: string | null | undefined): boolean => {
    return typeof str === 'string' && str.trim() !== '';  
  }
  