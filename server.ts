import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY as string,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes
  app.post("/api/generate-enemies", async (req, res) => {
    try {
      const prompt = `
        Redacta una descripción detallada y lore emocionante de enemigos para un videojuego neo-arcade de acción rápida "Rocket Bull".
        Usa estos seis personajes de enemigos principales como base:
        - Personaje 1: Pájaro Amarillo Retro (Enemigo volador estándar, hiperactivo y travieso)
        - Personaje 2: Pájaro 'Cool' con Lentes de Sol (Enemigo con gafas oscuras, más rápido y táctico)
        - Personaje 3: Pájaro Cyber Ninja (Agresivo, sigiloso y esquivo que viaja en patrones zigzagueantes)
        - Personaje 4: Murciélago Volcánico Pira (Veloz criatura envuelta en llamas y ascuas del inframundo)
        - Personaje 5: Fantasma Etéreo del Vacío (Espíritu traslúcido flotante con poderes gravitacionales que altera su opacidad)
        - Personaje 6: Cyber Robo-Copter (Heli-pájaro metálico blindado armado con rotores hiperveloces)

        Para cada enemigo incluye obligatoriamente:
        - Nombre comercial del enemigo (en español)
        - Descripción física emocionante o lore (en español)
        - Habilidades especiales
        - Puntos de vida (hp, número del 1 al 10)
        - Velocidad de ataque o movimiento (rápido, errático, sónico, etc.)
        - Tipo de arma o ataque
        
        Responde en formato JSON puro con la siguiente estructura exacta:
        {
          "enemies": [
            {
              "name": string,
              "description": string,
              "skills": string,
              "hp": number,
              "speed": string,
              "attackType": string
            }
          ]
        }
      `;

      const result = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      res.json(JSON.parse(result.text || "{}"));
    } catch (error: any) {
      console.error("Gemini Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
