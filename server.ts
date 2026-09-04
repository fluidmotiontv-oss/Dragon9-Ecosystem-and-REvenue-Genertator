import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Increase payload limit for large file lists
  app.use(express.json({ limit: '50mb' }));

  // API Routes
  app.post('/api/generate-report', async (req, res) => {
    try {
      const { files } = req.body;
      if (!files || !Array.isArray(files)) {
        return res.status(400).json({ error: 'Invalid files payload' });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: 'GEMINI_API_KEY is not set' });
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const fileSummary = files.map((f: any) => `- ${f.name} (${f.mimeType}, ${f.size ? Math.round(Number(f.size)/1024) + 'KB' : 'Unknown size'})`).join('\n');
      
      const prompt = `You are an expert digital asset manager and monetization strategist. 
The user is using the "Asset Plan Maker" tool to generate income from their digital assets. 
Here is an audit of their recent assets (from Google Drive and Local Storage):

${fileSummary}

Please generate a comprehensive, structured "Asset Monetization Plan" that includes:
1. **Asset Inventory Analysis**: Categorize these assets by potential value and readiness.
2. **Monetization Strategy**: Suggest specific, actionable ways to monetize them (e.g., selling templates, licensing media, offering courses, creating SaaS tools).
3. **High ROI Targets**: Highlight which specific assets have the highest potential return on investment.
4. **Step-by-Step Action Plan**: Provide a concrete, 30-day timeline to start generating income from these assets.

Format the report clearly in Markdown using headers, bullet points, and bold text for readability. Be concise, professional, and focus on practical monetization.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      res.json({ report: response.text });
    } catch (error) {
      console.error('Error generating report:', error);
      res.status(500).json({ error: 'Failed to generate report' });
    }
  });

  app.post('/api/audit-ai-apps', async (req, res) => {
    try {
      const { apps } = req.body;
      if (!apps || !Array.isArray(apps) || apps.length === 0) {
        return res.status(400).json({ error: 'No apps provided for audit' });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: 'GEMINI_API_KEY is not set' });
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const appList = apps.map((a: any) => `- **${a.name}**: ${a.description}`).join('\n');
      
      const prompt = `You are an elite AI Product Strategist and Venture Capital Analyst.
The user is using the "Dragon9 Gateway" to audit their portfolio of AI Studio applications.
Here is the list of their AI Studio apps:

${appList}

Please generate a comprehensive, structured "Development & Profit Potential Audit" that includes for each app:
1. **Technical Feasibility & Dev Roadmap**: Complexity, required stack, and next steps for development.
2. **Market Demand & Positioning**: Target audience and product-market fit.
3. **Monetization Strategy & ROI**: Best pricing models (e.g., SaaS, Freemium, API access) and profit potential.
4. **Overall Score**: A rating out of 10 for both Development Ease and Profit Potential.

Format the report clearly in Markdown using headers, bullet points, and bold text for readability. Be professional and highly strategic.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      res.json({ report: response.text });
    } catch (error) {
      console.error('Error generating AI apps audit:', error);
      res.status(500).json({ error: 'Failed to generate AI apps audit report' });
    }
  });

  app.post('/api/organize-local-files', async (req, res) => {
    try {
      const { files } = req.body;
      if (!files || !Array.isArray(files) || files.length === 0) {
        return res.status(400).json({ error: 'No files provided for organization' });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: 'GEMINI_API_KEY is not set' });
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const prompt = `You are an expert digital archivist and file system organizer.
Review the following list of filenames and organize them into logical subfolders (e.g., 'Documents', 'Images', 'Code', 'Archives', 'Media', etc.).
Return ONLY a valid JSON array of objects with the following structure. Do not wrap in markdown tags like \`\`\`json.
[
  {
    "original": "exact_original_filename.ext",
    "targetDir": "SuggestedFolderName",
    "newName": "cleaned_up_filename.ext"
  }
]
Only organize files into top-level subfolders within the directory.

Files to organize:
${files.join('\n')}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      let responseText = response.text || "[]";
      responseText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
      const plan = JSON.parse(responseText);

      res.json({ plan });
    } catch (error) {
      console.error('Error generating organization plan:', error);
      res.status(500).json({ error: 'Failed to generate organization plan' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
