// src/components/pages/admin/DatosdeEmpresa.jsx
import React, { useRef, useState, useEffect } from "react";
import {
  Box,
  TextField,
  Typography,
  Paper,
  Grid,
  Select,
  MenuItem,
  IconButton,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Avatar,
  Snackbar,
  Alert,
  FormControl,
  
  InputAdornment,
  InputLabel
} from "@mui/material";
import {
  Edit as EditIcon,
  Save as SaveIcon,
  CameraAlt as CameraAltIcon,
  Check as CheckIcon,
  Close as CloseIcon
} from "@mui/icons-material";
import { Chip } from "@mui/material";

import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import TwitterIcon from "@mui/icons-material/Twitter";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import YouTubeIcon    from "@mui/icons-material/YouTube";
import MusicNoteIcon  from "@mui/icons-material/MusicNote"
import axios from "axios";


import { Delete as DeleteIcon } from "@mui/icons-material";


const ICONS = {
  Facebook: <FacebookIcon sx={{ color: "#3b5998" }} />,
  Instagram: <InstagramIcon sx={{ color: "#E1306C" }} />,
  Twitter: <TwitterIcon sx={{ color: "#1DA1F2" }} />,
  LinkedIn: <LinkedInIcon sx={{ color: "#0077B5" }} />,
  YouTube:   <YouTubeIcon sx={{ color: "#FF0000" }} />,
  TikTok:    <MusicNoteIcon sx={{ color: "#000000" }} />
};

export default function DatosdeEmpresa({ drawerOpen }) {
  // --- Redes Sociales ---
  const [socialData, setSocialData] = useState([
    { id: 1, redSocial: "Facebook", enlace: "https://facebook.com", estado: "Activo" },
    { id: 2, redSocial: "Instagram", enlace: "https://instagram.com", estado: "Inactivo" },
    { id: 3, redSocial: "Twitter", enlace: "https://twitter.com", estado: "Activo" },
    { id: 4, redSocial: "LinkedIn", enlace: "https://linkedin.com", estado: "Activo" },
    { id: 5, redSocial: "YouTube", enlace: "https://linkedin.com", estado: "Activo" },
    { id: 6, redSocial: "MusicNote", enlace: "https://linkedin.com", estado: "Activo" }
  ]);

  // Estado edición inline
  const [editingId, setEditingId] = useState(null);
  const [editEnlace, setEditEnlace] = useState("");
  const [editEstado, setEditEstado] = useState("");
  

  // Snackbar
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });
  const showSnack = (msg, sev = "success") => setSnack({ open: true, message: msg, severity: sev });
  const closeSnack = () => setSnack(prev => ({ ...prev, open: false }));


  
