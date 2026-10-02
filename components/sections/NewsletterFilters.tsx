"use client"

import { useRouter, usePathname, useSearchParams } from 'next/navigation'

interface FilterProps {
  years: number[]
  availableMonths: number[]
  currentYear?: string
  currentMonth?: string
}

export default function NewsletterFilters({ years, availableMonths, currentYear, currentMonth }: FilterProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleFilterChange = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (value) {
      params.set(name, value)
    } else {
      params.delete(name)
    }

    if (name === 'year') {
      params.delete('month')
    }

    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
      <select 
        className="h-11 px-5 py-2 border-2 border-input rounded-full bg-background text-sm font-medium shadow-sm hover:border-primary/50 focus-visible:outline-none focus-visible:border-primary transition-colors cursor-pointer" 
        value={currentYear || ""}
        onChange={(e) => handleFilterChange('year', e.target.value)}
      >
        <option value="">Filter By Year</option>
        {years.map(y => <option key={y} value={y}>{y}</option>)}
      </select>
      
      <select 
        className="h-11 px-5 py-2 border-2 border-input rounded-full bg-background text-sm font-medium shadow-sm hover:border-primary/50 focus-visible:outline-none focus-visible:border-primary transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" 
        value={currentMonth || ""}
        onChange={(e) => handleFilterChange('month', e.target.value)}
        disabled={availableMonths.length === 0}
      >
        <option value="">Filter By Month</option>
        {availableMonths.map(m => (
          <option key={m} value={m}>
            {new Date(0, m - 1).toLocaleString('default', { month: 'long' })}
          </option>
        ))}
      </select>
    </div>
  )
}