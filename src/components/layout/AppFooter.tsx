export const AppFooter = () => {
  return (
    <footer className="border-t border-border bg-card/50 backdrop-blur-sm">
      <div className="container py-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between text-sm text-muted-foreground">
            <div className="text-xs">
              <div className="font-medium">D&D Chronicle</div>
              <div className="font-medium">Version 1.0</div>
              <br />
              <div className="italic">"Every adventure begins with a single thought"</div>
              <br />
              <div className="text-xs">Built with Lovable.</div>
            </div>
            <div className="text-xs">
              <span>💡 Tip: Press Ctrl+Enter to quickly save your thoughts</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};