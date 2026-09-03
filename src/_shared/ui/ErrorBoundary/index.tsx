import { Component, ErrorInfo, ReactNode } from "react";

type TProps = {
  fallback: ReactNode;
  children: ReactNode;
};

type TState = {
  hasError: boolean;
};

// Replaces react-error-boundary. React still has no hook for this, so a class
// with getDerivedStateFromError is the only way to catch a render throw.
export class ErrorBoundary extends Component<TProps, TState> {
  state: TState = { hasError: false };

  static getDerivedStateFromError(): TState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error, info.componentStack);
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}
