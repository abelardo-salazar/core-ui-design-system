import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Chip } from './Chip';

const meta: Meta<typeof Chip> = {
  title: 'Components/Chip',
  component: Chip,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof Chip>;

// 1. Ninguno: chip estático, sin Toggle ni botón de cierre.
export const Static: Story = {
  args: {
    children: 'Static',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Static')).toBeInTheDocument();
    await expect(canvas.queryByRole('button')).not.toBeInTheDocument();
  },
};

// 2. Solo pressed/onPressedChange: cuerpo interactivo vía Radix Toggle real.
export const Toggleable: Story = {
  args: {
    children: 'Design',
    defaultPressed: false,
    onPressedChange: fn(),
    variant: 'outline',
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('button', { name: 'Design' });

    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await expect(toggle).toHaveAttribute('data-state', 'off');

    // Sin botón de cierre, el Toggle ya llega exactamente al borde de la píldora por su propio
    // padding (pl-2.5/py-0.5) — no hay franja muerta que corregir, así que no genera ::after.
    await expect(toggle.className.split(' ')).not.toContain('relative');
    await expect(toggle.className).not.toContain("after:content-['']");

    await userEvent.click(toggle);

    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await expect(toggle).toHaveAttribute('data-state', 'on');
    await expect(args.onPressedChange).toHaveBeenLastCalledWith(true);

    // La raíz declara el override has-[[data-state=on]]:bg-primary — el estado "on" siempre
    // gana sobre la variante de color de base (aquí outline), mismo criterio que Switch/Checkbox.
    const root = toggle.parentElement as HTMLElement;
    await expect(root.className).toContain('has-[[data-state=on]]:bg-primary');
    await expect(root.className).toContain('has-[[data-state=on]]:text-primary-content');
  },
};

// 3. Solo onRemove: un único botón de cierre, sin Toggle.
export const Removable: Story = {
  args: {
    children: 'Design',
    onRemove: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getAllByRole('button')).toHaveLength(1);
    const removeButton = canvas.getByRole('button', { name: 'Remove' });

    // Touch target: la caja VISUAL del botón sigue siendo 24x24 reales (spec de Material para
    // el ícono de borrar de un Chip), sin que el ícono en sí (12x12) cambie de tamaño — el
    // anillo de foco sigue siendo ese mismo círculo de 24x24. El área que SÍ responde al toque
    // es más grande: el ::after (relative + after:...) extiende el hit area hacia el padding
    // que la raíz reintroduce (pr-2.5/py-0.5 en root, ver abajo) sin agrandar la caja del botón,
    // y rounded-r-full hace que esa zona siga la curva de la píldora en vez de un rectángulo
    // (sin esto, un toque justo fuera de la curva, cerca de la esquina, también disparaba
    // onRemove). El fixture de vitest-browser no aplica el CSS de utilidades de Tailwind (mismo
    // issue documentado en el story Destructive de Button), así que la aserción va sobre la
    // clase; el tamaño, la posición y la forma reales se verificaron a mano en Storybook con un
    // navegador real (bounding boxes + elementFromPoint), con A/B contra el commit previo a la
    // regresión del PR #30.
    await expect(removeButton.className.split(' ')).toContain('p-1.5');
    await expect(removeButton.className.split(' ')).toContain('relative');
    await expect(removeButton.className).toContain("after:content-['']");
    await expect(removeButton.className).toContain('after:rounded-r-full');
    await expect(removeButton.querySelector('svg')).toHaveClass('h-3', 'w-3');

    // La raíz reintroduce el padding que el PR #30 le había sacado: es la única forma de
    // reconstruir el alto/ancho histórico (30px de alto) sin volver a inflar el cuerpo, que ya
    // tiene su propio padding correcto para el caso sin botón de cierre.
    const root = removeButton.parentElement as HTMLElement;
    await expect(root.className.split(' ')).toContain('py-0.5');
    await expect(root.className.split(' ')).toContain('pr-2.5');

    await userEvent.click(removeButton);
    await expect(args.onRemove).toHaveBeenCalledTimes(1);
  },
};

