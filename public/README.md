# Pasta de Recursos Públicos

Esta pasta é o local para todos os seus recursos estáticos, como imagens, logotipos, fontes e outros arquivos.

## Como Usar

1.  **Arraste e solte** seus arquivos (ex: `logo.png`, `imagem-heroi.jpg`) diretamente nesta pasta.
2.  **Referencie** os arquivos no seu código começando com uma barra (`/`).

### Exemplo em um Componente React/Next.js:

```jsx
import Image from 'next/image';

function MeuComponente() {
  return (
    <Image 
      src="/logo.png" 
      alt="Logotipo da Empresa" 
      width={200} 
      height={100} 
    />
  );
}
```

Qualquer arquivo colocado aqui é servido publicamente na raiz do seu site.
- `public/logo.png` pode ser acessado em `[seu-site.com]/logo.png`.
- `public/fotos/perfil.jpg` pode ser acessado em `[seu-site.com]/fotos/perfil.jpg`.
