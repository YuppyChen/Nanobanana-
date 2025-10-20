export type AspectRatio = "1:1" | "16:9" | "9:16" | "4:3" | "3:4" | "3:2" | "2:3" | "5:4" | "4:5" | "21:9";

export interface Asset {
  id: string;
  prompt: string;
  imageDataUrl: string;
}