// 4. Ambos: Toggle + botón de cierre, cada uno con su propio foco (Tab los separa).
export const ToggleableAndRemovable: Story = {
  args: {
    children: 'Design',
    defaultPressed: false,
    onPressedChange: fn(),
    onRemove: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('button', { name: 'Design' });
    const removeButton = canvas.getByRole('button', { name: 'Remove' });

    await expect(canvas.getAllByRole('button')).toHaveLength(2);

    // Mismo fix que en Removable: la raíz reintroduce py-0.5/pr-2.5 (sm con botón de cierre)
    // para reconstruir el alto/ancho histórico; el botón de cierre reclama esa zona como área
    // de respuesta vía ::after (rounded-r-full), sin agrandar su caja visual de 24x24.
    const root = toggle.parentElement as HTMLElement;
    await expect(root.className.split(' ')).toContain('py-0.5');
    await expect(root.className.split(' ')).toContain('pr-2.5');
    await expect(removeButton.className.split(' ')).toContain('relative');
    await expect(removeButton.className).toContain('after:rounded-r-full');

    // El Toggle, a diferencia del botón de cierre, solo se estira al alto de la fila (24px) —
    // sin su propio ::after quedarían ~2px sin respuesta arriba/abajo que el ✕ sí reclama.
    // rounded-l-full porque el Toggle vive en el borde IZQUIERDO de la píldora (curva opuesta
    // a la del botón de cierre).
    await expect(toggle.className.split(' ')).toContain('relative');
    await expect(toggle.className).toContain("after:content-['']");
    await expect(toggle.className).toContain('after:rounded-l-full');

    // Foco independiente: clic en el cuerpo enfoca solo el Toggle, Tab mueve al botón de cierre
    // sin activarlo, y cada uno dispara su propio callback sin interferir con el otro.
    await userEvent.click(toggle);
    await expect(toggle).toHaveFocus();
    await expect(args.onPressedChange).toHaveBeenLastCalledWith(true);
    await expect(args.onRemove).not.toHaveBeenCalled();

    await userEvent.tab();
    await expect(removeButton).toHaveFocus();

    await userEvent.keyboard('{Enter}');
    await expect(args.onRemove).toHaveBeenCalledTimes(1);
    // El Enter sobre el botón de cierre no debe reabrir/cambiar el estado del Toggle.
    await expect(args.onPressedChange).toHaveBeenCalledTimes(1);
  },
};

// 5. size="md": el padding del cuerpo y el tamaño del botón de cierre pasan a vivir en los
// hijos (no en la raíz) para que su hit box real llene la píldora de 32px. El fixture de
// vitest-browser no aplica el CSS de utilidades de Tailwind (mismo issue documentado en
// Removable), así que esto verifica las clases; el tamaño real en píxeles se verificó a mano
// en Storybook con un navegador real.
export const Medium: Story = {
  args: {
    children: 'Design',
    size: 'md',
    defaultPressed: false,
    onPressedChange: fn(),
    onRemove: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('button', { name: 'Design' });
    const removeButton = canvas.getByRole('button', { name: 'Remove' });

    const root = toggle.parentElement as HTMLElement;
    await expect(root.className.split(' ')).toContain('h-8');
    await expect(root.className.split(' ')).toContain('text-sm');

    // pl-3 siempre; pr-3 NO (hay botón de cierre al lado: la separación la da gap-1 de la
    // raíz, no un padding propio del cuerpo — ver comentario en Chip.tsx).
    await expect(toggle.className.split(' ')).toContain('pl-3');
    await expect(toggle.className.split(' ')).not.toContain('pr-3');
    // py-0.5 es exclusivo de sm (md/lg fijan el alto en la raíz y se estiran hasta llenarlo).
    await expect(toggle.className.split(' ')).not.toContain('py-0.5');
    // El Toggle extiende su hit area hasta el borde EXTERIOR de la raíz (cubre el propio borde
    // de 1px, a diferencia de sm) — con o sin botón de cierre al lado, ver Chip.tsx.
    await expect(toggle.className.split(' ')).toContain('relative');
    await expect(toggle.className).toContain("after:content-['']");
    await expect(toggle.className).toContain('after:rounded-l-full');
    await expect(toggle.className).toContain('after:-top-px');

    // Botón de cierre: ancho explícito 32px, pero SIN alto explícito (a diferencia de una
    // versión anterior de este archivo) — así se estira igual que el Toggle/body y queda
    // centrado, en vez de desbordar el borde inferior de la raíz por no responder a
    // items-stretch (h-8 fijo no se estira). Su ::after (rounded-r-full) llega hasta el borde
    // exterior igual que el del Toggle, pero del lado derecho.
    await expect(removeButton.className.split(' ')).not.toContain('h-8');
    await expect(removeButton.className.split(' ')).toContain('w-8');
    await expect(removeButton.className.split(' ')).not.toContain('p-1.5');
    await expect(removeButton.className.split(' ')).toContain('relative');
    await expect(removeButton.className).toContain('after:rounded-r-full');
    await expect(removeButton.querySelector('svg')).toHaveClass('h-3.5', 'w-3.5');

    await userEvent.click(toggle);
    await expect(args.onPressedChange).toHaveBeenLastCalledWith(true);
  },
};

