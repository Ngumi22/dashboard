import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import Homeee from "../components/Homee";

it("renders the sum of 2 and 3", () => {
  render(<Homeee />);
  const resultElement = screen.getByText("5"); // Assuming the result is rendered as '5'
  expect(resultElement).toBeInTheDocument();
});
