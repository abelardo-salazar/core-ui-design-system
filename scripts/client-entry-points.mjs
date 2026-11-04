// Single source of truth for which components declare 'use client' on their first line.
//
// Rollup, even with output.preserveModules, does not keep module directives in non-entry
// chunks (verified in this repo: a build with preserveModules:true + grep on dist/ gave 0
// occurrences of "use client"). vite.config.ts uses this list to re-inject the directive
// into the exact chunk that belongs to each file.
//
// scripts/verify-client-directives.mjs uses this same list (not a copy) to confirm that
// every component with 'use client' in its source is registered here. If the script kept
// its own copy instead of importing this list, it could drift from the real list just like
// vite.config.ts did (see the PR of this fix), hence one shared list, not two.
//
// Paths relative to the repo root. When adding a new component with 'use client' in its
// source, add its path here; `npm run build` fails if you forget.
export const CLIENT_ENTRY_POINTS = [
  'src/components/Input/Input.tsx',
  'src/components/Textarea/Textarea.tsx',
  'src/components/Dialog/Dialog.tsx',
  'src/components/Sheet/Sheet.tsx',
  'src/components/Select/Select.tsx',
  'src/components/Checkbox/Checkbox.tsx',
  'src/components/Switch/Switch.tsx',
  'src/components/Avatar/Avatar.tsx',
  'src/components/Toast/Toast.tsx',
  'src/components/Tooltip/Tooltip.tsx',
  'src/components/Calendar/Calendar.tsx',
  'src/components/Chip/Chip.tsx',
  'src/components/Combobox/Combobox.tsx',
  'src/components/DatePicker/DatePicker.tsx',
  'src/components/Image/Image.tsx',
  'src/components/Popover/Popover.tsx',
  'src/components/Progress/Progress.tsx',
  'src/components/DropdownMenu/DropdownMenu.tsx',
  'src/components/Tabs/Tabs.tsx',
  'src/components/ToggleGroup/ToggleGroup.tsx',
  'src/components/DataTable/DataTable.tsx',
  'src/components/Chart/ChartContainer.tsx',
  'src/components/QuantityStepper/QuantityStepper.tsx',
  'src/components/Button/Button.tsx',
  'src/components/SelectionField/SelectionField.tsx',
  'src/components/SwitchField/SwitchField.tsx',
  'src/components/CheckboxField/CheckboxField.tsx',
  'src/components/Toggle/Toggle.tsx',
];
