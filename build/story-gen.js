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
exports.mockGenerateAudio = exports.generateAudio = void 0;
require("dotenv/config");
const axios_1 = __importDefault(require("axios"));
const path_1 = __importDefault(require("path"));
const openai_1 = require("openai");
const fs_1 = require("fs");
const configuration = new openai_1.Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const prompt = `write a english listening practice story for english students in b2 level, just two lines. Do not include symbols and breaklines.`;
let generatedStory = "";
const openai = new openai_1.OpenAIApi(configuration);
function generateStory() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield openai.createCompletion({
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
        }
        catch (_a) {
            return false;
        }
    });
}
function generateAudio() {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const story = yield generateStory();
        if (!story) {
            throw new Error("Error generating story");
        }
        try {
            const response = yield axios_1.default.post("https://bff.listnr.tech/api/tts/v1/convert-text", {
                voice: "en-US-AmberNeural",
                ssml: `<speak>${generatedStory}</speak>`,
            }, {
                headers: {
                    "x-listnr-token": (_a = process.env.LISTNR_API_KEY) !== null && _a !== void 0 ? _a : "",
                    "Content-Type": "application/json",
                },
            });
            if (response.status !== 200) {
                throw new Error("Error generating audio");
            }
            const voiceAudio = Object.assign(Object.assign({}, response.data), { story: generatedStory });
            yield saveStory(voiceAudio);
            return voiceAudio;
        }
        catch (err) {
            return Promise.reject(err);
        }
    });
}
exports.generateAudio = generateAudio;
function saveStory(voiceAudio) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = yield fs_1.promises.readFile(path_1.default.join(__dirname, '../data/stories.json'), 'utf8');
        const stories = data ? JSON.parse(data) : [];
        stories.push(voiceAudio);
        yield fs_1.promises.writeFile(path_1.default.join(__dirname, '../data/stories.json'), JSON.stringify(stories));
    });
}
function mockGenerateAudio() {
    return __awaiter(this, void 0, void 0, function* () {
        const data = yield fs_1.promises.readFile(path_1.default.join(__dirname, '../data/stories.json'), 'utf8');
        const stories = data ? JSON.parse(data) : [];
        return stories !== null && stories !== void 0 ? stories : [];
    });
}
exports.mockGenerateAudio = mockGenerateAudio;
