import cors from "cors";
import express from "express";
import { generateAudio, mockGenerateAudio } from "./story-gen.js";

const app = express();

app.use(express.static("public"));
app.use(cors());

app.get("/generate", async (req, res) => {
    let data;

    if (process.argv[2] === "--dev") {
        data = await mockGenerateAudio();
        data = data[0];

        if (!data || data?.length == 0) {
            data = await generateAudio();
        }
    } else {
        data = await generateAudio();
    }

    res.json({ data });
});

app.listen(3000, () => console.log(`Example app listening on port 3000!`));
