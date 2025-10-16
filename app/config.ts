const isLocal = typeof window !== "undefined" && window.location.hostname === "localhost";

export const API_BASE_URL = isLocal
  ? "http://localhost:8080"
  : ""; // em produção, o front e o back estarão no mesmo domínio