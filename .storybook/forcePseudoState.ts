// Forces :hover / :active on an element through the Chrome DevTools Protocol, the same as the
// DevTools ":hov" panel. Only in vitest-browser with Playwright's Chromium (the storybook-css
// project). In the Storybook UI it returns false and the caller skips its assertions; anywhere
// else a missing CDP session throws, so the test can't pass green without checking anything.
type CdpSession = {
  send: <T = Record<string, never>>(method: string, params?: object) => Promise<T>;
};
type CdpNode = {
  nodeId: number;
  attributes?: string[];
  children?: CdpNode[];
  contentDocument?: CdpNode;
  shadowRoots?: CdpNode[];
};

let session: CdpSession | undefined;

// Fails closed: it skips only where the Storybook UI is confirmed, and anywhere else it runs and
// throws without CDP. Storybook serves every story, in dev and in the static build, from its
// documented iframe.html (the same URL used to embed stories); vitest-browser serves its tester
// at "/". Vitest's own markers aren't usable here: __vitest_browser__ is internal, and
// import.meta.env.VITEST is undefined in browser mode.
export const inStorybookUI = () => /\/iframe\.html$/.test(location.pathname);

const getSession = async (): Promise<CdpSession | null> => {
  if (inStorybookUI()) return null;
  if (session) return session;
  try {
    const { cdp } = await import('vitest/browser');
    const opened = cdp() as CdpSession;
    await opened.send('DOM.enable');
    await opened.send('CSS.enable');
    session = opened;
  } catch (error) {
    throw new Error(`forcePseudoState: no CDP session outside the Storybook UI (${String(error)})`);
  }
  return session;
};

const findNode = (node: CdpNode, marker: string): CdpNode | undefined => {
  const attributes = node.attributes ?? [];
  for (let i = 0; i < attributes.length; i += 2) {
    if (attributes[i] === 'data-force-pseudo' && attributes[i + 1] === marker) return node;
  }
  for (const child of [
    ...(node.children ?? []),
    ...(node.contentDocument ? [node.contentDocument] : []),
    ...(node.shadowRoots ?? []),
  ]) {
    const found = findNode(child, marker);
    if (found) return found;
  }
  return undefined;
};

/**
 * Forces `states` on `element` (an empty list clears them). False in the Storybook UI; throws
 * anywhere else if CDP isn't available.
 */
export const forcePseudoState = async (
  element: Element,
  states: Array<'hover' | 'active'>,
): Promise<boolean> => {
  const cdp = await getSession();
  if (!cdp) return false;
  let marker = element.getAttribute('data-force-pseudo');
  if (!marker) {
    // Unique across the page: pierce: true walks every iframe, including those of other test
    // files running at the same time, so a per-file counter could match their elements.
    marker = crypto.randomUUID();
    element.setAttribute('data-force-pseudo', marker);
  }
  const { root } = await cdp.send<{ root: CdpNode }>('DOM.getDocument', {
    depth: -1,
    pierce: true,
  });
  const node = findNode(root, marker);
  if (!node) throw new Error(`forcePseudoState: node ${marker} not found`);
  await cdp.send('CSS.forcePseudoState', { nodeId: node.nodeId, forcedPseudoClasses: states });
  return true;
};
