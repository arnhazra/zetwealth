import { Button } from "../ui/button"
import { Pen } from "lucide-react"
import { useState } from "react"
import {
  DialogHeader,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "../ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"
import { useUserContext } from "@/context/user.provider"
import { endPoints } from "@/shared/constants/api-endpoints"
import notify from "@/shared/hooks/use-notify"
import { Currency } from "country-code-enum"
import api from "@/shared/lib/ky-api"
import { usePlatformConfig } from "@/context/platformconfig.provider"

export default function EditCurrency({
  baseCurrency,
}: {
  baseCurrency: Currency
}) {
  const [open, setOpen] = useState(false)
  const [, dispatch] = useUserContext()
  const [value, setValue] = useState<Currency>(baseCurrency)
  const { platformConfig } = usePlatformConfig()

  const saveCurrency = async () => {
    try {
      dispatch("setUser", { baseCurrency: value })
      await api.patch(endPoints.updateAttribute, {
        json: {
          attributeName: "baseCurrency",
          attributeValue: value,
        },
      })
      setOpen(false)
    } catch (error) {
      notify(platformConfig?.otherConstants.genericError, "error")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="p-2 bg-primary hover:bg-primary"
          variant="default"
          size="icon"
        >
          <Pen className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-background border-border">
        <DialogHeader>
          <DialogTitle className="text-white">Select Currency</DialogTitle>
          <p className="text-primary text-sm">
            This is the currency that will be applied throughout the app
          </p>
        </DialogHeader>
        <Select
          value={value}
          onValueChange={(value: Currency) => setValue(value)}
        >
          <SelectTrigger className="bg-background border-border text-white w-full h-12">
            <SelectValue placeholder={value} />
          </SelectTrigger>
          <SelectContent className="bg-background border-border text-white">
            {Object.values(Currency).map((item) => (
              <SelectItem value={item} key={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <DialogFooter>
          <Button
            onClick={(): Promise<void> => saveCurrency()}
            variant="default"
            className="bg-primary hover:bg-primary"
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
