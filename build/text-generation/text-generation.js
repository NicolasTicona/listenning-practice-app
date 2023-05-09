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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextGeneration = void 0;
class TextGeneration {
    constructor(openai) {
        this.defaultConfiguration = {
            model: "text-davinci-003",
            prompt: "",
            temperature: 0.4,
            max_tokens: 256,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
        };
        this.openai = openai;
    }
    generateText(prompt) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!prompt) {
                    throw new Error("Prompt is empty");
                }
                const response = yield this.openai.createCompletion(Object.assign(Object.assign({}, this.defaultConfiguration), { prompt }));
                if (!response.data.choices[0].text) {
                    throw new Error("Error generating prompt");
                }
                console.log(response.data);
                return response.data.choices[0].text;
            }
            catch (err) {
                return err + "";
            }
        });
    }
}
exports.TextGeneration = TextGeneration;
