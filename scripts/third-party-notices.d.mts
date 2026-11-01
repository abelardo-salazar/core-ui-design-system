// Type declarations for third-party-notices.mjs (plain ESM: scripts/verify-third-party-notices.mjs
// runs it with `node`, without tsc). Only here so vite.config.ts can import it typed.
export declare const NOTICES_FILE: string;
export declare function packageRoot(file: string): string | null;
export declare function renderNotices(packageDirs: string[]): string;
