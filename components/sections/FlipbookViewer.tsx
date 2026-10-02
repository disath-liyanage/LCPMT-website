"use client"

import { useState, useRef, useEffect } from "react"
import HTMLFlipBook from "react-pageflip"
import { ChevronLeft, ZoomIn, ZoomOut, Maximize, Minimize, Redo, Undo, Volume2, VolumeX } from "lucide-react"
import { HugeiconsIcon } from "@hugeicons/react"
import { ScreenRotationFreeIcons } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface FlipbookViewerProps {
  pages: string[]
  title: string
  month: number
  year: number
}

const PAGE_RATIO = 1046 / 740
const MAX_ZOOM = 3

type GestureMode = "none" | "swipe" | "pan" | "pinch"

export default function FlipbookViewer({ pages, title, month, year }: FlipbookViewerProps) {
  const bookRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const areaRef = useRef<HTMLDivElement>(null)
  const soundOnRef = useRef(true)
  const flipAudioRef = useRef<HTMLAudioElement | null>(null)
  const cornerAudioRef = useRef<HTMLAudioElement | null>(null)
  const lastCornerRef = useRef(0)
  const gesture = useRef({
    mode: "none" as GestureMode,
    sx: 0,
    sy: 0,
    lx: 0,
    ly: 0,
    startDist: 0,
    startZoom: 1,
    lmx: 0,
    lmy: 0,
  })

  const [currentPage, setCurrentPage] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [gesturing, setGesturing] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [soundOn, setSoundOn] = useState(true)

  const [ready, setReady] = useState(false)
  const [isCompact, setIsCompact] = useState(false)
  const [isPortrait, setIsPortrait] = useState(false)
  const [isTouch, setIsTouch] = useState(false)
  const [canFullscreen, setCanFullscreen] = useState(false)
  const [forceRotate, setForceRotate] = useState(false)
  const [area, setArea] = useState<{ w: number; h: number } | null>(null)

  const totalPages = pages.length

  const canToggleRotate = isCompact && isPortrait && isTouch
  const rotated = canToggleRotate && forceRotate
  const singlePage = isCompact && isPortrait && !rotated

  const isCoverView = currentPage === 0 || currentPage >= totalPages - 1
  const hasPrev = currentPage > 0
  const hasNext = currentPage < totalPages - 1

  const handleNext = () => bookRef.current?.pageFlip()?.flipNext()
  const handlePrev = () => bookRef.current?.pageFlip()?.flipPrev()

  const resetView = () => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }

  useEffect(() => {
    const flip = new Audio("/sounds/turn.mp3")
    const corner = new Audio("/sounds/corner.mp3")
    flip.preload = corner.preload = "auto"
    flip.volume = 0.8
    corner.volume = 0.6
    flipAudioRef.current = flip
    cornerAudioRef.current = corner

    const prime = () => {
      ;[flip, corner].forEach((a) => {
        a.muted = true
        a.play()
          .then(() => {
            a.pause()
            a.currentTime = 0
            a.muted = false
          })
          .catch(() => {
            a.muted = false
          })
      })
    }
    window.addEventListener("pointerdown", prime, { once: true })
    return () => window.removeEventListener("pointerdown", prime)
  }, [])

  const playClone = (a: HTMLAudioElement | null) => {
    if (!soundOnRef.current || !a) return
    const c = a.cloneNode() as HTMLAudioElement
    c.volume = a.volume
    c.play().catch(() => {})
  }

  const playFlipSound = () => playClone(flipAudioRef.current)

  const playCornerSound = () => {
    const now = Date.now()
    if (now - lastCornerRef.current < 600) return
    lastCornerRef.current = now
    playClone(cornerAudioRef.current)
  }

  const toggleSound = () => {
    setSoundOn((s) => {
      soundOnRef.current = !s
      return !s
    })
  }

  const onPageChange = (e: any) => {
    setCurrentPage(e.data)
    if (isCompact) resetView()
  }

  const onChangeState = (e: any) => {
    if (e.data === "flipping") playFlipSound()
    else if (e.data === "fold_corner") playCornerSound()
  }

  const toggleFullScreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen()
      } else {
        await document.exitFullscreen()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleBack = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {})
    }
  }

  const clampPan = (x: number, y: number, z: number) => {
    const mx = ((z - 1) * (area?.w ?? 0)) / 2
    const my = ((z - 1) * (area?.h ?? 0)) / 2
    return { x: Math.max(-mx, Math.min(mx, x)), y: Math.max(-my, Math.min(my, y)) }
  }

  const toContent = (dx: number, dy: number) => (rotated ? { x: dy, y: -dx } : { x: dx, y: dy })

  const dist = (t: React.TouchList) => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY)
  const mid = (t: React.TouchList) => ({
    x: (t[0].clientX + t[1].clientX) / 2,
    y: (t[0].clientY + t[1].clientY) / 2,
  })

  const onTouchStart = (e: React.TouchEvent) => {
    if (!isCompact) return
    const g = gesture.current
    if (e.touches.length >= 2) {
      const m = mid(e.touches)
      g.mode = "pinch"
      g.startDist = dist(e.touches)
      g.startZoom = zoom
      g.lmx = m.x
      g.lmy = m.y
      setGesturing(true)
    } else if (e.touches.length === 1) {
      const t = e.touches[0]
      g.mode = zoom > 1.02 ? "pan" : "swipe"
      g.sx = g.lx = t.clientX
      g.sy = g.ly = t.clientY
      if (g.mode === "pan") setGesturing(true)
    }
  }

  const onTouchMove = (e: React.TouchEvent) => {
    if (!isCompact) return
    const g = gesture.current

    if (g.mode === "pinch" && e.touches.length >= 2) {
      const d = dist(e.touches)
      const m = mid(e.touches)
      const nextZoom = Math.max(1, Math.min(MAX_ZOOM, g.startZoom * (d / g.startDist)))
      const c = toContent(m.x - g.lmx, m.y - g.lmy)
      g.lmx = m.x
      g.lmy = m.y
      setZoom(nextZoom)
      setPan((p) => clampPan(p.x + c.x, p.y + c.y, nextZoom))
    } else if (g.mode === "pan" && e.touches.length === 1) {
      const t = e.touches[0]
      const c = toContent(t.clientX - g.lx, t.clientY - g.ly)
      g.lx = t.clientX
      g.ly = t.clientY
      setPan((p) => clampPan(p.x + c.x, p.y + c.y, zoom))
    } else if (g.mode === "swipe" && e.touches.length === 1) {
      g.lx = e.touches[0].clientX
      g.ly = e.touches[0].clientY
    }
  }

  const finishGesture = (e: React.TouchEvent, allowSwipe: boolean) => {
    if (!isCompact) return
    const g = gesture.current

    if (e.touches.length === 1 && g.mode === "pinch") {
      g.mode = zoom > 1.02 ? "pan" : "none"
      g.lx = e.touches[0].clientX
      g.ly = e.touches[0].clientY
      return
    }
    if (e.touches.length > 0) return

    if (allowSwipe && g.mode === "swipe") {
      const dx = g.lx - g.sx
      const dy = g.ly - g.sy
      if (rotated) {
        if (Math.abs(dy) > 40 && Math.abs(dy) > Math.abs(dx)) {
          if (dy < 0) handleNext()
          else handlePrev()
        }
      } else if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0) handleNext()
        else handlePrev()
      }
    }

    g.mode = "none"
    setGesturing(false)
    if (zoom < 1.05) resetView()
  }

  useEffect(() => {
    const compactMq = window.matchMedia("(max-width: 767px), ((max-height: 500px) and (pointer: coarse))")
    const portraitMq = window.matchMedia("(orientation: portrait)")
    const touchMq = window.matchMedia("(pointer: coarse)")

    const sync = () => {
      setIsCompact(compactMq.matches)
      setIsPortrait(portraitMq.matches)
      setIsTouch(touchMq.matches)
      if (!portraitMq.matches) setForceRotate(false)
    }
    sync()
    setCanFullscreen(Boolean(document.fullscreenEnabled))
    setReady(true)

    compactMq.addEventListener("change", sync)
    portraitMq.addEventListener("change", sync)
    touchMq.addEventListener("change", sync)
    return () => {
      compactMq.removeEventListener("change", sync)
      portraitMq.removeEventListener("change", sync)
      touchMq.removeEventListener("change", sync)
    }
  }, [])

  useEffect(() => {
    const el = areaRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setArea({ w: Math.floor(width), h: Math.floor(height) })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const handleFsChange = () => {
      const active = !!document.fullscreenElement
      setIsFullscreen(active)
      if (!active) {
        setZoom(1)
        setPan({ x: 0, y: 0 })
      }
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

  useEffect(() => {
    return () => {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {})
      }
    }
  }, [])

  let pageW = 0
  let pageH = 0
  if (isCompact && area && area.w > 0 && area.h > 0) {
    const maxW = singlePage ? area.w : area.w / 2
    pageW = Math.floor(Math.min(maxW, area.h / PAGE_RATIO))
    pageH = Math.floor(pageW * PAGE_RATIO)
  }
  const compactReady = isCompact && pageW > 0
  const canRenderBook = ready && (!isCompact || compactReady)

  let bookShift = "translateX(0)"
  if (!singlePage) {
    if (currentPage === 0) {
      bookShift = "translateX(-25%)"
    } else if (currentPage >= totalPages - 1) {
      bookShift = totalPages % 2 === 0 ? "translateX(25%)" : "translateX(-25%)"
    }
  }

  const arrowBase =
    "absolute z-[60] p-2 text-[#0F2A1D]/60 hover:text-[#0F2A1D] active:text-[#0F2A1D] transition-colors"

  const rotatedStyle: React.CSSProperties | undefined = rotated
    ? {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100dvh",
        height: "100dvw",
        transformOrigin: "top left",
        transform: "translateX(100dvw) rotate(90deg)",
        zIndex: 100,
      }
    : undefined

  const bookProps = isCompact
    ? { size: "fixed" as const, width: pageW, height: pageH, minWidth: 100, maxWidth: 2000, minHeight: 140, maxHeight: 3000 }
    : { size: "stretch" as const, width: 740, height: 1046, minWidth: 480, maxWidth: 1350, minHeight: 679, maxHeight: 1912 }

  return (
    <div
      ref={containerRef}
      style={rotatedStyle}
      className={cn(
        "bg-[#FBF7ED] flex flex-col",
        rotated ? "overflow-hidden" : "w-full h-full",
        isFullscreen && !rotated && "fixed inset-0 z-[100] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]"
      )}
    >
      <div
        className={cn(
          "flex items-center justify-between shrink-0 z-50",
          isCompact ? "gap-2 px-2 py-2" : "flex-wrap gap-4 p-4 md:p-6"
        )}
      >
        <div className={cn("flex items-center min-w-0", isCompact ? "gap-2" : "gap-4")}>
          <Link href="/newsletters" aria-label="Back to newsletters" onClick={handleBack}>
            <Button
              variant="frosted-nav"
              size="icon"
              className={cn(
                "rounded-full shadow-sm flex items-center justify-center [&_svg]:size-5 text-[#0F2A1D]",
                isCompact ? "size-11" : "size-12"
              )}
            >
              <ChevronLeft strokeWidth={2} />
            </Button>
          </Link>

          <div className="flex flex-col min-w-0">
            <h1
              className={cn(
                "font-serif font-bold tracking-tight leading-tight text-[#0F2A1D] truncate",
                isCompact ? "text-base" : "text-xl md:text-2xl"
              )}
            >
              {title}
            </h1>
            <p className="text-xs font-bold uppercase tracking-wider text-[#2F5D46]">
              {new Date(0, month - 1).toLocaleString("default", { month: "long" })} {year}
            </p>
          </div>
        </div>

        <div className={cn("flex items-center shrink-0", isCompact ? "gap-2" : "gap-3")}>
          {canToggleRotate && (
            <Button
              variant="frosted-pill"
              size="icon"
              aria-label={rotated ? "Use normal portrait view" : "Rotate view to landscape"}
              className="rounded-full text-[#0F2A1D] size-11"
              onClick={() => {
                setForceRotate((r) => !r)
                resetView()
              }}
            >
              <HugeiconsIcon icon={ScreenRotationFreeIcons} size={22} />
            </Button>
          )}

          {!isCompact && (
            <>
              <Button
                variant="frosted-pill"
                size="icon"
                aria-label="Zoom out"
                className="rounded-full text-[#0F2A1D]"
                onClick={() => setZoom((z) => Math.max(0.5, z - 0.2))}
              >
                <ZoomOut className="size-5" />
              </Button>
              <Button
                variant="frosted-pill"
                size="icon"
                aria-label="Zoom in"
                className="rounded-full text-[#0F2A1D]"
                onClick={() => setZoom((z) => Math.min(MAX_ZOOM, z + 0.2))}
              >
                <ZoomIn className="size-5" />
              </Button>
            </>
          )}

          <Button
            variant="frosted-pill"
            size="icon"
            aria-label={soundOn ? "Mute page sound" : "Unmute page sound"}
            className={cn("rounded-full text-[#0F2A1D]", isCompact && "size-11")}
            onClick={toggleSound}
          >
            {soundOn ? <Volume2 className="size-5" /> : <VolumeX className="size-5" />}
          </Button>

          {canFullscreen && (
            <Button
              variant="frosted-pill"
              size="icon"
              aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
              className={cn("rounded-full text-[#0F2A1D]", isCompact && "size-11")}
              onClick={toggleFullScreen}
            >
              {isFullscreen ? <Minimize className="size-5" /> : <Maximize className="size-5" />}
            </Button>
          )}
        </div>
      </div>

      <div
        ref={areaRef}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={(e) => finishGesture(e, true)}
        onTouchCancel={(e) => finishGesture(e, false)}
        className={cn(
          "isolate flex-1 relative overflow-hidden flex flex-col items-center justify-center touch-none",
          isCompact ? (rotated ? "px-12 pt-0 pb-12" : "px-2 pt-0 pb-12") : "px-10 md:px-16 pt-1 pb-10"
        )}
      >
        <div
          className={cn(
            "absolute left-1/2 -translate-x-1/2 w-48 h-1.5 bg-[#0F2A1D]/10 rounded-full overflow-hidden z-10",
            isCompact ? "bottom-5" : "bottom-8"
          )}
        >
          <div
            className="h-full bg-[#2F6B4A] transition-all duration-300 ease-out rounded-full"
            style={{ width: `${totalPages > 0 ? ((currentPage + 1) / totalPages) * 100 : 0}%` }}
          />
        </div>

        <div
          className="relative z-50 flex items-center justify-center w-full h-full"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "center center",
            transition: gesturing ? "none" : "transform 0.2s ease-out",
          }}
        >
          <div className="transition-transform duration-700 ease-in-out" style={{ transform: bookShift }}>
            <div className={isCoverView ? "" : "shadow-2xl transition-shadow duration-500"}>
              {canRenderBook && (
                // @ts-ignore
                <HTMLFlipBook
                  key={`${singlePage ? "single" : "spread"}-${pageW}-${pageH}`}
                  {...bookProps}
                  startPage={currentPage}
                  showCover={true}
                  usePortrait={singlePage}
                  useMouseEvents={!isCompact}
                  showPageCorners={true}
                  drawShadow={true}
                  onFlip={onPageChange}
                  onChangeState={onChangeState}
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
              )}
            </div>
          </div>
        </div>

        {hasPrev && (
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous page"
            className={cn(arrowBase, isCompact ? "left-2 bottom-1.5" : "left-10 md:left-[72px] bottom-16")}
          >
            <Undo className={isCompact ? "size-8" : "size-7"} strokeWidth={1.5} />
          </button>
        )}

        {hasNext && (
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next page"
            className={cn(arrowBase, isCompact ? "right-2 bottom-1.5" : "right-10 md:right-[72px] bottom-16")}
          >
            <Redo className={isCompact ? "size-8" : "size-7"} strokeWidth={1.5} />
          </button>
        )}
      </div>
    </div>
  )
}