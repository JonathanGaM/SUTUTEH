import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import RankingDialog from "../RankingDialog";

test("Renderiza correctamente el diálogo de ranking", () => {
  render(<RankingDialog open={true} onClose={() => {}} />);
  const titulo = screen.getByText(/Ranking/i);
  expect(titulo).toBeInTheDocument();
});
