import { ContentBlock } from '@/lib/types';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function ContentBlocksEditor({
  value,
  onChange,
}: {
  value: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
}) {
  const [blocks, setBlocks] = useState<ContentBlock[]>(value || []);

  function updateBlock(idx: number, newBlock: ContentBlock) {
    const updated = [...blocks];
    updated[idx] = newBlock;
    setBlocks(updated);
    onChange(updated);
  }

  function addBlock(type: ContentBlock['type']) {
    let newBlock: ContentBlock;
    if (type === 'heading') newBlock = { type: 'heading', level: 2, text: '' };
    else if (type === 'paragraph') newBlock = { type: 'paragraph', text: '' };
    else if (type === 'list') newBlock = { type: 'list', style: 'bullet', items: [''] };
    else newBlock = { type: 'image', url: '', alt: '' };
    const updated = [...blocks, newBlock];
    setBlocks(updated);
    onChange(updated);
  }

  function removeBlock(idx: number) {
    const updated = blocks.filter((_, i) => i !== idx);
    setBlocks(updated);
    onChange(updated);
  }

  function moveBlock(idx: number, direction: -1 | 1) {
    const newIdx = idx + direction;
    if (newIdx < 0 || newIdx >= blocks.length) return;
    const updated = [...blocks];
    const [removed] = updated.splice(idx, 1);
    updated.splice(newIdx, 0, removed);
    setBlocks(updated);
    onChange(updated);
  }

  return (
    <div className="space-y-4">
      {blocks.map((block, idx) => (
        <div key={idx} className="border p-3 rounded space-y-2 bg-muted/30 relative">
          <div className="flex justify-between items-center mb-1">
            <span className="font-bold text-xs text-muted-foreground">{block.type.toUpperCase()}</span>
            <div className="flex gap-1">
              <Button type="button" size="icon" variant="ghost" onClick={() => moveBlock(idx, -1)} disabled={idx === 0} title="Mover para cima">↑</Button>
              <Button type="button" size="icon" variant="ghost" onClick={() => moveBlock(idx, 1)} disabled={idx === blocks.length - 1} title="Mover para baixo">↓</Button>
              <Button type="button" size="icon" variant="ghost" onClick={() => removeBlock(idx)} title="Remover">✕</Button>
            </div>
          </div>
          {block.type === 'heading' && (
            <div className="flex gap-2 items-center">
              <select
                className="border rounded px-2 py-1 text-xs"
                value={block.level}
                onChange={e => updateBlock(idx, { ...block, level: Number(e.target.value) as any })}
              >
                {[1, 2, 3, 4].map(l => <option key={l} value={l}>H{l}</option>)}
              </select>
              <input
                className="w-full border rounded px-2 py-1"
                value={block.text}
                onChange={e => updateBlock(idx, { ...block, text: e.target.value })}
                placeholder="Título"
              />
            </div>
          )}
          {block.type === 'paragraph' && (
            <textarea
              className="w-full border rounded px-2 py-1"
              value={block.text}
              onChange={e => updateBlock(idx, { ...block, text: e.target.value })}
              placeholder="Parágrafo"
              rows={3}
            />
          )}
          {block.type === 'list' && (
            <textarea
              className="w-full border rounded px-2 py-1"
              value={block.items.join('\n')}
              onChange={e => updateBlock(idx, { ...block, items: e.target.value.split('\n') })}
              placeholder="Um item por linha"
              rows={3}
            />
          )}
          {block.type === 'image' && (
            <div className="space-y-1">
              <input
                className="w-full border rounded px-2 py-1"
                value={block.url}
                onChange={e => updateBlock(idx, { ...block, url: e.target.value })}
                placeholder="URL da imagem"
              />
              <input
                className="w-full border rounded px-2 py-1"
                value={block.alt || ''}
                onChange={e => updateBlock(idx, { ...block, alt: e.target.value })}
                placeholder="Descrição (alt)"
              />
            </div>
          )}
        </div>
      ))}
      <div className="flex gap-2 flex-wrap">
        <Button type="button" variant="outline" onClick={() => addBlock('heading')}>+ Título</Button>
        <Button type="button" variant="outline" onClick={() => addBlock('paragraph')}>+ Parágrafo</Button>
        <Button type="button" variant="outline" onClick={() => addBlock('list')}>+ Lista</Button>
        <Button type="button" variant="outline" onClick={() => addBlock('image')}>+ Imagem</Button>
      </div>
    </div>
  );
} 