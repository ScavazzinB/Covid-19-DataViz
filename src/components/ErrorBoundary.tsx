import React, { Component, ErrorInfo, ReactNode } from 'react';
import './ErrorBoundary.css';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    this.setState({
      error,
      errorInfo
    });

    // Log error to analytics service
    if (process.env.NODE_ENV === 'production') {
      // logErrorToService(error, errorInfo);
    }
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  handleReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="error-boundary">
          <div className="error-boundary-container">
            <div className="error-icon">⚠️</div>
            <h1 className="error-title">Oups ! Quelque chose s'est mal passé</h1>
            <p className="error-message">
              Une erreur inattendue s'est produite dans l'application.
              Ne vous inquiétez pas, vos données sont en sécurité.
            </p>

            {this.state.error && (
              <div className="error-details-container">
                <details className="error-details">
                  <summary>Détails techniques (pour les développeurs)</summary>
                  <div className="error-stack">
                    <p className="error-name">
                      <strong>Erreur:</strong> {this.state.error.toString()}
                    </p>
                    {this.state.errorInfo && (
                      <pre className="error-component-stack">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    )}
                  </div>
                </details>
              </div>
            )}

            <div className="error-actions">
              <button
                onClick={this.handleReset}
                className="error-button primary"
              >
                🔄 Réessayer
              </button>
              <button
                onClick={this.handleReload}
                className="error-button secondary"
              >
                ↻ Recharger la page
              </button>
              <button
                onClick={() => window.history.back()}
                className="error-button secondary"
              >
                ← Retour
              </button>
            </div>

            <div className="error-help">
              <p>
                <strong>Besoin d'aide ?</strong>
              </p>
              <p>
                Si le problème persiste, essayez de vider le cache de votre
                navigateur ou contactez le support technique.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
