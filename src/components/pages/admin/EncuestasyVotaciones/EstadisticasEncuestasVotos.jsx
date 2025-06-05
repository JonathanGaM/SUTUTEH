// src/pages/admin/EstadisticasEncuestasVotos.jsx

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  CircularProgress,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Divider
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell as PieCell,
  Legend as PieLegend,
  Tooltip as PieTooltip,
  ResponsiveContainer as PieResponsiveContainer
} from 'recharts';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as BarTooltip,
  Legend as BarLegend,
  ResponsiveContainer as BarResponsiveContainer
} from 'recharts';

export default function EstadisticasEncuestasVotos() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [colors, setColors] = useState([]);

  useEffect(() => {
    // ──────────────────────────────────────────────────────────────────────────
    // Simulación de fetch de encuesta/votación según ID.
    // Reemplaza este bloque con tu llamada real a la API.
    // ──────────────────────────────────────────────────────────────────────────
    setTimeout(() => {
      if (id === '1') {
        // Ejemplo: “Votación”
        setItem({
          id: '1',
          type: 'Votación',
          title: 'Elección de Delegado 2025',
          publicationDate: '2025-06-01',
          publicationTime: '10:00',
          // votos por opción
          votes: [
            { name: 'Pedro', value: 45 },
            { name: 'Juan', value: 50 },
            { name: 'Ricardo', value: 80 },
            { name: 'No votaron', value: 15 }
          ]
        });
      } else {
        // Ejemplo: “Encuesta”
        setItem({
          id: '2',
          type: 'Encuesta',
          title: 'Encuesta de Satisfacción 2025',
          publicationDate: '2025-06-01',
          publicationTime: '10:00',
          // estructura de preguntas con conteos por opción
          questions: [
            {
              text: 'Pregunta 1',
              options: [
                { name: 'Opción A', value: 20 },
                { name: 'Opción B', value: 15 },
                { name: 'Opción C', value: 10 },
                { name: 'Opción D', value: 5 }
              ]
            },
            {
              text: 'Pregunta 2',
              options: [
                { name: 'Opción A', value: 10 },
                { name: 'Opción B', value: 25 },
                { name: 'Opción C', value: 10 },
                { name: 'Opción D', value: 5 }
              ]
            },
            {
              text: 'Pregunta 3',
              options: [
                { name: 'Opción A', value: 15 },
                { name: 'Opción B', value: 10 },
                { name: 'Opción C', value: 15 },
                { name: 'Opción D', value: 10 }
              ]
            }
          ]
        });
      }
      setLoading(false);
    }, 500);
  }, [id]);

  useEffect(() => {
    if (!item) return;

    if (item.type === 'Votación') {
      // Preparar datos para el pastel
      setChartData(item.votes.map(v => ({ name: v.name, value: v.value })));
      // Colores fijos para la votación
      setColors(['#0088FE', '#00C49F', '#FFBB28', '#FF8042']);
    } else {
      // Preparar datos para el gráfico de barras apiladas
      const transformed = item.questions.map(q => {
        const obj = { pregunta: q.text };
        q.options.forEach(opt => {
          obj[opt.name] = opt.value;
        });
        return obj;
      });
      setChartData(transformed);
      // Colores para cada opción
      setColors(['#0088FE', '#FF6384', '#00C49F', '#FFBB28']);
    }
  }, [item]);

  if (loading || !item) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        {/* Título */}
        <Typography variant="h5" gutterBottom>
          {item.title}
        </Typography>

        {/* Fecha y hora de publicación */}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Publicada el {item.publicationDate} a las {item.publicationTime}
        </Typography>

        {item.type === 'Votación' ? (
          // ─────────────────────────────────────────────────
          // Gráfica de pastel para “Votación”
          // ─────────────────────────────────────────────────
          <Box sx={{ width: '100%', height: 350 }}>
            <PieResponsiveContainer>
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {chartData.map((entry, index) => (
                    <PieCell
                      key={`slice-${index}`}
                      fill={colors[index % colors.length]}
                    />
                  ))}
                </Pie>
                <PieTooltip />
                <PieLegend verticalAlign="bottom" height={36} />
              </PieChart>
            </PieResponsiveContainer>
          </Box>
        ) : (
          // ─────────────────────────────────────────────────
          // Gráfico de barras apiladas para “Encuesta”
          // ─────────────────────────────────────────────────
          <>
            <Box sx={{ width: '100%', height: 400 }}>
              <BarResponsiveContainer>
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="pregunta" />
                  <YAxis />
                  <BarTooltip />
                  <BarLegend verticalAlign="bottom" height={36} />
                  {/* Una <Bar> por opción; la propiedad stackId="a" las apila */}
                  <Bar dataKey="Opción A" stackId="a" fill={colors[0]} name="Opción A" />
                  <Bar dataKey="Opción B" stackId="a" fill={colors[1]} name="Opción B" />
                  <Bar dataKey="Opción C" stackId="a" fill={colors[2]} name="Opción C" />
                  <Bar dataKey="Opción D" stackId="a" fill={colors[3]} name="Opción D" />
                </BarChart>
              </BarResponsiveContainer>
            </Box>

            {/* ───────────────────────────────────────────────────────────── */}
            {/* Sección de tabla de estadísticas para Encuesta                */}
            {/* ───────────────────────────────────────────────────────────── */}
            <Divider sx={{ my: 3 }} />

            {item.questions.map((q, qidx) => {
              // Calcular total de respuestas para esta pregunta
              const total = q.options.reduce((sum, opt) => sum + opt.value, 0);
              // Determinar la moda y porcentaje para cada opción
              const moda = q.options.reduce((prev, curr) =>
                curr.value > prev.value ? curr : prev
              );
              return (
                <Box key={qidx} sx={{ mb: 4 }}>
                  {/* Título de la pregunta */}
                  <Typography variant="h6" gutterBottom>
                    {q.text}
                  </Typography>

                  {/* Tabla de detalle de opciones */}
                  <TableContainer component={Paper} sx={{ mb: 1 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Opción</TableCell>
                          <TableCell align="right">Cantidad</TableCell>
                          <TableCell align="right">Porcentaje</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {q.options.map((opt, oidx) => {
                          const porcentaje =
                            total > 0 ? ((opt.value / total) * 100).toFixed(1) : 0;
                          return (
                            <TableRow key={oidx}>
                              <TableCell>{opt.name}</TableCell>
                              <TableCell align="right">{opt.value}</TableCell>
                              <TableCell align="right">{porcentaje}%</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  {/* Nota: moda */}
                  <Typography variant="body2" color="text.secondary">
                    Moda: <strong>{moda.name}</strong> ({moda.value} respuestas,{' '}
                    {total > 0
                      ? ((moda.value / total) * 100).toFixed(1)
                      : 0}
                    %)
                  </Typography>
                </Box>
              );
            })}
          </>
        )}
      </Paper>
    </Container>
  );
}
