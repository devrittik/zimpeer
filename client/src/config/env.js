const rawServerUrl = process.env.REACT_APP_SERVER_URL || "http://localhost:8000";

export const SERVER_URL = rawServerUrl.replace(/\/+$/, "");
export const USERS_API_URL = `${SERVER_URL}/api/v1/users`;
