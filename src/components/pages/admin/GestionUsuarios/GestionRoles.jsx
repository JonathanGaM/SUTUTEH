import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Avatar,
  Menu,
  MenuItem,
  TextField,
  Grid,
  InputAdornment,
  Snackbar,
  Slide,
  useTheme,
  useMediaQuery,
  Tooltip
} from '@mui/material';
import Alert from '@mui/material/Alert';
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CloseIcon from '@mui/icons-material/Close';
import DescriptionIcon from '@mui/icons-material/Description';
import SearchIcon from '@mui/icons-material/Search';

// Componente de transición para Dialogs
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

// Helper para obtener las iniciales de un nombre
const getInitials = (name) => {
  const parts = name.split(' ');
  return parts.map(p => p.charAt(0)).join('').toUpperCase();
};

// Componente Draggable para usuarios (separa el checkbox del área draggable)
function DraggableUser({ user }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: user.id,
  });

  const containerStyle = {
    opacity: isDragging ? 0.5 : 1,
    padding: '8px',
    marginBottom: '8px',
    backgroundColor: '#e8f5e9',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center'
  };

  const dragHandleStyle = {
    cursor: 'grab',
    display: 'flex',
    alignItems: 'center',
    transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined,
    transition: 'transform 0.2s ease'
  };

  return (
    <Box sx={containerStyle}>
      <Box ref={setNodeRef} {...listeners} {...attributes} sx={dragHandleStyle}>
        <Avatar sx={{ mr: 1, width: 32, height: 32 }}>
          {getInitials(user.name)}
        </Avatar>
        {user.name}
      </Box>
    </Box>
  );
}


// Componente Droppable para roles
function DroppableRole({ role, children }) {
  const { isOver, setNodeRef } = useDroppable({ id: role.id });
  const style = {
    backgroundColor: isOver ? '#e0f7fa' : '#fafafa',
    padding: '8px',
    minHeight: '80px',
    border: '1px dashed #ccc',
    borderRadius: '4px',
    transition: 'background-color 0.3s ease'
  };
  return (
    <Box ref={setNodeRef} style={style}>
      {children}
    </Box>
  );
}

