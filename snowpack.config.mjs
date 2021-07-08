/** @type {import("snowpack").SnowpackUserConfig } */
import proxy from 'http2-proxy';

export default {
  mount: {
    public: { url: '/', static: true },
    src: { url: '/dist' },
  },
  plugins: [
    '@snowpack/plugin-react-refresh',
    [
      '@snowpack/plugin-typescript',
      {
        /* Yarn PnP workaround: see https://www.npmjs.com/package/@snowpack/plugin-typescript */
        ...(process.versions.pnp ? { tsc: 'yarn pnpify tsc' } : {}),
      },
    ],
  ],
  routes: [
    {
      src: '/auth/admin/.*',
      dest: (req, res) => {
        return proxy.web(req, res, {
          hostname: 'localhost',
          port: 8180,
        });
      },
    },
  ],
  optimize: {
    /* Example: Bundle your final build: */
    "bundle": true,
  },
  packageOptions: {
    /* ... */
  },
  devOptions: {
    /* ... */
  },
  buildOptions: {
    baseUrl: "/adminv2",
    clean: true,
  },
};
