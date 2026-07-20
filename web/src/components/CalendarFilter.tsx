'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, parseISO } from 'date-fns'

export function CalendarFilter({ activeDates }: { activeDates: string[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedDateParam = searchParams.get('date')
  const selectedDate = selectedDateParam ? parseISO(selectedDateParam) : new Date()

  const monthStart = startOfMonth(selectedDate)
  const monthEnd = endOfMonth(selectedDate)
  const startDate = monthStart // We could add padding for grid here but keep it simple
  
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const handleDateClick = (date: Date) => {
    const formatted = format(date, 'yyyy-MM-dd')
    router.push(`/?date=${formatted}`)
  }

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-slate-800">{format(selectedDate, 'MMMM yyyy')}</h3>
        <button 
          onClick={() => router.push('/')}
          className="text-xs text-indigo-600 hover:underline"
        >
          Today
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2 text-slate-500 font-medium">
        <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-sm">
        {Array.from({ length: monthStart.getDay() }).map((_, i) => (
          <div key={`empty-${i}`} className="p-2" />
        ))}
        {days.map((day) => {
          const isSelected = isSameDay(day, selectedDate) && selectedDateParam
          const dateStr = format(day, 'yyyy-MM-dd')
          const hasReport = activeDates.includes(dateStr)

          return (
            <button
              key={day.toString()}
              onClick={() => handleDateClick(day)}
              className={`
                p-2 rounded-lg flex items-center justify-center relative transition-all
                ${isSelected ? 'bg-indigo-600 text-white font-bold shadow-md' : 'text-slate-700 hover:bg-slate-100'}
              `}
            >
              <span>{format(day, 'd')}</span>
              {hasReport && !isSelected && (
                <span className="absolute bottom-1 w-1 h-1 bg-indigo-500 rounded-full"></span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
