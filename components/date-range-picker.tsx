"use client"

import { useState, useMemo } from "react"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from "lucide-react"

interface DateRangePickerProps {
  dateRange: { from: Date | null; to: Date | null }
  setDateRange: (range: { from: Date | null; to: Date | null }) => void
  updateDates: Set<string>
}

export function DateRangePicker({ dateRange, setDateRange, updateDates }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())

  // Pomocnicze funkcje do kalendarza
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay()
  // Przesunięcie dni, żeby tydzień zaczynał się od poniedziałku (0 = Pon, 6 = Nie)
  const startDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))

  const handleDayClick = (day: number) => {
    const clickedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    
    // Logika zaznaczania zakresu
    if (!dateRange.from || (dateRange.from && dateRange.to)) {
      setDateRange({ from: clickedDate, to: null })
    } else {
      if (clickedDate < dateRange.from) {
        setDateRange({ from: clickedDate, to: dateRange.from })
      } else {
        setDateRange({ from: dateRange.from, to: clickedDate })
      }
    }
  }

  const resetDates = (e: React.MouseEvent) => {
    e.stopPropagation()
    setDateRange({ from: null, to: null })
  }

  // Formatowanie do przycisku
  const formatDate = (date: Date | null) => {
    if (!date) return ""
    return date.toLocaleDateString("pl-PL", { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  const buttonText = dateRange.from 
    ? `${formatDate(dateRange.from)} - ${dateRange.to ? formatDate(dateRange.to) : "Wybierz koniec"}`
    : "Zakres dat"

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors text-sm font-medium text-foreground w-full sm:w-auto border border-border"
      >
        <CalendarIcon className="w-4 h-4 text-muted-foreground" />
        <span>{buttonText}</span>
        {dateRange.from && (
          <X 
            className="w-4 h-4 ml-2 text-muted-foreground hover:text-foreground transition-colors" 
            onClick={resetDates} 
          />
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 p-4 w-72 bg-card border border-border rounded-xl shadow-xl z-20">
            {/* Nagłówek kalendarza */}
            <div className="flex items-center justify-between mb-4">
              <button onClick={prevMonth} className="p-1 hover:bg-secondary rounded-md">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-semibold text-sm">
                {currentMonth.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' })}
              </span>
              <button onClick={nextMonth} className="p-1 hover:bg-secondary rounded-md">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Dni tygodnia */}
            <div className="grid grid-cols-7 gap-1 mb-2 text-center">
              {['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb', 'Nd'].map(day => (
                <div key={day} className="text-xs font-medium text-muted-foreground">{day}</div>
              ))}
            </div>

            {/* Siatka dni */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: startDay }).map((_, i) => (
                <div key={`empty-${i}`} className="h-8" />
              ))}
              
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1
                const dateObj = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
                // Formatujemy datę do YYYY-MM-DD, żeby sprawdzić czy jest update
                const dateString = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                
                const hasUpdate = updateDates.has(dateString)
                
                // Sprawdzanie czy dzień jest zaznaczony
                const isFrom = dateRange.from?.getTime() === dateObj.getTime()
                const isTo = dateRange.to?.getTime() === dateObj.getTime()
                const isInRange = dateRange.from && dateRange.to && dateObj > dateRange.from && dateObj < dateRange.to
                
                let baseClasses = "relative h-8 rounded-md flex items-center justify-center text-sm transition-colors cursor-pointer "
                
                if (isFrom || isTo) {
                  baseClasses += "bg-primary text-primary-foreground font-bold "
                } else if (isInRange) {
                  baseClasses += "bg-primary/20 text-foreground "
                } else {
                  baseClasses += "text-foreground hover:bg-secondary "
                }

                return (
                  <button
                    key={day}
                    onClick={() => handleDayClick(day)}
                    className={baseClasses}
                  >
                    {day}
                    {hasUpdate && (
                      <span className={`absolute bottom-1 w-1 h-1 rounded-full ${isFrom || isTo ? 'bg-primary-foreground' : 'bg-primary'}`} />
                    )}
                  </button>
                )
              })}
            </div>
            <div className="mt-4 text-xs text-muted-foreground text-center flex items-center justify-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block"></span>
              Dni z zapisanym stanem konta
            </div>
          </div>
        </>
      )}
    </div>
  )
}