// src/pages/public/StyledButton.jsx
import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";

export const StyledButton = styled(Button)`
  padding: 10px 25px; /* Mantiene el tamaño compacto */
  border-radius: 2px; /* Bordes suaves */
  cursor: pointer;
  background-color: transparent; /* 🔹 Fondo transparente */
  color: white; /* 🔹 Texto en blanco */
  border: 2px solid #29b732; /* 🔹 Borde verde */
  letter-spacing: 1px;
  text-transform: uppercase;
  font-size: 13px;
  transition: all 0.4s ease;
  font-weight: bold;
  font-family: "Poppins", sans-serif;

  &:hover {
    background-color:rgb(43, 169, 51); /* 🔹 Verde claro al pasar el puntero */
    color: white;
    box-shadow: rgb(43, 154, 49) 0px 6px 20px;
    letter-spacing: 1.5px;
  }

  &:active {
    background-color:rgb(44, 165, 52); /* 🔹 Sigue verde claro cuando se presiona */
    color: white;
    box-shadow: rgb(36, 158, 42) 0px 0px 0px 0px;
    transform: translateY(4px);
    transition: 100ms;
  }
`;






 

