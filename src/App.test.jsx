jest.mock("react-router-dom");
jest.mock("axios");
jest.mock("./components/layout/Layout", () => () => <div>Bienvenido</div>);

import { render, screen } from "@testing-library/react";
import App from "./App";

test("Renderiza correctamente el texto Bienvenido", () => {
  render(<App />);
  expect(screen.getByText(/Bienvenido/i)).toBeInTheDocument();
});
