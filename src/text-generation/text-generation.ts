import { OpenAIApi } from 'openai';

export class TextGeneration {
  private openai: OpenAIApi;
  private defaultConfiguration = {
    model: "text-davinci-003",
    prompt: "",
    temperature: 0.4,
    max_tokens: 256,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    
  }

  constructor(openai: OpenAIApi) {
    this.openai = openai;
  }

  async generateText(prompt: string): Promise<string> {
    try {

      if(!prompt) {
        throw new Error("Prompt is empty");
      }

      const response = await this.openai.createCompletion({
        ...this.defaultConfiguration,
        prompt
      });

      if (!response.data.choices[0].text) {
        throw new Error("Error generating prompt");
      }
    
      console.log(response.data);

      return response.data.choices[0].text;

    } catch (err) {
      return err + "";
    }

  }
}