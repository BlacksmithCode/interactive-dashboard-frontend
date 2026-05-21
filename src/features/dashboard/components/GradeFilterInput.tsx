import { useState, useRef, useEffect, memo } from "react";
import { TextField, Tooltip } from "@mui/material";

interface GradeFilterInputProps {
  value: number | undefined;
  onChange: (grade: number | undefined) => void;
  defaultMinGrade?: number;
  minPossibleGrade?: number;
  maxPossibleGrade?: number;
  label?: string;
  autoSetDefault?: boolean;
}

export const GradeFilterInput = memo(function GradeFilterInput({
  value,
  onChange,
  defaultMinGrade,
  minPossibleGrade,
  maxPossibleGrade,
  label,
  autoSetDefault = true,
}: GradeFilterInputProps) {
  const fallbackGrade = minPossibleGrade ?? defaultMinGrade;

  const [input, setInput] = useState<string>(
    value !== undefined 
      ? value.toString() 
      : (autoSetDefault && fallbackGrade !== undefined ? fallbackGrade.toString() : "")
  );
  const [error, setError] = useState("");
  const lastEmittedValue = useRef(value);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const hadFocus = useRef(false);

  useEffect(() => {
    if (autoSetDefault && value === undefined && fallbackGrade !== undefined) {
      setInput(fallbackGrade.toString());
      onChange(fallbackGrade);
      lastEmittedValue.current = fallbackGrade;
    }
  }, [autoSetDefault, fallbackGrade, value, onChange]);

  useEffect(() => {
    if (value !== lastEmittedValue.current) {
      const newVal = value !== undefined ? value.toString() : "";
      setInput(newVal);
      setError("");
      lastEmittedValue.current = value;
    }
  }, [value]);

  useEffect(() => {
    if (hadFocus.current && inputRef.current) {
      const timer = setTimeout(() => inputRef.current?.focus(), 0);
      return () => clearTimeout(timer);
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    if (raw === "") {
      setInput("");
      setError("");
      if (autoSetDefault && fallbackGrade !== undefined) {
        setInput(fallbackGrade.toString());
        if (lastEmittedValue.current !== fallbackGrade) {
          onChange(fallbackGrade);
          lastEmittedValue.current = fallbackGrade;
        }
      } else {
        if (lastEmittedValue.current !== undefined) {
          onChange(undefined);
          lastEmittedValue.current = undefined;
        }
      }
      return;
    }

    const cleaned = raw.replace(/^0+/, "") || "";
    if (cleaned === "") {
      setInput(raw);
      if (minPossibleGrade !== undefined) {
        setError(`Минимальный грейд: ${minPossibleGrade}`);
      } else {
        setError("Введите целое положительное число");
      }
      return;
    }

    const num = Number(cleaned);
    if (minPossibleGrade !== undefined && num < minPossibleGrade) {
      setInput(cleaned);
      setError(`Минимальный грейд: ${minPossibleGrade}`);
      return;
    }
    if (maxPossibleGrade !== undefined && num > maxPossibleGrade) {
      setInput(cleaned);
      setError(`Максимальный грейд: ${maxPossibleGrade}`);
      return;
    }

    setError("");
    setInput(cleaned);
    onChange(num);
    lastEmittedValue.current = num;
  };

  const handleBlur = () => {
    hadFocus.current = false;

    // Коррекция выхода за границы при потере фокуса
    if (input === "") {
      if (autoSetDefault && fallbackGrade !== undefined) {
        setInput(fallbackGrade.toString());
        setError("");
        if (lastEmittedValue.current !== fallbackGrade) {
          onChange(fallbackGrade);
          lastEmittedValue.current = fallbackGrade;
        }
      } else {
        // Оставляем пустым, onChange не вызываем, если значение уже undefined
        if (lastEmittedValue.current !== undefined) {
          onChange(undefined);
          lastEmittedValue.current = undefined;
        }
      }
      return;
    }

    const raw = input.replace(/\D/g, "");
    if (raw === "") return;

    const num = Number(raw);
    if (minPossibleGrade !== undefined && num < minPossibleGrade) {
      setInput(String(minPossibleGrade));
      setError("");
      onChange(minPossibleGrade);
      lastEmittedValue.current = minPossibleGrade;
    } else if (maxPossibleGrade !== undefined && num > maxPossibleGrade) {
      setInput(String(maxPossibleGrade));
      setError("");
      onChange(maxPossibleGrade);
      lastEmittedValue.current = maxPossibleGrade;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const allowedKeys = [
      "Backspace", "Delete", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown",
      "Tab", "Home", "End",
    ];
    if (e.key === "Enter") {
      e.preventDefault();
      inputRef.current?.blur();
      return;
    }
    if (e.ctrlKey || e.metaKey) return;
    if (/^\d$/.test(e.key)) return;
    if (!allowedKeys.includes(e.key)) {
      e.preventDefault();
    }
  };

  return (
    <Tooltip title={error || ""} arrow open={!!error} placement="top">
      <TextField
        label={label ?? "Грейд"}
        type="number"
        value={input}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        error={!!error}
        placeholder={fallbackGrade?.toString() ?? "без фильтра"}
        size="small"
        sx={{ width: 100 }}
        inputRef={inputRef}
        onFocus={() => { hadFocus.current = true; }}
        slotProps={{
          htmlInput: {
            inputMode: "numeric",
            pattern: "[0-9]*",
            min: minPossibleGrade ?? 0,
            max: maxPossibleGrade ?? undefined,
            onPaste: (e: React.ClipboardEvent<HTMLInputElement>) => {
              e.preventDefault();
              const pasted = e.clipboardData.getData('text');
              const cleaned = pasted.replace(/\D/g, '');
              if (cleaned) {
                const num = Number(cleaned);
                let finalValue = cleaned;
                if (minPossibleGrade !== undefined && num < minPossibleGrade) {
                  finalValue = String(minPossibleGrade);
                } else if (maxPossibleGrade !== undefined && num > maxPossibleGrade) {
                  finalValue = String(maxPossibleGrade);
                }
                setInput(finalValue);
                onChange(Number(finalValue));
                lastEmittedValue.current = Number(finalValue);
              } else {
                if (fallbackGrade !== undefined) {
                  setInput(fallbackGrade.toString());
                  onChange(fallbackGrade);
                  lastEmittedValue.current = fallbackGrade;
                } else {
                  setInput('');
                  onChange(undefined);
                  lastEmittedValue.current = undefined;
                }
              }
            }
          },
        }}
      />
    </Tooltip>
  );
});