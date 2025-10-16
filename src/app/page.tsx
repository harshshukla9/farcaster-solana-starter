import { Metadata } from "next";
import App from "./app";
import { aspectRatioSchema } from "@farcaster/miniapp-core";

const appUrl = process.env.NEXT_PUBLIC_URL;

const frame = {
  version: "next",
  imageUrl: `${appUrl}/solaanfarcaster3-2.png`,
  button: {
    title: "Launch Town",
    action: {
      type: "launch_frame",
      name: "Solana Starter by TownSquare",
      url: `${appUrl}`,
      splashImageUrl: `${appUrl}/townsquarepreview.png`,
      splashBackgroundColor: "#f7f7f7",
      aspectRatioSchema:3/1,
    },
  },
};

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Farcaster Frames v2 Demo",
    openGraph: {
      title: "Farcaster Frames v2 Demo",
      description: "A Farcaster Frames v2 demo app.",
    },
    other: {
      "fc:frame": JSON.stringify(frame),
    },
  };
}

export default function Home() {
  return (
    <App />
  );
}
