"use client";

import { useState } from 'react';

export default function PagamentoPage() {
  const [loading, setLoading] = useState(false);

  // Edite estes dados para o produto real
  const price = 100; // valor em reais
  const name = 'Produto Real';
  const quantity = 1;

  const handleStripeCheckout = async () => {
    setLoading(true);
    const res = await fetch('/api/payments/stripe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ price, name, quantity }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.url) {
      window.location.href = data.url;
    } else {
      alert('Erro ao criar checkout: ' + data.error);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 p-8 border rounded shadow bg-white">
      <h1 className="text-2xl font-bold mb-4">Pagamento</h1>
      <p className="mb-4">{name} - R$ {price.toFixed(2)}</p>
      <button
        onClick={handleStripeCheckout}
        disabled={loading}
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
      >
        {loading ? 'Redirecionando...' : 'Pagar com cartão'}
      </button>
      <p className="mt-4 text-xs text-gray-500">Use dados reais em produção. O valor e nome do produto podem ser alterados neste arquivo.</p>
    </div>
  );
} 