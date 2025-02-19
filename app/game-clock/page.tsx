"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AlertCircle, ArrowLeft } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useGameContext } from "../contexts/GameContext"
import Link from "next/link"

// Move your game clock logic into a separate component.
function GameClockContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { gameState, setGameState } = useGameContext()
  const { team1, team2, isGameStarted, isHalfTime, isGameEnded, currentTime } = gameState

  const [extraTime, setExtraTime] = useState(0)
  const [showAlert, setShowAlert] = useState(false)

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isGameStarted && !isHalfTime && !isGameEnded) {
      interval = setInterval(() => {
        setGameState((prevState) => ({
          ...prevState,
          currentTime: prevState.currentTime + 1,
        }))
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isGameStarted, isHalfTime, isGameEnded, setGameState])

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const toggleGameClock = () => {
    if (!isGameStarted) {
      setGameState((prevState) => ({
        ...prevState,
        isGameStarted: true,
        currentTime: 0,
      }))
    } else if (isHalfTime) {
      setGameState((prevState) => ({
        ...prevState,
        isHalfTime: false,
        currentTime: 45 * 60, // Start second half at 45:00
      }))
    } else {
      setGameState((prevState) => ({
        ...prevState,
        isGameStarted: !prevState.isGameStarted,
      }))
    }
  }

  const nextHalf = () => {
    if (!isHalfTime) {
      setGameState((prevState) => ({
        ...prevState,
        isHalfTime: true,
        currentTime: 45 * 60, // Set time to 45:00
      }))
    } else {
      setShowAlert(true)
    }
  }

  const addExtraTime = () => {
    setGameState((prevState) => ({
      ...prevState,
      currentTime: prevState.currentTime + extraTime * 60,
    }))
    setExtraTime(0)
  }

  const endGame = () => {
    setGameState((prevState) => ({
      ...prevState,
      isGameStarted: false,
      isGameEnded: true,
    }))
    setShowAlert(true)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <div className="flex justify-between items-center mb-4">
        <Link href="/dashboard">
          <Button variant="ghost">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
        <Link href="/">
          <Button variant="ghost">Main Page</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-center">Game Clock</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-5xl font-bold mb-4 text-center">{formatTime(currentTime)}</div>
          <div className="text-2xl font-semibold mb-6 text-center">
            {!isGameStarted
              ? "Game Not Started"
              : isHalfTime
                ? "Half Time"
                : isGameEnded
                  ? "Game Ended"
                  : currentTime < 45 * 60
                    ? "First Half"
                    : "Second Half"}
          </div>
          <div className="space-y-4">
            <Button onClick={toggleGameClock} className="w-full text-lg py-6">
              {!isGameStarted ? "Start Game" : isHalfTime ? "Start Second Half" : isGameStarted ? "Pause" : "Resume"}
            </Button>
            {isGameStarted && !isGameEnded && (
              <>
                <Button
                  onClick={nextHalf}
                  className="w-full text-lg py-6"
                  disabled={isHalfTime || currentTime >= 90 * 60}
                >
                  {isHalfTime ? "Second Half" : "Half Time"}
                </Button>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    placeholder="Extra time (min)"
                    value={extraTime}
                    onChange={(e) => setExtraTime(Number.parseInt(e.target.value) || 0)}
                    className="flex-grow text-lg py-6"
                  />
                  <Button onClick={addExtraTime} className="flex-shrink-0 text-lg py-6">
                    Add
                  </Button>
                </div>
                <Button onClick={endGame} className="w-full text-lg py-6">
                  End Game
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {showAlert && (
        <Alert className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Game End</AlertTitle>
          <AlertDescription>
            The game has reached full time. Add extra time if needed or end the game.
          </AlertDescription>
          <Button className="mt-2" onClick={() => setShowAlert(false)}>
            Dismiss
          </Button>
        </Alert>
      )}
    </div>
  )
}

// Wrap the GameClockContent in a Suspense boundary to satisfy Next.js' requirement.
export default function GameClock() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GameClockContent />
    </Suspense>
  )
}
