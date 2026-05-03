"use client";

import dynamic from "next/dynamic";

const ChatWidget = dynamic(
  () => import("./ChatWidget").then((m) => ({ default: m.ChatWidget })),
  { ssr: false, loading: () => null }
);

export default ChatWidget;
