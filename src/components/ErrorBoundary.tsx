import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RotateCcw, AlertTriangle, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary caught error]:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-amber-50 flex items-center justify-center p-4 text-right">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border-2 border-amber-300 text-center">
            <div className="w-16 h-16 rounded-3xl bg-amber-100 border border-amber-300 flex items-center justify-center mx-auto mb-4 text-3xl">
              🌟
            </div>

            <h2 className="text-2xl font-black text-amber-950 mb-2">
              حَصَلَ خَطَأٌ بَسِيطٌ، لَا تَقْلَقْ!
            </h2>

            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              لُومِي يَحْمِي بَيَانَاتِكَ وَتَقَدُّمَكَ دَائِمًا. يُمْكِنُكَ إِعَادَةُ التَّشْغِيلِ الْآنَ لِلْمُتَابَعَةِ فَوْرًا.
            </p>

            <div className="space-y-2">
              <button
                onClick={this.handleReset}
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black rounded-2xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 text-base"
              >
                <RotateCcw className="w-5 h-5" />
                <span>إِعَادَةُ التَّشْغِيلِ السَّرِيعَةِ</span>
              </button>

              <button
                onClick={this.handleGoHome}
                className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                <Home className="w-4 h-4" />
                <span>الْعَوْدَةُ لِلرَّئِيسِيَّةِ</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
