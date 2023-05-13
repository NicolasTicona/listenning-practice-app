import 'dotenv/config';
import axios from 'axios';
import path from 'path';
import { promises as fs } from 'fs';
import { AIVoiceAudio, ListnrVoiceResponse } from './interfaces/text-to-speech.interface';
import { TextGeneration } from './text-generation/text-generation';
import { openai } from './open-ai-instance';
import { PROMPT } from './index';
import { replaceStringPortion } from './utils/get-content-from-html-tag';

let generatedStory = "";


async function generateStory(): Promise<boolean> {
  try {
    const textGeneration = new TextGeneration(openai);

    const text = await textGeneration.generateText(PROMPT);

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
  const success = await generateStory();

  if (!success) {
    throw new Error("Error generating story");
  }

  const [story, questions] = generatedStory.split("<hr>");

  let speechStory = replaceStringPortion("<p id='story'>", "", story);
  speechStory = replaceStringPortion("</p>", "", speechStory);
  speechStory = replaceStringPortion("</hr>", "", speechStory);
  speechStory = replaceStringPortion("<hr>", "", speechStory);

  try {
    const response = await axios.post<ListnrVoiceResponse>(
      "https://bff.listnr.tech/api/tts/v1/convert-text",
      {
        voice: "en-US-AmberNeural",
        ssml: `<speak>${speechStory}</speak>`,
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

    const voiceAudio: AIVoiceAudio = { ...response.data, story, questions };
    await saveStory(voiceAudio);

    console.log("Voice Audio:", voiceAudio);

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
