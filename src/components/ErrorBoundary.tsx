"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
    componentName?: string;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error(`Error in ${this.props.componentName || 'component'}:`, error, errorInfo);
        this.props.onError?.(error, errorInfo);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="pm-card p-8 text-center border-red-500/30">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
                            <AlertTriangle className="w-8 h-8 text-red-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white mb-2">
                                Something went wrong
                            </h3>
                            <p className="text-sm text-pm-muted mb-4 max-w-md">
                                {this.props.componentName
                                    ? `The ${this.props.componentName} encountered an error.`
                                    : "An unexpected error occurred."
                                }
                            </p>
                            {this.state.error && (
                                <p className="text-xs text-red-400/70 font-mono mb-4 max-w-md truncate">
                                    {this.state.error.message}
                                </p>
                            )}
                        </div>
                        <button
                            onClick={this.handleRetry}
                            className="flex items-center gap-2 px-4 py-2 bg-pm-green/10 hover:bg-pm-green/20 text-pm-green border border-pm-green/30 rounded-lg transition-colors"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Try Again
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

// Specialized error boundary for watchlist components
export function WatchlistErrorBoundary({ children }: { children: ReactNode }) {
    return (
        <ErrorBoundary
            componentName="Watchlist Table"
            fallback={
                <div className="pm-card p-8 text-center border-orange-500/30">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center">
                            <AlertTriangle className="w-8 h-8 text-orange-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white mb-2">
                                Watchlist Data Unavailable
                            </h3>
                            <p className="text-sm text-pm-muted mb-4 max-w-md">
                                We&apos;re having trouble loading your watchlist data.
                                This might be due to a temporary issue with our price feeds.
                            </p>
                        </div>
                        <button
                            onClick={() => window.location.reload()}
                            className="flex items-center gap-2 px-4 py-2 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-lg transition-colors"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Refresh Page
                        </button>
                    </div>
                </div>
            }
        >
            {children}
        </ErrorBoundary>
    );
}

export default ErrorBoundary;
