import { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Copy, RotateCcw, List, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface Props {
  children: ReactNode;
  onFallbackRequested?: () => void;
  onSampleDataRequested?: () => void;
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
      name: error.name,
      graphLibrary: 'react-force-graph',
      browser: navigator.userAgent
    });
  }

  handleCopyDebugInfo = () => {
    const debugInfo = {
      error: this.state.error?.message,
      stack: this.state.error?.stack,
      graphLibrary: 'react-force-graph',
      browser: navigator.userAgent,
      timestamp: new Date().toISOString()
    };
    
    navigator.clipboard.writeText(JSON.stringify(debugInfo, null, 2));
    toast({
      title: 'Debug info copied',
      description: 'Error details copied to clipboard'
    });
  };

  handleTryAgain = () => {
    this.setState({ hasError: false, error: undefined });
  };

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
                <div className="w-full max-w-2xl space-y-2">
                  <details className="bg-muted p-4 rounded-lg">
                    <summary className="cursor-pointer text-sm font-medium mb-2">Error Details</summary>
                    <pre className="text-xs overflow-auto max-h-60 whitespace-pre-wrap">
                      {this.state.error.message}
                      {'\n\n'}
                      {this.state.error.stack}
                    </pre>
                  </details>
                  <div className="text-xs text-muted-foreground">
                    <div>react-force-graph (latest)</div>
                    <div>Browser: {navigator.userAgent.substring(0, 50)}...</div>
                  </div>
                </div>
              )}
              <div className="flex flex-wrap gap-2 justify-center">
                <Button onClick={this.handleTryAgain} variant="outline">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                {this.props.onSampleDataRequested && (
                  <Button onClick={this.props.onSampleDataRequested} variant="outline">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Try Sample Data
                  </Button>
                )}
                {this.props.onFallbackRequested && (
                  <Button onClick={this.props.onFallbackRequested} variant="outline">
                    <List className="h-4 w-4 mr-2" />
                    Switch to List View
                  </Button>
                )}
                <Button onClick={this.handleCopyDebugInfo} variant="outline">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Debug Info
                </Button>
                <Button onClick={() => window.location.reload()}>
                  Reload Page
                </Button>
              </div>
              
              <div className="pt-4 border-t max-w-md">
                <p className="text-xs text-muted-foreground mb-2">
                  💡 Try enabling <Badge variant="outline" className="text-xs mx-1">Safe Mode</Badge> in the graph options (top left) to reduce animation complexity.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
