import { useState, useMemo } from "react";
import { Grid, TextField, MenuItem } from "@mui/material";
import { useDashboardFilters } from "../hooks/useDashboardFilters";
import { useDomainGistQuery } from "../hooks/useDomainGistQuery";
import { GradeFilterInput } from "./GradeFilterInput";

interface FiltersBarProps {
  minPossibleGrade?: number;
  maxPossibleGrade?: number;
}

export function FiltersBar({ minPossibleGrade, maxPossibleGrade }: FiltersBarProps) {
  const { filters, setGradeMin, setDomain } = useDashboardFilters();

  const { data: domainGist = [] } = useDomainGistQuery({});
  const availableDomains = useMemo(
    () => [...new Set(domainGist.map((d) => d.domain))].sort(),
    [domainGist]
  );

  const [domainInput, setDomainInput] = useState(filters.domain ?? "");

  return (
    <Grid container spacing={2} sx={{ mb: 3 , alignItems: "center"}}>
      <Grid size={{ xs: 12, sm: 4 }}>
        <GradeFilterInput
          label="Грейд"
          value={filters.gradeMin}
          onChange={setGradeMin}
          defaultMinGrade={minPossibleGrade}
          minPossibleGrade={minPossibleGrade}
          maxPossibleGrade={maxPossibleGrade}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <TextField
          label="Домен"
          select
          value={domainInput}
          onChange={(e) => {
            const raw = e.target.value;
            setDomainInput(raw);
            setDomain(raw || undefined);
          }}
          fullWidth
          size="small"
        >
          <MenuItem value="">Все домены</MenuItem>
          {availableDomains.map((d) => (
            <MenuItem key={d} value={d}>{d}</MenuItem>
          ))}
        </TextField>
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }} />
    </Grid>
  );
}