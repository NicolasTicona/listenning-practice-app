import 'dotenv/config';
import fetch from "node-fetch";
import { Configuration, OpenAIApi } from "openai";
import { promises as fs } from 'fs';

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

const prompt = `write a english listening practice story for english students in b2 level, just two lines. Do not include symbols and breaklines.`;
let generatedStory = "";

const openai = new OpenAIApi(configuration);

async function generateStory() {
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

        generatedStory = response.data.choices[0].text;

        return true;
    } catch {
        return false;
    }
}

export async function generateAudio() {
    const story = await generateStory();

    if (!story) {
        console.log("Error generating story");

        return;
    }

    try {
        const auidoResponse = await fetch(
            "https://bff.listnr.tech/api/tts/v1/convert-text",
            {
                method: "POST",
                headers: {
                    "x-listnr-token": process.env.LISTNR_API_KEY,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    voice: "en-US-AmberNeural",
                    ssml: `<speak>${generatedStory}</speak>`,
                }),
            }
        );

        const data = await auidoResponse.json();
        const response = { ...data, story: generatedStory};
        await saveStory({...data, story: generatedStory});

        return response;
    } catch (err) {
        console.log(err);
    }
}

async function saveStory(generatedStory) {
  const data = await fs.readFile('./data/stories.json', 'utf8');

  const stories = data ? JSON.parse(data) : [];

  stories.push(generatedStory);

  await fs.writeFile('./data/stories.json', JSON.stringify(stories));
}

export async function mockGenerateAudio() {

  const data = await fs.readFile('./data/stories.json', 'utf8');
  const stories = data ? JSON.parse(data) : [];

  return stories ?? [];
}
