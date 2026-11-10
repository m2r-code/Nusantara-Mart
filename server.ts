import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // Shared Gemini client utility
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  // Health endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // AI Shopping Assistant & Customer Service 24/7 Chat
  app.post('/api/gemini/chat', async (req, res) => {
    try {
      const { message, history, context } = req.body;

      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'Pesan tidak boleh kosong.' });
      }

      const systemInstruction = `Kamu adalah 'NusaBot' - Asisten Belanja Cerdas & Customer Service Resmi 24/7 untuk NusantaraMart, platform belanja online terdepan di Indonesia.
Karakter: Ramah, tanggap, solutif, sopan, antusias, dan berbahasa Indonesia natural (gunakan sapaan ramah seperti 'Kak', 'Halo Kak').

Keahlianmu:
1. Rekomendasi Produk: Berikan saran produk terbaik berdasarkan kebutuhan, kegunaan, dan anggaran belanja pengguna.
2. Penjelasan Pembayaran & Promo: Jelaskan kemudahan bayar melalui E-Wallet (GoPay, OVO, DANA, ShopeePay), Transfer Bank Lokal & VA (BCA, Mandiri, BRI, BNI), QRIS instan, Kartu Kredit berkeamanan tinggi SSL 256-bit, dan COD.
3. Fitur Peta Pelacakan Pengiriman Langsung: Jelaskan bahwa NusantaraMart menyediakan fitur radar peta interaktif real-time di mana pengguna bisa melihat posisi kurir dan estimasi waktu tiba (ETA).
4. Program Poin Loyalitas & Tier:
   - Silver: Cashback 1% poin per transaksi.
   - Gold: Cashback 2% poin + 3x gratis ongkir.
   - Platinum: Cashback 3% poin + prioritas customer service + voucher VIP eksklusif.
   - 1 Poin = Rp 1 potongan langsung di checkout!
5. Pengecekan Pesanan: Jika pengguna menanyakan status pesanan, minta nomor resi/invoice (misal: NSR-8921) dan arahkan ke menu 'Lacak Pengiriman' di aplikasi.
6. Penanganan Keluhan: Berikan empati mendalam dan solusi cepat, termasuk garansi retur 7 hari uang kembali jika barang rusak.

Katalog produk ringkas & status toko saat ini:
${context || 'Tersedia kategori Elektronik, Fashion Muslim & Casual, Kopi & Kuliner Nusantara, Perabotan Rumah Tangga, Skincare Lokal, dan Hobi.'}

Format balasan:
- Berikan jawaban yang padat, rapi (gunakan bullet points jika perlu), dan hindari teks yang terlalu panjang bertele-tele.
- Selalu tawarkan bantuan lanjutan jika ada hal lain yang ingin ditanyakan.`;

      const contents = [];
      if (Array.isArray(history) && history.length > 0) {
        for (const h of history) {
          if (h && h.role && h.content) {
            contents.push({
              role: h.role === 'user' ? 'user' : 'model',
              parts: [{ text: String(h.content) }],
            });
          }
        }
      }
      contents.push({
        role: 'user',
        parts: [{ text: message }],
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction,
        },
      });

      res.json({
        reply: response.text || 'Halo Kak, ada yang bisa NusaBot bantu seputar produk atau pesanan hari ini?',
      });
    } catch (err: any) {
      console.error('Gemini Chat error:', err);
      // Friendly fallback so user experience is always graceful
      res.status(200).json({
        reply: 'Halo Kak! Saat ini NusaBot siap membantu Anda. Untuk melacak pesanan, silakan cek tab "Lacak Pengiriman" atau gunakan menu pencarian produk kami. Ada yang ingin Kak tanyakan seputar promo atau produk rekomendasi hari ini?',
        isFallback: true,
      });
    }
  });

  // AI Personalized Product Recommendation Generator
  app.post('/api/gemini/recommendations', async (req, res) => {
    try {
      const { userInterests, recentViews, budget } = req.body;

      const prompt = `Analisis data belanja pengguna ini dan berikan 2 kalimat wawasan rekomendasi personal cerdas:
Minat Pengguna: ${JSON.stringify(userInterests || ['Elektronik', 'Kuliner'])}
Produk Baru Dilihat: ${JSON.stringify(recentViews || [])}
Rentang Budget: ${budget || 'Fleksibel'}

Tuliskan 1 insight alasan personal yang menggugah selera belanja dalam Bahasa Indonesia (maksimal 2 kalimat, santun dan bersahabat).`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      res.json({
        insight: response.text?.trim() || 'Berdasarkan aktivitas belanja Anda, kami telah mempersonalisasi koleksi produk terbaik dengan cashback poin loyalitas ganda.',
      });
    } catch (err: any) {
      console.error('Gemini Recommendation error:', err);
      res.json({
        insight: 'Berdasarkan tren belanja terbaru, produk gadget dan kuliner Nusantara favorit kami siapkan khusus untuk Anda!',
      });
    }
  });

  // Serve static assets in production or mount Vite middleware in development
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[NusantaraMart Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
