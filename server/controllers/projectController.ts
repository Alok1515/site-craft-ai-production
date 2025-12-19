import { Request, Response } from "express";
import prisma from "../lib/prisma.js";
import openai from "../configs/openai.js";

/**
 * ============================
 * MAKE REVISION (AI CHANGES)
 * ============================
 */
export const makeRevision = async (req: Request, res: Response) => {
  const userId = req.user?.id


  try {
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { projectId } = req.params;
    const { message } = req.body;

    if (!message || message.trim() === "") {
      return res.status(400).json({ message: "Please enter a valid prompt" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (user.credits < 5) {
      return res
        .status(403)
        .json({ message: "Add more credits to make changes" });
    }

    const currentProject = await prisma.websiteProject.findUnique({
      where: { id: projectId, userId },
      include: { versions: true },
    });

    if (!currentProject) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Save user message
    await prisma.conversation.create({
      data: {
        role: "user",
        content: message,
        projectId,
      },
    });

    // Deduct credits
    await prisma.user.update({
      where: { id: userId },
      data: { credits: { decrement: 5 } },
    });

    /**
     * -------- PROMPT ENHANCEMENT ----------
     */
    const promptEnhanceResponse = await openai.chat.completions.create({
      model: "kwaipilot/kat-coder-pro:free",
      messages: [
        {
          role: "system",
          content:
            "Improve the user's website change request to be precise and actionable.",
        },
        {
          role: "user",
          content: message,
        },
      ],
    });

    const enhancedPrompt =
      promptEnhanceResponse.choices[0].message.content || "";

    await prisma.conversation.create({
      data: {
        role: "assistant",
        content: `Enhanced prompt: "${enhancedPrompt}"`,
        projectId,
      },
    });

    /**
     * -------- CODE GENERATION ----------
     */
    const codeGenerationResponse = await openai.chat.completions.create({
      model: "kwaipilot/kat-coder-pro:free",
      messages: [
        {
          role: "system",
          content: `
            You are an expert web developer.
            Return ONLY complete HTML.
            Use Tailwind CSS.
            No markdown.
            No explanations.
          `,
        },
        {
          role: "user",
          content: `
            Current website code:
            ${currentProject.current_code || ""}

            Requested change:
            ${enhancedPrompt}
          `,
        },
      ],
    });

    const code = codeGenerationResponse.choices[0].message.content || "";

    if(!code) {
            await prisma.conversation.create({
        data: {
            role: "assistant",
            content: "Unable to generate please try again",
            projectId,
        },
        });
            await prisma.user.update({
        where: { id: userId },
        data: { credits: { increment: 5 } },
        });
        return;
    }

    const cleanedCode = code
      .replace(/```[a-z]*\n?/gi, "")
      .replace(/```$/g, "")
      .trim();

    // Save version
    const version = await prisma.version.create({
      data: {
        code: cleanedCode,
        description: "Revision update",
        projectId,
      },
    });

    // Update project
    await prisma.websiteProject.update({
      where: { id: projectId },
      data: {
        current_code: cleanedCode,
        current_version_index: version.id,
      },
    });

    await prisma.conversation.create({
      data: {
        role: "assistant",
        content: "I've updated your website. You can preview it now.",
        projectId,
      },
    });

    res.json({ message: "Revision applied successfully" });
  } catch (error: any) {
    console.error(error.message);

    await prisma.user.update({
      where: { id: userId },
      data: { credits: { increment: 5 } },
    });

    res.status(500).json({ message: error.message });
  }
};

/**
 * ============================
 * ROLLBACK TO VERSION
 * ============================
 */
export const rollbackToVersion = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id

    const { projectId, versionId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const project = await prisma.websiteProject.findUnique({
      where: { id: projectId, userId },
      include: { versions: true },
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const version = project.versions.find((v) => v.id === versionId);

    if (!version) {
      return res.status(404).json({ message: "Version not found" });
    }

    await prisma.websiteProject.update({
      where: { id: projectId },
      data: {
        current_code: version.code,
        current_version_index: version.id,
      },
    });

    res.json({ message: "Rolled back successfully" });
  } catch (error: any) {
    console.error(error.message);
    res.status(500).json({ message: error.message });
  }
};

/**
 * ============================
 * DELETE PROJECT
 * ============================
 */
export const deleteProject = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id

    const { projectId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await prisma.websiteProject.delete({
      where: { id: projectId, userId },
    });

    res.json({ message: "Project deleted successfully" });
  } catch (error: any) {
    console.error(error.message);
    res.status(500).json({ message: error.message });
  }
};

/**
 * ============================
 * PREVIEW (OWNER)
 * ============================
 */
export const getProjectPreview = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id

    const { projectId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const project = await prisma.websiteProject.findUnique({
      where: { id: projectId, userId },
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json({ project });
  } catch (error: any) {
    console.error(error.message);
    res.status(500).json({ message: error.message });
  }
};

/**
 * ============================
 * PUBLISHED PROJECTS
 * ============================
 */
export const getPublishedProjects = async (_req: Request, res: Response) => {
  try {
    const projects = await prisma.websiteProject.findMany({
      where: { isPublished: true },
      include: { user: true },
    });

    res.json({ projects });
  } catch (error: any) {
    console.error(error.message);
    res.status(500).json({ message: error.message });
  }
};

/**
 * ============================
 * PUBLIC VIEW
 * ============================
 */
export const getProjectById = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;

    const project = await prisma.websiteProject.findUnique({
      where: { id: projectId },
    });

    if (!project || !project.isPublished || !project.current_code) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json({ code: project.current_code });
  } catch (error: any) {
    console.error(error.message);
    res.status(500).json({ message: error.message });
  }
};

/**
 * ============================
 * SAVE PROJECT CODE
 * ============================
 */
export const saveProjectCode = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id

    const { projectId } = req.params;
    const { code } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await prisma.websiteProject.update({
      where: { id: projectId, userId },
      data: {
        current_code: code,
        current_version_index: "",
      },
    });

    res.json({ message: "Project saved successfully" });
  } catch (error: any) {
    console.error(error.message);
    res.status(500).json({ message: error.message });
  }
};
