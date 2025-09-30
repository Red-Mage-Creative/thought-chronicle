import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownDisplayProps {
  content: string;
  className?: string;
}

export function MarkdownDisplay({ content, className }: MarkdownDisplayProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      className={className}
      components={{
        // Custom styling for markdown elements
        p: ({ node, ...props }) => <p className="mb-4 last:mb-0" {...props} />,
        a: ({ node, ...props }) => (
          <a 
            className="text-primary hover:underline" 
            target="_blank" 
            rel="noopener noreferrer" 
            {...props} 
          />
        ),
        ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-4 space-y-1" {...props} />,
        ol: ({ node, ...props }) => <ol className="list-decimal list-inside mb-4 space-y-1" {...props} />,
        li: ({ node, ...props }) => <li className="ml-4" {...props} />,
        strong: ({ node, ...props }) => <strong className="font-semibold" {...props} />,
        em: ({ node, ...props }) => <em className="italic" {...props} />,
        h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mb-2" {...props} />,
        h2: ({ node, ...props }) => <h2 className="text-xl font-bold mb-2" {...props} />,
        h3: ({ node, ...props }) => <h3 className="text-lg font-semibold mb-2" {...props} />,
        code: ({ node, className, children, ...props }: any) => {
          const isInline = !className?.includes('language-');
          return isInline 
            ? <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono" {...props}>{children}</code>
            : <code className="block bg-muted p-4 rounded text-sm font-mono overflow-x-auto" {...props}>{children}</code>;
        },
        blockquote: ({ node, ...props }) => (
          <blockquote className="border-l-4 border-muted-foreground/20 pl-4 italic my-4" {...props} />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
