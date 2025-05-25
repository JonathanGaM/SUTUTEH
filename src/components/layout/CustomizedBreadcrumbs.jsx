import React from "react";
import { useLocation, Link as RouterLink } from "react-router-dom";
import { emphasize, styled as muiStyled } from "@mui/material/styles";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Chip from "@mui/material/Chip";
import HomeIcon from "@mui/icons-material/Home";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

// Se utiliza el mismo estilo para los chips (migajas)
const StyledBreadcrumb = muiStyled(Chip)(({ theme }) => ({
  backgroundColor: theme.palette.grey[100],
  height: theme.spacing(3),
  color: theme.palette.text.primary,
  fontWeight: theme.typography.fontWeightRegular,
  "&:hover, &:focus": {
    backgroundColor: emphasize(theme.palette.grey[100], 0.06),
  },
  "&:active": {
    boxShadow: theme.shadows[1],
    backgroundColor: emphasize(theme.palette.grey[100], 0.12),
  },
}));

export default function CustomizedBreadcrumbs() {
  const location = useLocation();
  // Separa la ruta en segmentos (omitiendo cadenas vacías)
  const pathnames = location.pathname.split("/").filter((x) => x);

  return (
    <div role="presentation">
      <Breadcrumbs aria-label="breadcrumb">
        {/* Primer elemento: Home */}
        <StyledBreadcrumb
          component={RouterLink}
          to="/"
          label="Home"
          icon={<HomeIcon fontSize="small" />}
        />
        {/* Genera dinámicamente las migajas según la ruta */}
        {pathnames.map((value, index) => {
          // Construye la ruta acumulada para cada segmento
          const to = `/${pathnames.slice(0, index + 1).join("/")}`;
          const isLast = index === pathnames.length - 1;
          return isLast ? (
            <StyledBreadcrumb key={to} label={value} />
          ) : (
            <StyledBreadcrumb
              key={to}
              component={RouterLink}
              to={to}
              label={value}
              deleteIcon={<ExpandMoreIcon />}
              onDelete={() => {}}
            />
          );
        })}
      </Breadcrumbs>
    </div>
  );
}
