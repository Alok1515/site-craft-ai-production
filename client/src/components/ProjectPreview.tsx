import {
  forwardRef,
  useRef,
  useImperativeHandle,
  useState,
  useEffect,
} from "react";
import type { Project } from "../types";
import { iframeScript } from "../assets/assets";
import EditorPanel from "./EditorPanel";
import LoaderSteps from "./LoaderSteps";

interface ProjectPreviewProps {
  project: Project;
  isGenerating: boolean;
  device?: "phone" | "tablet" | "desktop";
  showEditorPanel?: boolean;
}

export interface ProjectPreviewRef {
  getCode: () => string | undefined;
}

const ProjectPreview = forwardRef<ProjectPreviewRef, ProjectPreviewProps>(
  ({ project, isGenerating, device = "desktop", showEditorPanel = true }, ref) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [selectedElement, setSelectedElement] = useState<any>(null);

    const deviceWidths: Record<string, string> = {
      phone: "w-[390px]",
      tablet: "w-[820px]",
      desktop: "w-full",
    };

    useImperativeHandle(ref, ()=> ({
        getCode: ()=>{
            const doc = iframeRef.current?.contentDocument;
            if(!doc) return undefined;

            // Remove our selection class / attributes / outline from all elements
            doc.querySelectorAll('.ai-selected-element, [data-ai-selected]').forEach
            ((el)=> {
                el.classList.remove('ai-selected-element');
                el.removeAttribute('data-ai-selected');
                (el as HTMLElement).style.outline = '';
            })

            // 2. remove injected style + script from the document
            const previewStyle = doc.getElementById('ai-preview-style');
            if(previewStyle) previewStyle.remove();

            const previewScript = doc.getElementById('ai-preview-script');
            if(previewScript) previewScript.remove()

            // 3 serialize clear HTML
            const html = doc.documentElement.outerHTML;
            return html;
        }
    }))

    // Receive messages from iframe
    useEffect(() => {
      const handleMessage = (event: MessageEvent) => {
        if (event.data.type === "ELEMENT_SELECTED") {
          const iframeDoc = iframeRef.current?.contentDocument;
          const el = iframeDoc?.querySelector("[data-ai-selected='true']");

          if (el) {
            setSelectedElement({
              ...event.data.payload,
              el, // REAL DOM ELEMENT
            });
          }
        }

        if (event.data.type === "CLEAR_SELECTION") {
          setSelectedElement(null);
        }
      };

      window.addEventListener("message", handleMessage);
      return () => window.removeEventListener("message", handleMessage);
    }, []);

    // Apply updates to iframe instantly
    const handleUpdate = (updates: any) => {
      if (!selectedElement?.el) return;

      const el = selectedElement.el;

      if (updates.className !== undefined) el.className = updates.className;
      if (updates.text !== undefined) el.innerText = updates.text;

      if (updates.styles) {
        Object.assign(el.style, updates.styles);
      }

      iframeRef.current?.contentWindow?.postMessage(
        { type: "UPDATE_ELEMENT", payload: updates },
        "*"
      );
    };

    // Inject script
    const injectPreview = (html: string) => {
      if (!html) return "";
      if (!showEditorPanel) return html;
      if (html.includes("</body>"))
        return html.replace("</body>", iframeScript + "</body>");
      return html + iframeScript;
    };

   
    return (
      <div className="relative h-full flex-1 bg-gray-900 rounded-xl overflow-hidden">
        {project.current_code ? (
          <>
            <iframe
              ref={iframeRef}
              srcDoc={injectPreview(project.current_code)}
              className={`h-full ${deviceWidths[device]} mx-auto transition-all border border-gray-800 rounded-lg`}
            />

            {showEditorPanel && selectedElement && (
              <EditorPanel
                selectedElement={selectedElement}
                onUpdate={handleUpdate}
                onClose={() => {
                  setSelectedElement(null);
                  iframeRef.current?.contentWindow?.postMessage(
                    { type: "CLEAR_SELECTION_REQUEST" },
                    "*"
                  );
                }}
              />
            )}
          </>
        ) : (
          isGenerating && (
            <LoaderSteps />
          )
        )}
      </div>
    );
  }
);

export default ProjectPreview;
