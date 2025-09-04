import { useState } from "react";
import { toast } from "sonner";
import { ApiResponse } from "@/app/types";

const useFetch = (cb: Function) => {
  const [data, setData] = useState<ApiResponse>(null);
  const [isLoading, setIsLoading] = useState<Boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fn = async (...args: any[]) => {
    setData(null);
    setIsLoading(true);
    setError(null);

    try {
      const response = await cb(...args);
      setData(response);
      setError(null);
      return response;
    } catch (error: any) {
      setData(null);
      setError(error);
      toast.error(error?.message);
    } finally {
      setIsLoading(false);
    }
  };

  return { data, isLoading, error, fn };
};

export default useFetch;
