import { Component, type ReactNode } from 'react';

export function AppLoading() {
  return (
    <p className="app-status" role="status">
      Loading
    </p>
  );
}

export class AppErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  override state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: unknown): { error: Error } {
    return { error: error instanceof Error ? error : new Error(String(error)) };
  }

  override render() {
    const { error } = this.state;
    if (error === null) return this.props.children;
    return (
      <p className="app-status app-status-error" role="alert">
        {error.message}
      </p>
    );
  }
}
