import { useState } from 'react';
import { Alert, Flex, Text, Table, Badge, Switch, Collapse, Divider } from '@mantine/core';
import { AreaChart, DonutChart, LineChart, BarChart } from '@mantine/charts';
import { 
  IconAlertCircle, 
  IconArrowUpRight, 
  IconArrowDownRight, 
  IconCircleArrowUpRight, 
  IconCircleArrowDownRight 
} from '@tabler/icons-react';

/* --- Helper: Asigna colores automáticos si el JSON no trae 'color' --- */
function getStatusColor(name) {
  if (!name) return 'gray.6';
  const upperName = name.toUpperCase();
  if (upperName === 'FALLA' || upperName === 'ERROR') return 'red.6';
  if (upperName === 'FUNCIONANDO' || upperName === 'OK' || upperName === 'ACTIVO') return 'teal.6';
  if (upperName === 'ATENDIDOS' || upperName === 'WARNING') return 'yellow.6';
  return 'blue.6'; 
}

/* --- Sub-componente: Icono de Tendencia --- */
function TrendIcon({ trend }) {
  const t = trend ? trend.toLowerCase() : '';
  if (t === 'up') return <IconCircleArrowUpRight size={18} color="var(--mantine-color-teal-6)" />;
  if (t === 'down') return <IconCircleArrowDownRight size={18} color="var(--mantine-color-red-6)" />;
  return null;
}

/* --- Sub-componente: KPI Stat Card --- */
function KpiStatCard({ title, description, data, details_data, details_columns, defaultOpen }) {
  const [showDetails, setShowDetails] = useState(defaultOpen || false);
  const hasDetails = details_data && details_data.length > 0;

  if (!data || data.length === 0) return <Text>Sin datos</Text>;
  
  const { value, trend, color: jsonColor } = data[0];
  const isUp = trend === 'up';
  // Si el JSON trae color, úsalo. Si no, calcúlalo según la tendencia.
  const badgeColor = jsonColor || (isUp ? 'teal' : 'red');
  const Icon = isUp ? IconArrowUpRight : IconArrowDownRight;

  const headers = (details_columns && details_columns.length > 0) 
    ? details_columns 
    : (hasDetails ? Object.keys(details_data[0]) : []);
  
  const detailsRows = hasDetails ? details_data.map((row, index) => (
    <Table.Tr key={index}>
      {headers.map((header) => (
        <Table.Td key={header}>
          {(header === 'trend' || header === 'Tendencia') 
            ? <TrendIcon trend={row[header]} /> 
            : row[header]
          }
        </Table.Td>
      ))}
    </Table.Tr>
  )) : [];

  return (
    <div>
      <Text c="dimmed" tt="uppercase" fz="xs" fw={500}>{title}</Text>
      <Flex justify="space-between" align="center" gap="md">
        <Text fz={28} fw={700}>{value}</Text> 
        {/* Nota: Si tus valores numéricos ya traen %, quita el "%" hardcodeado abajo o en el JSON */}
        <Badge color={badgeColor} leftSection={<Icon size={16} />} size="lg" variant="light">
          {trend}
        </Badge>
      </Flex>
      <Text c="dimmed" fz="sm" mt="sm">{description}</Text>

      {hasDetails && (
        <>
          <Divider my="sm" />
          <Flex justify="flex-end" align="center" gap="sm">
            <Text fz="sm" c="dimmed">Detalles</Text>
            <Switch checked={showDetails} onChange={(e) => setShowDetails(e.currentTarget.checked)} size="xs" />
          </Flex>
          <Collapse in={showDetails} mt="xs">
            <Table fz="xs" verticalSpacing="xs" striped withTableBorder>
              <Table.Thead>
                <Table.Tr>
                  {headers.map((h) => <Table.Th key={h} tt="capitalize">{h}</Table.Th>)}
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

/* --- Sub-componente: Tabla Genérica --- */
function KpiTable({ data, columns }) {
  if (!data || data.length === 0) return <Text>Sin datos</Text>;
  
  const headers = (columns && columns.length > 0) 
    ? columns 
    : Object.keys(data[0]);

  return (
    <Table striped withTableBorder withColumnBorders>
      <Table.Thead>
        <Table.Tr>{headers.map(h => <Table.Th key={h}>{h}</Table.Th>)}</Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {data.map((row, i) => (
          <Table.Tr key={i}>
            {headers.map(h => <Table.Td key={h}>{row[h]}</Table.Td>)}
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  );
}

/* --- WIDGET PRINCIPAL --- */
export function DashboardWidget({ config, isPrintMode }) {
  const { component_type, data, dataKey, series, details_data, details_columns, columns, title, description } = config;

  if (config.error) {
    return <Alert icon={<IconAlertCircle size="1rem" />} title="Error" color="red">{config.error}</Alert>;
  }

  switch (component_type) {
    case 'statCard':
      return <KpiStatCard title={title} description={description} data={data} details_data={details_data} details_columns={details_columns} defaultOpen={isPrintMode} />;
    
    case 'table':
      return <KpiTable data={data} columns={columns} />;

    case 'donut':
      // Mapeo Estándar: Asegurar que haya 'color'
      const donutData = data ? data.map(item => ({
        ...item,
        color: item.color || getStatusColor(item.name)
      })) : [];
      
      return (
        <Flex h={300} justify="center" align="center" direction="column">
          <DonutChart h={250} data={donutData} withLabelsLine withLabels tooltipDataSource="segment" paddingAngle={2} chartLabel="Total" />
        </Flex>
      );

    case 'area':
      return <Flex h={300}><AreaChart h={300} data={data} dataKey={dataKey} series={series} withLegend connectNulls /></Flex>;
    case 'bar':
      return <Flex h={300}><BarChart h={300} data={data} dataKey={dataKey} series={series} withLegend /></Flex>;
    case 'line':
      return <Flex h={300}><LineChart h={300} data={data} dataKey={dataKey} series={series} withLegend /></Flex>;

    default:
      return <Alert color="gray">Componente desconocido: {component_type}</Alert>;
  }
}