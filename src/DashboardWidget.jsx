import { useState } from 'react';
import { Alert, Flex, Text, Table, Badge, Switch, Collapse, Divider } from '@mantine/core';
import { AreaChart, DonutChart, LineChart, BarChart } from '@mantine/charts';
import { IconAlertCircle, IconArrowUpRight, IconArrowDownRight, IconCircleArrowUpRight, IconCircleArrowDownRight } from '@tabler/icons-react';

/* --- Sub-componente para el icono de Tendencia --- */
function TrendIcon({ trend }) {
  if (trend === 'up') {
    return <IconCircleArrowUpRight size={18} color="var(--mantine-color-teal-6)" />;
  }
  if (trend === 'down') {
    return <IconCircleArrowDownRight size={18} color="var(--mantine-color-red-6)" />;
  }
  return null;
}

/* --- Sub-componente para las Tarjetas de KPI (ACTUALIZADO) --- */
function KpiStatCard({ title, description, data, details_data }) {
  const [showDetails, setShowDetails] = useState(false);
  const hasDetails = details_data && details_data.length > 0;

  if (!data || data.length === 0) {
    return <Text>Sin datos para KPI</Text>;
  }
  
  const { value, trend } = data[0];
  const isUp = trend === 'up';
  const color = isUp ? 'teal' : 'red';
  const Icon = isUp ? IconArrowUpRight : IconArrowDownRight;

  // --- Lógica para la tabla de detalles ---
  const detailsHeaders = hasDetails ? Object.keys(details_data[0]) : [];
  const detailsRows = hasDetails ? details_data.map((row, index) => (
    <Table.Tr key={index}>
      {detailsHeaders.map((header) => (
        <Table.Td key={header}>
          {header === 'trend' ? <TrendIcon trend={row[header]} /> : row[header]}
        </Table.Td>
      ))}
    </Table.Tr>
  )) : [];
  // --- Fin de la lógica ---

  return (
    <div>
      {/* Parte principal del KPI */}
      <Text c="dimmed" tt="uppercase" fz="xs" fw={500}>{title}</Text>
      <Flex justify="space-between" align="center" gap="md">
        <Text fz={28} fw={700}>{value}</Text>
        <Badge
          color={color}
          leftSection={<Icon size={16} />}
          size="lg"
          variant="light"
        >
          {value}
        </Badge>
      </Flex>
      <Text c="dimmed" fz="sm" mt="sm">
        {description}
      </Text>

      {/* NUEVA SECCIÓN: Toggle y Detalles Desplegables */}
      {hasDetails && (
        <>
          <Divider my="sm" />
          <Flex justify="flex-end" align="center" gap="sm">
            <Text fz="sm" c="dimmed">Mostrar detalles</Text>
            <Switch
              checked={showDetails}
              onChange={(event) => setShowDetails(event.currentTarget.checked)}
              aria-label="Mostrar detalles"
            />
          </Flex>

          <Collapse in={showDetails} mt="xs">
            <Table fz="xs" verticalSpacing="xs" striped withTableBorder>
              <Table.Thead>
                <Table.Tr>
                  {detailsHeaders.map((header) => (
                    <Table.Th key={header} tt="capitalize">{header}</Table.Th>
                  ))}
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>{detailsRows}</Table.Tbody>
            </Table>
          </Collapse>
        </>
      )}
    </div>
  );
}

/* --- Sub-componente para la Tabla de Geografía (Sin cambios) --- */
function KpiTable({ data }) {
  if (!data || data.length === 0) {
    return <Text>Sin datos para la tabla</Text>;
  }

  // Genera cabeceras dinámicamente
  const headers = Object.keys(data[0]);
  
  // Genera filas
  const rows = data.map((row, index) => (
    <Table.Tr key={index}>
      {headers.map((header) => (
        <Table.Td key={header}>{row[header]}</Table.Td>
      ))}
    </Table.Tr>
  ));

  return (
    <Table striped withTableBorder withColumnBorders>
      <Table.Thead>
        <Table.Tr>
          {headers.map((header) => (
            <Table.Th key={header}>{header}</Table.Th>
          ))}
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>{rows}</Table.Tbody>
    </Table>
  );
}


/* --- El Widget "Tonto" Principal (ACTUALIZADO) --- */
export function DashboardWidget({ config }) {
  // Extraemos `details_data` de la configuración
  const { component_type, data, dataKey, series, details_data } = config;

  // Si hubo un error en el backend, el JSON tendrá este campo
  if (config.error) {
    return (
      <Alert icon={<IconAlertCircle size="1rem" />} title="Error de Widget" color="red">
        {config.error}
      </Alert>
    );
  }

  // El `switch` ahora decide qué componente "tonto" renderizar.
  switch (component_type) {
    case 'statCard':
      // Pasamos `details_data` al sub-componente
      return <KpiStatCard 
                title={config.title} 
                description={config.description} 
                data={data} 
                details_data={details_data} 
             />;
    
    case 'table':
      return <KpiTable data={data} />;

    case 'area':
      return (
        <Flex h={300} justify="center" align="center">
          <AreaChart
            h={300}
            data={data}
            dataKey={dataKey}
            series={series}
            withLegend
            connectNulls
          />
        </Flex>
      );
      
    case 'bar':
      return (
        <Flex h={300} justify="center" align="center">
          <BarChart h={300} data={data} dataKey={dataKey} series={series} withLegend />
        </Flex>
      );

    case 'line':
      return (
        <Flex h={300} justify="center" align="center">
          <LineChart h={300} data={data} dataKey={dataKey} series={series} withLegend />
        </Flex>
      );
    
    case 'donut':
      return (
        <Flex h={300} justify="center" align="center">
          <DonutChart h={300} data={data} withLabelsLine withLabels />
        </Flex>
      );

    default:
      return (
        <Alert color="gray" title="Componente Desconocido">
          Tipo de componente no reconocido: {component_type}
        </Alert>
      );
  }
}