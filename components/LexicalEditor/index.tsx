import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";


import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListNode, ListItemNode } from "@lexical/list";
import { LinkNode } from "@lexical/link";
import { CodeNode } from "@lexical/code";
import { TRANSFORMERS } from "@lexical/markdown";

import { LocalStoragePlugin } from "./plugins/LocalStorage";
import Toolbar from "./plugins/Toolbar";


const EDITOR_NODES = [
  CodeNode,
  HeadingNode,
  LinkNode,
  ListNode,
  ListItemNode,
  QuoteNode,
];

type LexicalEditorProps = {
  config: Parameters<typeof LexicalComposer>["0"]["initialConfig"];
};

export function LexicalEditor(props: LexicalEditorProps) {
  return (
    <LexicalComposer initialConfig={props.config}>
      <RichTextPlugin
        contentEditable={<ContentEditable />}
        placeholder={<div>Start writing...</div>}
        ErrorBoundary={LexicalErrorBoundary}
      />
      <LocalStoragePlugin namespace={props.config.namespace}/>
      <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
      <Toolbar/>
    </LexicalComposer>
  );
}

const Placeholder = () => {
  return (
    <div className="absolute top-[1.125rem] left-[1.125rem] opacity-50">
      Start writing...
    </div>
  );
};

const EDITOR_NAMESPACE = "lexical-editor";

export function Editor() {
  const content = localStorage.getItem(EDITOR_NAMESPACE);
  return (
    <div
      id="editor-wrapper"
      className={
        "relative prose prose-slate prose-p:my-0 prose-headings:mb-4 prose-headings:mt-2"
      }
    >
      <LexicalEditor
        config={{
          namespace: EDITOR_NAMESPACE,
          editorState: content,
          nodes: EDITOR_NODES,
          theme: {
            root: "p-4 border-slate-500 border-2 rounded h-full min-h-[200px] focus:outline-none focus-visible:border-black lexcial-wrapper",
            link: "cursor-pointer",
            text: {
              bold: "font-semibold",
              underline: "underline",
              italic: "italic",
              strikethrough: "line-through",
              underlineStrikethrough: "underlined-line-through",
              
            },
            heading: {
              h1: "font-bold text-3xl",
            }
          },
          onError: (error) => {
            console.log(error);
          },
        }}
      />
    </div>
  );
}
