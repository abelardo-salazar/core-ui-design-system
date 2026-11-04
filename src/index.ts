// src/index.ts
// Exportar componentes
import './index.css';
export * from './components/Alert';
export * from './components/AspectRatio';
export * from './components/Avatar';
export * from './components/Badge';
export * from './components/Button';
export * from './components/Calendar';
export * from './components/Card';
export * from './components/Checkbox';
export * from './components/CheckboxField';
// `Chart` is NOT exported from the root barrel: it pulls in recharts, which calls
// createContext() at module level and breaks the whole barrel in Server Components
// (react-server). It lives in its own subpath, fully client-only:
//   import { ChartContainer, BarChart, ... } from '@abelardo-salazar/core-ui-design-system/charts';
// See src/charts.ts and CHANGELOG.md [0.4.1].
export * from './components/Chip';
export * from './components/Combobox';
export * from './components/DataTable';
export * from './components/DatePicker';
export * from './components/Dialog';
export * from './components/DropdownMenu';
export * from './components/EmptyState';
export * from './components/FileInput';
export * from './components/Image';
export * from './components/Input';
export * from './components/Layout'; // Container, Separator, SkipToContent
export * from './components/Popover';
export * from './components/Progress';
export * from './components/ProgressRing';
export * from './components/QuantityStepper';
export * from './components/Select';
export * from './components/Sheet';
export * from './components/Skeleton';
export * from './components/Switch';
export * from './components/SwitchField';
export * from './components/Table';
export * from './components/NavigationBar';
export * from './components/Tabs';
export * from './components/Textarea';
export * from './components/Toast';
export * from './components/Toggle';
export * from './components/ToggleGroup';
export * from './components/Tooltip';
export * from './components/Typography'; // Heading, Text
export * from './components/VisuallyHidden';

// Export utilities that are needed externally
export { cn } from './utils/cn';
export { announce, type AnnounceOptions } from './utils/announce';
