import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Error Boundary Caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center text-center p-6">
          <h1 className="text-2xl font-bold mb-3 text-red-600">
            Something went wrong
          </h1>
          <p className="text-slate-600 max-w-md">
            An unexpected error occurred. Please refresh the page or contact support.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}
