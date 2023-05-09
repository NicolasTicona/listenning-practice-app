"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.openai = void 0;
const openai_1 = require("openai");
const configuration = new openai_1.Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
exports.openai = new openai_1.OpenAIApi(configuration);
