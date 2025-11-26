export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return "Unknown error";
}

export function formatError(prefix: string, error: unknown): string {
  return `${prefix}: ${getErrorMessage(error)}`;
}

export function hasErrorCode(error: unknown, code: string): error is Error & { code: string } {
  return (
    error instanceof Error && "code" in error && (error as Error & { code: string }).code === code
  );
}
