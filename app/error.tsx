"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="container page empty-state">
      <h1>Não foi possível carregar esta página</h1>
      <p>Tente novamente. Se o problema continuar, avise a administradora.</p>
      <button className="button primary" onClick={reset}>
        Tentar novamente
      </button>
    </div>
  );
}
