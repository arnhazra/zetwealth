"use client"
import { useState, useRef, useEffect } from "react"
import { flushSync } from "react-dom"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { ScrollArea } from "@/shared/components/ui/scroll-area"
import {
  PanelRightClose,
  User,
  ArrowUp,
  Sparkle,
  BadgeMinus,
  PenBox,
  PlusSquare,
} from "lucide-react"
import { endPoints } from "@/shared/constants/api-endpoints"
import { usePlatformConfig } from "@/context/platformconfig.provider"
import MarkdownRenderer from "../markdown"
import Show from "../show"
import { suggestedPrompts } from "./data"
import { Badge } from "../ui/badge"
import { Thread } from "@/shared/constants/types"
import IconContainer from "../icon-container"
import { streamConversationResponse } from "@/shared/lib/stream-response"
import { useUserContext } from "@/context/user.provider"
import useQuery from "@/shared/hooks/use-query"
import HTTPMethods from "@/shared/constants/http-methods"
import { colorVars } from "@/shared/styles/color-vars"
import { PLATFORM_NAME } from "@/shared/constants/config"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"

export default function Intelligence() {
  const { platformConfig } = usePlatformConfig()
  const [isOpen, setIsOpen] = useState(false)
  const [{ user }] = useUserContext()
  const [prompt, setPrompt] = useState("")
  const [isLoading, setLoading] = useState(false)
  const [messages, setMessages] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const threadId = sessionStorage.getItem("thread_id")

  const thread = useQuery<Thread[]>({
    queryKey: ["get-thread", threadId ?? ""],
    queryUrl: `${endPoints.intelligence}/thread/${threadId}`,
    method: HTTPMethods.GET,
    suspense: false,
    enabled: threadId !== null,
  })

  useEffect(() => {
    setMessages(
      thread.data?.flatMap(({ prompt, response }) => [
        prompt ?? "",
        response ?? "",
      ]) ?? []
    )
  }, [thread?.data])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const invokeConversationAPI = async (userPrompt: string) => {
    const latestThreadId = sessionStorage.getItem("thread_id")
    setMessages((prev) => [...prev, userPrompt ?? ""])
    setPrompt("")
    setLoading(true)

    setMessages((prevMessages) => [...prevMessages, ""])

    try {
      await streamConversationResponse(
        `${endPoints.intelligence}/conversation`,
        {
          prompt: userPrompt,
          threadId: latestThreadId ?? undefined,
        },
        (token) => {
          flushSync(() => {
            setMessages((prevMessages) => {
              const newMessages = [...prevMessages]
              newMessages[newMessages.length - 1] += token
              return newMessages
            })
          })
        },
        (threadId) => {
          if (!latestThreadId) {
            sessionStorage.setItem("thread_id", threadId)
          }
        }
      )
    } catch (error: any) {
      setMessages((prevMessages) => {
        const newMessages = [...prevMessages]
        newMessages[newMessages.length - 1] = "Request timed out"
        return newMessages
      })
    } finally {
      setLoading(false)
    }
  }

  const createNewConversation = () => {
    setMessages([])
    sessionStorage.removeItem("thread_id")
  }

  return (
    <Show condition={user.useIntelligence}>
      <Button
        onClick={() => setIsOpen(true)}
        variant="default"
        size="icon"
        className="h-11 w-11 fixed bottom-6 right-6 z-50 text-white ui-soft-gradient text-white rounded-full transition"
      >
        <Sparkle className="h-4 w-4 text-black" />
      </Button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-xs z-40 transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className={`fixed top-0 bg-background border-l border-border/10 right-0 h-full w-full sm:w-96 flex flex-col transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-none">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="text-theme-400 hover:text-white bg-none hover:bg-background"
          >
            <PanelRightClose className="h-4 w-4" />
          </Button>
        </div>

        <ScrollArea className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-4">
            <Show condition={messages.length === 0}>
              <div className="text-center mt-8">
                <div className="flex justify-center mb-4">
                  <IconContainer>
                    <Sparkle className="h-4 w-4" />
                  </IconContainer>
                </div>
                <p className="text-white">{PLATFORM_NAME} Intelligence</p>
                <p className="text-xs mt-2 text-theme-200 p-6">
                  {platformConfig?.otherConstants.aiSafetyStatement}
                </p>
                <p className="text-sm mt-2 text-white mb-4">
                  Try these actions
                </p>
                {suggestedPrompts.map((item, index) => (
                  <Badge
                    key={index}
                    className="text-theme-200 bg-theme-800 hover:bg-border p-1 ps-4 pe-4 ms-2 mb-2 cursor-pointer"
                    onClick={(): void => {
                      setPrompt(item)
                      invokeConversationAPI(item)
                    }}
                  >
                    {item}
                  </Badge>
                ))}
              </div>
            </Show>
            {messages.map((message, index) =>
              message === "" && index % 2 !== 0 ? null : (
                <div
                  key={index}
                  className={`flex items-start space-x-2 ${
                    index % 2 === 0 ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[100%] p-3 rounded-2xl ${
                      index % 2 === 0 ? "text-white" : "text-theme-100"
                    }`}
                    style={{
                      backgroundColor:
                        index % 2 === 0 ? colorVars.border : "transparent",
                      border: "none",
                    }}
                  >
                    <MarkdownRenderer key={index} markdown={message} />
                  </div>

                  {index % 2 === 0 && (
                    <Avatar className="h-5 w-5 cursor-pointer">
                      <AvatarImage src={user.avatar ?? ""} alt={user.name} />
                      <AvatarFallback className="bg-theme-800">
                        <User className="h-4 w-4 text-primary" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              )
            )}

            {isLoading && messages[messages.length - 1] === "" && (
              <div className="ms-3 text-sm font-medium bg-gradient-to-r from-gray-400 via-white to-gray-400 bg-[length:200%_100%] bg-clip-text text-transparent animate-shimmer">
                Thinking ...
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="p-4 border-none">
          <div className="text-center">
            <Show condition={!!threadId}>
              <Button
                variant="outline"
                size="sm"
                onClick={createNewConversation}
                className="text-xs text-theme-400 hover:text-white bg-transparent hover:bg-transparent mb-2"
              >
                <PlusSquare className="h-3 w-3 mr-1" />
                New Conversation
              </Button>
            </Show>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              invokeConversationAPI(prompt)
            }}
          >
            <div className="w-full max-w-4xl mx-auto">
              <div className="relative bg-main border border-border rounded-full p-2 ps-4 pe-4 shadow-lg">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <Input
                        autoFocus
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Ask Anything"
                        disabled={isLoading}
                        className="bg-transparent border-none text-theme-200 placeholder:text-theme-500 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none outline-none ring-0 text-sm px-0"
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={isLoading || !prompt.trim()}
                      size="icon"
                      className="bg-border hover:bg-theme-600 text-white h-8 w-8 rounded-2xl"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </Show>
  )
}
