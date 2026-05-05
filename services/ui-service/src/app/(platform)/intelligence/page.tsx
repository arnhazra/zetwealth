"use client"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { ScrollArea } from "@/shared/components/ui/scroll-area"
import { Bot, User, ArrowUp, Sparkle, PlusSquare } from "lucide-react"
import { endPoints } from "@/shared/constants/api-endpoints"
import MarkdownRenderer from "@/shared/components/markdown"
import Show from "@/shared/components/show"
import { Thread } from "@/shared/constants/types"
import { useUserContext } from "@/context/user.provider"
import useQuery from "@/shared/hooks/use-query"
import HTTPMethods from "@/shared/constants/http-methods"
import { streamConversationResponse } from "@/shared/lib/stream-response"
import IconContainer from "@/shared/components/icon-container"
import { colorVars } from "@/shared/styles/color-vars"
import { usePlatformConfig } from "@/context/platformconfig.provider"
import { flushSync } from "react-dom"
import { PLATFORM_NAME } from "@/shared/constants/config"
import Loading from "@/app/loading"
import { suggestedPrompts } from "@/shared/components/intelligence/data"
import { Badge } from "@/shared/components/ui/badge"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar"

export default function Page() {
  const { platformConfig } = usePlatformConfig()
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
    <Show condition={!thread.isLoading} fallback={<Loading />}>
      <div className="h-full flex flex-col w-full max-w-4xl mx-auto">
        <ScrollArea
          className={`flex-1 p-4 overflow-y-auto ${
            messages.length > 0 ? "pb-32" : ""
          }`}
        >
          <div className="space-y-4">
            <Show condition={messages.length === 0}>
              <div className="text-center mt-8 max-w-xl mx-auto">
                <div className="flex justify-center mb-4">
                  <IconContainer>
                    <Sparkle className="h-5 w-5" />
                  </IconContainer>
                </div>
                <p className="text-primary">{PLATFORM_NAME} Intelligence</p>
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
                  {index % 2 !== 0 && (
                    <Avatar className="h-6 w-6 cursor-pointer">
                      <AvatarFallback className="bg-theme-800">
                        <Sparkle className="h-3 w-3 text-primary" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`max-w-[100%] p-3 rounded-2xl ${
                      index % 2 === 0 ? "text-white" : "text-theme-100"
                    }`}
                    style={{
                      backgroundColor:
                        index % 2 === 0 ? colorVars.main : colorVars.border,
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
        <div
          className={`p-4 border-none transition-all duration-300 ${
            messages.length === 0
              ? "flex-1 flex items-center justify-center"
              : "fixed w-full bottom-0 left-0"
          }`}
        >
          <div className="text-center">
            <Show condition={!!threadId}>
              <Button
                variant="outline"
                size="sm"
                onClick={createNewConversation}
                className="text-xs text-theme-400 hover:text-white bg-transparent hover:bg-transparent mb-4"
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
            className="w-full max-w-3xl mx-auto"
          >
            <div className="relative bg-background border border-theme-800 rounded-full p-2 ps-4 pe-4 shadow-lg">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <Input
                      autoFocus
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Ask anything about your finances"
                      disabled={isLoading}
                      className="bg-transparent border-none text-theme-200 placeholder:text-theme-500 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none outline-none ring-0 text-sm px-0"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={isLoading || !prompt.trim()}
                    size="icon"
                    className="bg-theme-800 hover:bg-theme-600 text-white h-8 w-8 rounded-full"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </Show>
  )
}
