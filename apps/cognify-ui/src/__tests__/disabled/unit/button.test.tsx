import { Button } from "@/components/button";
import { fireEvent, render, screen } from "@testing-library/react";

describe("Button Component", () => {
  it("renders with text", () => {
    render(<Button>Click me</Button>);
    expect(
      screen.getByRole("button", { name: "Click me" }),
    ).toBeInTheDocument();
  });

  it("handles click events", () => {
    const handleClick = global.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByRole("button"));
    expect(handleClick.toHaveBeenCalledTimes(1)).toBe(true);
  });

  it("applies default styles correctly", () => {
    render(<Button>Default Button</Button>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("bg-gray-950");
    expect(button).toHaveClass("rounded-full");
  });

  it("applies custom className when provided", () => {
    render(<Button className="custom-class">Custom Button</Button>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("custom-class");
    expect(button).toHaveClass("bg-gray-950"); // Should still have default classes
  });

  it("is disabled when disabled prop is true", () => {
    render(<Button disabled>Disabled Button</Button>);
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });

  it("does not call onClick when disabled", () => {
    const handleClick = global.fn();
    render(
      <Button disabled onClick={handleClick}>
        Disabled Button
      </Button>,
    );

    fireEvent.click(screen.getByRole("button"));
    expect(handleClick.not.toHaveBeenCalled()).toBe(true);
  });
});
