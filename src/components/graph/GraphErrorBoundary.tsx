import { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class GraphErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[GraphErrorBoundary] Caught error:', error);
    console.error('[GraphErrorBoundary] Component stack:', errorInfo.componentStack);
    console.error('[GraphErrorBoundary] Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen flex items-center justify-center p-6">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
              <AlertCircle className="h-16 w-16 text-destructive" />
              <h3 className="text-lg font-semibold text-foreground">Graph Rendering Error</h3>
              <p className="text-sm text-muted-foreground text-center max-w-md">
                Unable to render the graph visualization. Check the console for detailed error information.
              </p>
              {this.state.error && (
                <div className="w-full max-w-2xl">
                  <details className="bg-muted p-4 rounded-lg">
                    <summary className="cursor-pointer text-sm font-medium mb-2">Error Details</summary>
                    <pre className="text-xs overflow-auto max-h-60 whitespace-pre-wrap">
                      {this.state.error.message}
                      {'\n\n'}
                      {this.state.error.stack}
                    </pre>
                  </details>
                </div>
              )}
              <Button onClick={() => window.location.reload()}>
                Reload Page
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
