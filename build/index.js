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
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const express_1 = __importDefault(require("express"));
const story_gen_1 = require("./story-gen");
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
app.use((0, cors_1.default)());
// Frontend
app.use(express_1.default.static(path_1.default.join(__dirname, '../public')));
// Routes
app.get("/generate", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let data;
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
}));
console.log();
// Serve backend
app.listen(port, () => console.log(`app listening on port 3000!`));
