import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  IconButton,
  Grid,
  Collapse
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon
} from '@mui/icons-material';

export default function Encuestas() {
  const [type, setType] = useState('Encuesta');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [closeDate, setCloseDate] = useState('');
  const [closeTime, setCloseTime] = useState('');
  const [questions, setQuestions] = useState([]);

  const handleAddQuestion = () => {
    // Inicializa cada nueva pregunta con dos opciones vacías
    setQuestions(prev => [...prev, { text: '', options: ['', ''] }]);
  };
  const handleRemoveQuestion = idx => {
    setQuestions(prev => prev.filter((_, i) => i !== idx));
  };
  const handleQuestionChange = (idx, text) => {
    setQuestions(prev => prev.map((q, i) => i === idx ? { ...q, text } : q));
  };
  const handleAddOption = qidx => {
    setQuestions(prev => prev.map((q, i) => i === qidx ? { ...q, options: [...q.options, ''] } : q));
  };
  const handleRemoveOption = (qidx, oidx) => {
    setQuestions(prev => prev.map((q, i) => i === qidx ? { ...q, options: q.options.filter((_, j) => j !== oidx) } : q));
  };
  const handleOptionChange = (qidx, oidx, value) => {
    setQuestions(prev => prev.map((q, i) => i === qidx
      ? { ...q, options: q.options.map((opt, j) => j === oidx ? value : opt) }
      : q
    ));
  };
  const handleSave = () => {
    console.log({ type, title, description, closeDate, closeTime, questions });
  };

  return (
    <Container maxWidth="md">
      {/* Más sombra con elevation */}
      <Paper elevation={6} sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Crear {type}
        </Typography>
        <FormControl fullWidth sx={{ mb: 2 }} size="small">
          <InputLabel>Tipo</InputLabel>
          <Select value={type} label="Tipo" onChange={e => setType(e.target.value)} size="small">
            <MenuItem value="Encuesta">Encuesta</MenuItem>
            <MenuItem value="Votación">Votación</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label="Título"
          fullWidth
          size="small"
          sx={{ mb: 2 }}
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <TextField
          label="Descripción"
          fullWidth
          multiline
          rows={3}
          size="small"
          sx={{ mb: 2 }}
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6}>
            <TextField
              label="Fecha de cierre"
              type="date"
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
              value={closeDate}
              onChange={e => setCloseDate(e.target.value)}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Hora de cierre"
              type="time"
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
              value={closeTime}
              onChange={e => setCloseTime(e.target.value)}
            />
          </Grid>
        </Grid>
        <Typography variant="subtitle1" gutterBottom>
          Preguntas
        </Typography>
        {questions.map((q, qidx) => (
          <Collapse in key={qidx} timeout={200} sx={{ mb: 2 }}>
            <Paper sx={{ p: 2 }}>
              <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
                <TextField
                  label={`Pregunta ${qidx + 1}`}
                  fullWidth
                  size="small"
                  value={q.text}
                  onChange={e => handleQuestionChange(qidx, e.target.value)}
                />
                <IconButton color="error" size="small" onClick={() => handleRemoveQuestion(qidx)} sx={{ ml: 1 }}>
                  <DeleteIcon />
                </IconButton>
              </Box>
              {q.options.map((opt, oidx) => (
                <Grid container spacing={1} alignItems="center" key={oidx} sx={{ mb: 1 }}>
                  <Grid item xs={10}>
                    <TextField
                      label={`Opción ${oidx + 1}`}
                      fullWidth
                      size="small"
                      value={opt}
                      onChange={e => handleOptionChange(qidx, oidx, e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={2}>
                    <IconButton color="error" size="small" onClick={() => handleRemoveOption(qidx, oidx)}>
                      <DeleteIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              ))}
              <Button variant="text" size="small" startIcon={<AddIcon />} onClick={() => handleAddOption(qidx)}>
                Agregar Opción
              </Button>
            </Paper>
          </Collapse>
        ))}
        <Button variant="outlined" size="small" startIcon={<AddIcon />} sx={{ mb: 3 }} onClick={handleAddQuestion}>
          Agregar Pregunta
        </Button>
        <Box textAlign="right">
          <Button variant="contained" size="small" startIcon={<SaveIcon />} onClick={handleSave}>
            Guardar {type}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}