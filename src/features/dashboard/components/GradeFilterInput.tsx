import { useState, useRef, useEffect, memo } from "react";
import { TextField } from "@mui/material";

interface GradeFilterInputProps {
  value: number | undefined;
  onChange: (grade: number | undefined) => void;
  defaultMinGrade?: number;
  minPossibleGrade?: number;
  maxPossibleGrade?: number;
}

export const GradeFilterInput = memo(function GradeFilterInput({
  value,
  onChange,
  defaultMinGrade,
  minPossibleGrade,
  maxPossibleGrade,
}: GradeFilterInputProps) {
  const fallbackGrade = minPossibleGrade ?? defaultMinGrade;

  const [input, setInput] = useState<string>(
    value !== undefined ? value.toString() : (fallbackGrade?.toString() ?? "")
  );
  const [error, setError] = useState("");
  const lastEmittedValue = useRef(value);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const hadFocus = useRef(false);

  // При первом рендере: если фильтр не задан, а минимальный грейд известен – применяем его
  useEffect(() => {
    if (value === undefined && fallbackGrade !== undefined) {
      setInput(fallbackGrade.toString());
      onChange(fallbackGrade);
      lastEmittedValue.current = fallbackGrade;
    }
  }, [fallbackGrade, value, onChange]);

  // Синхронизация поля с внешним фильтром
  useEffect(() => {
    if (value !== lastEmittedValue.current) {
      const newVal = value !== undefined ? value.toString() : (fallbackGrade?.toString() ?? "");
      setInput(newVal);
      setError("");
      lastEmittedValue.current = value;
    }
  }, [value, fallbackGrade]);

  // Восстановление фокуса после перерисовок
  useEffect(() => {
    if (hadFocus.current && inputRef.current) {
      const timer = setTimeout(() => inputRef.current?.focus(), 0);
      return () => clearTimeout(timer);
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");

    // Если стёрли всё — поле визуально пустое, но фильтр = минимальный грейд
    if (raw === "") {
      setInput("");
      setError("");
      if (fallbackGrade !== undefined) {
        onChange(fallbackGrade);
        lastEmittedValue.current = fallbackGrade;
      } else {
        onChange(undefined);
        lastEmittedValue.current = undefined;
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
    // При потере фокуса, если поле пустое — заполняем минимальным грейдом
    if (input === "" && fallbackGrade !== undefined) {
      setInput(fallbackGrade.toString());
      setError("");
      if (lastEmittedValue.current !== fallbackGrade) {
        onChange(fallbackGrade);
        lastEmittedValue.current = fallbackGrade;
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const allowedKeys = [
      "Backspace", "Delete", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown",
      "Tab", "Home", "End",
    ];
    if (e.ctrlKey || e.metaKey) return;
    if (/^\d$/.test(e.key)) return;
    if (!allowedKeys.includes(e.key)) {
      e.preventDefault();
    }
  };

  return (
    <TextField
      type="number"
      value={input}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      error={!!error}
      helperText={error || ""}
      placeholder={fallbackGrade?.toString() ?? "без фильтра"}
      size="small"
      sx={{ width: 100, mb: 1 }}
      inputRef={inputRef}
      onFocus={() => { hadFocus.current = true; }}
      slotProps={{
        htmlInput: {
          inputMode: "numeric",
          pattern: "[0-9]*",
          min: minPossibleGrade ?? 0,
          max: maxPossibleGrade ?? undefined,
        },
      }}
    />
  );
});