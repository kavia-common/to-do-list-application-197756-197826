import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders Tasks header", () => {
  render(<App />);
  const header = screen.getByText(/tasks/i);
  expect(header).toBeInTheDocument();
});
