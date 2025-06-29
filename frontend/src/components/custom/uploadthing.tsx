// utils/uploadthing-client.ts
import { generateUploadButton } from "@uploadthing/react";

// Use `as any` to bypass type requirement for OurFileRouter
export const UploadButton = generateUploadButton<any>({
  url: "https://manhattan-thanksgiving-derek-collecting.trycloudflare.com/api/v1/uploadthing",
});
