import crossOriginIsolation from 'vite-plugin-cross-origin-isolation'

export default {
  plugins: [crossOriginIsolation()],
  server: {
    middlewares: [
      (req, res, next) => {
        // Set Cross-Origin-Opener-Policy and Cross-Origin-Embedder-Policy headers
        res.setHeader('Cross-Origin-Opener-Policy', 'same-origin')
        res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp')
        next()
      },
    ],
  },
}
