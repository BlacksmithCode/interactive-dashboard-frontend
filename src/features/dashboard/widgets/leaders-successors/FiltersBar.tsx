import { useRef } from "react";
import {
  Autocomplete,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
} from "@mui/material";
import { GradeFilterInput } from "../../components/GradeFilterInput";

// Общие стили для полей фильтров (синий фон, белый текст и рамка)
const commonFilterSx = {
  backgroundColor: '#0088FF',
  borderRadius: 1,
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
  '& .MuiInputLabel-root': {
    color: 'white',
    '&.Mui-focused': {
      color: 'white',
    },
  },
  '& .MuiInputBase-input, & .MuiSelect-select': {
    color: 'white',
  },
  '& .MuiSvgIcon-root, & .MuiAutocomplete-clearIndicator, & .MuiAutocomplete-popupIndicator': {
    color: 'white',
  },
};

interface FiltersBarProps {
  filters: { gradeMin: number | undefined; domain: string | undefined };
  setGradeMin: (value: number | undefined) => void;
  setDomain: (value: string | undefined) => void;
  minGrade: number;
  maxGrade: number;
  availableDomains: string[];
  searchName: string;
  setSearchName: (value: string | ((prev: string) => string)) => void;
  positionFilter: string;
  setPositionFilter: (value: string) => void;
  criticalFilter: boolean | undefined;
  setCriticalFilter: (value: boolean | undefined) => void;
  successorFilter: boolean | undefined;
  setSuccessorFilter: (value: boolean | undefined) => void;
  resetAllFilters: () => void;
  filteredNameOptions: string[];
  filteredPositionOptions: string[];
}

export const FiltersBar = ({
  filters,
  setGradeMin,
  setDomain,
  minGrade,
  maxGrade,
  availableDomains,
  searchName,
  setSearchName,
  positionFilter,
  setPositionFilter,
  criticalFilter,
  setCriticalFilter,
  successorFilter,
  setSuccessorFilter,
  resetAllFilters,
  filteredNameOptions,
  filteredPositionOptions,
}: FiltersBarProps) => {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const positionInputRef = useRef<HTMLInputElement>(null);

  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={2}
      sx={{ 
        mb: 3, 
        flexWrap: "wrap", 
        alignItems: "center",
        backgroundColor: '#1DAFF7', // Задаем фон всей панели фильтров
        p: 2,                       // Внутренние отступы, чтобы элементы не прилипали к краям фона
        borderRadius: 2             // Скругление как у остальных карточек
      }}
      useFlexGap
    >
      {/* Поле поиска по ФИО */}
      <Autocomplete
        freeSolo
        disableClearable={false}
        clearOnBlur={false}
        selectOnFocus
        openOnFocus
        options={filteredNameOptions}
        value={searchName}
        inputValue={searchName}
        onInputChange={(_, newValue) => {
          const cleaned = newValue.replace(/[^а-яА-ЯёЁa-zA-Z \-.]/g, "");
          setSearchName(cleaned);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            const input = (e.target as HTMLElement)
              .closest(".MuiAutocomplete-root")
              ?.querySelector("input");
            if (input) input.blur();
            return;
          }
          const allowed = [
            "Backspace",
            "Delete",
            "ArrowLeft",
            "ArrowRight",
            "ArrowUp",
            "ArrowDown",
            "Tab",
            "Home",
            "End",
            "Escape",
          ];
          if (allowed.includes(e.key)) return;
          if (/^[a-zA-Zа-яА-ЯёЁ \-.]$/.test(e.key)) return;
          e.preventDefault();
        }}
        size="small"
        sx={{ minWidth: 200, ...commonFilterSx }}
        clearIcon={searchName ? undefined : null}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Поиск по ФИО"
            inputRef={searchInputRef}
            onPaste={(e) => {
              e.preventDefault();
              const pasted = e.clipboardData.getData("text");
              const cleaned = pasted.replace(/[^а-яА-ЯёЁa-zA-Z \-.]/g, "");
              setSearchName((prev) => prev + cleaned);
            }}
          />
        )}
      />

      {/* Поле должности */}
      <Autocomplete
        freeSolo
        disableClearable={false}
        clearOnBlur={false}
        selectOnFocus
        openOnFocus
        options={filteredPositionOptions}
        value={positionFilter}
        inputValue={positionFilter}
        onInputChange={(_, newValue) => setPositionFilter(newValue)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            const input = (e.target as HTMLElement)
              .closest(".MuiAutocomplete-root")
              ?.querySelector("input");
            if (input) input.blur();
            return;
          }
        }}
        size="small"
        sx={{ minWidth: 200, ...commonFilterSx }}
        clearIcon={positionFilter ? undefined : null}
        renderInput={(params) => (
          <TextField {...params} label="Должность" inputRef={positionInputRef} />
        )}
      />

      <GradeFilterInput
        label="Грейд"
        value={filters.gradeMin}
        onChange={setGradeMin}
        defaultMinGrade={minGrade}
        minPossibleGrade={minGrade}
        maxPossibleGrade={maxGrade}
        autoSetDefault={false}
      />
      <TextField
        label="Домен"
        select
        size="small"
        value={filters.domain ?? ""}
        onChange={(e) => setDomain(e.target.value || undefined)}
        sx={{ minWidth: 160, ...commonFilterSx }}
      >
        <MenuItem value="">Все домены</MenuItem>
        {availableDomains.map((d) => (
          <MenuItem key={d} value={d}>
            {d}
          </MenuItem>
        ))}
      </TextField>
      <FormControl size="small" sx={{ minWidth: 160, ...commonFilterSx }}>
        <InputLabel>Критичность</InputLabel>
        <Select
          value={criticalFilter === undefined ? "all" : criticalFilter.toString()}
          label="Критичность"
          onChange={(e) => {
            const val = e.target.value;
            setCriticalFilter(val === "all" ? undefined : val === "true");
          }}
        >
          <MenuItem value="all">Все</MenuItem>
          <MenuItem value="true">Критичные</MenuItem>
          <MenuItem value="false">Некритичные</MenuItem>
        </Select>
      </FormControl>
      <FormControl size="small" sx={{ minWidth: 160, ...commonFilterSx }}>
        <InputLabel>Преемник</InputLabel>
        <Select
          value={successorFilter === undefined ? "all" : successorFilter.toString()}
          label="Преемник"
          onChange={(e) => {
            const val = e.target.value;
            setSuccessorFilter(val === "all" ? undefined : val === "true");
          }}
        >
          <MenuItem value="all">Все</MenuItem>
          <MenuItem value="true">Есть преемник</MenuItem>
          <MenuItem value="false">Нет преемника</MenuItem>
        </Select>
      </FormControl>

      <Button
        variant="outlined"
        size="small"
        onClick={resetAllFilters}
        sx={{ 
          minWidth: 140,
          backgroundColor: '#0088FF',
          color: 'white',
          borderColor: 'white',
          '&:hover': {
            backgroundColor: '#0077EE',
            borderColor: 'white',
          }
        }}
      >
        Сбросить
      </Button>
    </Stack>
  );
};