import {
  getSupabaseServiceClient,
  getSupabaseUserClient,
} from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  SocialMediaProject,
  SocialMediaProjectInsert,
  SocialMediaProjectUpdate,
  SocialMediaProjectDisplay,
  SocialMediaDashboardStats,
} from "@/lib/types/social-media";
import {
  OperationType,
  ProjectStatus,
  ProjectType,
} from "@/lib/types/social-media";
import type { Database } from "@/lib/supabase/database.types";
import {
  getOperationLabel,
  getStatusLabel,
  getProjectTypeLabel,
  isValidOperationType,
} from "@/lib/types/social-media";

export class SocialMediaProjectError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "SocialMediaProjectError";
  }
}

type SocialMediaSupabaseClient = SupabaseClient<Database>;

async function getClient({
  privileged = false,
}: { privileged?: boolean } = {}): Promise<SocialMediaSupabaseClient> {
  if (privileged) {
    return getSupabaseServiceClient();
  }
  return getSupabaseUserClient();
}

function coerceProject(
  project: Database["public"]["Tables"]["social_media_projects"]["Row"]
): SocialMediaProject {
  return {
    id: project.id,
    user_id: project.user_id,
    project_name: project.project_name,
    input_image_url: project.input_image_url,
    output_image_url: project.output_image_url,
    operation_type: project.operation_type as OperationType,
    project_type: project.project_type as ProjectType,
    status: project.status as ProjectStatus,
    file_path: project.file_path,
    error_message: project.error_message,
    created_at: project.created_at ?? new Date().toISOString(),
    updated_at: project.updated_at ?? project.created_at ?? new Date().toISOString(),
  };
}

function formatRelativeTime(dateInput: string): string {
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const now = new Date();
  let diff = (date.getTime() - now.getTime()) / 1000;

  const divisions: { amount: number; name: Intl.RelativeTimeFormatUnit }[] = [
    { amount: 60, name: "second" },
    { amount: 60, name: "minute" },
    { amount: 24, name: "hour" },
    { amount: 7, name: "day" },
    { amount: 4.34524, name: "week" },
    { amount: 12, name: "month" },
    { amount: Number.POSITIVE_INFINITY, name: "year" },
  ];

  const rtf = new Intl.RelativeTimeFormat("tr", { numeric: "auto" });

  for (const division of divisions) {
    if (Math.abs(diff) < division.amount) {
      return rtf.format(Math.round(diff), division.name);
    }
    diff /= division.amount;
  }

  return date.toLocaleDateString("tr-TR");
}

function enrichProjectDisplay(project: SocialMediaProject): SocialMediaProjectDisplay {
  const createdAt = new Date(project.created_at);
  const createdRelative = formatRelativeTime(project.created_at);
  const createdExact = createdAt.toLocaleString("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return {
    id: project.id,
    project_name: project.project_name,
    input_image_url: project.input_image_url,
    output_image_url: project.output_image_url,
    operation_type: project.operation_type,
    operation_label: getOperationLabel(project.operation_type),
    project_type: project.project_type,
    project_type_label: getProjectTypeLabel(project.project_type),
    status: project.status,
    status_label: getStatusLabel(project.status),
    file_path: project.file_path,
    error_message: project.error_message,
    created_at: project.created_at,
    created_relative: createdRelative,
    created_exact: createdExact,
    updated_at: project.updated_at,
  };
}

/**
 * Create a new social media project
 */
export async function createSocialMediaProject(
  data: SocialMediaProjectInsert,
  useServer = true
): Promise<SocialMediaProject> {
  try {
    const supabase = await getClient({ privileged: useServer });

    const { data: project, error } = await supabase
      .from("social_media_projects")
      .insert({
        user_id: data.user_id,
        project_name: data.project_name,
        input_image_url: data.input_image_url,
        operation_type: data.operation_type,
        project_type: data.project_type,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    if (!project) {
      throw new Error("Failed to create project");
    }

    return coerceProject(project);
  } catch (error) {
    console.error("Error creating social media project:", error);
    throw new SocialMediaProjectError(
      error instanceof Error ? error.message : "Unknown error",
      "CREATE_FAILED",
      { originalError: error }
    );
  }
}

/**
 * Get a single social media project by ID
 */
export async function getSocialMediaProject(
  projectId: string,
  userId: string,
  useServer = true
): Promise<SocialMediaProject | null> {
  try {
    const supabase = await getClient({ privileged: useServer });

    const { data, error } = await supabase
      .from("social_media_projects")
      .select("*")
      .eq("id", projectId)
      .eq("user_id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null; // Project not found
      }
      throw error;
    }

    return data ? coerceProject(data) : null;
  } catch (error) {
    console.error("Error fetching social media project:", error);
    throw new SocialMediaProjectError(
      error instanceof Error ? error.message : "Unknown error",
      "FETCH_FAILED",
      { projectId, originalError: error }
    );
  }
}

/**
 * Get all social media projects for a user
 */
export async function getUserSocialMediaProjects(
  userId: string,
  { limit = 50, offset = 0 } = {}
): Promise<SocialMediaProject[]> {
  try {
    const supabase = await getClient({ privileged: true });

    const { data, error } = await supabase
      .from("social_media_projects")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    return (data || []).map(coerceProject);
  } catch (error) {
    console.error("Error fetching user social media projects:", error);
    throw new SocialMediaProjectError(
      error instanceof Error ? error.message : "Unknown error",
      "FETCH_FAILED",
      { userId, originalError: error }
    );
  }
}

/**
 * Update social media project status and data
 */
export async function updateSocialMediaProjectStatus(
  projectId: string,
  updateData: SocialMediaProjectUpdate,
  useServer = true
): Promise<SocialMediaProject> {
  try {
    const supabase = await getClient({ privileged: useServer });

    const { data, error } = await supabase
      .from("social_media_projects")
      .update(updateData)
      .eq("id", projectId)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        throw new Error("Project not found");
      }
      throw error;
    }

    if (!data) {
      throw new Error("Failed to update project");
    }

    return coerceProject(data);
  } catch (error) {
    console.error("Error updating social media project:", error);
    throw new SocialMediaProjectError(
      error instanceof Error ? error.message : "Unknown error",
      "UPDATE_FAILED",
      { projectId, originalError: error }
    );
  }
}

