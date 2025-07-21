"use client";
import { storage } from "@/lib/firebase";
import { ref, listAll, getDownloadURL, deleteObject } from "firebase/storage";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { ClipboardCopy, Trash2 } from "lucide-react";

export default function AdminImageGallery() {
  const { user, userProfile } = useAuth();
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    async function fetchImages() {
      setLoading(true);
      let listRef;
      if (userProfile?.role === 'admin') {
        listRef = ref(storage, "blog-images/");
      } else if (user?.uid) {
        listRef = ref(storage, `blog-images/${user.uid}/`);
      } else {
        setImages([]);
        setLoading(false);
        return;
      }
      const res = await listAll(listRef);
      const urls = await Promise.all(res.items.map(item => getDownloadURL(item)));
      setImages(urls);
      setLoading(false);
    }
    fetchImages();
  }, [user, userProfile]);

  async function handleDelete(url: string) {
    if (!window.confirm("Excluir esta imagem?")) return;
    const path = decodeURIComponent(url.split("/o/")[1].split("?")[0]);
    const itemRef = ref(storage, path);
    await deleteObject(itemRef);
    setImages(images.filter(img => img !== url));
  }

  async function handleCopy(url: string) {
    await navigator.clipboard.writeText(url);
    setCopied(url);
    setTimeout(() => setCopied(null), 1500);
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Galeria de Imagens</h1>
      {loading && <p>Carregando imagens...</p>}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {images.map(url => (
          <div key={url} className="relative group border rounded shadow-sm overflow-hidden">
            <img src={url} alt="Imagem salva" className="w-full h-40 object-cover" />
            <div className="absolute inset-0 flex flex-col justify-end p-2 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => handleCopy(url)} className="mb-2 bg-white/90 text-xs px-2 py-1 rounded hover:bg-white font-semibold flex items-center gap-1">
                <ClipboardCopy className="w-4 h-4" />
                {copied === url ? "Copiado!" : "Copiar URL"}
              </button>
              <button onClick={() => handleDelete(url)} className="bg-red-600 text-white text-xs px-2 py-1 rounded hover:bg-red-700 font-semibold flex items-center gap-1">
                <Trash2 className="w-4 h-4" />
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>
      {!loading && images.length === 0 && (
        <div className="text-center text-muted-foreground mt-8 flex flex-col items-center gap-2">
          <span className="text-4xl">📷</span>
          <p className="font-semibold">Nenhuma imagem encontrada ainda.</p>
          <p>Que tal ser o primeiro a fazer upload? Use o botão de upload nos formulários do site!</p>
        </div>
      )}
    </div>
  );
} 