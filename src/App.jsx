import { DynamicDashboard } from './DynamicDashboard';

// Borra cualquier CSS de App.css, no lo necesitamos

function App() {
  // App ahora solo renderiza el DynamicDashboard.
  // Todo lo demás (carga, layout, etc.) se maneja dentro.
  return (
    <DynamicDashboard />
  );
}

export default App;