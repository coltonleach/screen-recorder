import crossOriginIsolation from 'vite-plugin-cross-origin-isolation'

export default {
  base: '/screen-recorder',
  plugins: [crossOriginIsolation()],
}