// al inicio, tras los useState existentes
const [focusCoord, setFocusCoord] = useState({ lat: false, lng: false });

  const [empresa, setEmpresa] = useState({
    id:         null,
    direccion:  "",
    telefono:   "",
    correo:     "",
    nombre_empresa: "",
    titulo_empresa: "",
    avatar_url: "",
    cover_url:  "",
    latitud: "",   
   longitud: "" 
  });
  


  const [editingFields, setEditingFields] = useState({
       direccion: false,
       telefono: false,
       correo: false,
       nombre_empresa: false,
       titulo_empresa: false,
       latitud: false,   
   longitud: false
     });

     const toggleEdit = (field) => {
        setEditingFields(prev => ({ ...prev, [field]: !prev[field] }));
       };


       
       const saveField = async (field) => {
          try {
             await axios.put(`http://localhost:3001/api/datos-empresa/${empresa.id}`, {
               [field]: empresa[field]
           });
           showSnack("Guardado exitoso");
             setEditingFields(prev => ({ ...prev, [field]: false }));
           } catch (err) {
             console.error(err);
             showSnack("Error al guardar", "error");
           }
       };
        
  // Abrir edición de fila
  const handleEditSocial = (row) => {
    setEditingId(row.id);
    setEditEnlace(row.enlace);
    setEditEstado(row.estado);
  };

  // Guardar edición inline
  const handleSaveSocial = async (id) => {
    try {
      // Llamas al endpoint que creaste en el back: PUT /api/datos-empresa/:empresaId/redes/:id
      await axios.put(
        `http://localhost:3001/api/datos-empresa/${empresa.id}/redes/${id}`,
        {
          enlace: editEnlace,
          estado: editEstado,
        }
      );

      // Una vez confirmado el guardado, actualizas el state local
      setSocialData(prev =>
        prev.map(item =>
          item.id === id
            ? { ...item, enlace: editEnlace, estado: editEstado }
            : item
        )
      );
      setEditingId(null);
      showSnack("Red social actualizada");
    } catch (err) {
      console.error("Error actualizando red:", err);
      showSnack("Error al guardar red", "error");
    }
  };

  // --- Agregar nueva red ---
  const [newRed, setNewRed] = useState({
    redSocial: "",
    enlace: "",
    estado: "Activo"
  });

  

  const handleAddSocial = async () => {
    if (!newRed.redSocial || !newRed.enlace) {
      showSnack("Completa todos los campos", "error");
      return;
    }
    try {
      const { data } = await axios.post(
        `http://localhost:3001/api/datos-empresa/${empresa.id}/redes`,
        {
          red_social: newRed.redSocial,
          enlace:     newRed.enlace,
          estado:     newRed.estado
        }
      );
      // 'data.id' es el insertId que devuelve el servidor
      setSocialData(prev => [
        { id: data.id, ...newRed },
        ...prev
      ]);
      setNewRed({ redSocial: "", enlace: "", estado: "Activo" });
      showSnack("Red social agregada");
    } catch (err) {
      console.error("Error creando red:", err);
      showSnack("Error al agregar red", "error");
    }
  };


  const handleDeleteSocial = async (id) => {
    try {
      await axios.delete(
        `http://localhost:3001/api/datos-empresa/${empresa.id}/redes/${id}`
      );
      setSocialData(prev => prev.filter(item => item.id !== id));
      showSnack("Red social eliminada");
    } catch (err) {
      console.error("Error eliminando red:", err);
      showSnack("Error al eliminar red", "error");
    }
  };
  

  // --- Avatar y Cover (igual que antes) ---
  const fileInputRef = useRef(null);
  const [avatarSrc, setAvatarSrc] = useState("");
  const [tempAvatarSrc, setTempAvatarSrc] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);


 const [tempCoverSrc, setTempCoverSrc] = useState("");
const [coverSrc, setCoverSrc] = useState("");
const [coverFile, setCoverFile] = useState(null);
const [isEditingCover, setIsEditingCover] = useState(false);
const coverFileInputRef = useRef(null);



  const handleOpenFileExplorer = () => fileInputRef.current?.click();
  const handleFileChange = e => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setTempAvatarSrc(reader.result);
        setAvatarFile(file);
        setIsEditingAvatar(true);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSaveAvatar = async () => {
    if (!avatarFile) return;
    const form = new FormData();
    form.append("avatar", avatarFile);
    try {
      const { data } = await axios.put(
        `http://localhost:3001/api/datos-empresa/${empresa.id}`,
        form,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      // el server te devuelve el objeto actualizado bajo data.updated
      setAvatarSrc(data.updated.avatar_url);
      setTempAvatarSrc("");
      setAvatarFile(null);
      setIsEditingAvatar(false);
      showSnack("Avatar actualizado");
    } catch (err) {
      console.error(err);
      showSnack("Error al actualizar avatar", "error");
    }
  };
  
  const handleCancelAvatar = () => {
    setTempAvatarSrc("");
    setIsEditingAvatar(false);
  };

 

  const handleOpenCoverExplorer = () => coverFileInputRef.current?.click();
  

  const handleCoverChange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setTempCoverSrc(reader.result);
      setCoverFile(file);
      setIsEditingCover(true);
    };
    reader.readAsDataURL(file);
  };
  
 
     
  
  
