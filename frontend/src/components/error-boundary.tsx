import React, { Component, type PropsWithChildren, type ReactNode } from 'react';

type AppErrorBoundaryState = {
  hasError: boolean;
  message?: string;
};

export class AppErrorBoundary extends Component<PropsWithChildren, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = {
    hasError: false
  };

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return {
      hasError: true,
      message: error.message
    };
  }

  componentDidCatch(error: Error) {
    console.error(error);
  }

  private resetBoundary = () => {
    this.setState({ hasError: false, message: undefined });
  };

  render(): ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="min-h-screen bg-canvas px-6 py-16">
        <div className="mx-auto max-w-2xl rounded-[2rem] border border-white/60 bg-card/90 p-10 shadow-soft">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-accent">Recovery mode</p>
          <h1 className="mt-4 font-display text-4xl text-ink">The app hit an unexpected state.</h1>
          <p className="mt-4 text-sm text-[#5d584d]">
            {this.state.message ?? 'A runtime error interrupted the current view.'} You can reset the interface and
            continue where you left off.
          </p>
          <button
            type="button"
            className="mt-8 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-accentDark"
            onClick={this.resetBoundary}
          >
            Reset interface
          </button>
        </div>
      </div>
    );
  }
}
