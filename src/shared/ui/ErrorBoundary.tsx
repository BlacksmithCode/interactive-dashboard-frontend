import { Component, type ErrorInfo, type ReactNode } from "react";
import { Box, Typography, Button } from "@mui/material";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Предохранитель (Error Boundary) для отлова ошибок рендеринга.
 * Отображает fallback UI вместо упавшего поддерева компонентов.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Box sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h6" gutterBottom color="error">
            Что-то пошло не так
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            {this.state.error?.message ?? "Неизвестная ошибка"}
          </Typography>
          <Button variant="outlined" onClick={this.handleReset}>
            Попробовать снова
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}