export default function GestionRoles() {
  
 

  // Estados principales
  const [unassignedUsers, setUnassignedUsers] = useState([
    { id: 'user-1', name: 'Alice' },
    { id: 'user-2', name: 'Bob' },
    { id: 'user-3', name: 'Charlie' },
    { id: 'user-4', name: 'David' },
  ]);
  const [roles, setRoles] = useState([
    {
      id: 'role-1',
      name: 'Administrador',
      description: 'Responsable de la gestión general y estratégica.',
      assignedUsers: []
    },
    {
      id: 'role-2',
      name: 'Operador',
      description: 'Encargado de las operaciones diarias y seguimiento.',
      assignedUsers: []
    },
    {
      id: 'role-3',
      name: 'Secretario',
      description: 'Responsable de la organización, documentación y comunicación.',
      assignedUsers: []
    }
  ]);
  const [editingRoleId, setEditingRoleId] = useState(null);

  const [userToRemove, setUserToRemove] = useState(null);
 const [confirmRemoveOpen, setConfirmRemoveOpen] = useState(false);

  const [activeDragGroup, setActiveDragGroup] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal de asignar responsabilidad específica

  // Modal de detalles del rol (solo lectura)
  const [selectedRoleForModal, setSelectedRoleForModal] = useState(null);

  // Modal para agregar/editar rol
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [roleModalMode, setRoleModalMode] = useState('add');
  const [roleModalData, setRoleModalData] = useState({ name: '', description: '' });

  // Modal de confirmación de eliminación de rol
  const [deleteRoleModalOpen, setDeleteRoleModalOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState(null);

  // Feedback con Alert
  const [alert, setAlert] = useState({ open: false, severity: '', message: '' });
  const showAlert = (severity, message) => {
    setAlert({ open: true, severity, message });
  };
  const handleAlertClose = () => {
    setAlert({ ...alert, open: false });
  };

  // Estados para menú de opciones del rol
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuRoleId, setMenuRoleId] = useState(null);

  // Estados para edición de usuarios asignados en el modal de editar
  const [editAssignedUsers, setEditAssignedUsers] = useState([]);
  const [selectedUsersToRemoveEdit, setSelectedUsersToRemoveEdit] = useState([]);


  const handleConfirmRemove = () => {
    const updatedEdit = editAssignedUsers.filter(u => u.id !== userToRemove.id);
  setEditAssignedUsers(updatedEdit);

   setRoles(prev =>
    prev.map(r =>
      r.id === editingRoleId
        ? { ...r, assignedUsers: updatedEdit }
        : r
    )
  );

  // 3️⃣ Devuelve al usuario al pool de sin asignar (si lo deseas)
  setUnassignedUsers(prev => [...prev, userToRemove]);

  // 4️⃣ Cierra el diálogo
  setConfirmRemoveOpen(false);
  setUserToRemove(null);
};

  // Identificar el rol actual en el modal de asignación

 const handleDragStart = ({ active }) => {
  setActiveDragGroup([active.id]);
};

 const handleDragEnd = ({ active, over }) => {
  if (!over || !over.id.startsWith("role-")) return;
  const roleId = over.id;
const targetRole = roles.find(r => r.id === roleId);
  // Si ya tiene un usuario, no permitimos más
  if (targetRole.assignedUsers.length >= 1) {
    showAlert('error', 'Este rol ya tiene asignado un usuario');
    return;
  }
  // Encuentra el usuario arrastrado
  const draggedUser = unassignedUsers.find(u => u.id === active.id);
  if (!draggedUser) return;

  // Remueve al usuario del pool sin asignar
  setUnassignedUsers(us => us.filter(u => u.id !== active.id));

  // Asigna al usuario al rol
  setRoles(rs =>
    rs.map(r =>
      r.id === roleId
        ? { ...r, assignedUsers: [draggedUser] } // ahora siempre será un único elemento
        : r
    )
  );
  showAlert('success', 'Usuario asignado correctamente');
};
  // Modal de asignar responsabilidad específica
 

 
 

 
  // Modal de detalles del rol (solo lectura)
  const openRoleModalReadOnly = (roleId) => {
    const role = roles.find(r => r.id === roleId);
    setSelectedRoleForModal(role);
  };

  const closeRoleModalReadOnly = () => {
    setSelectedRoleForModal(null);
  };

  // Modal de editar rol (SOLUCIÓN: no setear selectedRoleForModal para evitar conflicto con el modal de solo lectura)
  const handleEditRole = () => {
    setEditingRoleId(menuRoleId);
   const role = roles.find(r => r.id === menuRoleId);
    if (role) {
      // No asignamos el rol a selectedRoleForModal para evitar abrir el modal de solo lectura
      // setSelectedRoleForModal(role); // Esta línea se elimina
      // Campos del modal (nombre, descripción)
      setRoleModalData({ name: role.name, description: role.description });
      // Modo edición
      setRoleModalMode('edit');
      setRoleModalOpen(true);
      // Usuarios asignados para editarlos
      setEditAssignedUsers(role.assignedUsers);
      setSelectedUsersToRemoveEdit([]);
    }
    handleCloseMenu();
  };

  // Modal de agregar rol
  const handleAddRole = () => {
    setRoleModalData({ name: '', description: '' });
    setRoleModalMode('add');
    setRoleModalOpen(true);
  };

  // Guardar cambios en el modal (agregar o editar)
  const handleRoleModalSave = () => {
    if (roleModalMode === 'add') {
      const newRole = {
        id: 'role-' + Date.now(),
        name: roleModalData.name,
        description: roleModalData.description,
        assignedUsers: []
      };
      setRoles(prev => [...prev, newRole]);
      showAlert("success", "Rol creado correctamente");
    } else if (roleModalMode === 'edit') {
      setRoles(prev =>
        prev.map(role =>
           role.id === editingRoleId
      ? {
          ...role,
          name: roleModalData.name,
          description: roleModalData.description,
          assignedUsers: editAssignedUsers
        }
      : role
        )
      );
      showAlert("success", "Rol actualizado correctamente");
    }
    setRoleModalOpen(false);
  };

  const handleRoleModalChange = (field, value) => {
    setRoleModalData(prev => ({ ...prev, [field]: value }));
  };

  

  // Botón para eliminar usuarios seleccionados en modo edición
  const handleEliminarUsuariosEdit = () => {
    setEditAssignedUsers(editAssignedUsers.filter(u => !selectedUsersToRemoveEdit.includes(u.id)));
    setSelectedUsersToRemoveEdit([]);
  };

  // Menú (3 puntos) en cada rol
  const handleOpenMenu = (event, roleId) => {
    setAnchorEl(event.currentTarget);
    setMenuRoleId(roleId);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setMenuRoleId(null);
  };

  // Eliminar rol
  const handleDeleteRole = () => {
    const role = roles.find(r => r.id === menuRoleId);
    if (role) {
      setRoleToDelete(role);
      setDeleteRoleModalOpen(true);
    }
    handleCloseMenu();
  };

  const confirmDeleteRole = () => {
    if (roleToDelete) {
      // Devolver usuarios al pool sin asignar
      setUnassignedUsers(prev => [...prev, ...roleToDelete.assignedUsers]);
      // Eliminar el rol
      setRoles(prev => prev.filter(r => r.id !== roleToDelete.id));
      setRoleToDelete(null);
      setDeleteRoleModalOpen(false);
      showAlert("success", "Rol eliminado correctamente");
    }
  };

  const cancelDeleteRole = () => {
    setRoleToDelete(null);
    setDeleteRoleModalOpen(false);
  };

  // Filtrar usuarios sin asignar según la búsqueda
  const filteredUnassigned = unassignedUsers.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  
  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" align="center" gutterBottom sx={{ fontSize: '1.5rem' }}>
          Gestión de Roles del Comite ejecutivo del sindicato
        </Typography>
        <Typography variant="subtitle1" align="center" gutterBottom sx={{ fontSize: '0.9rem' }}>
          Arrastra un usuario a un rol para asignarlo.
        </Typography>

        {/* Botón para agregar un nuevo rol */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <Button variant="contained" onClick={handleAddRole}>
            Agregar Rol
          </Button>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
          {/* Columna de Usuarios sin Asignar */}
          <Paper sx={{ flex: 1, p: 2 }}>
            <Typography variant="h6" align="center" gutterBottom sx={{ fontSize: '1rem' }}>
              Usuarios sin Asignar
            </Typography>

            {/* Barra de búsqueda */}
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                placeholder="Buscar por nombre"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            {/* Contenedor para los usuarios sin asignar */}
            <Box
              sx={{
                minHeight: 300,
                p: 2,
                border: '1px dashed #ccc',
              }}
            >
             {filteredUnassigned.map(user => (
  <DraggableUser key={user.id} user={user} />
))}
            </Box>
          </Paper>

          {/* Columna de Roles */}
          <Paper sx={{ flex: 2, p: 2 }}>
            <Typography variant="h6" align="center" gutterBottom sx={{ fontSize: '1rem' }}>
              Comite ejecutivo del sindicato
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {roles.map(role => (
                <Paper key={role.id} sx={{ p: 2, position: 'relative' }} variant="outlined">
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Tooltip title="Más información" arrow>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          fontSize: '0.95rem',
                          "&:hover": { color: 'green' }
                        }}
                        onClick={() => openRoleModalReadOnly(role.id)}
                      >
                        {role.name}
                      </Typography>
                    </Tooltip>
                    <IconButton size="small" onClick={(e) => handleOpenMenu(e, role.id)}>
                      <MoreVertIcon />
                    </IconButton>
                  </Box>

                  {/* Área droppable */}
                  <DroppableRole role={role}>
                    {role.assignedUsers.map(user => (
                      <Box key={user.id} sx={{ mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ mr: 1, width: 28, height: 28 }}>
                            {getInitials(user.name)}
                          </Avatar>
                          <Typography sx={{ fontSize: '0.9rem' }}>{user.name}</Typography>
                        </Box>
                       
                      </Box>
                    ))}
                  </DroppableRole>
                </Paper>
              ))}
            </Box>
          </Paper>
        </Box>

      

        {/* Modal de detalles del rol (solo lectura) */}
        {selectedRoleForModal && (
          <Dialog
            open={Boolean(selectedRoleForModal)}
            TransitionComponent={Transition}
            onClose={closeRoleModalReadOnly}
            fullWidth
            maxWidth="sm"
          >
            <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
              <IconButton onClick={closeRoleModalReadOnly}>
                <CloseIcon />
              </IconButton>
            </Box>
            <DialogTitle sx={{ fontSize: '1.1rem' }}>{selectedRoleForModal.name}</DialogTitle>
            <DialogContent>
              <DialogContentText sx={{ fontSize: '0.9rem' }}>
                <strong>Rol:</strong> {selectedRoleForModal.name}<br />
                <strong>Responsabilidad general:</strong> {selectedRoleForModal.description}
              </DialogContentText>
            
            </DialogContent>
          </Dialog>
        )}

        {/* Modal para agregar/editar rol */}
        <Dialog
          open={roleModalOpen}
          TransitionComponent={Transition}
          onClose={() => setRoleModalOpen(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle sx={{ fontSize: '1.1rem' }}>
            {roleModalMode === 'add' ? "Agregar Rol" : "Editar Rol"}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ "& > .MuiGrid-item": { pt: "21px" } }}>
              <Grid item xs={12}>
                <TextField
                  label="Nombre del Rol"
                  size="small"
                  fullWidth
                  value={roleModalData.name || ""}
                  onChange={(e) => handleRoleModalChange('name', e.target.value)}
                  inputProps={{ style: { fontSize: '0.875rem' } }}
                  InputLabelProps={{ style: { fontSize: '0.875rem' } }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Responsabilidad"
                  size="small"
                  fullWidth
                  multiline
                  rows={2}
                  value={roleModalData.description || ""}
                  onChange={(e) => handleRoleModalChange('description', e.target.value)}
                  inputProps={{ style: { fontSize: '0.875rem' } }}
                  InputLabelProps={{ style: { fontSize: '0.875rem' } }}
                />
              </Grid>
            </Grid>
 {roleModalMode === 'edit' && (
             <>
               <Typography variant="subtitle1" sx={{ mt: 2, fontSize: '0.95rem' }}>
                 Usuario asignado:
               </Typography>
               {editAssignedUsers.length === 0
                 ? <Typography sx={{ fontSize: '0.9rem' }}>No hay usuarios asignados.</Typography>
                 : editAssignedUsers.map(user => (
                     <Box
                       key={user.id}
                       sx={{
                         display: 'flex',
                         alignItems: 'center',
                         justifyContent: 'space-between',
                        mb: 1,
                        p: 1,
      bgcolor: '#f5f5f5',      // gris claro
      borderRadius: 1
                       }}
                     >
                       <Typography sx={{ fontSize: '0.9rem' }}>
                        {user.name}
                      </Typography>
                       <IconButton
                         size="small"
                         color="error"
                         onClick={() => {
                           setUserToRemove(user);
                           setConfirmRemoveOpen(true);
                         }}
                       >
                         <CloseIcon fontSize="small" />
                      </IconButton>
                     </Box>
                   ))
               }
             </>
           )}
         
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'center', gap: 2 }}>
            <Button variant="contained" color="warning" onClick={() => setRoleModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="contained" onClick={handleRoleModalSave}>
              Guardar
            </Button>
          </DialogActions>
        </Dialog>
{/* Diálogo de confirmación para eliminar al usuario asignado */}
       <Dialog
         open={confirmRemoveOpen}
         onClose={() => setConfirmRemoveOpen(false)}
         maxWidth="xs"
       >
         <DialogTitle>Confirmar eliminación</DialogTitle>
         <DialogContent>
           <DialogContentText>
             ¿Estás seguro de que quieres quitar a <strong>{userToRemove?.name}</strong> de este rol?
           </DialogContentText>
         </DialogContent>
         <DialogActions>
           <Button onClick={() => setConfirmRemoveOpen(false)}>Cancelar</Button>
           <Button color="error" onClick={handleConfirmRemove}>Eliminar</Button>
         </DialogActions>
       </Dialog>
        {/* Modal de confirmación para eliminar rol */}
        <Dialog
          open={deleteRoleModalOpen}
          TransitionComponent={Transition}
          onClose={cancelDeleteRole}
          fullWidth
          maxWidth="xs"
        >
          <DialogTitle sx={{ fontSize: '1.1rem' }}>Confirmar Eliminación</DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ fontSize: '0.9rem' }}>
              ¿Está seguro de que desea eliminar el rol "{roleToDelete?.name}"? Los usuarios asignados volverán a la lista sin asignar.
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'center' }}>
            <Button onClick={cancelDeleteRole}>Cancelar</Button>
            <Button onClick={confirmDeleteRole} color="error">
              Confirmar
            </Button>
          </DialogActions>
        </Dialog>

        {/* Menú de opciones del rol (Editar/Eliminar) */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleCloseMenu}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <MenuItem onClick={handleEditRole}>
            <EditIcon fontSize="small" sx={{ mr: 1 }} /> Editar
          </MenuItem>
          <MenuItem onClick={handleDeleteRole}>
            <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Eliminar
          </MenuItem>
        </Menu>

        {/* Alert para feedback de acciones */}
        <Snackbar
          open={alert.open}
          autoHideDuration={3000}
          onClose={handleAlertClose}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          sx={{ mt: 7 }}
        >
          <Alert onClose={handleAlertClose} severity={alert.severity} sx={{ width: '100%' }}>
            {alert.message}
          </Alert>
        </Snackbar>
      </Box>
    </DndContext>
  );
}
