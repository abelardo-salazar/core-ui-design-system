export type AnnounceOptions = {
  /** `polite` espera a que el lector termine lo que esté leyendo; `assertive` lo interrumpe. */
  politeness?: 'polite' | 'assertive';
};

// La región se localiza por este atributo en el DOM y no por una variable del módulo: con
// dos copias del paquete o con HMR, todas encuentran la misma región en vez de duplicarla.
const REGION_ATTR = 'data-core-ui-announcer';

// Pausa entre vaciar la región y escribir: sin ella, un mismo texto repetido no cambia el
// contenido y el lector no lo vuelve a anunciar.
const WRITE_DELAY_MS = 100;
const CLEAR_DELAY_MS = 5000;

const getRegion = (politeness: 'polite' | 'assertive') => {
  const existing = document.querySelector<HTMLElement>(`[${REGION_ATTR}="${politeness}"]`);
  if (existing) return existing;

  // Una región por nivel en vez de cambiar el aria-live de una sola: los lectores no siempre
  // registran ese cambio en caliente.
  const region = document.createElement('div');
  region.setAttribute(REGION_ATTR, politeness);
  // aria-live explícito, no solo role: hideOthers (aria-hidden, el que usa Radix Dialog al
  // abrir un Dialog/Sheet) solo deja sin ocultar los [aria-live].
  region.setAttribute('aria-live', politeness);
  region.setAttribute('aria-atomic', 'true');
  // sr-only, nunca display:none ni hidden: una región oculta así no se anuncia.
  region.className = 'sr-only';
  document.body.appendChild(region);
  return region;
};

/**
 * Anuncia `message` a los lectores de pantalla mediante una región `aria-live` que se crea en
 * `document.body` en la primera llamada. Sirve con un `Dialog` o `Sheet` abierto. El texto se
 * borra unos segundos después, y llamar dos veces con el mismo mensaje lo anuncia dos veces.
 * En el servidor no hace nada.
 */
export function announce(message: string, { politeness = 'polite' }: AnnounceOptions = {}) {
  if (typeof document === 'undefined') return;

  const region = getRegion(politeness);
  region.textContent = '';
  setTimeout(() => {
    region.textContent = message;
    // Solo borra si nadie escribió otro mensaje mientras tanto.
    setTimeout(() => {
      if (region.textContent === message) region.textContent = '';
    }, CLEAR_DELAY_MS);
  }, WRITE_DELAY_MS);
}
