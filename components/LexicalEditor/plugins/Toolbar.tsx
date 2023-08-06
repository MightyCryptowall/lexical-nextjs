import { useCallback, useEffect, useMemo, useState } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ClearEditorPlugin } from "@lexical/react/LexicalClearEditorPlugin";
import {
  $getRoot,
  $getSelection,
  $isParagraphNode,
  $isRangeSelection,
  $isRootOrShadowRoot,
  CLEAR_EDITOR_COMMAND,
  DEPRECATED_$isGridSelection,
  FORMAT_TEXT_COMMAND,
  NodeKey,
} from "lexical";
import clsx from "clsx";
import { ELEMENT_TRANSFORMERS } from "@lexical/markdown";
import { $setBlocksType } from "@lexical/selection";
import { $createHeadingNode, $isHeadingNode, HeadingTagType } from "@lexical/rich-text";
import { $findMatchingParent } from "@lexical/utils";
import { $isListNode, ListNode } from "@lexical/list";
import {
  $getNearestNodeOfType,
  $getNearestBlockElementAncestorOrThrow,
  mergeRegister,
} from "@/components/LexicalEditor/utils";

interface ToolbarProps {}

const blockTypeToBlockName = {
  bullet: "Bulleted List",
  check: "Check List",
  code: "Code Block",
  h1: "Heading 1",
  h2: "Heading 2",
  h3: "Heading 3",
  h4: "Heading 4",
  h5: "Heading 5",
  h6: "Heading 6",
  number: "Numbered List",
  paragraph: "Normal",
  quote: "Quote",
};

