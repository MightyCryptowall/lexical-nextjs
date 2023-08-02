import { useEffect, useMemo, useState } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ClearEditorPlugin } from "@lexical/react/LexicalClearEditorPlugin";
import { $getRoot, $isParagraphNode, CLEAR_EDITOR_COMMAND } from "lexical";
import clsx from "clsx";

interface ToolbarProps {}

const Toolbar: React.FC<ToolbarProps> = () => {
  const [isEditorEmpty, setIsEditorEmpty] = useState(true);
  const [editor] = useLexicalComposerContext();

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

  const MandatoryPlugins = useMemo(() => {
    return <ClearEditorPlugin />;
  }, []);

  return (
    <>
      {MandatoryPlugins}
      <div className="my-4">
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
