import 'dotenv/config';
import axios from 'axios';
import path from 'path';
import { promises as fs } from 'fs';
import { AIVoiceAudio, ListnrVoiceResponse } from './interfaces/text-to-speech.interface';
import { TextGeneration } from './text-generation/text-generation';
import { openai } from './open-ai-instance';

const prompt = `write a english listening practice story for english students in b2 level, just two lines. Do not include symbols and breaklines.`;
let generatedStory = "";


async function generateStory(): Promise<boolean> {
  try {
    const textGeneration = new TextGeneration(openai);

    const text = await textGeneration.generateText(prompt);

    if (!text) {
      return false;
    }

    generatedStory = text

    return true;
  } catch {
    return false;
  }
}

export async function generateAudio(): Promise<AIVoiceAudio> {
  const story = await generateStory();

  if (!story) {
    throw new Error("Error generating story");
  }

  try {
    const response = await axios.post<ListnrVoiceResponse>(
      "https://bff.listnr.tech/api/tts/v1/convert-text",
      {
        voice: "en-US-AmberNeural",
        ssml: `<speak>${generatedStory}</speak>`,
      },
      {
        headers: {
          "x-listnr-token": process.env.LISTNR_API_KEY ?? "",
          "Content-Type": "application/json",
        },
      }
    );

    if (response.status !== 200) {
      throw new Error("Error generating audio");
    }

    const voiceAudio: AIVoiceAudio = { ...response.data, story: generatedStory };
    await saveStory(voiceAudio);

    return voiceAudio;
  } catch (err) {
    return Promise.reject(err);
  }
}

async function saveStory(voiceAudio: AIVoiceAudio): Promise<void> {
  const data = await fs.readFile(path.join(__dirname, '../data/stories.json'), 'utf8');

  const stories = data ? JSON.parse(data) : [];

  stories.push(voiceAudio);

  await fs.writeFile(path.join(__dirname, '../data/stories.json'), JSON.stringify(stories));
}

export async function mockGenerateAudio(): Promise<AIVoiceAudio[]> {

  const data = await fs.readFile(path.join(__dirname, '../data/stories.json'), 'utf8');
  const stories = data ? JSON.parse(data) : [];

  return stories ?? [];
}
