import { useState, useMemo } from "react";
import { Grid, TextField, MenuItem } from "@mui/material";
import { useDashboardFilters } from "../hooks/useDashboardFilters";
import { useDomainGistQuery } from "../hooks/useDomainGistQuery";

export function FiltersBar() {
  const { filters, setGradeMin, setDomain } = useDashboardFilters();

  const { data: domainGist = [] } = useDomainGistQuery({});
  const availableDomains = useMemo(
    () => [...new Set(domainGist.map((d) => d.domain))].sort(),
    [domainGist]
  );

  const [gradeMinInput, setGradeMinInput] = useState<string>(
    filters.gradeMin?.toString() ?? ""
  );
  const [domainInput, setDomainInput] = useState(filters.domain ?? "");

  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      <Grid size={{ xs: 12, sm: 4 }}>
        <TextField
          label="Минимальный грейд"
          type="number"
          value={gradeMinInput}
          onChange={(e) => {
            const raw = e.target.value;
            setGradeMinInput(raw);
            setGradeMin(raw === "" ? undefined : parseInt(raw));
          }}
          fullWidth
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