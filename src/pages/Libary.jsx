import { useState, useEffect } from "react";
import { supabaseMedia } from "../api/config";
import { Upload, Download, FileText, Film } from "lucide-react";

const Library = () => {
  const [posts, setPosts] = useState([]);
  const [uploading, setUploading] = useState(false);

  const fetchPosts = async () => {
    const { data } = await supabaseMedia.from('posts').select('*').order('created_at', { ascending: false });
    setPosts(data || []);
  };

  const handleUpload = async (e) => {
    setUploading(true);
    const file = e.target.files[0];
    const fileName = `${Date.now()}_${file.name}`;
    
    const { data } = await supabaseMedia.storage.from('eas-vault').upload(fileName, file);
    if (data) {
      await supabaseMedia.from('posts').insert([{ 
        url: `https://YOUR_SUPABASE_URL/storage/v1/object/public/eas-vault/${data.path}`, 
        type: file.type 
      }]);
      fetchPosts();
    }
    setUploading(false);
  };

  useEffect(() => { fetchPosts(); }, []);

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center bg-gray-900 p-4 rounded-xl border border-blue-900">
        <h2 className="text-sm font-bold tracking-widest text-blue-400 uppercase">EAS Archive</h2>
        <label className="bg-blue-600 p-2 rounded-lg cursor-pointer">
          <Upload size={18} />
          <input type="file" className="hidden" onChange={handleUpload} disabled={uploading}/>
        </label>
      </div>

      <div className="grid gap-4">
        {posts.map((p) => (
          <div key={p.id} className="bg-gray-950 border border-gray-800 rounded-2xl overflow-hidden p-3">
            {p.type.includes('video') ? <Film className="text-blue-500 mb-2"/> : <FileText className="text-cyan-500 mb-2"/>}
            <p className="text-[10px] text-gray-500 truncate mb-3">{p.url.split('/').pop()}</p>
            <a href={p.url} download className="block text-center bg-gray-800 py-2 rounded-lg text-xs font-bold hover:bg-blue-900 transition">
              DOWNLOAD DATA
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Library;
