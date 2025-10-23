import type { FeatureModalConfig } from "@/lib/types/modal";
import { OperationType, OPERATION_LABELS, OPERATION_ICONS, ProjectType } from "@/lib/types/social-media";
import { ImageUpload } from "@/components/social-media/ImageUpload";

type SocialMediaModalFormData = {
  imageUrl?: string;
  operationType?: string;
  projectType?: string;
  projectName?: string;
};

type SocialMediaSubmitResult = {
  success: boolean;
  projectId?: string;
  status?: string;
  error?: string;
};


async function submitSocialMediaProject(formData: Record<string, unknown>) {
  const data = formData as SocialMediaModalFormData;

  const payload = {
    imageUrl: typeof data.imageUrl === "string" ? data.imageUrl : "",
    operationType: typeof data.operationType === "string" ? data.operationType : "",
    projectType: ProjectType.IMAGE_TO_IMAGE, // Fixed value for image-to-image feature
    ...(data.projectName && typeof data.projectName === "string" && data.projectName.trim().length
      ? { projectName: data.projectName.trim() }
      : {}),
  };

  const response = await fetch("/api/social-media", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  let body: SocialMediaSubmitResult | null = null;
  try {
    body = (await response.json()) as SocialMediaSubmitResult;
  } catch {
    // ignore JSON parse errors to handle below
  }

  if (!response.ok || !body?.success || !body.projectId) {
    const message =
      body?.error ??
      (response.status === 401
        ? "Lütfen giriş yaptıktan sonra tekrar deneyin."
        : "Görsel dönüşümü başlatılamadı. Lütfen tekrar deneyin.");
    throw new Error(message);
  }

  return {
    projectId: body.projectId,
    status: body.status ?? "pending",
  };
}

export const socialMediaConfig: FeatureModalConfig = {
  id: "social-media-transform",
  category: "business",
  title: "Görsel Dönüşüm",
  description: "AI destekli görsel stil dönüşümü yap.",
  creditCost: 2,
  formSteps: [
    {
      id: "image-input",
      title: "Görsel yükle",
      description: "Dönüştürmek istediğin görseli yükle veya URL gir.",
      fields: [
        {
          id: "imageUrl",
          type: "custom",
          label: "Görsel",
          required: true,
          helperText: "Görseli URL ile veya dosya yükleyerek ekleyin",
          component: ImageUpload,
          componentProps: {
            defaultUrl: "", // Will be set dynamically
          },
        },
        {
          id: "projectName",
          type: "text",
          label: "Proje adı (opsiyonel)",
          placeholder: "Örn: Profil fotoğrafım",
        },
      ],
    },
    {
      id: "operation-selection",
      title: "Dönüşüm türü seç",
      description: "Hangi stil dönüşümünü uygulamak istiyorsun?",
      fields: [
        {
          id: "operationType",
          type: "cards",
          label: "Dönüşüm türü",
          required: true,
          options: [
            { 
              value: OperationType.ANIME_STYLE, 
              label: OPERATION_LABELS[OperationType.ANIME_STYLE], 
              icon: OPERATION_ICONS[OperationType.ANIME_STYLE] 
            },
            { 
              value: OperationType.OIL_PAINTING, 
              label: OPERATION_LABELS[OperationType.OIL_PAINTING], 
              icon: OPERATION_ICONS[OperationType.OIL_PAINTING] 
            },
            { 
              value: OperationType.WATERCOLOR, 
              label: OPERATION_LABELS[OperationType.WATERCOLOR], 
              icon: OPERATION_ICONS[OperationType.WATERCOLOR] 
            },
            { 
              value: OperationType.QUALITY_ENHANCE, 
              label: OPERATION_LABELS[OperationType.QUALITY_ENHANCE], 
              icon: OPERATION_ICONS[OperationType.QUALITY_ENHANCE] 
            },
            { 
              value: OperationType.VINTAGE_LOOK, 
              label: OPERATION_LABELS[OperationType.VINTAGE_LOOK], 
              icon: OPERATION_ICONS[OperationType.VINTAGE_LOOK] 
            },
            { 
              value: OperationType.SKETCH_DRAWING, 
              label: OPERATION_LABELS[OperationType.SKETCH_DRAWING], 
              icon: OPERATION_ICONS[OperationType.SKETCH_DRAWING] 
            },
            { 
              value: OperationType.CYBERPUNK_STYLE, 
              label: OPERATION_LABELS[OperationType.CYBERPUNK_STYLE], 
              icon: OPERATION_ICONS[OperationType.CYBERPUNK_STYLE] 
            },
            { 
              value: OperationType.RENDER_3D, 
              label: OPERATION_LABELS[OperationType.RENDER_3D], 
              icon: OPERATION_ICONS[OperationType.RENDER_3D] 
            },
            { 
              value: OperationType.POP_ART, 
              label: OPERATION_LABELS[OperationType.POP_ART], 
              icon: OPERATION_ICONS[OperationType.POP_ART] 
            },
            { 
              value: OperationType.FANTASY_ART, 
              label: OPERATION_LABELS[OperationType.FANTASY_ART], 
              icon: OPERATION_ICONS[OperationType.FANTASY_ART] 
            },
          ],
        },
      ],
    },
  ],
  aiTips: [
    {
      id: "image-url-tip",
      trigger: "field_focus",
      fieldId: "imageUrl",
      condition: (_, context) => context.currentField === "imageUrl",
      content: "💡 Görsel URL'si geçerli bir resim formatı olmalı (JPG, PNG, WebP).",
      type: "tip",
    },
    {
      id: "operation-suggestion",
      trigger: "field_focus",
      fieldId: "operationType",
      condition: (_, context) => context.currentField === "operationType",
      content: "🎨 Her dönüşüm türü farklı sonuçlar verir. Anime stili portreler için, yağlı boya manzara fotoğrafları için idealdir.",
      type: "tip",
    },
  ],
  onSubmit: async (formData) => {
    return submitSocialMediaProject(formData);
  },
  onSuccess: (result) => {
    console.info("Social media project created", result);
  },
  onError: (error) => {
    console.error("Social media project creation failed", error);
  },
};

export default socialMediaConfig;
