"use client"
import { ReactNode, createContext, useContext } from "react"
import { useState } from "react"
import { Button } from "@/shared/components/ui/button"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog"
import { Input } from "@/shared/components/ui/input"

type InputValue = string | number | undefined | null

type PromptProps = {
  promptDialog: () => React.ReactNode
  prompt: (
    isNumeric: boolean,
    message: string,
    defaultValue?: InputValue
  ) => Promise<{
    hasConfirmed: boolean
    value: InputValue
  }>
}

function usePrompt() {
  const [show, setShow] = useState(false)
  const [message, setMessage] = useState<string>("")
  const [inputType, setType] = useState("text")
  const [defaultValue, setDefaultValue] = useState<InputValue>(undefined)
  const [value, setValue] = useState<InputValue>(undefined)
  const [resolveCallback, setResolveCallback] = useState<
    (choice: { hasConfirmed: boolean; value: InputValue }) => void
  >(() => {})

  const handleClose = () => setShow(false)

  const prompt = (
    isNumeric: boolean,
    message: string,
    defaultValue?: InputValue
  ): Promise<{ hasConfirmed: boolean; value: InputValue }> => {
    if (isNumeric) setType("number")
    setMessage(message)
    setDefaultValue(defaultValue)
    if (defaultValue) {
      setValue(defaultValue)
    }

    setShow(true)

    return new Promise((resolve) => {
      setResolveCallback(
        () =>
          ({
            hasConfirmed,
            value,
          }: {
            hasConfirmed: boolean
            value: InputValue
          }) => {
            handleClose()
            resolve({ hasConfirmed, value })
          }
      )
    })
  }

  const handleConfirm = (hasConfirmed: boolean) => {
    if (resolveCallback) {
      resolveCallback({ hasConfirmed, value })
      setResolveCallback(() => {})
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value)
  }

  const promptDialog = () => (
    <AlertDialog open={show}>
      <AlertDialogContent className="bg-background text-white border-border">
        <AlertDialogHeader className="mb-2">
          <AlertDialogTitle>{message}</AlertDialogTitle>
          <p className="text-primary text-sm -mt-2">{`Enter ${message}`}</p>
          <Input
            min={0}
            defaultValue={defaultValue ? defaultValue : ""}
            className="h-12 bg-background border-border"
            required
            type={inputType}
            placeholder={`Enter ${message}`}
            autoComplete={"off"}
            onChange={handleChange}
          />
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button variant="outline" onClick={() => handleConfirm(false)}>
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-primary hover:bg-primary"
            variant="default"
            onClick={() => handleConfirm(true)}
          >
            Proceed
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )

  return { promptDialog, prompt }
}

const PromptContext = createContext<PromptProps | undefined>(undefined)

export const PromptProvider = ({ children }: { children: ReactNode }) => {
  const { promptDialog, prompt } = usePrompt()
  const value = { promptDialog, prompt }

  return (
    <PromptContext.Provider value={value}>
      {children}
      {promptDialog()}
    </PromptContext.Provider>
  )
}

export const usePromptContext = (): PromptProps => {
  const context = useContext(PromptContext)

  if (!context) {
    throw new Error("usePromptContext must be used within a PromptProvider")
  }

  return context
}
