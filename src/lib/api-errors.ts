type ApiErrorDetails = Record<string, string[] | string | undefined>;

type ApiErrorShape = {
  data?: {
    message?: string;
    errors?: ApiErrorDetails;
  };
};

export function getApiErrorMessage(error: unknown, fallback: string): string {
  const data = (error as ApiErrorShape | undefined)?.data;

  if (data?.errors) {
    const messages = Object.values(data.errors)
      .flatMap((value) => (Array.isArray(value) ? value : value ? [value] : []))
      .filter(Boolean);

    if (messages.length > 0) {
      return messages.join(", ");
    }
  }

  if (typeof data?.message === "string" && data.message.trim()) {
    return data.message;
  }

  return fallback;
}
