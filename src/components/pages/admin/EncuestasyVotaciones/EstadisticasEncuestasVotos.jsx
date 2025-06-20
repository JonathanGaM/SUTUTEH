// src/pages/admin/EstadisticasEncuestasVotos.jsx

import React, { useEffect, useState, useMemo } from 'react';
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
  const [data, setData] = useState(null);

  // Colores
  const pieColors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
  const barColors = ['#0088FE', '#FF6384', '#00C49F', '#FFBB28', '#FF8042', '#A28FD0'];

  useEffect(() => {
    fetch(`http://localhost:3001/api/encuestas-votaciones/${id}/estadisticas`, {
      credentials: 'include'
    })
      .then(res => {
        if (!res.ok) throw new Error('Error al cargar estadísticas');
        return res.json();
      })
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  // Preparo chartData y optionKeys para "Encuesta"
  const { chartData, optionKeys } = useMemo(() => {
    if (!data || data.encuesta.type !== 'Encuesta') {
      return { chartData: [], optionKeys: [] };
    }
    const preguntas = data.preguntas || [];
    // 1) Unir todas las opciones de todas las preguntas
    const allKeys = [];
    preguntas.forEach(p =>
      p.opciones.forEach(o => {
        if (!allKeys.includes(o.opcionText)) {
          allKeys.push(o.opcionText);
        }
      })
    );
    // 2) Construir chartData: un objeto por pregunta con valor 0 para claves ausentes
    const cd = preguntas.map(p => {
      const obj = { pregunta: p.preguntaText };
      allKeys.forEach(key => {
        const found = p.opciones.find(o => o.opcionText === key);
        obj[key] = found ? found.votos : 0;
      });
      return obj;
    });
    return { chartData: cd, optionKeys: allKeys };
  }, [data]);

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }
  if (!data) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4, textAlign: 'center' }}>
        <Typography color="error">No se encontraron estadísticas.</Typography>
      </Container>
    );
  }

  const { encuesta, totalRespondieron, preguntas } = data;
  const isVotacion = encuesta.type === 'Votación';

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          {encuesta.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Publicada el {encuesta.publicationDate} a las {encuesta.publicationTime}
        </Typography>
        <Typography variant="body2" sx={{ mb: 3 }}>
          Total de participantes: <strong>{totalRespondieron}</strong>
        </Typography>

        {isVotacion ? (
          preguntas.map((p, pi) => (
            <Box key={p.preguntaId} sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                {p.preguntaText}
              </Typography>
              <Box sx={{ width: '100%', height: 300 }}>
                <PieResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={p.opciones.map(o => ({
                        name: o.opcionText,
                        value: o.votos
                      }))}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {p.opciones.map((o, idx) => (
                        <PieCell
                          key={o.opcionId}
                          fill={pieColors[idx % pieColors.length]}
                        />
                      ))}
                    </Pie>
                    <PieTooltip />
                    <PieLegend verticalAlign="bottom" height={36} />
                  </PieChart>
                </PieResponsiveContainer>
              </Box>
            </Box>
          ))
        ) : (
          <>
            {/* Un único bar chart apilado */}
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
                  {optionKeys.map((key, idx) => (
                    <Bar
                      key={key}
                      dataKey={key}
                      stackId="a"
                      fill={barColors[idx % barColors.length]}
                      name={key}
                    />
                  ))}
                </BarChart>
              </BarResponsiveContainer>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Tablas de detalle */}
            {preguntas.map((p, idx) => {
              const total = p.opciones.reduce((s, o) => s + o.votos, 0);
              const moda = p.opciones.reduce(
                (mx, o) => (o.votos > mx.votos ? o : mx),
                { votos: -1 }
              );
              return (
                <Box key={p.preguntaId} sx={{ mb: 4 }}>
                  <Typography variant="h6" gutterBottom>
                    {p.preguntaText}
                  </Typography>
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
                        {p.opciones.map(o => {
                          const pct =
                            total > 0
                              ? ((o.votos / total) * 100).toFixed(1)
                              : '0.0';
                          return (
                            <TableRow key={o.opcionId}>
                              <TableCell>{o.opcionText}</TableCell>
                              <TableCell align="right">{o.votos}</TableCell>
                              <TableCell align="right">{pct}%</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <Typography variant="body2" color="text.secondary">
                    Moda:{' '}
                    <strong>
                      {moda.opcionText} ({moda.votos} votos,{' '}
                      {total > 0
                        ? ((moda.votos / total) * 100).toFixed(1)
                        : 0}
                      %)
                    </strong>
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
