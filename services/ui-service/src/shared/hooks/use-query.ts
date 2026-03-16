"use client"
import {
  useSuspenseQuery,
  useQuery as useReactQuery,
} from "@tanstack/react-query"
import HTTPMethods from "@/shared/constants/http-methods"
import { useUserContext } from "@/context/user.provider"
import api from "../lib/ky-api"

interface QueryType<T> {
  queryKey: unknown[]
  queryUrl: string
  method: HTTPMethods
  requestBody?: object
  suspense?: boolean
  enabled?: boolean
}

export default function useQuery<T>({
  queryKey,
  queryUrl,
  method,
  requestBody,
  suspense = true,
  enabled = true,
}: QueryType<T>) {
  const [{ user }] = useUserContext()

  const queryFn = async () => {
    const data: any = await api(queryUrl, {
      method,
      json: requestBody,
    }).json()
    return data
  }

  if (suspense) {
    return useSuspenseQuery<T, Error>({
      queryKey,
      queryFn,
      refetchOnWindowFocus: !user.reduceCarbonEmissions,
      refetchInterval: user.reduceCarbonEmissions ? 0 : 30000,
    })
  }

  return useReactQuery<T, Error>({
    queryKey: [...queryKey, user._id],
    queryFn,
    refetchOnWindowFocus: !user.reduceCarbonEmissions,
    refetchInterval: user.reduceCarbonEmissions ? 0 : 30000,
    enabled,
  })
}
