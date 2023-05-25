"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PROMPT = void 0;
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const express_1 = __importDefault(require("express"));
const story_generation_1 = require("./story-generation");
require("./open-ai-instance");
const text_generation_1 = require("./text-generation");
const open_ai_instance_1 = require("./open-ai-instance");
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
exports.PROMPT = `Write a B2 level story for an English listening test.
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
app.use((0, cors_1.default)());
// Frontend
app.use(express_1.default.static(path_1.default.join(__dirname, '../public')));
// Routes
app.get("/generate", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let data;
    try {
        if (process.argv[2] === "--dev") {
            const mockAudio = yield (0, story_generation_1.mockGenerateAudio)();
            data = mockAudio;
            if (!data) {
                data = yield (0, story_generation_1.generateAudio)();
            }
        }
        else {
            data = yield (0, story_generation_1.generateAudio)();
        }
        res.json({ data });
    }
    catch (err) {
        res.status(500).json(err);
    }
}));
app.get('/try-openai', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const textGeneration = new text_generation_1.TextGeneration(open_ai_instance_1.openai);
    let text = yield textGeneration.generateText(exports.PROMPT);
    text = text.replace(/\n/g, '');
    res.json({ text });
}));
// Serve backend
app.listen(port, () => console.log(`app listening on port 3000!`));
