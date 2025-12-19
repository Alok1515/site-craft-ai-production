import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Loader2Icon } from "lucide-react";
import ProjectPreview from "../components/ProjectPreview";
import type { Project, Version } from "../types";
import api from "@/configs/axios";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

const Preview = () => {
  const { data: session, isPending } = authClient.useSession();
  const { projectId, versionId } = useParams();

  const [code, setCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isPending) return;

    if (!session?.user) {
      setLoading(false);
      return;
    }

    const fetchCode = async () => {
      try {
        const { data } = await api.get(`/api/project/preview/${projectId}`);

        let finalCode = data.project.current_code;

        if (versionId && Array.isArray(data.project.versions)) {
          const version = data.project.versions.find(
            (v: Version) => v.id === versionId
          );
          if (version) {
            finalCode = version.code;
          }
        }

        setCode(finalCode || null);
      } catch (error: any) {
        toast.error(error?.response?.data?.message || error.message);
        console.error(error);
      } finally {
        setLoading(false); // ✅ ALWAYS
      }
    };

    fetchCode();
  }, [session?.user, isPending, projectId, versionId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2Icon className="size-7 animate-spin text-indigo-200" />
      </div>
    );
  }

  if (!code) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-400">
        No preview available
      </div>
    );
  }

  return (
    <div className="h-screen">
      <ProjectPreview
        project={{ current_code: code } as Project}
        isGenerating={false}
        showEditorPanel={false}
      />
    </div>
  );
};

export default Preview;
