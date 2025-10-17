"use client"

import { useTransition } from "react"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateProfile, requestEmailChange, deleteAccount } from "./actions"

type SettingsFormProps = {
  userId: string
  email: string
  fullName: string
  avatarUrl: string | null
}

export function SettingsForm({ userId, email, fullName, avatarUrl }: SettingsFormProps) {
  const [isPending, startTransition] = useTransition()

  async function handleUpdateProfile(formData: FormData) {
    startTransition(async () => {
      try {
        await updateProfile(formData)
        toast.success("✅ Profil bilgileri kaydedildi")
      } catch {
        toast.error("❌ Profil güncellenemedi")
      }
    })
  }

  async function handleEmailChange(formData: FormData) {
    startTransition(async () => {
      try {
        await requestEmailChange(formData)
        toast.info("📧 E-posta değişikliği için onay linki gönderildi")
      } catch {
        toast.error("❌ E-posta değiştirilemedi")
      }
    })
  }

      async function handleDeleteAccount() {
        if (!confirm("Hesabınızı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz!")) {
          return
        }

        startTransition(async () => {
          try {
            await deleteAccount()
            toast.success("✅ Hesap silindi")
            window.location.href = "/"
          } catch {
            toast.error("❌ Hesap silinemedi")
          }
        })
      }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profil</CardTitle>
          <CardDescription>Profil bilgilerini güncelle.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleUpdateProfile} className="grid gap-4 max-w-lg">
            <input type="hidden" name="userId" value={userId} />
            <div className="grid gap-2">
              <Label htmlFor="full_name">Ad Soyad</Label>
              <Input id="full_name" name="full_name" defaultValue={fullName ?? ""} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="avatar_url">Avatar URL</Label>
              <Input id="avatar_url" name="avatar_url" defaultValue={avatarUrl ?? ""} />
            </div>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>E-posta</CardTitle>
          <CardDescription>Hesap e-posta adresin.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleEmailChange} className="grid gap-4 max-w-lg">
            <input type="hidden" name="userId" value={userId} />
            <div className="grid gap-2">
              <Label htmlFor="email">E-posta</Label>
              <Input id="email" name="email" type="email" defaultValue={email} />
            </div>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Güncelleniyor..." : "E-postayı Güncelle"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Hesabı Sil</CardTitle>
          <CardDescription>Bu işlem geri alınamaz.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button type="button" variant="destructive" onClick={handleDeleteAccount} disabled={isPending}>
            {isPending ? "Siliniyor..." : "Hesabı Sil"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