/**
 * Get recent social media projects for a user
 */
export async function getRecentSocialMediaProjects(
  userId: string,
  limit = 5
): Promise<SocialMediaProject[]> {
  try {
    return await getUserSocialMediaProjects(userId, { limit });
  } catch (error) {
    console.error("Error fetching recent social media projects:", error);
    throw new SocialMediaProjectError(
      error instanceof Error ? error.message : "Unknown error",
      "FETCH_FAILED",
      { userId, originalError: error }
    );
  }
}

/**
 * Get social media dashboard statistics
 */
export async function getUserSocialMediaStats(
  userId: string
): Promise<SocialMediaDashboardStats> {
  try {
    const supabase = await getClient({ privileged: true });

    const { data, error } = await supabase
      .from("social_media_projects")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    const projects = (data || []).map(coerceProject);

    const startOfMonth = new Date();
    startOfMonth.setUTCDate(1);
    startOfMonth.setUTCHours(0, 0, 0, 0);

    let totalProjects = 0;
    let completedProjects = 0;
    let failedProjects = 0;
    let monthlyTotal = 0;

    const operationCounts: Record<OperationType, number> = {
      [OperationType.ANIME_STYLE]: 0,
      [OperationType.OIL_PAINTING]: 0,
      [OperationType.WATERCOLOR]: 0,
      [OperationType.QUALITY_ENHANCE]: 0,
      [OperationType.VINTAGE_LOOK]: 0,
      [OperationType.SKETCH_DRAWING]: 0,
      [OperationType.CYBERPUNK_STYLE]: 0,
      [OperationType.RENDER_3D]: 0,
      [OperationType.POP_ART]: 0,
      [OperationType.FANTASY_ART]: 0,
    };

    for (const project of projects) {
      totalProjects++;

      if (project.status === "completed") {
        completedProjects++;
      } else if (project.status === "failed") {
        failedProjects++;
      }

      const createdAt = new Date(project.created_at);
      if (createdAt >= startOfMonth) {
        monthlyTotal++;
      }

      if (isValidOperationType(project.operation_type)) {
        operationCounts[project.operation_type]++;
      }
    }

    return {
      totalProjects,
      completedProjects,
      failedProjects,
      monthlyTotal,
      operationCounts,
    };
  } catch (error) {
    console.error("Error computing social media stats:", error);
    throw new SocialMediaProjectError(
      error instanceof Error ? error.message : "Unknown error",
      "STATS_FAILED",
      { userId, originalError: error }
    );
  }
}

/**
 * Delete a social media project
 */
export async function deleteSocialMediaProject(
  projectId: string,
  userId: string,
  useServer = false
): Promise<boolean> {
  try {
    const supabase = await getClient({ privileged: useServer });

    const { error } = await supabase
      .from("social_media_projects")
      .delete()
      .eq("id", projectId)
      .eq("user_id", userId);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error("Error deleting social media project:", error);
    throw new SocialMediaProjectError(
      error instanceof Error ? error.message : "Unknown error",
      "DELETE_FAILED",
      { projectId, originalError: error }
    );
  }
}

/**
 * Get enriched project display data
 */
export async function getSocialMediaProjectDisplay(
  projectId: string,
  userId: string,
  useServer = true
): Promise<SocialMediaProjectDisplay | null> {
  try {
    const project = await getSocialMediaProject(projectId, userId, useServer);
    return project ? enrichProjectDisplay(project) : null;
  } catch (error) {
    console.error("Error fetching social media project display:", error);
    throw new SocialMediaProjectError(
      error instanceof Error ? error.message : "Unknown error",
      "FETCH_DISPLAY_FAILED",
      { projectId, originalError: error }
    );
  }
}