const handleSaveCover = async () => {
  if (!coverFile) return;
  const form = new FormData();
  form.append("cover", coverFile);
  try {
    const { data } = await axios.put(
      `http://localhost:3001/api/datos-empresa/${empresa.id}`,
      form,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    setCoverSrc(data.updated.cover_url);
    setTempCoverSrc("");
    setCoverFile(null);
    setIsEditingCover(false);
    showSnack("Portada actualizada");
  } catch (err) {
    console.error(err);
    showSnack("Error al actualizar portada", "error");
  }
};

  const handleCancelCover = () => {
    setTempCoverSrc("");
    setCoverFile(null);
    setIsEditingCover(false);
  };

  useEffect(() => {
    axios.get('http://localhost:3001/api/datos-empresa')
      .then(({ data }) => {
        if (data.length) {
          const emp = data[0];
  
          // asigna TODO el objeto
          setEmpresa({
            id:              emp.id,
            direccion:       emp.direccion,
            telefono:        emp.telefono,
            correo:          emp.correo,
            nombre_empresa:  emp.nombre_empresa,
            titulo_empresa:  emp.titulo_empresa,
            avatar_url:      emp.avatar_url,
            cover_url:       emp.cover_url,
            latitud:         emp.latitud,   
            longitud:        emp.longitud
          });
  
          // transforma snake_case → camelCase para las redes
          setSocialData(emp.redes.map(r => ({
            id:          r.id,
            redSocial:   r.red_social,
            enlace:      r.enlace,
            estado:      r.estado,
            fecha_creacion:    r.fecha_creacion,
            fecha_actualizacion:r.fecha_actualizacion
          })));
  
          setAvatarSrc(emp.avatar_url);
          setCoverSrc(emp.cover_url);
        }
      })
      .catch(err => {
        console.error(err);
        showSnack("Error cargando datos", "error");
      });
  }, []);
  
  

  
  
  
  // Márgenes para drawer (igual que antes)
  const openMarginLeft = 5, closedMarginLeft = 5;

  return (
    <Box
      sx={{
        marginLeft: {
          xs: 0,
          sm: drawerOpen ? `${openMarginLeft}px` : `${closedMarginLeft}px`,
        },
        width: {
          xs: "100%",
          sm: drawerOpen
            ? `calc(100% - ${openMarginLeft}px)`
            : `calc(100% - ${closedMarginLeft}px)`,
        },
        p: 2,
      }}
    >
      {/* Portada + Avatar */}
      <Paper sx={{ p: 2, mb: 3, position: "relative" }} elevation={3}>
        {/* Cover */}
        <Box sx={{ position: "relative" }}>
          <Box
            component="img"
            src={
              tempCoverSrc ||
              coverSrc ||
              empresa.cover_url ||
              "https://via.placeholder.com/800x200"
            }
            sx={{ width: "100%", height: 200, objectFit: "cover" }}
          />

          <label htmlFor="cover-upload">
            <Button
              component="span"
              sx={{
                position: "absolute",
                bottom: 8,
                right: 16,
                bgcolor: "rgba(255,255,255,0.7)",
                zIndex: 1, // <- aquí
              }}
              startIcon={<CameraAltIcon />}
              size="small"
            >
              Editar portada
            </Button>
          </label>
          <input
            id="cover-upload"
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleCoverChange}
          />
          {isEditingCover && (
            <Box
              sx={{
                position: "absolute",
                bottom: -24,
                right: 20,  
                transform: "translateX(-50%)",
                display: "flex",
                gap: 1,
                zIndex: 2,  
              }}
            >
              <IconButton color="success" onClick={handleSaveCover}>
                <CheckIcon />
              </IconButton>
              <IconButton color="error" onClick={handleCancelCover}>
                <CloseIcon />
              </IconButton>
            </Box>
          )}

         
        </Box>


      {/* Avatar */}
<Box
  sx={{
    position: "relative",
    mt: -7,
    display: "flex",
    justifyContent: "center",
  }}
>
  <Avatar
    src={tempAvatarSrc || avatarSrc || empresa.avatar_url || ""}
    sx={{ width: 120, height: 120, border: "3px solid white" }}
  />
  <IconButton
    onClick={handleOpenFileExplorer}
    sx={{
      position: "absolute",
      bottom: 8,
      right: "calc(50% - 60px)",
      bgcolor: "#fff",
    }}
  >
    <CameraAltIcon />
  </IconButton>

  {isEditingAvatar && (
    <Box
      sx={{
        position: "absolute",
        bottom: -4,               // ajusta este valor para subir/bajar
        right: "calc(50% - 140px)", // ajusta para mover izquierda/derecha
        display: "flex",
        gap: 1,
      }}
    >
      <IconButton color="success" onClick={handleSaveAvatar}>
        <CheckIcon />
      </IconButton>
      <IconButton color="error" onClick={handleCancelAvatar}>
        <CloseIcon />
      </IconButton>
    </Box>
  )}

  <input
    type="file"
    accept="image/*"
    ref={fileInputRef}
    style={{ display: "none" }}
    onChange={handleFileChange}
  />
</Box>

      </Paper>

      {/* Contacto e Info Empresa (igual que antes) */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: "100%" }} elevation={3}>
            <Typography variant="h6">Datos de Contacto</Typography>
            <Grid container spacing={2} mt={1}>
              <Grid item xs={6}>
                <TextField
                  size="small"
                  label="Dirección"
                  value={empresa.direccion}
                  onChange={(e) =>
                    setEmpresa((prev) => ({
                      ...prev,
                      direccion: e.target.value,
                    }))
                  }
                  InputProps={{
                    readOnly: !editingFields.direccion,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() =>
                            editingFields.direccion
                              ? saveField("direccion")
                              : toggleEdit("direccion")
                          }
                        >
                          {editingFields.direccion ? (
                            <SaveIcon />
                          ) : (
                            <EditIcon />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={6}>
  <TextField
    size="small"
    label="Latitud"
    value={empresa.latitud || ""}
    onChange={e =>
      setEmpresa(prev => ({ ...prev, latitud: e.target.value }))
    }
    onFocus={() =>
      setFocusCoord(prev => ({ ...prev, lat: true }))
    }
    onBlur={() =>
      setFocusCoord(prev => ({ ...prev, lat: false }))
    }
    helperText={
      focusCoord.lat
        ? "Se usará para posicionar la ubicación en el mapa del footer"
        : ""
    }
    FormHelperTextProps={{
      sx: { color: "success.main", fontSize: "0.75rem" }
    }}
    InputProps={{
      readOnly: !editingFields.latitud,
      endAdornment: (
        <InputAdornment position="end">
          <IconButton
            size="small"
            onClick={() =>
              editingFields.latitud
                ? saveField("latitud")
                : toggleEdit("latitud")
            }
          >
            {editingFields.latitud ? <SaveIcon /> : <EditIcon />}
          </IconButton>
        </InputAdornment>
      ),
    }}
  />
</Grid>

<Grid item xs={6}>
  <TextField
    size="small"
    label="Longitud"
    value={empresa.longitud || ""}
    onChange={e =>
      setEmpresa(prev => ({ ...prev, longitud: e.target.value }))
    }
    onFocus={() =>
      setFocusCoord(prev => ({ ...prev, lng: true }))
    }
    onBlur={() =>
      setFocusCoord(prev => ({ ...prev, lng: false }))
    }
    helperText={
      focusCoord.lng
        ? "Se usará para posicionar la ubicación en el mapa del footer"
        : ""
    }
    FormHelperTextProps={{
      sx: { color: "success.main", fontSize: "0.75rem" }
    }}
    InputProps={{
      readOnly: !editingFields.longitud,
      endAdornment: (
        <InputAdornment position="end">
          <IconButton
            size="small"
            onClick={() =>
              editingFields.longitud
                ? saveField("longitud")
                : toggleEdit("longitud")
            }
          >
            {editingFields.longitud ? <SaveIcon /> : <EditIcon />}
          </IconButton>
        </InputAdornment>
      ),
    }}
  />
</Grid>



              <Grid item xs={6}>
                <TextField
                  size="small"
                  label="Teléfono"
                  value={empresa.telefono}
                  onChange={(e) =>
                    setEmpresa((prev) => ({
                      ...prev,
                      telefono: e.target.value,
                    }))
                  }
                  InputProps={{
                    readOnly: !editingFields.telefono,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() =>
                            editingFields.telefono
                              ? saveField("telefono")
                              : toggleEdit("telefono")
                          }
                        >
                          {editingFields.telefono ? <SaveIcon /> : <EditIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  size="small"
                  label="Correo"
                  value={empresa.correo}
                  onChange={(e) =>
                    setEmpresa((prev) => ({ ...prev, correo: e.target.value }))
                  }
                  InputProps={{
                    readOnly: !editingFields.correo,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() =>
                            editingFields.correo
                              ? saveField("correo")
                              : toggleEdit("correo")
                          }
                        >
                          {editingFields.correo ? <SaveIcon /> : <EditIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: "100%" }} elevation={3}>
            <Typography variant="h6">Información de la Empresa</Typography>
            <Grid container spacing={2} mt={1}>
              <Grid item xs={6}>
                <TextField
                  size="small"
                  label="Nombre Empresa"
                  value={empresa.nombre_empresa}
                  onChange={(e) =>
                    setEmpresa((prev) => ({
                      ...prev,
                      nombre_empresa: e.target.value,
                    }))
                  }
                  InputProps={{
                    readOnly: !editingFields.nombre_empresa,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() =>
                            editingFields.nombre_empresa
                              ? saveField("nombre_empresa")
                              : toggleEdit("nombre_empresa")
                          }
                        >
                          {editingFields.nombre_empresa ? (
                            <SaveIcon />
                          ) : (
                            <EditIcon />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  size="small"
                  label="Título Empresa"
                  value={empresa.titulo_empresa}
                  onChange={(e) =>
                    setEmpresa((prev) => ({
                      ...prev,
                      titulo_empresa: e.target.value,
                    }))
                  }
                  InputProps={{
                    readOnly: !editingFields.titulo_empresa,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() =>
                            editingFields.titulo_empresa
                              ? saveField("titulo_empresa")
                              : toggleEdit("titulo_empresa")
                          }
                        >
                          {editingFields.titulo_empresa ? (
                            <SaveIcon />
                          ) : (
                            <EditIcon />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Formulario Agregar Red */}
      <Paper sx={{ p: 2, mb: 2 }} elevation={3}>
        <Typography variant="h6" gutterBottom>
          Agregar Red Social
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Red Social</InputLabel>
              <Select
                label="Red Social"
                value={newRed.redSocial}
                onChange={(e) =>
                  setNewRed((prev) => ({ ...prev, redSocial: e.target.value }))
                }
              >
                {Object.keys(ICONS).map((name) => (
                  <MenuItem key={name} value={name}>
                    {ICONS[name]}&nbsp;{name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={4}>
            <TextField
              size="small"
              label="Enlace"
              value={newRed.enlace}
              onChange={(e) =>
                setNewRed((prev) => ({ ...prev, enlace: e.target.value }))
              }
              fullWidth
            />
          </Grid>
          <Grid item xs={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Estado</InputLabel>
              <Select
                label="Estado"
                value={newRed.estado}
                onChange={(e) =>
                  setNewRed((prev) => ({ ...prev, estado: e.target.value }))
                }
              >
                <MenuItem value="Activo">Activo</MenuItem>
                <MenuItem value="Inactivo">Inactivo</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={2}>
            <Button variant="contained" onClick={handleAddSocial}>
              Guardar
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabla Redes Sociales */}
      <Paper sx={{ p: 2 }} elevation={3}>
        <Typography variant="h6" gutterBottom>
          Redes Sociales
        </Typography>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#0D47A1" }}>
              <TableCell sx={{ color: "#fff" }}>Ícono</TableCell>
              <TableCell sx={{ color: "#fff" }}>Red</TableCell>
              <TableCell sx={{ color: "#fff" }}>Enlace</TableCell>
              <TableCell sx={{ color: "#fff" }}>Estado</TableCell>
              <TableCell sx={{ color: "#fff", textAlign: "center" }}>
                Acciones
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {socialData.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{ICONS[row.redSocial]}</TableCell>
                <TableCell>{row.redSocial}</TableCell>
                <TableCell>
                  {editingId === row.id ? (
                    <TextField
                      size="small"
                      fullWidth
                      value={editEnlace}
                      onChange={(e) => setEditEnlace(e.target.value)}
                    />
                  ) : (
                    <a href={row.enlace} target="_blank" rel="noreferrer">
                      {row.enlace}
                    </a>
                  )}
                </TableCell>
                <TableCell>
                  {editingId === row.id ? (
                    <Select
                      size="small"
                      value={editEstado}
                      onChange={(e) => setEditEstado(e.target.value)}
                    >
                      <MenuItem value="Activo">Activo</MenuItem>
                      <MenuItem value="Inactivo">Inactivo</MenuItem>
                    </Select>
                  ) : (
                    <Chip
                    label={row.estado}
                    size="small"
                    color={row.estado === "Activo" ? "success" : "error"}
                  />                  )}
                </TableCell>
                <TableCell align="center">
                  {editingId === row.id ? (
                    <IconButton
                      color="primary"
                      onClick={() => handleSaveSocial(row.id)}
                    >
                      <SaveIcon />
                    </IconButton>
                  ) : (
                    <IconButton onClick={() => handleEditSocial(row)}>
                      <EditIcon />
                    </IconButton>
                  )}
                  <IconButton
                    color="error"
                    onClick={() => handleDeleteSocial(row.id)}
                    sx={{ ml: 1 }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {/* Snackbar general */}
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        open={snack.open}
        autoHideDuration={3000}
        onClose={closeSnack}
      >
        <Alert
          onClose={closeSnack}
          severity={snack.severity}
          sx={{ width: "100%" }}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
