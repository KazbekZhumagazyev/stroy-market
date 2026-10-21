import type { NextConfig } from "next";

const api = new URL(process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8010/api");

const nextConfig: NextConfig = {
  allowedDevOrigins: ["*.ngrok-free.app", "*.ngrok.app"],
  images: {
    // Фото товаров отдаёт Laravel из storage
    remotePatterns: [{ protocol: api.protocol.replace(":", "") as "http" | "https", hostname: api.hostname, port: api.port, pathname: "/storage/**" }],
    dangerouslyAllowLocalIP: process.env.NODE_ENV !== "production",
  },
};

export default nextConfig;
