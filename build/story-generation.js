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
const fs_1 = require("fs");
const text_generation_1 = require("./text-generation");
const open_ai_instance_1 = require("./open-ai-instance");
const index_1 = require("./index");
const get_content_from_html_tag_1 = require("./utils/get-content-from-html-tag");
let generatedStory = "";
function generateStory() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const textGeneration = new text_generation_1.TextGeneration(open_ai_instance_1.openai);
            const text = yield textGeneration.generateText(index_1.PROMPT);
            if (!text) {
                return false;
            }
            generatedStory = text;
            return true;
        }
        catch (err) {
            return false;
        }
    });
}
function generateAudio() {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const generatedStorySuccess = yield generateStory();
        if (!generatedStorySuccess) {
            throw new Error("Error generating story");
        }
        const [story, questions] = generatedStory.split("<hr id='separation'>");
        let noTagsStory = (0, get_content_from_html_tag_1.replaceStringPortion)("<p id='story'>", "", story);
        noTagsStory = (0, get_content_from_html_tag_1.replaceStringPortion)("</p>", "", noTagsStory);
        noTagsStory = (0, get_content_from_html_tag_1.replaceStringPortion)("</hr>", "", noTagsStory);
        noTagsStory = (0, get_content_from_html_tag_1.replaceStringPortion)("<hr>", "", noTagsStory);
        noTagsStory = (0, get_content_from_html_tag_1.replaceStringPortion)("<p/>", "", noTagsStory);
        try {
            const response = yield axios_1.default.post("https://bff.listnr.tech/api/tts/v1/convert-text", {
                voice: "en-US-AmberNeural",
                ssml: `<speak>${noTagsStory}</speak>`,
            }, {
                headers: {
                    "x-listnr-token": (_a = process.env.LISTNR_API_KEY) !== null && _a !== void 0 ? _a : "",
                    "Content-Type": "application/json",
                },
            });
            if (response.status !== 200) {
                throw new Error("Error generating audio");
            }
            const voiceAudio = Object.assign(Object.assign({}, response.data), { story, questions });
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
        return stories ? stories[0] : null;
    });
}
exports.mockGenerateAudio = mockGenerateAudio;
