"use client"

import { signOut } from 'next-auth/react'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function UserMenu({ user }: { user: { name?: string | null; email?: string; image?: string | null } }) {
  const initials = user.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : user.email?.[0]?.toUpperCase() ?? 'U'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.image ?? undefined} alt={user.name ?? 'avatar'} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <span className="hidden sm:block text-sm">{user.name ?? user.email ?? 'Hesap'}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name ?? 'Kullanıcı'}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard/settings">Ayarlar</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer"
          onSelect={() => signOut({ callbackUrl: '/' })}
        >
          Çıkış Yap
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

