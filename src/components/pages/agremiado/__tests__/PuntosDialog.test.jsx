import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import axios from "axios";
import PuntosDialog from "../PuntosDialog";

jest.mock("axios");

test("Renderiza correctamente el título 'Total de Puntos'", () => {
  axios.get.mockResolvedValueOnce({ data: { puntos: 0 } });
  render(<PuntosDialog open={true} onClose={() => {}} />);
  const titulo = screen.getByText(/Total de Puntos/i);
  expect(titulo).toBeInTheDocument();
});
