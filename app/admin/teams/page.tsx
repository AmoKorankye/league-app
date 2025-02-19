"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useGameContext } from "../../contexts/GameContext"

const teams = ["Vikings", "Dragons", "Elites", "Lions", "Warriors", "Falcons"]

export default function TeamSelectionPage() {
  const [team1, setTeam1] = useState("")
  const [team2, setTeam2] = useState("")
  const router = useRouter()
  const { gameState, setGameState } = useGameContext()

  useEffect(() => {
    if (!gameState.isAdmin) {
      router.push("/")
    }
  }, [gameState.isAdmin, router])

  const handleStartGame = () => {
    if (team1 && team2 && team1 !== team2) {
      setGameState((prevState) => ({
        ...prevState,
        team1,
        team2,
        stats: {
          [team1]: { goals: [], redCards: [], yellowCards: [], shots: 0, saves: 0, fouls: 0 },
          [team2]: { goals: [], redCards: [], yellowCards: [], shots: 0, saves: 0, fouls: 0 },
        },
      }))
      router.push(`/admin/dashboard`)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>Select Teams</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Team 1</label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  {team1 || "Select Team 1"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[300px]">
                {teams.map((team) => (
                  <DropdownMenuItem key={team} onSelect={() => setTeam1(team)} disabled={team === team2}>
                    {team}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Team 2</label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  {team2 || "Select Team 2"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[300px]">
                {teams.map((team) => (
                  <DropdownMenuItem key={team} onSelect={() => setTeam2(team)} disabled={team === team1}>
                    {team}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <Button onClick={handleStartGame} className="w-full" disabled={!team1 || !team2 || team1 === team2}>
            Start Game
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

