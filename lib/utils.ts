import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Convert prisma object into a regular JS object
export function convertToPlainObject<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

// Format number with decimal places
export function formatNumberWithDecimal(num: number): string {
  const [int, decimal] = num.toString().split('.');
  return decimal
    ? `$${int}.${decimal.padEnd(2, '0')}`
    : `$${int}.00`;
}

// Format errors
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function formatError(error: any) {
  if (error.name === 'ZodError') {
    // Handle Zod error
    if (!error.errors || !Array.isArray(error.errors)) {
      return 'Validation error occurred';
    }
    const fieldErrors = error.errors.map(
      (err: { message: string; path?: string[] }) => {
        const field = err.path && err.path.length > 0 ? err.path[0] : 'field';
        return `${field}: ${err.message}`;
      }
    );
    return fieldErrors.join('. ');
  } else if (error.name === 'PrismaClientKnownRequestError' && error.code === 'P2002') {
    // Handle Prisma error
    const field = error.meta?.target ? error.meta.target[0] : 'Field';
    return `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
  } else {
    // Handle other errors
    if (error.message) {
      // If error.message is a string, return it directly
      if (typeof error.message === 'string') {
        return error.message;
      }
      // If error.message is an object, try to extract useful information
      if (typeof error.message === 'object') {
        const messageStr = JSON.stringify(error.message);
        // Limit the length to avoid overly long error messages
        return messageStr.length > 200 ? messageStr.substring(0, 200) + '...' : messageStr;
      }
    }
    // Fallback for errors without message or with unexpected message format
    return 'An unexpected error occurred. Please try again.';
  }
}

// Round number to 2 decimal places
export function round2(value: number | string) {
  if (typeof value === 'number') {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  } else if (typeof value === 'string') {
    return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
  } else {
    throw new Error('Value is not a number or string');
  }
}

const CURRENCY_FORMATTER = new Intl.NumberFormat('en-US', {
  currency: 'USD',
  style: 'currency',
  minimumFractionDigits: 2,
});

// Format currency using the formatter above
export function formatCurrency(amount: number | string | null) {
  if (typeof amount === 'number') {
    return CURRENCY_FORMATTER.format(amount);
  } else if (typeof amount === 'string') {
    return CURRENCY_FORMATTER.format(Number(amount));
  } else {
    return 'NaN';
  }
}