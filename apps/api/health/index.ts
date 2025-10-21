import { version } from "../package.json";

export const healthCheck = () => ({
  status: "healthy",
  timestamp: new Date().toISOString(),
  version,
});
