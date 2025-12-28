interface EmptySearchStateProps {
  query: string;
}

export function EmptySearchState({ query }: EmptySearchStateProps) {
  return (
    <div className="py-16 text-center font-mono text-sm text-muted-foreground">
      No apps found for &quot;{query}&quot;
    </div>
  );
}
