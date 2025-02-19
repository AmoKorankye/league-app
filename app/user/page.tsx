"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import Image from "next/image"
import { useGameContext } from "../contexts/GameContext"

const teamColors: { [key: string]: { bg: string; text: string } } = {
  Dragons: { bg: "bg-blue-500", text: "text-white" },
  Vikings: { bg: "bg-red-500", text: "text-white" },
  Elites: { bg: "bg-gray-900", text: "text-white" },
  Lions: { bg: "bg-green-500", text: "text-white" },
  Warriors: { bg: "bg-yellow-500", text: "text-black" },
  Falcons: { bg: "bg-gray-500", text: "text-white" },
}

export default function MainUserPage() {
  const { gameState } = useGameContext()
  const { team1, team2, isGameStarted, isHalfTime, isGameEnded, currentTime, stats } = gameState

  const formatTime = (seconds: number) => {
    if (isHalfTime) return "HT"
    if (isGameEnded) return "FT"
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const getGameStatus = () => {
    if (!isGameStarted) return "Game Not Started"
    if (isHalfTime) return "Half Time"
    if (isGameEnded) return "Game Ended"
    return currentTime < 45 * 60 ? "First Half" : "Second Half"
  }

  if (!team1 || !team2) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card>
          <CardContent>
            <p className="text-center">No game in progress</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <h1 className="text-2xl md:text-3xl font-bold text-center mb-6">Soccer League Live Match</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-center text-lg md:text-xl">{getGameStatus()}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl md:text-4xl font-bold text-center mb-4">{formatTime(currentTime)}</div>
          <div className="flex justify-between items-center">
            <TeamScore team={team1} score={stats[team1]?.goals.length || 0} />
            <div className="text-2xl md:text-3xl font-bold">-</div>
            <TeamScore team={team2} score={stats[team2]?.goals.length || 0} />
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4">
            <GoalScorers team={team1} goals={stats[team1]?.goals || []} />
            <GoalScorers team={team2} goals={stats[team2]?.goals || []} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-center text-lg md:text-xl">Match Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <StatComparison
              label="Shots"
              value1={stats[team1]?.shots || 0}
              value2={stats[team2]?.shots || 0}
              team1={team1}
              team2={team2}
            />
            <StatComparison
              label="Saves"
              value1={stats[team1]?.saves || 0}
              value2={stats[team2]?.saves || 0}
              team1={team1}
              team2={team2}
            />
            <StatComparison
              label="Fouls"
              value1={stats[team1]?.fouls || 0}
              value2={stats[team2]?.fouls || 0}
              team1={team1}
              team2={team2}
            />
            <StatComparison
              label="Yellow Cards"
              value1={stats[team1]?.yellowCards.length || 0}
              value2={stats[team2]?.yellowCards.length || 0}
              team1={team1}
              team2={team2}
            />
            <StatComparison
              label="Red Cards"
              value1={stats[team1]?.redCards.length || 0}
              value2={stats[team2]?.redCards.length || 0}
              team1={team1}
              team2={team2}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function TeamScore({ team, score }: { team: string; score: number }) {
  return (
    <div className="text-center">
      <div
        className={`w-16 h-16 md:w-20 md:h-20 rounded-full ${teamColors[team].bg} ${teamColors[team].text} flex items-center justify-center mb-2 mx-auto overflow-hidden`}
      >
        <Image 
          src={`/team-logos/${team.toLowerCase()}.png`} 
          alt={team} 
          width={80} 
          height={80} 
          className="object-contain"
          priority // Add this to preload important images
          loading="eager" // Add this to load immediately
        />
      </div>
      <div className="text-sm md:text-base font-semibold">{team}</div>
      <div className="text-3xl md:text-4xl font-bold">{score}</div>
    </div>
  )
}

function GoalScorers({ team, goals }: { team: string; goals: any[] }) {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    return `${minutes}'`
  }

  return (
    <div className="space-y-1">
      {goals.map((goal, index) => (
        <p key={index} className="text-xs md:text-sm mb-1">
          <span className="font-semibold">{goal.player}</span>
          {goal.assist && <span className="text-gray-600"> ({goal.assist})</span>}
          <span className="float-right">
            {formatTime(goal.time)}
            {goal.isPenalty && " (P)"}
          </span>
        </p>
      ))}
    </div>
  )
}

function StatComparison({
  label,
  value1,
  value2,
  team1,
  team2,
}: { label: string; value1: number; value2: number; team1: string; team2: string }) {
  const total = value1 + value2
  const percent1 = total === 0 ? 50 : (value1 / total) * 100

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs md:text-sm">
        <span>{value1}</span>
        <span className="font-medium">{label}</span>
        <span>{value2}</span>
      </div>
      <div className="flex h-2 w-full overflow-hidden rounded-full">
        <div className={`${teamColors[team1].bg} transition-all duration-500`} style={{ width: `${percent1}%` }}></div>
        <div
          className={`${teamColors[team2].bg} transition-all duration-500`}
          style={{ width: `${100 - percent1}%` }}
        ></div>
      </div>
    </div>
  )
}

