"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AlertCircle, ArrowLeft } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useGameContext } from "../../contexts/GameContext"

export default function GameClock() {
  const router = useRouter()
  const { gameState, startGame, pauseGame, resumeGame, endGame, setHalfTime, addExtraTime } = useGameContext()
  const { isGameStarted, isHalfTime, isGameEnded, currentTime, isAdmin } = gameState

  const [extraTime, setExtraTime] = useState(0)
  const [showAlert, setShowAlert] = useState(false)

  useEffect(() => {
    if (!isAdmin) {
      router.push("/")
    }
  }, [isAdmin, router])

  const formatTime = (seconds: number) => {
    if (isHalfTime) return "HT"
    if (isGameEnded) return "FT"
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const toggleGameClock = () => {
    if (!isGameStarted) {
      startGame()
    } else if (isHalfTime) {
      resumeGame()
    } else {
      isGameStarted ? pauseGame() : resumeGame()
    }
  }

  const handleHalfTime = () => {
    if (!isHalfTime) {
      setHalfTime()
    } else {
      resumeGame()
    }
  }

  const handleAddExtraTime = () => {
    addExtraTime(extraTime)
    setExtraTime(0)
  }

  const handleEndGame = () => {
    endGame()
    setShowAlert(true)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <div className="flex justify-between items-center mb-4">
        <Link href="/admin/dashboard">
          <Button variant="ghost">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
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
              {!isGameStarted ? "Start Game" : isGameStarted ? "Pause" : "Resume"}
            </Button>
            {isGameStarted && !isGameEnded && (
              <>
                <Button onClick={handleHalfTime} className="w-full text-lg py-6" disabled={isGameEnded}>
                  {isHalfTime ? "Start Second Half" : "Half Time"}
                </Button>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    placeholder="Extra time (min)"
                    value={extraTime}
                    onChange={(e) => setExtraTime(Number.parseInt(e.target.value) || 0)}
                    className="flex-grow text-lg py-6"
                  />
                  <Button onClick={handleAddExtraTime} className="flex-shrink-0 text-lg py-6">
                    Add
                  </Button>
                </div>
                <Button onClick={handleEndGame} className="w-full text-lg py-6">
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
          <AlertDescription>The game has reached full time. Add extra time if needed or end the game.</AlertDescription>
          <Button className="mt-2" onClick={() => setShowAlert(false)}>
            Dismiss
          </Button>
        </Alert>
      )}
    </div>
  )
}

