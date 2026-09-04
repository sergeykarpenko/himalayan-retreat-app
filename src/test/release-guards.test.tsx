import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BookContentGate } from "@/components/shared/BookContentGate";
import { PrivacyConsent } from "@/components/shared/PrivacyConsent";
import { renderWithProviders } from "./test-utils";

describe("release safety guards", () => {
  test("book remains locked until the adult content warning is confirmed", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();

    renderWithProviders(
      <BookContentGate
        language="en"
        open
        onCancel={vi.fn()}
        onConfirm={onConfirm}
      />,
    );

    const openBook = screen.getByRole("button", { name: "Open book" });
    expect(openBook).toBeDisabled();
    expect(screen.getByText(/not medical advice/i)).toBeInTheDocument();

    await user.click(
      screen.getByRole("checkbox", {
        name: /I am at least 18 years old/i,
      }),
    );
    await user.click(openBook);

    expect(onConfirm).toHaveBeenCalledOnce();
  });

  test("privacy rejection does not load optional tracking scripts", async () => {
    const user = userEvent.setup();
    renderWithProviders(<PrivacyConsent />);

    expect(document.querySelector("#hdt-google-analytics")).toBeNull();
    expect(document.querySelector("#hdt-clarity")).toBeNull();
    expect(document.querySelector("#hdt-meta-pixel")).toBeNull();

    await user.click(screen.getByRole("button", { name: "Reject" }));

    expect(document.querySelector("#hdt-google-analytics")).toBeNull();
    expect(document.querySelector("#hdt-clarity")).toBeNull();
    expect(document.querySelector("#hdt-meta-pixel")).toBeNull();
  });
});
