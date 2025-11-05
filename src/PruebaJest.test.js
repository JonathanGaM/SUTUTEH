import React from "react";
import { render, screen } from "@testing-library/react";

function HolaMundo() {
  return <h1>Bienvenido a la prueba</h1>;
}

test("Renderiza correctamente el texto de prueba", () => {
  render(<HolaMundo />);
  expect(screen.getByText(/Bienvenido a la prueba/i)).toBeInTheDocument();
});
