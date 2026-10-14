interface PlaceholderPageProps {
  title: string;
}

export function PlaceholderPage({ title }: Readonly<PlaceholderPageProps>) {
  return (
    <div>
      <h1>{title}</h1>
      <p>Coming soon.</p>
    </div>
  );
}