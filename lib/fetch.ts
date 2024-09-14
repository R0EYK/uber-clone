import { useState, useEffect, useCallback } from "react";

// library function to help fetching from database
export const fetchAPI = async (url: string, options?: RequestInit) => {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      new Error(`HTTP Error , status: ${response.status}`);
    }
    return await response.json();
  } catch (error: any) {
    console.error("Fetching error: ", error);
    throw error;
  }
};

// custom hook to fetch data from the database,
// manages 3 different states holding the data, loading (if loading),
// error (if there is one)
export const useFetch = <T>(url: string, options?: RequestInit) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetchAPI(url, options);
      setData(result.data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [url, options]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};
