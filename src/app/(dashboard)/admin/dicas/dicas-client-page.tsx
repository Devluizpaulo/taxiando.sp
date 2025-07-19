"use client";
import { useState, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import { Star } from "lucide-react";
import Image from "next/image";

// Tipagem para dica
interface Dica {
  id?: string | number;
  title: string;
  description: string;
  type: "motorista" | "cliente";
  rating: number;
  imageUrl: string;
  address: string;
  bairro: string;
  city: string;
  region: string;
}

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function DicasClientPage() {
  const [dicas, setDicas] = useState<Dica[]>([]); // Substitua por fetch real do Firestore/Supabase DB
  const [form, setForm] = useState<Dica>({
    title: "",
    description: "",
    type: "motorista",
    rating: 4.5,
    imageUrl: "",
    address: "",
    bairro: "",
    city: "",
    region: ""
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [iaLoading, setIaLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Upload de imagem para Supabase Storage
  async function handleImageUpload(file: File) {
    setUploading(true);
    const { data, error } = await supabase.storage.from("dicas").upload(`dicas/${Date.now()}-${file.name}`, file, { upsert: false });
    if (error) {
      alert("Erro ao enviar imagem: " + error.message);
      setUploading(false);
      return;
    }
    const { data: urlData } = supabase.storage.from("dicas").getPublicUrl(data.path);
    setForm((f) => ({ ...f, imageUrl: urlData.publicUrl }));
    setUploading(false);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setDicas((prev) => [
      { ...form, id: Date.now() },
      ...prev,
    ]);
    setForm({ title: "", description: "", type: "motorista", rating: 4.5, imageUrl: "", address: "", bairro: "", city: "", region: "" });
    setImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleIaGenerate() {
    setIaLoading(true);
    try {
      const res = await fetch('/api/gerar-dica-ia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: form.title, address: form.address, description: form.description }),
      });
      const iaResult = await res.json();
      setForm(f => ({
        ...f,
        description: iaResult.description || f.description,
        bairro: iaResult.bairro || f.bairro,
        city: iaResult.city || f.city,
        region: iaResult.region || f.region,
      }));
    } catch (e) {
      alert('Erro ao gerar com IA');
    }
    setIaLoading(false);
  }

  return (
    <div className="max-w-3xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Administração de Dicas</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 mb-10 flex flex-col gap-4">
        {/* Título */}
        <div className="flex flex-col gap-2">
          <label className="font-semibold">Título</label>
          <input name="title" value={form.title} onChange={handleChange} className="input input-bordered" required />
        </div>
        {/* Descrição */}
        <div className="flex flex-col gap-2">
          <label className="font-semibold">Descrição</label>
          <textarea name="description" value={form.description} onChange={handleChange} className="input input-bordered" required />
        </div>
        {/* Endereço, Bairro, Cidade, Região */}
        <div className="flex flex-col gap-2">
          <label className="font-semibold">Endereço</label>
          <input name="address" value={form.address} onChange={handleChange} className="input input-bordered" placeholder="Rua, número, complemento" />
        </div>
        <div className="flex gap-4">
          <div className="flex flex-col gap-2 flex-1">
            <label className="font-semibold">Bairro</label>
            <input name="bairro" value={form.bairro} onChange={handleChange} className="input input-bordered" placeholder="Ex: Moema" />
          </div>
          <div className="flex flex-col gap-2 flex-1">
            <label className="font-semibold">Cidade</label>
            <input name="city" value={form.city} onChange={handleChange} className="input input-bordered" placeholder="Ex: São Paulo" />
          </div>
          <div className="flex flex-col gap-2 flex-1">
            <label className="font-semibold">Região</label>
            <input name="region" value={form.region} onChange={handleChange} className="input input-bordered" placeholder="Ex: Zona Sul" />
          </div>
        </div>
        {/* Tipo e Nota */}
        <div className="flex gap-4">
          <div className="flex flex-col gap-2 flex-1">
            <label className="font-semibold">Tipo</label>
            <select name="type" value={form.type} onChange={handleChange} className="input input-bordered">
              <option value="motorista">Para Motorista</option>
              <option value="cliente">Para Cliente</option>
            </select>
          </div>
          <div className="flex flex-col gap-2 flex-1">
            <label className="font-semibold">Nota</label>
            <input type="number" name="rating" min={1} max={5} step={0.1} value={form.rating} onChange={handleChange} className="input input-bordered" />
          </div>
        </div>
        {/* Imagem */}
        <div className="flex flex-col gap-2">
          <label className="font-semibold">Imagem</label>
          <input type="file" accept="image/*" ref={fileInputRef} onChange={e => {
            if (e.target.files && e.target.files[0]) {
              setImageFile(e.target.files[0]);
              handleImageUpload(e.target.files[0]);
            }
          }} className="input input-bordered" />
          {uploading && <span className="text-xs text-amber-600">Enviando imagem...</span>}
          {form.imageUrl && (
            <Image src={form.imageUrl} alt="Preview" width={120} height={80} className="rounded-lg mt-2" />
          )}
        </div>
        {/* Botão Gerar com IA */}
        <div className="flex flex-row gap-4 items-center">
          <button
            type="button"
            onClick={handleIaGenerate}
            className="btn btn-secondary"
            disabled={iaLoading || !form.title}
          >
            {iaLoading ? 'Gerando...' : 'Gerar com IA'}
          </button>
        </div>
        <button type="submit" className="btn btn-primary mt-4">Salvar Dica</button>
      </form>
      <h2 className="text-xl font-bold mb-4">Dicas Cadastradas</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {dicas.map((dica) => (
          <div key={dica.id} className="bg-white rounded-xl shadow p-4 flex flex-col gap-2">
            <div className="relative w-full h-32 mb-2">
              {dica.imageUrl && <Image src={dica.imageUrl} alt={dica.title} fill className="object-cover rounded-lg" />}
            </div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${dica.type === 'motorista' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>{dica.type === 'motorista' ? 'Para Motorista' : 'Para Cliente'}</span>
              <span className="flex items-center gap-1 text-amber-500 font-bold text-sm">
                <Star className="h-4 w-4 fill-amber-400" /> {dica.rating}
              </span>
            </div>
            <h3 className="font-bold text-lg">{dica.title}</h3>
            <p className="text-slate-600 text-sm line-clamp-3">{dica.description}</p>
            <div className="text-xs text-slate-500 mt-1">
              {dica.address && <div><b>Endereço:</b> {dica.address}</div>}
              {dica.bairro && <span className="mr-2"><b>Bairro:</b> {dica.bairro}</span>}
              {dica.city && <span className="mr-2"><b>Cidade:</b> {dica.city}</span>}
              {dica.region && <span><b>Região:</b> {dica.region}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 