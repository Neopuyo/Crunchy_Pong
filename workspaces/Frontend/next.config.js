/** @type {import('next').NextConfig} */

const withTM = require("next-transpile-modules")(["@transcendence/shared"]);

const nextConfig = {
  // Disable React Strict Mode (set to false to turn it off)
  reactStrictMode: false,

  // Set the output directory for the production build (default is ".next")
  distDir: ".next",

  // Custom rewrite rules for the Next.js server
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://backend:4000/api/:path*",
      },
    ];
  },

  // Environment variables available to the client-side code
  env: {
    URL_42: process.env.URL_42,
    STATE_42: process.env.STATE_42,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASSWORD: process.env.SMTP_PASSWORD,
    JWT_SECRET: process.env.JWT_SECRET,
    CRYPTO_KEY: process.env.CRYPTO_KEY,
    WEBSITE_KEY: process.env.WEBSITE_KEY,
    SECRET_KEY: process.env.SECRET_KEY,
    HOST_IP: process.env.HOST_IP,
    CLOUD_NAME: process.env.CLOUD_NAME,
    CLOUD_API_KEY: process.env.CLOUD_API_KEY,
    CLOUD_SECRET: process.env.CLOUD_SECRET,
    CLOUD_API_ENV_VAR: process.env.CLOUD_API_ENV_VAR,
    CLOUD_FOLDER: process.env.CLOUD_FOLDER,
    ENVIRONNEMENT: process.env.ENVIRONNEMENT,
  },

  // Image domains to allow image optimization and usage
  images: {
    domains: ["cdn.intra.42.fr", "lh3.googleusercontent.com"],
  },

  transpilePackages: ["@transcendence/shared"],
};

module.exports = nextConfig;
