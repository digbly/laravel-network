export const getErrorMessage = (
  error: unknown,
  fallback = 'An unexpected error occurred. Please try again.'
): string => {
  if (!error) return fallback;

  if (typeof error === 'object' && 'data' in error) {
    const errorData = (
      error as {
        data?: {
          message?: string;
          errors?: Record<string, string[]>;
          error?: string;
        };
      }
    ).data;

    if (errorData?.errors && typeof errorData.errors === 'object') {
      const firstField = Object.keys(errorData.errors)[0];
      if (firstField && errorData.errors[firstField]?.length) {
        return errorData.errors[firstField][0];
      }
    }

    if (errorData?.message) {
      return errorData.message;
    }

    if (errorData?.error) {
      return errorData.error;
    }
  }

  if (typeof error === 'object' && 'error' in error) {
    return String((error as { error?: unknown }).error);
  }

  return fallback;
};
