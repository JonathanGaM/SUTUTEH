import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import axios from "axios";
import LogrosDialog from "../LogrosDialog";

jest.mock("axios");

test("Renderiza correctamente el título 'Mis Logros'", () => {
  axios.get.mockResolvedValueOnce({ data: [] });
  render(<LogrosDialog open={true} onClose={() => {}} />);
  const titulo = screen.getByText(/Mis Logros/i);
  expect(titulo).toBeInTheDocument();
});
