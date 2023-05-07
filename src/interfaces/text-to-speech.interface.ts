export interface ListnrVoiceResponse {
  success: boolean;
  url: string;
  audioKey: string;
  voiceoverId: string;
}

export interface AIVoiceAudio extends ListnrVoiceResponse {
  story: string;
}