   import 'dotenv/config';
   import { GoogleGenAI, ThinkingLevel } from '@google/genai';

   const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
   const models = ['gemini-3.1-flash-lite', 'gemini-3.8-flash'];

   for (const model of models) {
     const config: any = {};
     if (model === 'gemini-3.8-flash') {
       config.thinkingConfig = { thinkingLevel: ThinkingLevel.LOW };
     }
     const start = Date.now();
     let first: number | null = null;
     try {
       const stream = await ai.models.generateContentStream({
         model,
         contents: 'Explain what a prime number is in 3 sentences.',
         config,
       });
       for await (const chunk of stream) {
         if (chunk.text && first === null) first = Date.now() - start;
       }
       console.log(model, '=> first word:', first, 'ms | total:', Date.now() - start, 'ms');
     } catch (e: any) {
       console.log(model, '=> FAILED:', e?.message);
     }
   }