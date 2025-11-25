export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold">404</h1>
        <p className="text-xl text-muted-foreground">Pokémon not found</p>
        <a href="/" className="text-primary hover:underline cursor-pointer">
          Return to Pokédex
        </a>
      </div>
    </div>
  );
}
