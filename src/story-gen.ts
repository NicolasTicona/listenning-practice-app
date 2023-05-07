import 'dotenv/config';
import axios from 'axios';
import path from 'path';
import { Configuration, OpenAIApi } from "openai";
import { promises as fs } from 'fs';
import { AIVoiceAudio, ListnrVoiceResponse } from './interfaces/text-to-speech.interface';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const prompt = `write a english listening practice story for english students in b2 level, just two lines. Do not include symbols and breaklines.`;
let generatedStory = "";

const openai = new OpenAIApi(configuration);

async function generateStory(): Promise<boolean> {
  try {
    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt,
      temperature: 0.7,
      max_tokens: 256,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    if (!response.data.choices[0].text) {
      return false;
    }

    generatedStory = response.data.choices[0].text;

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
