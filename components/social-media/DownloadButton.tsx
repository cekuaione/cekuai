"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DownloadButtonProps {
  projectId: string;
  filename?: string;
}

export function DownloadButton({ projectId, filename }: DownloadButtonProps) {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = `/api/social-media/images/${projectId}`;
    link.download = filename || 'dönüştürülmüş-görsel.png';
    link.click();
  };

  return (
    <Button
      size="sm"
      className="w-full gap-2 bg-business text-background hover:bg-business/90"
      onClick={handleDownload}
    >
      <Download className="h-4 w-4" />
      İndir
    </Button>
  );
}