// 6. size="md", Toggle SIN botón de cierre: caso no cubierto por Medium (que siempre tiene
// onRemove). Acá el extremo DERECHO del Toggle es también el extremo derecho de la píldora
// (a diferencia de Medium, donde linda con el gap-1 interior) — necesita rounded-full completo,
// no rounded-l-full, o esas dos esquinas quedan cuadradas y responden fuera de la curva visible
// de la píldora (bug corregido acá; confirmado con un barrido sistemático de elementFromPoint
// en Storybook con un navegador real — ver PR).
export const MediumToggleable: Story = {
  args: {
    children: 'Design',
    size: 'md',
    defaultPressed: false,
    onPressedChange: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('button', { name: 'Design' });

    await expect(toggle.className.split(' ')).toContain('relative');
    await expect(toggle.className).toContain("after:content-['']");
    await expect(toggle.className).toContain('after:rounded-full');
    await expect(toggle.className).not.toContain('after:rounded-l-full');
  },
};

// 7. size="lg": tamaño táctil (44px). Mismo criterio que Medium.
export const Large: Story = {
  args: {
    children: 'Design',
    size: 'lg',
    defaultPressed: false,
    onPressedChange: fn(),
    onRemove: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('button', { name: 'Design' });
    const removeButton = canvas.getByRole('button', { name: 'Remove' });

    const root = toggle.parentElement as HTMLElement;
    await expect(root.className.split(' ')).toContain('h-11');
    await expect(root.className.split(' ')).toContain('text-base');

    await expect(toggle.className.split(' ')).toContain('pl-4');
    await expect(toggle.className.split(' ')).not.toContain('pr-4');
    await expect(toggle.className.split(' ')).not.toContain('py-0.5');
    // Igual que en Medium: el Toggle alcanza el borde exterior de la raíz, incluyendo el propio
    // borde de 1px — en lg esto es lo que garantiza el objetivo táctil real de 44px (no solo
    // la caja visual del Toggle, que por construcción mide 1px menos que la raíz).
    await expect(toggle.className.split(' ')).toContain('relative');
    await expect(toggle.className).toContain('after:rounded-l-full');

    // Botón de cierre: SIN alto explícito (igual que en Medium) — se estira al interior de la
    // raíz y queda centrado; su ancho (w-11, 44px) sí se mantiene fijo. Su propia caja visual
    // mide ~1px menos de alto que la raíz (el borde-box del borde se lo "come"), pero su área de
    // respuesta real (caja + ::after) sí llega a los 44px completos, el tamaño táctil objetivo
    // de esta escala (ver README) — verificado en navegador real escaneando el área de clic.
    await expect(removeButton.className.split(' ')).not.toContain('h-11');
    await expect(removeButton.className.split(' ')).toContain('w-11');
    await expect(removeButton.className.split(' ')).not.toContain('p-1.5');
    await expect(removeButton.className.split(' ')).toContain('relative');
    await expect(removeButton.className).toContain('after:rounded-r-full');
    await expect(removeButton.querySelector('svg')).toHaveClass('h-4', 'w-4');

    await userEvent.click(toggle);
    await expect(args.onPressedChange).toHaveBeenLastCalledWith(true);
  },
};

// 8. size="lg", Toggle SIN botón de cierre: mismo caso que MediumToggleable, en el tamaño
// táctil (44px) — acá la esquina cuadrada sin corregir dejaba hasta ~9px de hueco en diagonal
// fuera de la curva visible que igual activaban el Toggle.
export const LargeToggleable: Story = {
  args: {
    children: 'Design',
    size: 'lg',
    defaultPressed: false,
    onPressedChange: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('button', { name: 'Design' });

    await expect(toggle.className.split(' ')).toContain('relative');
    await expect(toggle.className).toContain("after:content-['']");
    await expect(toggle.className).toContain('after:rounded-full');
    await expect(toggle.className).not.toContain('after:rounded-l-full');
  },
};
