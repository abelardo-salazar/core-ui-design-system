// Type declarations for fonts.mjs (plain ESM: scripts/verify-third-party-notices.mjs runs it
// with `node`, without tsc). Only here so vite.config.ts can import it typed.
export declare const FONTS_SOURCE: string;
export declare const FONTS_DIR: string;
export declare function fontSourceFiles(root: string): string[];
export declare function renderPublishedFonts(root: string): string;
