import { useState, useEffect } from 'react';
import { Grid, Card, Title, Text, LoadingOverlay, Container } from '@mantine/core';
import { DashboardWidget } from './DashboardWidget';
import dashboardMockData from './dashboard_data.json';

export function DynamicDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [isPrintMode, setIsPrintMode] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 1. Buscamos el ID en la URL del navegador
        const params = new URLSearchParams(window.location.search);
        const reportId = params.get('report_id');
        
        const printParam = params.get('print_mode');
        if (printParam === 'true') {
            setIsPrintMode(true);
        }

        if (!reportId) {
            // OPCIONAL: Si no hay ID, puedes cargar un JSON local de prueba
            setDashboardData(dashboardMockData);
            // throw new Error("No se proporcionó un 'report_id' en la URL.");
        }
        else {

          // 2. Llamamos a tu Backend Python
          // Asegúrate de que el puerto 8000 sea donde corre tu FastAPI
          const response = await fetch(`https://solkosintelligence-testing-545989770214.us-central1.run.app/api/reports/${reportId}`);

          if (!response.ok) {
              throw new Error(`Error del servidor: ${response.statusText}`);
          }

          const data = await response.json();
          setDashboardData(data);
        }

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <LoadingOverlay visible />;
  if (error) return <Container my="xl"><Text c="red" size="lg">⚠️ {error}</Text></Container>;
  if (!dashboardData) return <Container><Text>No hay datos.</Text></Container>;

  return (
    <Container fluid my="xl">
      <Title order={1}>{dashboardData.global_title}</Title>
      <Text c="dimmed" mb="xl">{dashboardData.global_subtitle}</Text>
      
      <Grid>
        {dashboardData.dashboard_plan.map((widgetConfig, idx) => (
          <Grid.Col 
            key={idx} 
            span={{ base: 12, md: widgetConfig.layout.span }}
          >
            <Card withBorder radius="md" p="md" shadow="sm">
              <Title order={5} mb="md">{widgetConfig.title}</Title>
              <DashboardWidget config={widgetConfig} isPrintMode={isPrintMode} />
            </Card>
          </Grid.Col>
        ))}
      </Grid>
    </Container>
  );
}