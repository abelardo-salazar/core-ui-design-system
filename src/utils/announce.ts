export type AnnounceOptions = {
  /** `polite` waits for the reader to finish what it's reading; `assertive` interrupts it. */
  politeness?: 'polite' | 'assertive';
};

// The region is found by this attribute in the DOM and not by a module variable: with
// two copies of the package or with HMR, they all find the same region instead of duplicating it.
const REGION_ATTR = 'data-core-ui-announcer';

// Pause between emptying the region and writing: without it, the same repeated text doesn't
// change the content and the reader doesn't announce it again.
const WRITE_DELAY_MS = 100;
const CLEAR_DELAY_MS = 5000;

const getRegion = (politeness: 'polite' | 'assertive') => {
  const existing = document.querySelector<HTMLElement>(`[${REGION_ATTR}="${politeness}"]`);
  if (existing) return existing;

  // One region per level instead of changing the aria-live of a single one: readers don't always
  // pick up that change on the fly.
  const region = document.createElement('div');
  region.setAttribute(REGION_ATTR, politeness);
  // Explicit aria-live, not just role: hideOthers (aria-hidden, the one Radix Dialog uses when
  // opening a Dialog/Sheet) only leaves [aria-live] elements unhidden.
  region.setAttribute('aria-live', politeness);
  region.setAttribute('aria-atomic', 'true');
  // Inline equivalent of sr-only (copied from the compiled rule), so it doesn't depend on the
  // consumer having imported the CSS. Never display:none or hidden: a region hidden that way
  // isn't announced.
  Object.assign(region.style, {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: '0',
    margin: '-1px',
    overflow: 'hidden',
    clipPath: 'inset(50%)',
    whiteSpace: 'nowrap',
    borderWidth: '0',
  });
  document.body.appendChild(region);
  return region;
};

/**
 * Announces `message` to screen readers through an `aria-live` region created in
 * `document.body` on the first call. Works with a `Dialog` or `Sheet` open. The text is
 * cleared a few seconds later, and calling twice with the same message announces it twice.
 * On the server it does nothing.
 */
export function announce(message: string, { politeness = 'polite' }: AnnounceOptions = {}) {
  if (typeof document === 'undefined') return;

  const region = getRegion(politeness);
  region.textContent = '';
  setTimeout(() => {
    region.textContent = message;
    // Only clears if nobody wrote another message in the meantime.
    setTimeout(() => {
      if (region.textContent === message) region.textContent = '';
    }, CLEAR_DELAY_MS);
  }, WRITE_DELAY_MS);
}
