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
// `Chart` NO se exporta desde el barrel raíz: arrastra recharts, que llama createContext()
// a nivel de módulo y rompe el barrel entero en Server Components (react-server). Vive en su
// propio subpath, client-only completo:
//   import { ChartContainer, BarChart, ... } from '@abelardo-salazar/core-ui-design-system/charts';
// Ver src/charts.ts y CHANGELOG.md [0.4.1].
export * from './components/Chip';
export * from './components/DataTable';
export * from './components/DatePicker';
export * from './components/Dialog';
export * from './components/DropdownMenu';
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
export * from './components/Table';
export * from './components/Tabs';
export * from './components/Textarea';
export * from './components/Toast';
export * from './components/Tooltip';
export * from './components/Typography'; // Heading, Text

// Exportar utilidades si son necesarias externamente
export { cn } from './utils/cn';
