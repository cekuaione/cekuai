/**
 * Type definitions for the Social Media module
 * AI-powered image style transformation feature types and interfaces
 */

/**
 * Available project types for social media features
 */
export enum ProjectType {
  TEXT_TO_IMAGE = "text_to_image",
  IMAGE_TO_IMAGE = "image_to_image",
  IMAGE_TO_VIDEO = "image_to_video",
}

/**
 * Available operation types for image transformation
 */
export enum OperationType {
  ANIME_STYLE = "anime_style",
  OIL_PAINTING = "oil_painting",
  WATERCOLOR = "watercolor",
  QUALITY_ENHANCE = "quality_enhance",
  VINTAGE_LOOK = "vintage_look",
  SKETCH_DRAWING = "sketch_drawing",
  CYBERPUNK_STYLE = "cyberpunk_style",
  RENDER_3D = "3d_render",
  POP_ART = "pop_art",
  FANTASY_ART = "fantasy_art",
}

/**
 * Project processing status
 */
export enum ProjectStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  COMPLETED = "completed",
  FAILED = "failed",
}

/**
 * Form data submitted by user
 */
export interface SocialMediaFormData {
  imageUrl: string;
  operationType: OperationType;
  projectType: ProjectType;
  projectName?: string;
}

/**
 * API request payload sent to n8n webhook
 */
export interface SocialMediaRequest {
  userId: string;
  projectId: string;
  operationType: OperationType;
  projectType: ProjectType;
  imageUrl: string;
}

/**
 * API response from n8n webhook
 */
export interface SocialMediaResponse {
  success: boolean;
  projectId: string;
  status: ProjectStatus;
  file_path?: string;
  output_image_url?: string;
  error?: string;
}

/**
 * Full Supabase record type for social_media_projects table
 */
export interface SocialMediaProject {
  id: string;
  user_id: string;
  project_name: string | null;
  input_image_url: string;
  output_image_url: string | null;
  operation_type: OperationType;
  project_type: ProjectType;
  status: ProjectStatus;
  file_path: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Database insert type (without auto-generated fields)
 */
export type SocialMediaProjectInsert = Omit<
  SocialMediaProject,
  "id" | "created_at" | "updated_at" | "output_image_url" | "file_path" | "error_message"
> & {
  output_image_url?: string;
  file_path?: string;
  error_message?: string;
};

/**
 * Database update type (partial, only updatable fields)
 */
export type SocialMediaProjectUpdate = Partial<
  Pick<
    SocialMediaProject,
    "status" | "output_image_url" | "file_path" | "error_message"
  >
>;

/**
 * Display data for UI (formatted and enriched)
 */
export interface SocialMediaProjectDisplay {
  id: string;
  project_name: string | null;
  input_image_url: string;
  output_image_url: string | null;
  operation_type: OperationType;
  operation_label: string;
  project_type: ProjectType;
  project_type_label: string;
  status: ProjectStatus;
  status_label: string;
  file_path: string | null;
  error_message: string | null;
  created_at: string;
  created_relative: string;
  created_exact: string;
  updated_at: string;
}

/**
 * Aggregated statistics for social media dashboard
 */
export interface SocialMediaDashboardStats {
  totalProjects: number;
  completedProjects: number;
  failedProjects: number;
  monthlyTotal: number;
  operationCounts: Record<OperationType, number>;
}

/**
 * Project type labels for UI
 */
export const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  [ProjectType.TEXT_TO_IMAGE]: "Metinden Görsel",
  [ProjectType.IMAGE_TO_IMAGE]: "Görselden Görsel", 
  [ProjectType.IMAGE_TO_VIDEO]: "Görselden Video",
};

/**
 * Operation type labels and icons for UI
 */
export const OPERATION_LABELS: Record<OperationType, string> = {
  [OperationType.ANIME_STYLE]: "Anime Stili",
  [OperationType.OIL_PAINTING]: "Yağlı Boya",
  [OperationType.WATERCOLOR]: "Suluboya",
  [OperationType.QUALITY_ENHANCE]: "Kalite Artırma",
  [OperationType.VINTAGE_LOOK]: "Vintage Görünüm",
  [OperationType.SKETCH_DRAWING]: "Karakalem",
  [OperationType.CYBERPUNK_STYLE]: "Cyberpunk",
  [OperationType.RENDER_3D]: "3D Render",
  [OperationType.POP_ART]: "Pop Art",
  [OperationType.FANTASY_ART]: "Fantastik Sanat",
};

export const OPERATION_ICONS: Record<OperationType, string> = {
  [OperationType.ANIME_STYLE]: "🎨",
  [OperationType.OIL_PAINTING]: "🖌️",
  [OperationType.WATERCOLOR]: "💧",
  [OperationType.QUALITY_ENHANCE]: "✨",
  [OperationType.VINTAGE_LOOK]: "📷",
  [OperationType.SKETCH_DRAWING]: "✏️",
  [OperationType.CYBERPUNK_STYLE]: "🌆",
  [OperationType.RENDER_3D]: "🎮",
  [OperationType.POP_ART]: "🎭",
  [OperationType.FANTASY_ART]: "🧙",
};

export const STATUS_LABELS: Record<ProjectStatus, string> = {
  [ProjectStatus.PENDING]: "Bekliyor",
  [ProjectStatus.PROCESSING]: "İşleniyor",
  [ProjectStatus.COMPLETED]: "Tamamlandı",
  [ProjectStatus.FAILED]: "Başarısız",
};

/**
 * Helper functions for project types
 */
export function getProjectTypeLabel(projectType: ProjectType): string {
  return PROJECT_TYPE_LABELS[projectType] ?? projectType;
}

/**
 * Helper functions for operation types
 */
export function getOperationLabel(operationType: OperationType): string {
  return OPERATION_LABELS[operationType] ?? operationType;
}

export function getOperationIcon(operationType: OperationType): string {
  return OPERATION_ICONS[operationType] ?? "🎨";
}

export function getStatusLabel(status: ProjectStatus): string {
  return STATUS_LABELS[status] ?? status;
}

/**
 * Validate project type
 */
export function isValidProjectType(value: string): value is ProjectType {
  return Object.values(ProjectType).includes(value as ProjectType);
}

/**
 * Validate operation type
 */
export function isValidOperationType(value: string): value is OperationType {
  return Object.values(OperationType).includes(value as OperationType);
}

/**
 * Validate project status
 */
export function isValidProjectStatus(value: string): value is ProjectStatus {
  return Object.values(ProjectStatus).includes(value as ProjectStatus);
}
