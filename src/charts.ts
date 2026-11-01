'use client';
// Second entry point of the package, exposed as the `./charts` subpath (see package.json
// `exports`). It exists to take `Chart` out of the root barrel (src/index.ts): `Chart` pulls
// in recharts, and recharts (ResponsiveContainer.js) calls `createContext(...)` at module
// level, which blows up in the Next.js react-server environment. Once folded into
// dist/index.js, that made the whole package unsafe for Server Components, not just whoever
// uses Chart. See CHANGELOG.md [0.4.1].
//
// Unlike the root barrel (which needs the per-component 'use client' treatment through
// CLIENT_ENTRY_POINTS), this entry is fully client-only: EVERYTHING it exports is client.
// vite.config.ts re-injects the 'use client' directive above into the published chunk
// (dist/charts.js); Rollup doesn't keep module directives in the output.
//
// It doesn't import './index.css': consumers already import the stylesheet once (see
// README, "Setup Inicial") and Chart uses the same DS tokens as everything else.
export * from './components/Chart';
