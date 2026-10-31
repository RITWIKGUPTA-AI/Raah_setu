import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Terminal, ChevronDown, ChevronUp } from 'lucide-react';
import { verifyWebGLSupport } from './map/mapProviders';

export interface MapErrorBoundaryProps {
  children: ReactNode;
  key?: React.Key;
  componentName?: string;
  className?: string;
  onReset?: () => void;
  fallback?: ReactNode;
}

interface MapErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
  timestamp: string | null;
}

/**
 * Robust React Error Boundary specifically designed for GIS Map components.
 * Catches WebGL crashes, tile pipeline exceptions, or DOM reference errors,
 * logs full diagnostic telemetry to the console, and displays an operational recovery UI.
 */
export class MapErrorBoundary extends Component<MapErrorBoundaryProps, MapErrorBoundaryState> {
  public override state: MapErrorBoundaryState = {
    hasError: false,
    error: null,
    errorInfo: null,
    showDetails: false,
    timestamp: null,
  };

  constructor(props: MapErrorBoundaryProps) {
    super(props);
  }

  static getDerivedStateFromError(error: Error): Partial<MapErrorBoundaryState> {
    return {
      hasError: true,
      error,
      timestamp: new Date().toISOString(),
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const componentName = this.props.componentName || 'MapComponent';

    console.group(`[VECTOR GIS ErrorBoundary] Failure detected in <${componentName}>`);
    console.error('Error Message:', error.message);
    console.error('Error Stack:', error.stack);
    console.error('Component Stack:', errorInfo.componentStack);
    console.info('Diagnostic Context:', {
      webgl: verifyWebGLSupport(),
      time: new Date().toISOString(),
    });
    console.groupEnd();

    this.setState({
      errorInfo,
    });
  }

  handleRetry = (): void => {
    if (this.props.onReset) {
      try {
        this.props.onReset();
      } catch (e) {
        console.warn('[MapErrorBoundary] Error during onReset callback:', e);
      }
    }

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
      timestamp: null,
    });
  };

  toggleDetails = (): void => {
    this.setState((prev) => ({ showDetails: !prev.showDetails }));
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const componentName = this.props.componentName || 'Regional Operations Map';
      const webglStatus = verifyWebGLSupport();

      return (
        <div
          id="vector-map-error-boundary-container"
          className={`relative flex flex-col items-center justify-center min-h-[380px] w-full h-full bg-slate-50 border border-slate-200 rounded-lg p-6 text-slate-800 ${
            this.props.className || ''
          }`}
        >
          <div className="max-w-lg w-full bg-white rounded-lg border border-slate-200 shadow-sm p-5 space-y-4">
            {/* Header / Icon */}
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                    GIS Engine Notice
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    {this.state.timestamp ? new Date(this.state.timestamp).toLocaleTimeString() : ''}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 mt-1">
                  {componentName} Interrupted
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  The GIS mapping engine encountered an unexpected rendering error.
                </p>
              </div>
            </div>

            {/* Error Summary Banner */}
            <div className="rounded border border-rose-100 bg-rose-50/50 p-3 text-xs text-rose-900 font-mono break-words">
              {this.state.error?.message || 'Unknown WebGL or map pipeline error.'}
            </div>

            {/* System Status Indicators */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded border border-slate-100 bg-slate-50 p-2">
                <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  Basemap Provider
                </div>
                <div className="font-medium text-slate-800 mt-0.5 flex items-center space-x-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span>Keyless Open GIS</span>
                </div>
              </div>

              <div className="rounded border border-slate-100 bg-slate-50 p-2">
                <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  Hardware Acceleration
                </div>
                <div className="font-medium text-slate-800 mt-0.5 flex items-center space-x-1.5">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      webglStatus.supported ? 'bg-emerald-500' : 'bg-rose-500'
                    }`}
                  />
                  <span>{webglStatus.supported ? webglStatus.version || 'WebGL Active' : 'WebGL Unavailable'}</span>
                </div>
              </div>
            </div>

            {/* Recovery Action Buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={this.toggleDetails}
                className="text-xs text-slate-500 hover:text-slate-800 flex items-center space-x-1 py-1 px-2 rounded hover:bg-slate-100 transition-colors"
              >
                <Terminal className="h-3.5 w-3.5 text-slate-400" />
                <span>Diagnostics</span>
                {this.state.showDetails ? (
                  <ChevronUp className="h-3.5 w-3.5" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5" />
                )}
              </button>

              <button
                type="button"
                id="retry-map-error-boundary-btn"
                onClick={this.handleRetry}
                className="inline-flex items-center space-x-1.5 rounded bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Retry Map Initialization</span>
              </button>
            </div>

            {/* Collapsible Technical Details */}
            {this.state.showDetails && (
              <div className="rounded border border-slate-200 bg-slate-900 p-3 text-[11px] font-mono text-slate-300 space-y-2 overflow-x-auto max-h-40">
                <div className="text-slate-400 text-[10px] uppercase font-bold">
                  Technical Diagnostics Log:
                </div>
                {this.state.error?.stack && (
                  <pre className="text-slate-300 whitespace-pre-wrap leading-tight text-[10px]">
                    {this.state.error.stack.split('\n').slice(0, 5).join('\n')}
                  </pre>
                )}
                {this.state.errorInfo?.componentStack && (
                  <div className="pt-1 border-t border-slate-800 text-[10px] text-slate-400">
                    <div className="font-semibold text-slate-400">Component Stack:</div>
                    <pre className="whitespace-pre-wrap text-[10px]">
                      {this.state.errorInfo.componentStack.split('\n').slice(0, 4).join('\n')}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
