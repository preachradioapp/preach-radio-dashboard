/**
 * Normalises any RTK Query / fetch / runtime error into a human readable string.
 * Backend envelope: { success: false, message, errorMessages: [{ path, message }] }
 */
export const getErrorMessage = (error, fallback = "Something went wrong. Please try again.") => {
  if (!error) return fallback;
  if (typeof error === "string") return error;

  if (error.status === "FETCH_ERROR") {
    return "Unable to reach the server. Check your internet connection.";
  }
  if (error.status === "TIMEOUT_ERROR") {
    return "The request timed out. Please try again.";
  }
  if (error.status === "PARSING_ERROR") {
    return "The server returned an unexpected response.";
  }

  const data = error.data;
  const detail = data?.errorMessages?.find((e) => e?.message)?.message;
  return data?.message || detail || data?.error || error.message || fallback;
};
