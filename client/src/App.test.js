import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders the landing page hero content", () => {
  render(<App />);
  expect(
    screen.getByRole("heading", { name: /meet\. talk\. done\./i })
  ).toBeInTheDocument();
});
