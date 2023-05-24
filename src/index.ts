import cors from "cors";
import path from 'path';
import express, { Request, Response } from "express";
import { generateAudio, mockGenerateAudio } from "./story-gen";
import { AIVoiceAudio } from './interfaces/text-to-speech.interface';
import './open-ai-instance';
import { TextGeneration } from './text-generation/text-generation'
import { openai } from './open-ai-instance';

const app = express();
const port = process.env.PORT || 3000;


export const PROMPT = `Write a B2 level story for an English listening test. Story must have up to 5 lines.
Create two multiple-choice (2 options) questions based on the story.
Use HTML tags to format the text.
Indicate correct answer with a id='correct'.
Add <hr> between story and questions

Example:

<p id='story'>Jack and his sister, Jill, had an argument about what to do on the weekend. They eventually decided to go on a hike together and enjoy the fresh air.<p/>

<hr>

<div class='question'>
  <p> Why Jack and his sister had an argument ?</p>
  <span id='correct'> A: They were discussing what activity do in on the weekend. </span>
  <span> B: They forgot to cook for lunch </span>
</div>
<div class='question'>
  <p> Where did they go ? </p>
  <span> A: They went to hike together</span>
  <span id='correct'> B: They went to ride together</span>
</div>`;

app.use(cors());


// Frontend

app.use(express.static(path.join(__dirname, '../public')));

// Routes

app.get("/generate", async (req: Request, res: Response) => {
  let data: AIVoiceAudio;

  try {
    if (process.argv[2] === "--dev") {
      const mockStories = await mockGenerateAudio();
      data = mockStories[0];

      if (!data) {
        data = await generateAudio();
      }
    } else {
      data = await generateAudio();
    }


    res.json({ data });

  } catch (err) {
    console.log(err);
    res.status(500).json(err)
  }
});

app.get('/try-openai', async (req: Request, res: Response) => {
  // 384 tokens total
  const prompt = `Write a B2 level story for an English listening test. Story must have up to 5 lines.
  Create two multiple-choice (3 options) questions based on the story.
  Use HTML tags to format the text.
  Indicate correct answer with a id='correct'.

  Examples:

  <p id='story'>
    Jack and his sister, Jill, had an argument about what to do on the weekend. They eventually decided to go on a hike together and enjoy the fresh air.
  <p/>

  <hr>

  <p class='question'>
    <span> Question 1: </span>
    <span id='correct'> A: Option 1 </span>
    <span> B: Option 2 </span>
    <span> C: Option 3 </span> 
  </p>
  <p class='question'>
    <span> Question 2 </span>
    <span> A: Option 1 </span>
    <span id='correct'> B: Option 2 </span>
    <span> C: Option 3 </span>
  </p>
  .
  `;

  const textGeneration = new TextGeneration(openai);

  let text = await textGeneration.generateText(PROMPT);

  text = text.replace(/\n/g, '');

  res.json({ text });
});

// Serve backend

app.listen(port, () => console.log(`app listening on port 3000!`));
