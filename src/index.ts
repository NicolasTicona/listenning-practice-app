import cors from "cors";
import path from 'path';
import express, { Request, Response } from "express";
import { generateAudio, mockGenerateAudio } from "./story-gen";
import { AIVoiceAudio } from './interfaces/text-to-speech.interface';

const app = express();
const port = process.env.PORT || 3000;


app.use(cors());


// Frontend

app.use(express.static(path.join(__dirname, '../public')));

// Routes

app.get("/generate", async (req: Request, res: Response) => {
    let data: AIVoiceAudio;

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
});

console.log()

// Serve backend

app.listen(port, () => console.log(`app listening on port 3000!`));