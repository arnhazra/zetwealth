"use client"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { ScrollArea } from "@/shared/components/ui/scroll-area"
import {
  PanelRightClose,
  Bot,
  User,
  ArrowUp,
  Sparkles,
  BadgeMinus,
} from "lucide-react"
import { endPoints } from "@/shared/constants/api-endpoints"
import { platformName, uiConstants } from "@/shared/constants/global-constants"
import MarkdownRenderer from "../markdown"
import Show from "../show"
import { suggestedPrompts } from "./data"
import { Badge } from "../ui/badge"
import { Thread } from "@/shared/constants/types"
import IconContainer from "../icon-container"
import { streamResponseText } from "@/shared/lib/stream-response"
import { useUserContext } from "@/context/user.provider"
import { usePathname } from "next/navigation"
import api from "@/shared/lib/ky-api"
import { eventEmitter } from "@/shared/event-emitter/event-emitter"
import { EventMap } from "@/shared/event-emitter/events-map"
import { EntityType } from "../entity-card/data"
import useQuery from "@/shared/hooks/use-query"
import HTTPMethods from "@/shared/constants/http-methods"

export default function Intelligence() {
  const [isOpen, setIsOpen] = useState(false)
  const [{ user }] = useUserContext()
  const [prompt, setPrompt] = useState("")
  const [isLoading, setLoading] = useState(false)
  const [messages, setMessages] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const pathName = usePathname()
  const threadId = localStorage.getItem("thread_id")

  const thread = useQuery<Thread[]>({
    queryKey: ["get-thread", threadId ?? ""],
    queryUrl: `${endPoints.intelligence}/thread/${threadId}`,
    method: HTTPMethods.GET,
    suspense: threadId !== null && !isOpen,
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
    eventEmitter.on(EventMap.Summarize, (data) => {
      setIsOpen(true)
      const { entityType, entityDetails, entityName } = data || {}
      const summarizePrompt = `Summarize the ${entityName} ${entityType} and give me insights.`
      setLoading(true)
      hitAPIToSummarize(entityType, entityDetails, summarizePrompt)
    })
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrompt(e.target.value)
  }

  const hitAPIToSummarize = async (
    entityType?: EntityType,
    entityDetails?: string,
    summarizePrompt?: string
  ) => {
    setMessages((prev) => [...prev, summarizePrompt ?? ""])
    setPrompt("")
    setLoading(true)

    // Always fetch the latest threadId from localStorage
    const latestThreadId = localStorage.getItem("thread_id")

    try {
      const res: Thread = await api
        .post(`${endPoints.intelligence}/chat`, {
          json: {
            prompt: summarizePrompt,
            threadId: latestThreadId ?? undefined,
            summarizeRequest: true,
            entityType,
            entityDetails,
          },
        })
        .json()

      if (!latestThreadId) {
        localStorage.setItem("thread_id", res.threadId)
      }

      setMessages((prevMessages) => [...prevMessages, ""])

      streamResponseText(res?.response ?? "", (chunk) => {
        setMessages((prevMessages) => {
          const newMessages = [...prevMessages]
          newMessages[newMessages.length - 1] = chunk
          return newMessages
        })
      })
    } catch (error: any) {
      setMessages((prevMessages) => [...prevMessages, "Request timed out"])
    } finally {
      setLoading(false)
    }
  }

  const hitAPI = async (e: any) => {
    e.preventDefault()
    setMessages((prev) => [...prev, prompt])
    setPrompt("")
    setLoading(true)

    // Always fetch the latest threadId from localStorage
    const latestThreadId = localStorage.getItem("thread_id")

    try {
      const res: Thread = await api
        .post(`${endPoints.intelligence}/chat`, {
          json: {
            prompt,
            threadId: latestThreadId ?? undefined,
            summarizeRequest: false,
          },
        })
        .json()

      if (!latestThreadId) {
        localStorage.setItem("thread_id", res.threadId)
      }

      setMessages((prevMessages) => [...prevMessages, ""])

      streamResponseText(res?.response ?? "", (chunk) => {
        setMessages((prevMessages) => {
          const newMessages = [...prevMessages]
          newMessages[newMessages.length - 1] = chunk
          return newMessages
        })
      })
    } catch (error: any) {
      setMessages((prevMessages) => [...prevMessages, "Request timed out"])
    } finally {
      setLoading(false)
    }
  }

  const clearChat = () => {
    setMessages([])
    localStorage.removeItem("thread_id")
  }

  return (
    <Show condition={user.useIntelligence && !pathName.match("intelligence")}>
      <Button
        onClick={() => setIsOpen(true)}
        variant="default"
        size="icon"
        className="h-11 w-11 fixed bottom-6 right-6 z-50 text-white ui-soft-gradient text-white rounded-full transition"
      >
        <Sparkles className="h-5 w-5" />
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
            className="text-neutral-400 hover:text-white bg-none hover:bg-background"
          >
            <PanelRightClose className="h-5 w-5" />
          </Button>
        </div>

        <ScrollArea className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-4">
            <Show condition={messages.length === 0}>
              <div className="text-center mt-8">
                <div className="flex justify-center mb-4">
                  <IconContainer ai>
                    <Sparkles className="h-5 w-5" />
                  </IconContainer>
                </div>
                <p className="text-white">{platformName} Intelligence</p>
                <p className="text-xs mt-2 text-neutral-300 p-6">
                  {uiConstants.aiSafetyStatement}
                </p>
                <p className="text-sm mt-2 text-neutral-400 mb-4">
                  Try these actions
                </p>
                {suggestedPrompts.map((item, index) => (
                  <Badge
                    key={index}
                    className="text-neutral-300 bg-neutral-800 hover:bg-neutral-700 p-1 ps-4 pe-4 ms-2 mb-2 cursor-pointer"
                    onClick={(e): void => {
                      setPrompt(item)
                      hitAPI(e)
                    }}
                  >
                    {item}
                  </Badge>
                ))}
              </div>
            </Show>
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex items-start space-x-2 ${
                  index % 2 === 0 ? "justify-end" : "justify-start"
                }`}
              >
                {index % 2 !== 0 && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-primary">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                )}

                <div
                  className={`max-w-[80%] p-3 rounded-3xl ${
                    index % 2 === 0 ? "text-white" : "text-neutral-100"
                  }`}
                  style={{
                    backgroundColor: index % 2 === 0 ? "#1ed760" : "#121212",
                    border: index % 2 === 0 ? "none" : "1px solid #27272a",
                  }}
                >
                  <MarkdownRenderer key={index} markdown={message} />
                </div>

                {index % 2 === 0 && (
                  <div
                    className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "#3f3f46" }}
                  >
                    <User className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-start space-x-2">
                <div
                  className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "#1ed760" }}
                >
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div
                  className="p-3 rounded-3xl"
                  style={{
                    backgroundColor: "#121212",
                    border: "1px solid #27272a",
                  }}
                >
                  <div className="flex space-x-1">
                    <div className="w-1 h-1 bg-neutral-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-1 h-1 bg-neutral-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-1 h-1 bg-neutral-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="p-4 border-none">
          <div className="text-center">
            <Button
              variant="outline"
              size="sm"
              onClick={clearChat}
              className="text-xs text-neutral-400 hover:text-white bg-transparent hover:bg-transparent mb-2"
            >
              <BadgeMinus className="h-3 w-3 mr-1" />
              Clear Chat
            </Button>
          </div>
          <form onSubmit={hitAPI}>
            <div className="w-full max-w-4xl mx-auto">
              <div className="relative bg-neutral-900 border border-border rounded-full p-2 ps-4 pe-4 shadow-lg">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <Input
                        autoFocus
                        value={prompt}
                        onChange={handleInputChange}
                        placeholder="Ask Anything"
                        disabled={isLoading}
                        className="bg-transparent border-none text-neutral-300 placeholder:text-neutral-500 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none outline-none ring-0 text-sm px-0"
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={isLoading || !prompt.trim()}
                      size="icon"
                      className="bg-neutral-700 hover:bg-neutral-600 text-white h-8 w-8 rounded-full"
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
