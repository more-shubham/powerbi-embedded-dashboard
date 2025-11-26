export async function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  errorMessage = "Operation timed out"
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(errorMessage)), ms);
  });

  return Promise.race([promise, timeoutPromise]);
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000,
  backoff = false
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < retries) {
        const waitTime = backoff ? delay * Math.pow(2, attempt) : delay;
        await sleep(waitTime);
      }
    }
  }

  throw lastError;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function sequential<T>(fns: Array<() => Promise<T>>): Promise<T[]> {
  const results: T[] = [];
  for (const fn of fns) {
    results.push(await fn());
  }
  return results;
}

export async function withConcurrencyLimit<T>(
  fns: Array<() => Promise<T>>,
  limit: number
): Promise<T[]> {
  const results: T[] = new Array(fns.length);
  let index = 0;

  const execute = async (): Promise<void> => {
    while (index < fns.length) {
      const currentIndex = index++;
      results[currentIndex] = await fns[currentIndex]();
    }
  };

  const workers = Array(Math.min(limit, fns.length))
    .fill(null)
    .map(() => execute());

  await Promise.all(workers);
  return results;
}
