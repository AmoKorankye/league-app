"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Trash2, Plus, Minus, Clock, RefreshCw } from "lucide-react"
import Image from "next/image"
import { useGameContext } from "../../contexts/GameContext"

const teamColors: { [key: string]: string } = {
  Dragons: "bg-blue-500",
  Vikings: "bg-red-500",
  Elites: "bg-gray-900",
  Lions: "bg-green-500",
  Warriors: "bg-yellow-500",
  Falcons: "bg-gray-500",
}

export default function AdminDashboard() {
  const router = useRouter()
  const { gameState, setGameState } = useGameContext()
  const { team1, team2, stats, isGameStarted, isHalfTime, isGameEnded, currentTime, isAdmin } = gameState

  const [showRefreshConfirm, setShowRefreshConfirm] = useState(false)
  const [refreshPassword, setRefreshPassword] = useState("")
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(!isAdmin)

  useEffect(() => {
    setShowPasswordPrompt(!isAdmin)
  }, [isAdmin])

  const handlePasswordSubmit = (password: string) => {
    if (password === "admin") {
      setGameState((prevState) => ({ ...prevState, isAdmin: true }))
      setShowPasswordPrompt(false)
    } else {
      alert("Incorrect password")
    }
  }

  if (showPasswordPrompt) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>Admin Login</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              type="password"
              placeholder="Enter admin password"
              onChange={(e) => setRefreshPassword(e.target.value)}
            />
            <Button className="mt-4 w-full" onClick={() => handlePasswordSubmit(refreshPassword)}>
              Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const canEditStats = isGameStarted && !isHalfTime && !isGameEnded

  const addGoal = (team: string, player: string, assist: string, isPenalty: boolean) => {
    setGameState((prevState) => ({
      ...prevState,
      stats: {
        ...prevState.stats,
        [team]: {
          ...prevState.stats[team],
          goals: [...prevState.stats[team].goals, { id: Date.now(), player, assist, time: currentTime, isPenalty }],
        },
      },
    }))
  }

  const deleteGoal = (team: string, goalId: number) => {
    setGameState((prevState) => ({
      ...prevState,
      stats: {
        ...prevState.stats,
        [team]: {
          ...prevState.stats[team],
          goals: prevState.stats[team].goals.filter((goal) => goal.id !== goalId),
        },
      },
    }))
  }

  const addCard = (team: string, cardType: "redCards" | "yellowCards", player: string) => {
    setGameState((prevState) => ({
      ...prevState,
      stats: {
        ...prevState.stats,
        [team]: {
          ...prevState.stats[team],
          [cardType]: [...prevState.stats[team][cardType], { id: Date.now(), player, time: currentTime }],
        },
      },
    }))
  }

  const updateStat = (team: string, stat: "shots" | "saves" | "fouls", value: number) => {
    setGameState((prevState) => ({
      ...prevState,
      stats: {
        ...prevState.stats,
        [team]: {
          ...prevState.stats[team],
          [stat]: Math.max(0, prevState.stats[team][stat] + value),
        },
      },
    }))
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const handleRefresh = () => {
    if (refreshPassword === "admin") {
      setGameState({
        isGameStarted: false,
        isHalfTime: false,
        isGameEnded: false,
        currentTime: 0,
        team1: "",
        team2: "",
        stats: {},
        isAdmin: true,
      })
      router.push("/admin/teams")
    } else {
      alert("Incorrect password")
    }
    setShowRefreshConfirm(false)
    setRefreshPassword("")
  }

  if (!team1 || !team2) {
    router.push("/admin/teams")
    return null
  }

  return (
    <div className="container mx-auto px-4 md:px-8 lg:px-16 xl:px-24 max-w-6xl mt-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Match Dashboard</h1>
        <div className="flex space-x-2">
          <Link href="/admin/game-clock">
            <Button variant="outline">
              <Clock className="mr-2 h-4 w-4" />
              Game Clock
            </Button>
          </Link>
          <Button variant="outline" onClick={() => setShowRefreshConfirm(true)}>
            <RefreshCw className="mr-2 h-4 w-4" />
            New Game
          </Button>
        </div>
      </div>

      <div className="text-center mb-4">
        <div className="text-xl font-semibold">{formatTime(currentTime)}</div>
      </div>

      <div className="flex justify-center items-center space-x-8 mb-8">
        <div className="text-center flex items-center">
        <Image src={`/team-logos/${team1.toLowerCase()}.png`} alt={team1} width={80} height={80} className="object-contain"/>
          <div className="ml-4 text-6xl md:text-8xl font-bold">{stats[team1]?.goals.length || 0}</div>
        </div>
        <div className="text-4xl font-bold">-</div>
        <div className="text-center flex items-center">
          <div className="mr-4 text-6xl md:text-8xl font-bold">{stats[team2]?.goals.length || 0}</div>
        <Image src={`/team-logos/${team2.toLowerCase()}.png`} alt={team2} width={80} height={80} className="object-contain"/>
        </div>
      </div>

      <div className="space-y-4 mb-8">
        <StatProgressBar
          label="Shots"
          value1={stats[team1]?.shots || 0}
          value2={stats[team2]?.shots || 0}
          color1={teamColors[team1]}
          color2={teamColors[team2]}
        />
        <StatProgressBar
          label="Saves"
          value1={stats[team1]?.saves || 0}
          value2={stats[team2]?.saves || 0}
          color1={teamColors[team1]}
          color2={teamColors[team2]}
        />
        <StatProgressBar
          label="Fouls"
          value1={stats[team1]?.fouls || 0}
          value2={stats[team2]?.fouls || 0}
          color1={teamColors[team1]}
          color2={teamColors[team2]}
        />
        <StatProgressBar
          label="Yellow Cards"
          value1={stats[team1]?.yellowCards.length || 0}
          value2={stats[team2]?.yellowCards.length || 0}
          color1={teamColors[team1]}
          color2={teamColors[team2]}
        />
        <StatProgressBar
          label="Red Cards"
          value1={stats[team1]?.redCards.length || 0}
          value2={stats[team2]?.redCards.length || 0}
          color1={teamColors[team1]}
          color2={teamColors[team2]}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-center">Game Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={team1}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger
              value={team1}
              className={`transition-colors text-white
              ${teamColors[team1]} data-[state=active]:${teamColors[team1]}
              data-[state=inactive]:bg-gray-200 data-[state=inactive]:hover:bg-gray-300
              data-[state=inactive]:text-gray-900`}
              >
              {team1}
              </TabsTrigger>
              <TabsTrigger
              value={team2}
              className={`transition-colors text-white
              ${teamColors[team2]} data-[state=active]:${teamColors[team2]}
              data-[state=inactive]:bg-gray-200 data-[state=inactive]:hover:bg-gray-300
              data-[state=inactive]:text-gray-900`}
              >
              {team2}
              </TabsTrigger>
            </TabsList>
            {[team1, team2].map((team) => (
              <TabsContent key={team} value={team} className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2 text-center">Goals</h3>
                  {stats[team]?.goals.map((goal) => (
                    <div key={goal.id} className="flex items-center justify-between mb-2 text-sm">
                      <span>
                        {goal.player} {goal.isPenalty ? "(P)" : goal.assist ? `(${goal.assist})` : ""}{" "}
                        {formatTime(goal.time)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteGoal(team, goal.id)}
                        disabled={!canEditStats}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <AddEventDialog
                    title="Add Goal"
                    onSubmit={(player, assist, isPenalty) => addGoal(team, player, assist, isPenalty)}
                    showAssist
                    showPenalty
                    disabled={!canEditStats}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-center">
                      Red Cards ({stats[team]?.redCards.length || 0})
                    </h4>
                    <AddEventDialog
                      title="Add Red Card"
                      onSubmit={(player) => addCard(team, "redCards", player)}
                      disabled={!canEditStats}
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-center">
                      Yellow Cards ({stats[team]?.yellowCards.length || 0})
                    </h4>
                    <AddEventDialog
                      title="Add Yellow Card"
                      onSubmit={(player) => addCard(team, "yellowCards", player)}
                      disabled={!canEditStats}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-center">Shots</CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-between items-center">
                      <Button onClick={() => updateStat(team, "shots", -1)} disabled={!canEditStats}>
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="text-xl font-semibold">{stats[team]?.shots || 0}</span>
                      <Button onClick={() => updateStat(team, "shots", 1)} disabled={!canEditStats}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-center">Saves</CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-between items-center">
                      <Button onClick={() => updateStat(team, "saves", -1)} disabled={!canEditStats}>
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="text-xl font-semibold">{stats[team]?.saves || 0}</span>
                      <Button onClick={() => updateStat(team, "saves", 1)} disabled={!canEditStats}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-center">Fouls</CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-between items-center">
                      <Button onClick={() => updateStat(team, "fouls", -1)} disabled={!canEditStats}>
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="text-xl font-semibold">{stats[team]?.fouls || 0}</span>
                      <Button onClick={() => updateStat(team, "fouls", 1)} disabled={!canEditStats}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={showRefreshConfirm} onOpenChange={setShowRefreshConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm New Game</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to start a new game? This will reset all current game data.</p>
            <Input
              type="password"
              placeholder="Enter admin password"
              value={refreshPassword}
              onChange={(e) => setRefreshPassword(e.target.value)}
              className="mt-4"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowRefreshConfirm(false)}>
              Cancel
            </Button>
            <Button onClick={handleRefresh}>Confirm</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function StatProgressBar({
  label,
  value1,
  value2,
  color1,
  color2,
}: { label: string; value1: number; value2: number; color1: string; color2: string }) {
  const total = value1 + value2
  const percent = total === 0 ? 50 : (value1 / total) * 100

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span>
          {value1} - {value2}
        </span>
      </div>
      <div className="flex h-2 w-full overflow-hidden rounded-full">
        <div className={`${color1} transition-all duration-500`} style={{ width: `${percent}%` }}></div>
        <div className={`${color2} transition-all duration-500`} style={{ width: `${100 - percent}%` }}></div>
      </div>
    </div>
  )
}

function AddEventDialog({
  title,
  onSubmit,
  showAssist = false,
  showPenalty = false,
  disabled = false,
}: {
  title: string
  onSubmit: (player: string, assist: string, isPenalty: boolean) => void
  showAssist?: boolean
  showPenalty?: boolean
  disabled?: boolean
}) {
  const [player, setPlayer] = useState("")
  const [assist, setAssist] = useState("")
  const [isPenalty, setIsPenalty] = useState(false)
  const [open, setOpen] = useState(false)

  const handleSubmit = () => {
    onSubmit(player, assist, isPenalty)
    setPlayer("")
    setAssist("")
    setIsPenalty(false)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full" disabled={disabled}>
          {title}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="player" className="text-right">
              Player
            </label>
            <Input id="player" value={player} onChange={(e) => setPlayer(e.target.value)} className="col-span-3" />
          </div>
          {showAssist && !isPenalty && (
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="assist" className="text-right">
                Assist
              </label>
              <Input id="assist" value={assist} onChange={(e) => setAssist(e.target.value)} className="col-span-3" />
            </div>
          )}
          {showPenalty && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isPenalty"
                checked={isPenalty}
                onCheckedChange={(checked) => setIsPenalty(checked as boolean)}
              />
              <label htmlFor="isPenalty">Penalty</label>
            </div>
          )}
        </div>
        <Button onClick={handleSubmit} className="w-full">
          Add
        </Button>
      </DialogContent>
    </Dialog>
  )
}

