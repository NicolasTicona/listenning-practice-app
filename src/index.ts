import cors from "cors";
import path from 'path';
import express, { Request, Response } from "express";
import { generateAudio, mockGenerateAudio } from "./story-generation";
import { AIVoiceAudio } from './interfaces/text-to-speech.interface';
import './open-ai-instance';
import { TextGeneration } from './text-generation'
import { openai } from './open-ai-instance';

const app = express();
const port = process.env.PORT || 3000;


export const PROMPT = `Write a B2 level story for an English listening test.
Create two multiple-choice (3 options) questions based on the story.
Use HTML tags to format the text.
Indicate correct answer with a id='correct'.
Add only one <hr> between the story and questions


Follow this structure, be creative with the story to generate:

<p id='story'>PUT STORY HERE<p/>

<hr id='separation'>

<div class='question'>
  <p> PUT QUESTION #1 HERE</p>
  <span> A: Possible answer </span>
  <span id='correct'> B: Right answer </span>
</div>
<div class='question'>
  <p> PUT QUESTION #2 HERE</p>
  <span id='correct'> A: Right answer </span>
  <span> B: Posible answer </span>
</div>
<div class='question'>
  <p> PUT QUESTION #3 HERE </p>
  <span> A: Possible answer </span>
  <span id='correct'> B: Right answer </span>
</div>
`;

app.use(cors());


// Frontend

app.use(express.static(path.join(__dirname, '../public')));

// Routes

app.get("/generate", async (req: Request, res: Response) => {
  let data: AIVoiceAudio;

  try {
    if (process.argv[2] === "--dev") {
      const mockAudio = await mockGenerateAudio();
      data = mockAudio;

      if (!data) {
        data = await generateAudio();
      }
    } else {
      data = await generateAudio();
    }


    res.json({ data });

  } catch (err) {
    res.status(500).json(err)
  }
});

app.get('/try-openai', async (req: Request, res: Response) => {
  const textGeneration = new TextGeneration(openai);

  let text = await textGeneration.generateText(PROMPT);

  text = text.replace(/\n/g, '');

  res.json({ text });
});

// Serve backend
app.listen(port, () => console.log(`app listening on port 3000!`));
