import { useState, useRef, useEffect, memo } from "react";
import {
  TextField,
  IconButton,
  Tooltip,
  InputAdornment,
  Box,
} from "@mui/material";
import { KeyboardArrowUp, KeyboardArrowDown } from "@mui/icons-material";
import type { SxProps, Theme } from "@mui/material";

interface GradeFilterInputProps {
  value: number | undefined;
  onChange: (grade: number | undefined) => void;
  defaultMinGrade?: number;
  minPossibleGrade?: number;
  maxPossibleGrade?: number;
  label?: string;
  autoSetDefault?: boolean;
  sx?: SxProps<Theme>;
}

export const GradeFilterInput = memo(function GradeFilterInput({
  value,
  onChange,
  defaultMinGrade,
  minPossibleGrade,
  maxPossibleGrade,
  label = "Грейд",
  autoSetDefault = true,
  sx,
}: GradeFilterInputProps) {
  const fallbackGrade = minPossibleGrade ?? defaultMinGrade;

  const [input, setInput] = useState<string>(
    value !== undefined
      ? value.toString()
      : autoSetDefault && fallbackGrade !== undefined
      ? fallbackGrade.toString()
      : ""
  );
  const [error, setError] = useState("");
  const lastEmittedValue = useRef(value);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const hadFocus = useRef(false);

  const applyValue = (num: number | undefined) => {
    if (num === undefined) {
      setInput("");
      onChange(undefined);
      lastEmittedValue.current = undefined;
      return;
    }
    let clamped = num;
    if (minPossibleGrade !== undefined && clamped < minPossibleGrade) clamped = minPossibleGrade;
    if (maxPossibleGrade !== undefined && clamped > maxPossibleGrade) clamped = maxPossibleGrade;
    const str = clamped.toString();
    setInput(str);
    onChange(clamped);
    lastEmittedValue.current = clamped;
    setError("");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    if (raw === "") {
      setInput("");
      setError("");
      if (autoSetDefault && fallbackGrade !== undefined) {
        applyValue(fallbackGrade);
      } else {
        applyValue(undefined);
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
    if (input === "") {
      if (autoSetDefault && fallbackGrade !== undefined) {
        applyValue(fallbackGrade);
      } else {
        applyValue(undefined);
      }
      return;
    }
    const num = Number(input);
    if (isNaN(num)) {
      applyValue(undefined);
      return;
    }
    let clamped = num;
    if (minPossibleGrade !== undefined && clamped < minPossibleGrade) clamped = minPossibleGrade;
    if (maxPossibleGrade !== undefined && clamped > maxPossibleGrade) clamped = maxPossibleGrade;
    if (clamped !== num) {
      setError(clamped < num ? `Максимальный грейд: ${maxPossibleGrade}` : `Минимальный грейд: ${minPossibleGrade}`);
    } else {
      setError("");
    }
    applyValue(clamped);
  };

  const increment = () => {
    const current = input !== "" ? Number(input) : (fallbackGrade ?? 0);
    applyValue(current + 1);
  };

  const decrement = () => {
    const current = input !== "" ? Number(input) : (fallbackGrade ?? 0);
    applyValue(current - 1);
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
    if (e.key === "ArrowUp") {
      e.preventDefault();
      increment();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      decrement();
      return;
    }
    if (e.ctrlKey || e.metaKey) return;
    if (/^\d$/.test(e.key)) return;
    if (!allowedKeys.includes(e.key)) {
      e.preventDefault();
    }
  };

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

return (
    <Tooltip title={error || ""} arrow open={!!error} placement="top">
      <TextField
        label={label}
        type="number"
        value={input}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        onFocus={() => { hadFocus.current = true; }}
        inputRef={inputRef}
        error={!!error}
        placeholder={fallbackGrade?.toString() ?? "без фильтра"}
        size="small"
        variant="outlined"
        sx={{
          backgroundColor: '#0088FF',
          borderRadius: 1,
          // Рамка поля
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: 'white',
              borderWidth: '1px',
            },
            '&:hover fieldset': {
              borderColor: 'white',
              borderWidth: '1px',
            },
            '&.Mui-focused fieldset': {
              borderColor: 'white',
              borderWidth: '1px',
            },
          },
          // Лейбл всегда белый
          '& .MuiInputLabel-root': {
            color: 'white',
            '&.Mui-focused': {
              color: 'white',
            },
          },
          // Текст внутри поля
          '& .MuiInputBase-input': {
            color: 'white',
          },
          // Убираем стандартные стрелки для number
          '& input[type="number"]': {
            MozAppearance: 'textfield',
            '&::-webkit-inner-spin-button, &::-webkit-outer-spin-button': {
              display: 'none',
            },
          },
          ...sx,
        }}
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <Box sx={{ display: "flex", flexDirection: "column", ml: 0.5 }}>
                  <IconButton size="small" onClick={increment} sx={{ p: 0.25, height: 20, width: 20, color: 'white' }}>
                    <KeyboardArrowUp fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={decrement} sx={{ p: 0.25, height: 20, width: 20, color: 'white' }}>
                    <KeyboardArrowDown fontSize="small" />
                  </IconButton>
                </Box>
              </InputAdornment>
            ),
          },
          htmlInput: {
            inputMode: "numeric",
            pattern: "[0-9]*",
            min: minPossibleGrade ?? 0,
            max: maxPossibleGrade ?? undefined,
            onPaste: (e: React.ClipboardEvent<HTMLInputElement>) => {
              e.preventDefault();
              const pasted = e.clipboardData.getData("text");
              const cleaned = pasted.replace(/\D/g, "");
              if (cleaned) {
                const num = Number(cleaned);
                let finalValue = cleaned;
                if (minPossibleGrade !== undefined && num < minPossibleGrade) {
                  finalValue = String(minPossibleGrade);
                } else if (maxPossibleGrade !== undefined && num > maxPossibleGrade) {
                  finalValue = String(maxPossibleGrade);
                }
                applyValue(Number(finalValue));
              } else {
                if (fallbackGrade !== undefined) {
                  applyValue(fallbackGrade);
                } else {
                  applyValue(undefined);
                }
              }
            },
          },
        }}
      />
    </Tooltip>
  );
});