const Toolbar: React.FC<ToolbarProps> = () => {
  const [editor] = useLexicalComposerContext();
  const [activeEditor, setActiveEditor] = useState(editor);
  const [isEditorEmpty, setIsEditorEmpty] = useState(true);
  const [blockType, setBlockType] =
    useState<keyof typeof blockTypeToBlockName>("paragraph");
  const [selectedElementKey, setSelectedElementKey] = useState<NodeKey | null>(
    null
  );

  const formatHeading = (headingSize: HeadingTagType) => {
    if (blockType !== headingSize) {
      editor.update(() => {
        const selection = $getSelection();
        if (
          $isRangeSelection(selection) ||
          DEPRECATED_$isGridSelection(selection)
        ) {
          $setBlocksType(selection, () => $createHeadingNode(headingSize));
        }
      });
    }
  };

  useEffect(
    function checkEditorEmptyState() {
      return editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          const root = $getRoot();
          const children = root.getChildren();

          if (children.length > 1) {
            setIsEditorEmpty(false);
            return;
          }

          if ($isParagraphNode(children[0])) {
            setIsEditorEmpty(children[0].getChildren().length === 0);
          } else {
            setIsEditorEmpty(false);
          }
        });
      });
    },
    [editor]
  );

  const $updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const anchorNode = selection.anchor.getNode();
      let element =
        anchorNode.getKey() === "root"
          ? anchorNode
          : $findMatchingParent(anchorNode, (e) => {
              const parent = e.getParent();
              return parent !== null && $isRootOrShadowRoot(parent);
            });

      if (element === null) {
        element = anchorNode.getTopLevelElementOrThrow();
      }

      const elementKey = element.getKey();
      const elementDOM = activeEditor.getElementByKey(elementKey);

      // Update text format
      // setIsBold(selection.hasFormat("bold"));
      // setIsItalic(selection.hasFormat("italic"));
      // setIsUnderline(selection.hasFormat("underline"));
      // setIsStrikethrough(selection.hasFormat("strikethrough"));
      // setIsSubscript(selection.hasFormat("subscript"));
      // setIsSuperscript(selection.hasFormat("superscript"));
      // setIsCode(selection.hasFormat("code"));
      // setIsRTL($isParentElementRTL(selection));

      // Update links
      // const node = getSelectedNode(selection);
      // const parent = node.getParent();
      // if ($isLinkNode(parent) || $isLinkNode(node)) {
      //   setIsLink(true);
      // } else {
      //   setIsLink(false);
      // }

      // const tableNode = $findMatchingParent(node, $isTableNode);
      // if ($isTableNode(tableNode)) {
      //   setRootType("table");
      // } else {
      //   setRootType("root");
      // }

      if (elementDOM !== null) {
        setSelectedElementKey(elementKey);
        if ($isListNode(element)) {
          const parentList = $getNearestNodeOfType<ListNode>(
            anchorNode,
            ListNode
          );
          const type = parentList
            ? parentList.getListType()
            : element.getListType();
          setBlockType(type);
        } else {
          const type = $isHeadingNode(element)
            ? element.getTag()
            : element.getType();
          if (type in blockTypeToBlockName) {
            setBlockType(type as keyof typeof blockTypeToBlockName);
          }
          // if ($isCodeNode(element)) {
          //   const language =
          //     element.getLanguage() as keyof typeof CODE_LANGUAGE_MAP;
          //   setCodeLanguage(
          //     language ? CODE_LANGUAGE_MAP[language] || language : ""
          //   );
          //   return;
          // }
        }
      }
      // Handle buttons
      // setFontSize(
      //   $getSelectionStyleValueForProperty(selection, "font-size", "15px")
      // );
      // setFontColor(
      //   $getSelectionStyleValueForProperty(selection, "color", "#000")
      // );
      // setBgColor(
      //   $getSelectionStyleValueForProperty(
      //     selection,
      //     "background-color",
      //     "#fff"
      //   )
      // );
      // setFontFamily(
      //   $getSelectionStyleValueForProperty(selection, "font-family", "Arial")
      // );
    }
  }, [activeEditor]);

  useEffect(() => {
    return mergeRegister(
      // editor.registerEditableListener((editable) => {
      //   setIsEditable(editable);
      // }),
      activeEditor.registerUpdateListener(({editorState}) => {
        editorState.read(() => {
          $updateToolbar();
        });
      }),
      // activeEditor.registerCommand<boolean>(
      //   CAN_UNDO_COMMAND,
      //   (payload) => {
      //     setCanUndo(payload);
      //     return false;
      //   },
      //   COMMAND_PRIORITY_CRITICAL,
      // ),
      // activeEditor.registerCommand<boolean>(
      //   CAN_REDO_COMMAND,
      //   (payload) => {
      //     setCanRedo(payload);
      //     return false;
      //   },
      //   COMMAND_PRIORITY_CRITICAL,
      // ),
    );
  }, [$updateToolbar, activeEditor, editor]);

  const MandatoryPlugins = useMemo(() => {
    return <ClearEditorPlugin />;
  }, []);

  return (
    <>
      {MandatoryPlugins}
      <div className="flex gap-5 my-4">
        <button
          className={clsx(isEditorEmpty ? "text-black/50" : "text-black")}
          onClick={() => {
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
          }}
        >
          Bold
        </button>
        <button
          className={clsx(isEditorEmpty ? "text-black/50" : "text-black")}
          onClick={() => {
            formatHeading("h1");
          }}
        >
          H1
        </button>
        <button
          className={clsx(isEditorEmpty ? "text-black/50" : "text-black")}
          onClick={() => {
            formatHeading("h2");
          }}
        >
          H2
        </button>
        <button
          className={clsx(isEditorEmpty ? "text-black/50" : "text-black")}
          onClick={() => {
            formatHeading("h3");
          }}
        >
          H3
        </button>
        <button
          className={clsx(isEditorEmpty ? "text-black/50" : "text-black")}
          onClick={() => {
            formatHeading("h4");
          }}
        >
          H4
        </button>
        <button
          className={clsx(isEditorEmpty ? "text-black/50" : "text-black")}
          onClick={() => {
            formatHeading("h5");
          }}
        >
          H5
        </button>
        <button
          className={clsx(isEditorEmpty ? "text-black/50" : "text-black")}
          onClick={() => {
            editor.dispatchCommand(CLEAR_EDITOR_COMMAND, undefined);
          }}
        >
          Clear
        </button>
      </div>
    </>
  );
};

export default Toolbar;
