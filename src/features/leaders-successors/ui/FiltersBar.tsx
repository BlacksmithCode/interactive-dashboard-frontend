import { useRef, useState } from "react";
import {
  Autocomplete,
  TextField,
  Button,
  Stack,
} from "@mui/material";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import ClearIcon from "@mui/icons-material/Clear";
import { useDashboardFilters, GradeFilterInput } from "@/features/dashboard";
import { colors } from "@/shared/theme/tokens";

// Общие стили для полей фильтров (синий фон, белый текст и рамка)
const commonFilterSx = {
  backgroundColor: colors.bluePrimary,
  borderRadius: 1,
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: colors.white,
      borderWidth: '1px',
    },
    '&:hover fieldset': {
      borderColor: colors.white,
      borderWidth: '1px',
    },
    '&.Mui-focused fieldset': {
      borderColor: colors.white,
      borderWidth: '1px',
    },
  },
  '& .MuiInputLabel-root': {
    color: colors.white,
    '&.Mui-focused': {
      color: colors.white,
    },
  },
  '& .MuiInputBase-input, & .MuiSelect-select': {
    color: colors.white,
  },
  '& .MuiSvgIcon-root, & .MuiAutocomplete-clearIndicator, & .MuiAutocomplete-popupIndicator': {
    color: colors.white,
  },
};

interface FiltersBarProps {
  filteredNameOptions: string[];
  filteredPositionOptions: string[];
  filteredDomainOptions: string[];
}

export const FiltersBar = ({
  filteredNameOptions,
  filteredPositionOptions,
  filteredDomainOptions,
}: FiltersBarProps) => {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const positionInputRef = useRef<HTMLInputElement>(null);

  const [domainOpen, setDomainOpen] = useState(false);
  const [criticalOpen, setCriticalOpen] = useState(false);
  const [successorOpen, setSuccessorOpen] = useState(false);

  const {
    filters,
    setGradeMin,
    setDomain,
    minGrade,
    maxGrade,
    searchName,
    setSearchName,
    positionFilter,
    setPositionFilter,
    criticalFilter,
    setCriticalFilter,
    successorFilter,
    setSuccessorFilter,
    resetAllFilters,
  } = useDashboardFilters();

  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={2}
      sx={{ 
        mb: 3, 
        flexWrap: "wrap", 
        alignItems: "center",
        backgroundColor: colors.bluePrimary,
        p: 2,
        borderRadius: 2
      }}
      useFlexGap
    >
      {/* Поле поиска по ФИО */}
      <Autocomplete
        freeSolo
        disableClearable={!searchName}
        clearOnBlur={false}
        selectOnFocus
        openOnFocus
        options={filteredNameOptions}
        noOptionsText="Нет вариантов"
        clearText=""
        closeText=""
        openText=""
        value={searchName || null}
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
        forcePopupIcon={!searchName}
        clearIcon={<ClearIcon fontSize="small" />}
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
        disableClearable={!positionFilter}
        clearOnBlur={false}
        selectOnFocus
        openOnFocus
        options={filteredPositionOptions}
        noOptionsText="Нет вариантов"
        clearText=""
        closeText=""
        openText=""
        value={positionFilter || null}
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
        forcePopupIcon={!positionFilter}
        clearIcon={<ClearIcon fontSize="small" />}
        renderInput={(params) => <TextField {...params} label="Должность" inputRef={positionInputRef} />}
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
      <Autocomplete
        options={filteredDomainOptions}
        value={filters.domain ?? null}
        noOptionsText="Нет вариантов"
        clearText=""
        closeText=""
        openText=""
        open={domainOpen}
        onOpen={() => { if (!filters.domain) setDomainOpen(true); }}
        onClose={() => setDomainOpen(false)}
        onChange={(_, newValue) => setDomain(newValue || undefined)}
        size="small"
        forcePopupIcon={!filters.domain}
        clearIcon={<ClearIcon fontSize="small" />}
        sx={{ minWidth: 160, ...commonFilterSx }}
        renderInput={(params) => <TextField {...params} label="Домен" />}
      />
      <Autocomplete
        options={["true", "false"]}
        value={criticalFilter !== undefined ? criticalFilter.toString() : null}
        noOptionsText="Нет вариантов"
        clearText=""
        closeText=""
        openText=""
        open={criticalOpen}
        onOpen={() => { if (criticalFilter === undefined) setCriticalOpen(true); }}
        onClose={() => setCriticalOpen(false)}
        onChange={(_, newValue) => setCriticalFilter(newValue ? newValue === "true" : undefined)}
        getOptionLabel={(option) => (option === "true" ? "Критичные" : "Некритичные")}
        size="small"
        forcePopupIcon={criticalFilter === undefined}
        clearIcon={<ClearIcon fontSize="small" />}
        sx={{ minWidth: 160, ...commonFilterSx }}
        renderInput={(params) => <TextField {...params} label="Критичность" />}
      />
      <Autocomplete
        options={["true", "false"]}
        value={successorFilter !== undefined ? successorFilter.toString() : null}
        noOptionsText="Нет вариантов"
        clearText=""
        closeText=""
        openText=""
        open={successorOpen}
        onOpen={() => { if (successorFilter === undefined) setSuccessorOpen(true); }}
        onClose={() => setSuccessorOpen(false)}
        onChange={(_, newValue) => setSuccessorFilter(newValue ? newValue === "true" : undefined)}
        getOptionLabel={(option) => (option === "true" ? "Есть преемник" : "Нет преемника")}
        size="small"
        forcePopupIcon={successorFilter === undefined}
        clearIcon={<ClearIcon fontSize="small" />}
        sx={{ minWidth: 160, ...commonFilterSx }}
        renderInput={(params) => <TextField {...params} label="Преемник" />}
      />

      <Button
        variant="text"
        size="small"
        onClick={resetAllFilters}
        startIcon={<RestartAltIcon />}
        sx={{ 
          color: colors.white,
          ml: 'auto !important',
          textTransform: 'none',
          fontWeight: 600,
          px: 2,
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
          }
        }}
      >
        Сбросить
      </Button>
    </Stack>
  );
};