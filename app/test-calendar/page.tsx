"use client"

import { Calendar } from "@/components/ui/calendar"
import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"

export default function TestCalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())

  return (
    <div className="p-10 flex justify-center">
      <Card className="w-[400px]">
        <CardContent className="p-4 flex justify-center">
            <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border"
            />
        </CardContent>
      </Card>
    </div>
  )
}
