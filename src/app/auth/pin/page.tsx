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
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "linear-gradient(180deg, var(--color-brand-50) 0%, var(--color-gray-25) 48%, #fff 100%)" }}
    >
      <div className="w-full" style={{ maxWidth: 400 }}>
        <div className="text-center" style={{ marginBottom: 24 }}>
          <div
            className="inline-flex items-center justify-center"
            style={{ width: 56, height: 56, borderRadius: 12, background: "#0E4CA1", marginBottom: 16 }}
          >
            <img src="/suburban-toppers-logo.svg" alt="Suburban Toppers" width={48} height={16} />
          </div>
          <h1 className="font-display" style={{ fontSize: 24 }}>Suburban Toppers</h1>
          <p className="text-gray-600" style={{ fontSize: 14, marginTop: 4 }}>Enter your 4-digit PIN to continue</p>
        </div>

        <div
          className="bg-white"
          style={{ borderRadius: 16, padding: 32, boxShadow: "var(--shadow-lg)", border: "1px solid var(--color-gray-150)" }}
        >
          <div className="flex justify-center" style={{ gap: 12, marginBottom: 20 }}>
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
                  width: 48,
                  height: 56,
                  textAlign: "center",
                  fontSize: 24,
                  fontWeight: 600,
                  borderRadius: 10,
                  border: error ? "1.5px solid var(--color-danger)" : digit ? "1.5px solid var(--color-brand-600)" : "1px solid var(--color-gray-200)",
                  background: error ? "var(--color-danger-bg)" : digit ? "var(--color-brand-50)" : "white",
                  outline: "none",
                }}
                aria-label={`PIN digit ${index + 1}`}
              />
            ))}
          </div>
          {error && (
            <div className="text-center" style={{ color: "var(--color-danger-fg)", fontSize: 13, marginBottom: 8 }}>
              Incorrect PIN. Please try again.
            </div>
          )}
          <p className="text-center text-gray-500" style={{ fontSize: 13 }}>
            {isSubmitting ? "Verifying…" : "Enter 4 digits"}
          </p>
        </div>
        <p className="text-center text-gray-500" style={{ marginTop: 20, fontSize: 13 }}>
          Contact your administrator if you&apos;ve forgotten your PIN
        </p>
      </div>
    </div>
  );
}
