import * as React from 'react';
import { createPortal } from 'react-dom';

// Media queries follow the viewport, not a container: to test both sides of a breakpoint in one
// run, each case renders in an iframe of fixed width, with the page's stylesheets copied in.
export const InFrame = ({
  title,
  width,
  height = 420,
  children,
}: {
  title: string;
  width: number;
  height?: number;
  children: React.ReactNode;
}) => {
  const [body, setBody] = React.useState<HTMLElement | null>(null);
  const frameRef = React.useRef<HTMLIFrameElement>(null);
  React.useEffect(() => {
    const doc = frameRef.current!.contentDocument!;
    for (const node of document.head.querySelectorAll('style, link[rel="stylesheet"]')) {
      doc.head.appendChild(node.cloneNode(true));
    }
    setBody(doc.body);
  }, []);
  return (
    <iframe ref={frameRef} title={title} style={{ width, height, border: 0 }}>
      {body && createPortal(children, body)}
    </iframe>
  );
};
