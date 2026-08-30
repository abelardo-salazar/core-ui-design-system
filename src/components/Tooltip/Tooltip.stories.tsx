import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './Tooltip';
import { Button } from '../Button';

const meta: Meta<typeof Tooltip> = {
  title: 'Components/Tooltip',
  component: Tooltip,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

// 1. Default: cerrado por defecto, aparece con delay al hacer hover, desaparece al sacar
// el mouse. TooltipProvider es obligatorio: Tooltip (Root) no trae un contexto por defecto
// y lanza si se monta sin un ancestro TooltipProvider (verificado en el código fuente de
// @radix-ui/react-tooltip, createTooltipContext('TooltipProvider') sin defaultContext).
export const Default: Story = {
  render: () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Hover me</Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Saved to your library</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Hover me' });

    // El content vive en un Portal fuera de canvasElement (mismo patrón que Popover/Select).
    const body = within(document.body);
    await expect(body.queryByRole('tooltip')).not.toBeInTheDocument();

    // El hover pasa por el delay por defecto de Radix (delayDuration = 700ms) antes de abrir.
    await userEvent.hover(trigger);
    const tooltipPanel = await body.findByRole('tooltip', {}, { timeout: 2000 });
    await expect(tooltipPanel).toHaveTextContent('Saved to your library');

    // Defensive CSS layer: the content is hidden on coarse-pointer (touch) devices via
    // the `pointer: coarse` media feature, independent of whether anything tried to open it.
    await expect(tooltipPanel.className.split(' ')).toContain('pointer-coarse:hidden');

    await userEvent.unhover(trigger);
    await waitFor(() => expect(body.queryByRole('tooltip')).not.toBeInTheDocument(), {
      timeout: 2000,
    });
  },
};

// 2. KeyboardFocus: enfocar por teclado abre de inmediato, sin el delay del hover (verificado
// en TooltipTrigger: onFocus llama a context.onOpen() directo, sin pasar por el timer de
// onTriggerEnter que usa el hover). Perder el foco lo cierra.
export const KeyboardFocus: Story = {
  render: () => (
    <TooltipProvider>
      <div className="flex items-center gap-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline">Hover me</Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Saved to your library</p>
          </TooltipContent>
        </Tooltip>
        <Button variant="ghost">Next</Button>
      </div>
    </TooltipProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Hover me' });

    const body = within(document.body);
    await expect(body.queryByRole('tooltip')).not.toBeInTheDocument();

    await userEvent.tab();
    await expect(trigger).toHaveFocus();

    // Sin esperar un delay largo: a diferencia de Default (hover), el foco abre de inmediato.
    const tooltipPanel = await body.findByRole('tooltip', {}, { timeout: 500 });
    await expect(tooltipPanel).toHaveTextContent('Saved to your library');

    // Mueve el foco al siguiente elemento -> blur en el trigger -> se cierra.
    await userEvent.tab();
    await waitFor(() => expect(body.queryByRole('tooltip')).not.toBeInTheDocument(), {
      timeout: 2000,
    });
  },
};
