"use client";

import { Editor, LexicalEditor } from "@/components/LexicalEditor";
import Image from "next/image";

export default function Home() {
  return (
    <main className="p-10 box-border">
      <Editor />
    </main>
  );
}
