import { Component } from "react";

export default class ErrorBoundary extends Component {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error, info) { console.error("UI error:", error, info); }
  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="mx-auto max-w-md py-24 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Something went wrong</h1>
        <p className="mt-2 text-slate-600">Please reload the page and try again.</p>
        <button onClick={() => window.location.assign("/")} className="mt-6 rounded-lg bg-blue-700 px-5 py-2.5 font-semibold text-white hover:bg-blue-800">
          Go to Home
        </button>
      </div>
    );
  }
}
