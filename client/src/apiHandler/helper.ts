export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5002";

export async function handleApiResponse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMessage =
      data?.error || data?.message || `HTTP error! status: ${response.status}`;
    throw new Error(errorMessage);
  }

  return data as T;
}

