import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Typography,
  Box,
  Grid,
  TextField,
  IconButton,
  InputAdornment,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  CardActions,
  Button,
  Menu,
  MenuItem,
  Fade,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import SearchIcon from "@mui/icons-material/Search";
import "animate.css";

// Base URL para metadatos
const API_BASE = 'http://localhost:3001/api/documentos';
// Endpoint para subida de archivos (solo si lo necesitaras)
const UPLOAD_PHP_URL = 'https://portal.sututeh.com/upload.php';

const Documentos = () => {
  const [docsList, setDocsList] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Más reciente");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });
  const [anchorEl, setAnchorEl] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewUrl, setViewUrl] = useState("");

  const openMenu = Boolean(anchorEl);
  const filterOptions = ["Más reciente", "Última semana", "Último mes"];

  useEffect(() => {
    // Carga de documentos usando API_BASE
    axios.get(API_BASE)
      .then(({ data }) => {
        setDocsList(data.map(d => ({
          id: d.id,
          title: d.nombre,
          description: d.descripcion,
          date: d.fecha_publicacion.split("T")[0],
          image: d.portada,
          url: d.url
        })));
      })
      .catch(err => console.error("Error cargando docs:", err));
  }, []);

  const handleFilterClick = e => setAnchorEl(e.currentTarget);
  const handleFilterClose = () => setAnchorEl(null);
  const handleFilterSelect = option => {
    setFilter(option);
    setAnchorEl(null);
    setSnackbar({ open: true, message: `Filtrando por: ${option}`, severity: "info" });
  };

  const handleOpenDoc = doc => {
    setViewUrl(doc.url);
    setViewOpen(true);
  };

  const filteredDocs = docsList.filter(doc =>
    doc.title.toLowerCase().includes(search.toLowerCase()) ||
    doc.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 15, mb: 6 }}>
      {/* Título */}
      <Box sx={{ textAlign: "center", mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: "bold" }}>Documentos</Typography>
        <Box sx={{ height: 2, width: 120, bgcolor: "#2e7d32", mx: "auto", mt: 1 }} />
      </Box>

      <Grid container spacing={2}>
        {/* Panel izquierdo */}
        <Grid item xs={12} md={3}>
          <Box sx={{ mb: 1.5, textAlign: "center" }}>
            <TextField
              size="small"
              label="Buscar documentos"
              value={search}
              onChange={e => setSearch(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: "#2e7d32" }} /></InputAdornment>
              }}
              sx={{
                width: "75%",
                "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#81c784" },
                "& .MuiInputLabel-root.Mui-focused": { color: "#81c784" }
              }}
            />
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5, justifyContent: "center" }}>
            <IconButton onClick={handleFilterClick}><FilterListIcon sx={{ color: "#2e7d32" }} /></IconButton>
            <Typography variant="body2" sx={{ color: "#2e7d32" }}>{filter}</Typography>
          </Box>
          <Menu
            anchorEl={anchorEl}
            open={openMenu}
            onClose={handleFilterClose}
            TransitionComponent={Fade}
          >
            {filterOptions.map(option => (
              <MenuItem key={option} onClick={() => handleFilterSelect(option)}>
                {option}
              </MenuItem>
            ))}
          </Menu>

          <Box sx={{ display: { xs: "none", md: "block" }, maxHeight: 350, overflowY: "auto" }}>
            {filteredDocs.map(doc => (
              <Card key={doc.id} className="animate__animated animate__fadeInUp" sx={{ mb: 1.5, width: "75%", mx: "auto", display: "flex", alignItems: "center", p: 0.5 }}>
                <CardActionArea onClick={() => handleOpenDoc(doc)}>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <CardMedia component="img" image={doc.image} alt={doc.title} sx={{ width: 60, height: 60, mr: 1, transition: "transform 0.3s", "&:hover": { transform: "scale(1.05)" } }} />
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>{doc.title}</Typography>
                      <Typography variant="caption" color="text.secondary">{doc.date}</Typography>
                    </Box>
                  </Box>
                </CardActionArea>
              </Card>
            ))}
          </Box>
        </Grid>

        {/* Panel derecho */}
        <Grid item xs={12} md={9}>
          <Box sx={{ maxHeight: { xs: "none", md: 600 }, overflowY: "auto" }}>
            <Grid container spacing={2}>
              {filteredDocs.map(doc => (
                <Grid item xs={12} sm={6} md={4} key={doc.id} sx={{ display: "flex", justifyContent: { xs: "center", md: "flex-start" } }}>
                  <Card className="animate__animated animate__fadeInUp" sx={{ maxWidth: 320, height: 330, display: "flex", flexDirection: "column", justifyContent: "space-between", width: "100%" }}>
                    <CardActionArea onClick={() => handleOpenDoc(doc)} sx={{ flexGrow: 1 }}>
                      <CardMedia component="img" height="130" image={doc.image} alt={doc.title} sx={{ transition: "transform 0.3s", "&:hover": { transform: "scale(1.05)" } }} />
                      <CardContent>
                        <Typography gutterBottom variant="subtitle2">{doc.title}</Typography>
                        <Typography variant="body2" color="text.secondary">{doc.description}</Typography>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>{doc.date}</Typography>
                      </CardContent>
                    </CardActionArea>
                    <CardActions>
                      <Button size="small" color="success" onClick={() => handleOpenDoc(doc)}>Ver más</Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Grid>
      </Grid>

      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Dialog de vista previa */}
      <Dialog open={viewOpen} onClose={() => setViewOpen(false)} fullWidth maxWidth="lg">
        <DialogTitle>Vista previa del documento</DialogTitle>
        <DialogContent sx={{ height: "80vh", p: 0 }}>
          {viewUrl.toLowerCase().endsWith(".pdf") ? (
            <object data={viewUrl} type="application/pdf" width="100%" height="100%">
              <Typography>
                No se puede mostrar el PDF.{" "}
                <a href={viewUrl} target="_blank" rel="noopener noreferrer">Abrir en nueva pestaña</a>
              </Typography>
            </object>
          ) : (
            <iframe
              src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(viewUrl)}`}
              width="100%" height="100%" frameBorder="0"
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewOpen(false)}>Cerrar</Button>
          <Button component="a" href={viewUrl} target="_blank" rel="noopener noreferrer">Abrir original</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Documentos;
