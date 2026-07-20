'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

export default function CalendarFilter({ selectedDateStr }: { selectedDateStr?: string }) {
  const router = useRouter()
  const today = new Date()
  
  // Default to the selected date's month, or current month
  const initialDate = selectedDateStr ? new Date(selectedDateStr) : today
  const [currentMonth, setCurrentMonth] = useState(new Date(initialDate.getFullYear(), initialDate.getMonth(), 1))

  const handleDateClick = (day: number) => {
    const selected = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    const yyyy = selected.getFullYear()
    const mm = String(selected.getMonth() + 1).padStart(2, '0')
    const dd = String(selected.getDate()).padStart(2, '0')
    router.push(`/?date=${yyyy}-${mm}-${dd}`)
  }

  const handleClear = () => {
    router.push('/')
  }

  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate()
  const firstDayIndex = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay()

  const days = []
  for (let i = 0; i < firstDayIndex; i++) days.push(null)
  for (let i = 1; i <= daysInMonth; i++) days.push(i)

  const monthNames = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ]

  return (
    <div className="w-full select-none">
      <div className="flex justify-between items-center mb-4 px-2">
        <button onClick={prevMonth} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="font-bold text-slate-800 text-sm tracking-wide">
          {monthNames[currentMonth.getMonth()]} - {currentMonth.getFullYear()}
        </span>
        <button onClick={nextMonth} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
      
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-400 mb-2">
        {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map(d => <div key={d} className="py-2">{d}</div>)}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {days.map((d, i) => {
          if (d === null) return <div key={i} className="h-10" />
          
          const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
          const isSelected = selectedDateStr === dateStr
          const isToday = today.getDate() === d && today.getMonth() === currentMonth.getMonth() && today.getFullYear() === currentMonth.getFullYear()

          return (
            <button 
              key={i} 
              onClick={() => handleDateClick(d)}
              className={`h-10 rounded-xl flex items-center justify-center text-sm font-medium transition-all duration-200
                ${isSelected 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-bold transform scale-105' 
                  : isToday 
                    ? 'bg-blue-50 text-blue-600 font-bold hover:bg-blue-100'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
            >
              {d}
            </button>
          )
        })}
      </div>

      {selectedDateStr && (
        <button 
          onClick={handleClear}
          className="mt-6 w-full py-2.5 bg-red-50 text-red-600 font-medium text-sm rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
        >
          <X className="w-4 h-4" /> Bỏ chọn ngày
        </button>
      )}
    </div>
  )
}
