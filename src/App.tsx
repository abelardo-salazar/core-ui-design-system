import { useState, useEffect } from 'react';

function App() {
  // Estado para controlar el tema
  const [isDark, setIsDark] = useState(false);

  // Efecto para aplicar la clase 'dark' al elemento HTML
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    // Quitamos cualquier clase 'dark' fija de aquí.
    // Usamos el fondo y texto base definidos en tus variables.
    <div className="min-h-screen w-full flex flex-col items-center justify-center gap-6 bg-base-100 text-base-content transition-colors duration-300">
      <header className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-primary">Core UI Design System</h1>
        <p className="text-lg text-secondary">Entorno de desarrollo</p>
      </header>

      {/* Tarjeta de demostración de colores */}
      <div className="p-8 border border-base-300 rounded-box bg-base-200 shadow-xl max-w-md text-center space-y-4">
        <p className="font-medium">
          Estado actual:{' '}
          <span className="font-bold text-accent">
            {isDark ? '🌙 Modo Oscuro' : '☀️ Modo Claro'}
          </span>
        </p>

        <p className="text-sm text-base-content/70">
          Usa el botón de abajo para alternar las variables CSS dinámicamente.
        </p>

        {/* Botón Switch */}
        <button
          onClick={() => setIsDark(!isDark)}
          className="px-6 py-3 rounded-btn font-bold text-neutral-content bg-neutral hover:bg-neutral-focus active:scale-95 transition-all"
        >
          Cambiar Tema
        </button>
      </div>

      {/* Paleta Semántica Visual */}
      <div className="grid grid-cols-2 gap-4 mt-8">
        <div className="p-4 bg-primary text-primary-content rounded-btn">Primary</div>
        <div className="p-4 bg-secondary text-secondary-content rounded-btn">Secondary</div>
        <div className="p-4 bg-accent text-accent-content rounded-btn">Accent</div>
        <div className="p-4 bg-neutral text-neutral-content rounded-btn">Neutral</div>
      </div>
    </div>
  );
}

export default App;
