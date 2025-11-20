import { useState, useEffect } from 'react';
import { Grid, Card, Title, Text, LoadingOverlay, Container } from '@mantine/core';
import { DashboardWidget } from './DashboardWidget';

// Importamos el JSON de prueba.
// En un caso real, harías fetch a tu API de Python.
import dashboardMockData from './dashboard_data.json';

// Simula una llamada a la API
const fetchDashboardData = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(dashboardMockData);
    }, 1000); // Simula 1 segundo de carga
  });
};


export function DynamicDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);

  // Este useEffect es el ÚNICO lugar donde se hace un fetch.
  // Carga el plan completo del dashboard.
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        
        // EN PRODUCCIÓN:
        // const response = await fetch('/api/v1/generate_dashboard_from_text', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ query: "Resumen de KOF" })
        // });
        // const data = await response.json();
        
        // PARA PRUEBAS (usando el JSON importado):
        const data = await fetchDashboardData();

        setDashboardData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []); // El array vacío [] asegura que esto se ejecute solo una vez.


  // Renderizado condicional
  if (loading) {
    return <LoadingOverlay visible zIndex={1000} overlayProps={{ radius: 'sm', blur: 2 }} />;
  }

  if (error) {
    return <Container><Text color="red">Error al cargar el dashboard: {error}</Text></Container>;
  }

  if (!dashboardData) {
    return <Container><Text>No hay datos para el dashboard.</Text></Container>;
  }

  // Renderizado del Dashboard
  return (
    <Container fluid my="xl">
      {/* Títulos globales que vienen del JSON */}
      <Title order={1}>{dashboardData.global_title}</Title>
      <Text c="dimmed" mb="xl">{dashboardData.global_subtitle}</Text>
      
      {/* Renderizado de los widgets */}
      <Grid>
        {dashboardData.dashboard_plan.map((widgetConfig) => (
          <Grid.Col 
            key={widgetConfig.widget_id} 
            span={{ 
              base: 12, // Ocupa 12 columnas en móvil
              md: widgetConfig.layout.span // Ocupa el 'span' del JSON en pantallas medianas
            }}
          >
            <Card withBorder radius="md" p="md" shadow="sm">
              
              {/* El título del widget (tarjeta) ahora también viene del JSON */}
              <Title order={5} mb="md">
                {widgetConfig.title}
              </Title>
              
              {/* Pasamos la configuración del widget (incluyendo los datos) 
                al componente "tonto".
              */}
              <DashboardWidget config={widgetConfig} />
              
            </Card>
          </Grid.Col>
        ))}
      </Grid>
    </Container>
  );
}