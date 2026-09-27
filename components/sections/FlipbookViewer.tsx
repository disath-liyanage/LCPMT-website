"use client"

import { useState, useRef, useEffect } from "react"
import HTMLFlipBook from "react-pageflip"
import { ChevronLeft, ZoomIn, ZoomOut, Maximize, Minimize, Redo, Undo } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface FlipbookViewerProps {
  pages: string[]
  title: string
  month: number
  year: number
}

export default function FlipbookViewer({ pages, title, month, year }: FlipbookViewerProps) {
  const bookRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const [currentPage, setCurrentPage] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const totalPages = pages.length

  const isCoverView = currentPage === 0 || currentPage >= totalPages - 1
  const hasPrev = currentPage > 0
  const hasNext = currentPage < totalPages - 1

  const handleNext = () => bookRef.current?.pageFlip()?.flipNext()
  const handlePrev = () => bookRef.current?.pageFlip()?.flipPrev()

  const onPageChange = (e: any) => {
    setCurrentPage(e.data)
  }

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => console.error(err))
    } else {
      document.exitFullscreen()
    }
  }

  useEffect(() => {
    const handleFsChange = () => {
      const active = !!document.fullscreenElement
      setIsFullscreen(active)
      if (!active) setZoom(1)
      requestAnimationFrame(() => {
        setTimeout(() => bookRef.current?.pageFlip()?.update(), 50)
      })
    }
    document.addEventListener("fullscreenchange", handleFsChange)
    return () => document.removeEventListener("fullscreenchange", handleFsChange)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      const isTyping = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable
      if (isTyping || e.metaKey || e.ctrlKey || e.altKey) return

      if (e.key === "ArrowLeft") {
        e.preventDefault()
        handlePrev()
      } else if (e.key === "ArrowRight") {
        e.preventDefault()
        handleNext()
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  let bookShift = 'translateX(0)'
  if (currentPage === 0) {
    bookShift = 'translateX(-25%)'
  } else if (currentPage >= totalPages - 1) {
    bookShift = totalPages % 2 === 0 ? 'translateX(25%)' : 'translateX(-25%)'
  }

  return (
    <div
      ref={containerRef}
      className={`w-full h-full flex flex-col bg-[#FBF7ED] ${isFullscreen ? "fixed inset-0 z-[100]" : ""}`}
    >

      <div className="flex flex-wrap items-center justify-between p-4 md:p-6 shrink-0 z-50 gap-4">
        <div className="flex items-center gap-4">
          <Link href="/newsletters">
            <Button
              variant="frosted-nav"
              size="icon"
              className="rounded-full size-12 shadow-sm flex items-center justify-center [&_svg]:size-5 text-[#0F2A1D]"
            >
              <ChevronLeft strokeWidth={2} />
            </Button>
          </Link>

          <div className="flex flex-col">
            <h1 className="font-serif text-xl md:text-2xl font-bold tracking-tight leading-tight text-[#0F2A1D]">
              {title}
            </h1>
            <p className="text-xs font-bold uppercase tracking-wider text-[#2F5D46]">
              {new Date(0, month - 1).toLocaleString('default', { month: 'long' })} {year}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="frosted-pill" size="icon" className="rounded-full text-[#0F2A1D]" onClick={() => setZoom(z => Math.max(0.5, z - 0.2))}>
            <ZoomOut className="size-5" />
          </Button>
          <Button variant="frosted-pill" size="icon" className="rounded-full text-[#0F2A1D]" onClick={() => setZoom(z => Math.min(3, z + 0.2))}>
            <ZoomIn className="size-5" />
          </Button>
          <Button variant="frosted-pill" size="icon" className="rounded-full text-[#0F2A1D]" onClick={toggleFullScreen}>
            {isFullscreen ? <Minimize className="size-5" /> : <Maximize className="size-5" />}
          </Button>
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden flex flex-col items-center justify-center touch-none px-10 md:px-16 pt-1 pb-10">

        <div
          className="relative flex items-center justify-center w-full h-full"
          style={{ transform: `scale(${zoom})`, transformOrigin: 'center center', transition: 'transform 0.2s ease-out' }}
        >

          <div
            className="transition-transform duration-700 ease-in-out"
            style={{ transform: bookShift }}
          >
            <div className={isCoverView ? "" : "shadow-2xl transition-shadow duration-500"}>
              {/* @ts-ignore */}
              <HTMLFlipBook
                width={740}
                height={1046}
                size="stretch"
                minWidth={480}
                maxWidth={1350}
                minHeight={679}
                maxHeight={1912}
                showCover={true}
                usePortrait={false}
                drawShadow={true}
                onFlip={onPageChange}
                ref={bookRef}
              >
                {pages.map((url, i) => {
                  const isCover = i === 0 || i === pages.length - 1
                  return (
                    <div
                      key={i}
                      className="bg-white overflow-hidden"
                      data-density={isCover ? "hard" : "soft"}
                    >
                      <img src={url} alt={`Page ${i + 1}`} className="w-full h-full object-contain" draggable="false" />
                    </div>
                  )
                })}
              </HTMLFlipBook>
            </div>
          </div>

          {hasPrev && (
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous page"
              className="absolute left-0 md:left-2 bottom-6 z-40 p-2 text-[#0F2A1D]/60 hover:text-[#0F2A1D] transition-colors"
            >
              <Undo className="size-7" strokeWidth={1.5} />
            </button>
          )}

          {hasNext && (
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next page"
              className="absolute right-0 md:right-2 bottom-6 z-40 p-2 text-[#0F2A1D]/60 hover:text-[#0F2A1D] transition-colors"
            >
              <Redo className="size-7" strokeWidth={1.5} />
            </button>
          )}
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-48 h-1.5 bg-[#0F2A1D]/10 rounded-full overflow-hidden z-40">
          <div
            className="h-full bg-[#C9A24B] transition-all duration-300 ease-out rounded-full"
            style={{ width: `${totalPages > 0 ? ((currentPage + 1) / totalPages) * 100 : 0}%` }}
          />
        </div>
      </div>
    </div>
  )
}