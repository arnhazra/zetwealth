"use client"
import { ReactNode, createContext, useContext } from "react"
import { useState } from "react"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog"
import { Button } from "@/shared/components/ui/button"
import { usePlatformConfig } from "@/context/platformconfig.provider"

interface ModalProps {
  title: string
  desc: string
}

function useConfirm() {
  const [show, setShow] = useState(false)
  const { platformConfig } = usePlatformConfig()
  const [message, setMessage] = useState<ModalProps>({ title: "", desc: "" })
  const [resolveCallback, setResolveCallback] = useState<
    (choice: boolean) => void
  >(() => {})

  const handleClose = () => setShow(false)

  const confirm = ({ title, desc }: ModalProps): Promise<boolean> => {
    setMessage({ title, desc })
    setShow(true)

    return new Promise((resolve) => {
      setResolveCallback(() => (choice: boolean) => {
        handleClose()
        resolve(choice)
      })
    })
  }

  const handleConfirm = (choice: boolean) => {
    if (resolveCallback) {
      resolveCallback(choice)
      setResolveCallback(() => {})
    }
  }

  const confirmDialog = () => (
    <AlertDialog open={show}>
      <AlertDialogContent className="w-[25rem] bg-background text-white border-border">
        <AlertDialogHeader>
          <AlertDialogTitle>{message.title}</AlertDialogTitle>
          <AlertDialogDescription className="text-theme-200">
            {message.desc ?? platformConfig?.otherConstants.confirmDescription}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button variant="outline" onClick={() => handleConfirm(false)}>
            Cancel
          </Button>
          <Button
            variant="default"
            className="bg-primary hover:bg-primary"
            onClick={() => handleConfirm(true)}
          >
            Continue
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )

  return { confirmDialog, confirm }
}

export type ConfirmProps = {
  confirmDialog: () => React.ReactNode
  confirm: (message: ModalProps) => Promise<boolean>
}

const ConfirmContext = createContext<ConfirmProps | undefined>(undefined)

export const ConfirmProvider = ({ children }: { children: ReactNode }) => {
  const { confirmDialog, confirm } = useConfirm()
  const value = { confirmDialog, confirm }

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      {confirmDialog()}
    </ConfirmContext.Provider>
  )
}

export const useConfirmContext = (): ConfirmProps => {
  const context = useContext(ConfirmContext)

  if (!context) {
    throw new Error("useConfirmContext must be used within a ConfirmProvider")
  }

  return context
}
