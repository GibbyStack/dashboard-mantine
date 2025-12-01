# Especificación Técnica: Módulo de Reportes Dinámicos & Generación de PDF

## 1. Resumen

El Agente SolkosInsights envía un **Plan de Dashboard (JSON)** que el frontend debe renderizar. Posteriormente, un proceso automatizado (Playwright) visitará una URL específica del frontend para generar un archivo PDF de este reporte.

---

## 2. Requerimientos de la Vista (Routing)

Se requiere una nueva ruta (o página) en el frontend dedicada exclusivamente a la visualización limpia del reporte.

* **Ruta sugerida:** `/reports/view` o `/print-report`
* **Parámetros de URL (Query Params):**
    * `report_id` (UUID, obligatorio): Identificador único del reporte a buscar en la BD.
    * `print_mode` (Boolean, opcional): Indica si la vista está siendo cargada por el bot de generación de PDF.

**Ejemplo de URL completa:**
`https://mi-sitio-web.com/reports/view?report_id=550e8400-e29b-41d4-a716-446655440000&print_mode=true`

### Comportamiento esperado de esta vista:

1. **Clean Layout:** Si `print_mode=true`, **ocultar** barras de navegación, sidebars, footers, botones de acción o popups. Solo debe verse el contenido del reporte y el fondo blanco.
2. **State Initialization:** Si `print_mode=true`, todos los componentes colapsables (como tablas de detalles o acordeones) deben inicializarse **abiertos (true)** por defecto.
3. **Responsive:** La vista debe ser responsiva, pero optimizada para un ancho de **1600px** (que es el viewport que simulará el bot de impresión).

---

## 3. Integración con API (Data Fetching)

Al cargar la vista, el frontend debe consumir el siguiente endpoint:

* **Endpoint:** `GET /api/reports/{report_id}` (Ruta pendiente de implementar)
* **Response (JSON Schema):**
```json
{
  "global_title": "Título del Reporte (H1)",
  "global_subtitle": "Subtítulo o descripción general (H2/p)",
  "dashboard_plan": [
    // Array de objetos. Cada objeto es un widget a renderizar.
    {
      "component_type": "statCard | donut | table | area | bar | line",
      "title": "Título del Widget",
      "description": "Descripción breve",
      "layout": {
        "span": 4 // Entero (1-12) para Grid System
      },
      "data": [], // Array de datos (estructura varía por componente)
      "details_data": [] // Array opcional para tabla desplegable
    }
  ]
}
```

---

## 4. Catálogo de Componentes

El frontend debe implementar un "Renderizador Dinámico" que itere sobre `dashboard_plan` y seleccione el componente visual según `component_type`.

### A. KPI Card (`statCard`)

Muestra un indicador clave numérico, una tendencia y una tabla opcional de detalles.

* **Estructura de `data`:** Array con un solo objeto.
* **Campos clave:**
    * `value`: (Number/String) El dato principal.
    * `trend`: (String) "up", "down", "neutral". Usar para icono de flecha.
    * `color`: (String, opcional) Color semántico sugerido (ej: "red", "teal").
* **Comportamiento:** Si existe `details_data`, mostrar un botón/switch para expandir una tabla. **Importante:** Si `print_mode=true`, expandir automáticamente.

```json
"data": [{ "value": 70.9, "trend": "up", "color": "teal" }]
```

### B. Gráfico de Dona (`donut`)

Muestra distribución porcentual o categórica.

* **Estructura de `data`:** Array de objetos.
* **Campos clave:**
    * `name`: (String) Etiqueta de la categoría.
    * `value`: (Number) Valor absoluto o porcentaje.
    * `color`: (String, opcional) Color hexadecimal o nombre de variable de tema.

```json
"data": [
  { "name": "FALLA", "value": 10, "color": "#FF0000" },
  { "name": "OK", "value": 90, "color": "#00FF00" }
]
```

### C. Gráficos XY (`area`, `bar`, `line`)

Gráficos de series de tiempo o categorías comparativas.

* **Propiedades extra en el nodo raíz:**
    * `dataKey`: (String) Nombre de la propiedad en `data` que va en el Eje X (ej: "fecha").
    * `series`: (Array) Configuración de las líneas/barras a pintar.
        * `name`: Clave del dato.
        * `color`: Color de la serie.
* **Estructura de `data`:** Array de objetos con el historial.

```json
"dataKey": "fecha",
"series": [{ "name": "ventas", "color": "blue" }],
"data": [{ "fecha": "2023-01", "ventas": 100 }, { "fecha": "2023-02", "ventas": 150 }]
```

### D. Tabla Genérica (`table`)

Una tabla simple para mostrar datos crudos.

* **Estructura de `data`:** Array de objetos planos.
* **Lógica:** Las claves del primer objeto (`Object.keys(data[0])`) deben usarse como cabeceras (TH).

---

## 5. Colaboración y Extensibilidad

Este catálogo de componentes es una **propuesta base** diseñada para cubrir las necesidades actuales de visualización. Entendemos que su UI Kit o librería de componentes puede tener requerimientos específicos o variantes adicionales no contempladas aquí.

**Solicitud al equipo:**
Si detectan que:
* Faltan campos necesarios para renderizar un componente correctamente (ej: `icon_name`, `variant`, `size`, `tooltip_format`).
* Existen otros componentes en su librería que serían útiles para estos reportes.
* La estructura de datos puede optimizarse para facilitar su implementación.

Por favor, **notifíquennos**. La arquitectura de los componentes es flexible y podemos adaptar la salida JSON rápidamente para cumplir con el contrato que sus componentes necesiten.

---

## 6. Consideraciones de Estilo y CSS para Impresión

Para asegurar que el PDF generado se vea idéntico al diseño web, por favor incluyan estas reglas CSS globales o en la vista de reporte:

1. **Backgrounds:** Asegurar la propiedad CSS `-webkit-print-color-adjust: exact;` o `print-color-adjust: exact;` en el `body` o contenedor principal para que los colores de fondo y badges se impriman.
2. **Animaciones:**
    * Idealmente, **desactivar animaciones** de entrada en los gráficos si `print_mode=true`.
    * Si no es posible desactivarlas, asegurar que la animación dure menos de 1 segundo (el bot espera 1.5s antes de capturar).
3. **Sombras:** Evitar sombras excesivas (`box-shadow`) en las tarjetas para la vista de impresión, se ven mejor con bordes sólidos (`border: 1px solid #eee`).

---

### Ejemplo de flujo

1. Backend genera UUID `12345`.
2. Backend llama a `https://front.com/reports/view?report_id=12345&print_mode=true`.
3. Frontend detecta `print_mode`, oculta el menú, hace fetch a `/api/reports/12345`.
4. Frontend renderiza los componentes con los acordeones abiertos.
5. Backend toma la "foto" y genera el PDF.