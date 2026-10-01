"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";

export default function PinEntryPage() {
  const [pin, setPin] = useState(["", "", "", ""]);
  const [error, setError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];
  const router = useRouter();

  useEffect(() => {
    inputRefs[0].current?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return;
    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    setError(false);
    if (value && index < 3) inputRefs[index + 1].current?.focus();
    if (newPin.every((digit) => digit !== "") && index === 3) submitPin(newPin.join(""));
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) inputRefs[index - 1].current?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (/^\d{4}$/.test(pastedData)) {
      setPin(pastedData.split(""));
      setError(false);
      inputRefs[3].current?.focus();
      setTimeout(() => submitPin(pastedData), 100);
    }
  };

  const submitPin = async (pinValue: string) => {
    setIsSubmitting(true);
    setError(false);
    try {
      const response = await fetch("/api/auth/verify-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: pinValue }),
      });
      if (response.ok) {
        router.push("/dashboard");
        router.refresh();
      } else {
        setError(true);
        setPin(["", "", "", ""]);
        inputRefs[0].current?.focus();
      }
    } catch {
      setError(true);
      setPin(["", "", "", ""]);
      inputRefs[0].current?.focus();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "#F6F7FB" }}>
      <div className="w-full" style={{ maxWidth: 400 }}>
        <div
          className="overflow-hidden bg-white"
          style={{ borderRadius: 12, boxShadow: "var(--shadow-lg)", border: "1px solid var(--color-gray-150)" }}
        >
          <div style={{ background: "#0E4CA1", padding: "28px 24px 22px", color: "white", textAlign: "center" }}>
            <div
              className="inline-flex items-center justify-center font-display"
              style={{
                width: 48,
                height: 48,
                borderRadius: 10,
                background: "#FFD504",
                color: "#0E4CA1",
                fontSize: 16,
                fontWeight: 800,
                marginBottom: 12,
              }}
            >
              ST
            </div>
            <h1 className="font-display" style={{ fontSize: 22 }}>
              Suburban Toppers
            </h1>
            <p style={{ fontSize: 13, opacity: 0.85, marginTop: 4 }}>CRM workspace · enter PIN</p>
          </div>

          <div style={{ padding: 28 }}>
            <div className="flex justify-center" style={{ gap: 10, marginBottom: 18 }}>
              {pin.map((digit, index) => (
                <input
                  key={index}
                  ref={inputRefs[index]}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  disabled={isSubmitting}
                  className={error ? "shake" : ""}
                  style={{
                    width: 52,
                    height: 56,
                    textAlign: "center",
                    fontSize: 24,
                    fontWeight: 700,
                    borderRadius: 8,
                    border: error ? "2px solid #e2445c" : digit ? "2px solid #00c875" : "1px solid var(--color-gray-200)",
                    background: error ? "#FDE8EC" : digit ? "#E3FDEC" : "white",
                    outline: "none",
                  }}
                  aria-label={`PIN digit ${index + 1}`}
                />
              ))}
            </div>
            {error && (
              <div className="text-center" style={{ color: "#C0213A", fontSize: 13, marginBottom: 8, fontWeight: 600 }}>
                Incorrect PIN. Please try again.
              </div>
            )}
            <p className="text-center text-gray-500" style={{ fontSize: 13 }}>
              {isSubmitting ? "Opening workspace…" : "4-digit shop PIN"}
            </p>
          </div>
        </div>
        <p className="text-center text-gray-500" style={{ marginTop: 20, fontSize: 13 }}>
          Contact your administrator if you&apos;ve forgotten your PIN
        </p>
      </div>
    </div>
  );
}
