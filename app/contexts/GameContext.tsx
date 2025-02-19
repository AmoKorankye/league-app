"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

type TeamStats = {
  goals: Goal[]
  redCards: Card[]
  yellowCards: Card[]
  shots: number
  saves: number
  fouls: number
}

type Goal = {
  id: number
  player: string
  assist: string
  time: number
  isPenalty: boolean
}

type Card = {
  id: number
  player: string
  time: number
}

type GameState = {
  isGameStarted: boolean
  isHalfTime: boolean
  isGameEnded: boolean
  currentTime: number
  team1: string
  team2: string
  stats: {
    [key: string]: TeamStats
  }
  isAdmin: boolean
}

type GameContextType = {
  gameState: GameState
  setGameState: React.Dispatch<React.SetStateAction<GameState>>
  startGame: () => void
  pauseGame: () => void
  resumeGame: () => void
  endGame: () => void
  addExtraTime: (minutes: number) => void
  setHalfTime: () => void
}

const GameContext = createContext<GameContextType | undefined>(undefined)

export const useGameContext = () => {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error("useGameContext must be used within a GameProvider")
  }
  return context
}

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [gameState, setGameState] = useState<GameState>(() => {
    if (typeof window !== "undefined") {
      const savedState = localStorage.getItem("gameState")
      if (savedState) {
        return JSON.parse(savedState)
      }
    }
    return {
      isGameStarted: false,
      isHalfTime: false,
      isGameEnded: false,
      currentTime: 0,
      team1: "",
      team2: "",
      stats: {},
      isAdmin: false,
    }
  })

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("gameState", JSON.stringify(gameState))
    }
  }, [gameState])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (gameState.isGameStarted && !gameState.isHalfTime && !gameState.isGameEnded) {
      interval = setInterval(() => {
        setGameState((prevState) => ({
          ...prevState,
          currentTime: prevState.currentTime + 1,
        }))
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [gameState.isGameStarted, gameState.isHalfTime, gameState.isGameEnded])

  const startGame = () => {
    setGameState((prevState) => ({
      ...prevState,
      isGameStarted: true,
      isHalfTime: false,
      isGameEnded: false,
    }))
  }

  const pauseGame = () => {
    setGameState((prevState) => ({
      ...prevState,
      isGameStarted: false,
    }))
  }

  const resumeGame = () => {
    setGameState((prevState) => ({
      ...prevState,
      isGameStarted: true,
      isHalfTime: false,
    }))
  }

  const endGame = () => {
    setGameState((prevState) => ({
      ...prevState,
      isGameStarted: false,
      isGameEnded: true,
    }))
  }

  const setHalfTime = () => {
    setGameState((prevState) => ({
      ...prevState,
      isGameStarted: false,
      isHalfTime: true,
    }))
  }

  const addExtraTime = (minutes: number) => {
    setGameState((prevState) => ({
      ...prevState,
      currentTime: prevState.currentTime + minutes * 60,
    }))
  }

  return (
    <GameContext.Provider
      value={{
        gameState,
        setGameState,
        startGame,
        pauseGame,
        resumeGame,
        endGame,
        setHalfTime,
        addExtraTime,
      }}
    >
      {children}
    </GameContext.Provider>
  )
}

