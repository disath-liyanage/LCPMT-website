"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import HTMLFlipBook from "react-pageflip"
import { ChevronLeft, ZoomIn, ZoomOut, Maximize, Minimize, Undo, Redo } from "lucide-react"
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

  let bookShift = 'translateX(0)'
  if (currentPage === 0) {
    bookShift = 'translateX(-25%)'
  } else if (currentPage >= totalPages - 1) {
    bookShift = totalPages % 2 === 0 ? 'translateX(25%)' : 'translateX(-25%)'
  }

  return (
    <div
      ref={containerRef}
      className={`w-full h-full flex flex-col bg-background ${isFullscreen ? "fixed inset-0 z-[100]" : ""}`}
    >

      <div className="flex flex-wrap items-center justify-between p-4 md:p-6 shrink-0 z-50 gap-4">
        <div className="flex items-center gap-4">
          <Link href="/newsletters">
            <Button
              variant="frosted-nav"
              size="icon"
              className="rounded-full size-12 shadow-sm flex items-center justify-center [&_svg]:size-5"
            >
              <ChevronLeft strokeWidth={2} />
            </Button>
          </Link>

          <div className="flex flex-col">
            <h1 className="text-xl md:text-2xl font-semibold tracking-tight leading-tight">
              {title}
            </h1>
            <p className="text-sm font-medium text-muted-foreground tracking-wide">
              {new Date(0, month - 1).toLocaleString('default', { month: 'long' })} {year}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="frosted-pill" size="icon" className="rounded-full" onClick={() => setZoom(z => Math.max(0.5, z - 0.2))}>
            <ZoomOut className="size-5" />
          </Button>
          <Button variant="frosted-pill" size="icon" className="rounded-full" onClick={() => setZoom(z => Math.min(3, z + 0.2))}>
            <ZoomIn className="size-5" />
          </Button>
          <Button variant="frosted-pill" size="icon" className="rounded-full" onClick={toggleFullScreen}>
            {isFullscreen ? <Minimize className="size-5" /> : <Maximize className="size-5" />}
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center overflow-hidden relative touch-none py-8 px-10 md:px-16">

        <div
          className="relative w-full h-full flex flex-col items-center justify-center"
          style={{ transform: `scale(${zoom})`, transformOrigin: 'center center', transition: 'transform 0.2s ease-out' }}
        >

          <div
            className="transition-transform duration-700 ease-in-out"
            style={{ transform: bookShift }}
          >
            <div className={isCoverView ? "" : "shadow-2xl transition-shadow duration-500"}>
              {/* @ts-ignore */}
              <HTMLFlipBook
                width={620}
                height={876}
                size="stretch"
                minWidth={450}
                maxWidth={1150}
                minHeight={636}
                maxHeight={1600}
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
              className="absolute left-0 md:left-2 bottom-6 z-40 p-2 text-foreground/60 hover:text-foreground transition-colors"
            >
              <Undo className="size-7" strokeWidth={1.5} />
            </button>
          )}

          {hasNext && (
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next page"
              className="absolute right-0 md:right-2 bottom-6 z-40 p-2 text-foreground/60 hover:text-foreground transition-colors"
            >
              <Redo className="size-7" strokeWidth={1.5} />
            </button>
          )}

          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-48 h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden z-40">
            <div
              className="h-full bg-primary transition-all duration-300 ease-out rounded-full"
              style={{ width: `${totalPages > 0 ? ((currentPage + 1) / totalPages) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}