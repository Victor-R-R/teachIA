'use client'

import { useState, useTransition } from 'react'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface DeleteAccountButtonProps {
  action: () => Promise<void>
}

export function DeleteAccountButton({ action }: DeleteAccountButtonProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleConfirm() {
    startTransition(async () => {
      await action()
    })
  }

  return (
    <>
      <Button
        variant="outline"
        className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
        onClick={() => setOpen(true)}
      >
        <Trash2 className="h-4 w-4 mr-2" />
        Supprimer mon compte
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer mon compte</DialogTitle>
            <DialogDescription>
              Cette action est <strong>irréversible</strong>. Toutes vos données seront
              définitivement supprimées : exercices, conversations, flashcards, statistiques
              et historique d&apos;activité.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirm}
              disabled={isPending}
            >
              {isPending ? 'Suppression…' : 'Oui, supprimer mon compte'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
