/**
 * Render Keep-Alive Utility
 * 
 * Free-tier web services on Render sleep after 15 minutes of inbound HTTP inactivity.
 * This utility optionally sends a lightweight GET request to the service's own public
 * `/ping` endpoint every 14 minutes to prevent the instance from spinning down.
 * 
 * Environment variables:
 * - RENDER_EXTERNAL_URL: Automatically set by Render (e.g., https://service.onrender.com).
 * - PING_URL: Fallback URL if RENDER_EXTERNAL_URL is not set.
 * - ENABLE_KEEP_ALIVE: Set to 'false' to disable this keep-alive loop (enabled by default when URL exists).
 * - KEEP_ALIVE_INTERVAL_MINUTES: Interval between pings in minutes (default: 14).
 */

function startKeepAlive() {
  const targetUrl = process.env.RENDER_EXTERNAL_URL || process.env.PING_URL;

  // Do not run if keep-alive is explicitly disabled or no public URL is provided
  if (!targetUrl || process.env.ENABLE_KEEP_ALIVE === "false") {
    return;
  }

  const pingEndpoint = `${targetUrl.replace(/\/+$/, "")}/ping`;
  const intervalMinutes = Number(process.env.KEEP_ALIVE_INTERVAL_MINUTES) || 14;
  const intervalMs = intervalMinutes * 60 * 1000;

  console.log(`[Keep-Alive] Initialized. Pinging ${pingEndpoint} every ${intervalMinutes} minutes.`);

  const intervalId = setInterval(async () => {
    try {
      const response = await fetch(pingEndpoint, {
        headers: { "User-Agent": "BookVault-KeepAlive/1.0" },
      });

      if (response.ok) {
        console.log(`[Keep-Alive] Ping successful (${response.status}) at ${new Date().toISOString()}`);
      } else {
        console.warn(`[Keep-Alive] Ping returned status ${response.status} at ${new Date().toISOString()}`);
      }
    } catch (error) {
      console.error(`[Keep-Alive] Ping error: ${error.message}`);
    }
  }, intervalMs);

  // Unreference timer so it doesn't prevent Node process from graceful shutdown
  if (typeof intervalId.unref === "function") {
    intervalId.unref();
  }
}

module.exports = { startKeepAlive };
