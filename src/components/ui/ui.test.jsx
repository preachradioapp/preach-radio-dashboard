import { fireEvent, render, screen } from "@testing-library/react";
import { App } from "antd";
import { describe, expect, it, vi } from "vitest";
import DataTable from "./DataTable";
import StatusBadge from "./StatusBadge";
import UserCell from "./UserCell";
import { EmptyState, ErrorState } from "./States";

const wrap = (ui) => render(<App>{ui}</App>);

describe("States", () => {
  it("ErrorState shows the server message and retries", () => {
    const onRetry = vi.fn();
    wrap(<ErrorState error={{ status: 500, data: { message: "Database unavailable" } }} onRetry={onRetry} />);
    expect(screen.getByText("Database unavailable")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /try again/i }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it("EmptyState renders title, description and action", () => {
    wrap(<EmptyState title="No users" description="Try again later" action={<button>Add</button>} />);
    expect(screen.getByText("No users")).toBeTruthy();
    expect(screen.getByText("Try again later")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Add" })).toBeTruthy();
  });
});

describe("DataTable", () => {
  const columns = [{ title: "Name", dataIndex: "name" }];

  it("renders rows", () => {
    wrap(<DataTable columns={columns} data={[{ _id: "1", name: "Ada" }]} meta={{ total: 1 }} page={1} limit={10} />);
    expect(screen.getByText("Ada")).toBeTruthy();
  });

  it("shows the empty state when there is no data", () => {
    wrap(<DataTable columns={columns} data={[]} meta={{ total: 0 }} empty={{ title: "Nobody here" }} />);
    expect(screen.getByText("Nobody here")).toBeTruthy();
  });

  it("shows an error with retry instead of an empty table", () => {
    const onRetry = vi.fn();
    wrap(<DataTable columns={columns} error={{ status: "FETCH_ERROR" }} onRetry={onRetry} />);
    expect(screen.getByText(/reach the server/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /try again/i }));
    expect(onRetry).toHaveBeenCalled();
  });
});

describe("UserCell / StatusBadge", () => {
  it("falls back to initials without an image", () => {
    wrap(<UserCell name="Grace Hopper" subtitle="grace@example.com" />);
    expect(screen.getByText("GH")).toBeTruthy();
    expect(screen.getByText("grace@example.com")).toBeTruthy();
  });

  it("renders a status label (never colour alone)", () => {
    wrap(<StatusBadge tone="danger">Blocked</StatusBadge>);
    expect(screen.getByText("Blocked")).toBeTruthy();
  });
});
