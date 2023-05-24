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
const story_gen_1 = require("./story-gen");
require("./open-ai-instance");
const text_generation_1 = require("./text-generation/text-generation");
const open_ai_instance_1 = require("./open-ai-instance");
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
exports.PROMPT = `Write a B2 level story for an English listening test. Story must have up to 5 lines.
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
app.use((0, cors_1.default)());
// Frontend
app.use(express_1.default.static(path_1.default.join(__dirname, '../public')));
// Routes
app.get("/generate", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let data;
    try {
        if (process.argv[2] === "--dev") {
            const mockStories = yield (0, story_gen_1.mockGenerateAudio)();
            data = mockStories[0];
            if (!data) {
                data = yield (0, story_gen_1.generateAudio)();
            }
        }
        else {
            data = yield (0, story_gen_1.generateAudio)();
        }
        res.json({ data });
    }
    catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
}));
app.get('/try-openai', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
    const textGeneration = new text_generation_1.TextGeneration(open_ai_instance_1.openai);
    let text = yield textGeneration.generateText(exports.PROMPT);
    text = text.replace(/\n/g, '');
    res.json({ text });
}));
// Serve backend
app.listen(port, () => console.log(`app listening on port 3000!`));
