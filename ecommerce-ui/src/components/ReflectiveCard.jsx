import { memo, useRef } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { CheckmarkBadge01Icon, FingerPrintIcon } from '@hugeicons/core-free-icons'
import './ReflectiveCard.css'

const THEMES = {
  dark: {
    '--rc-base': '#1d1c22',
    '--rc-ink': '#f4f4f5',
    '--rc-muted': 'rgba(244, 244, 245, 0.65)',
    '--rc-rim': 'rgba(255, 255, 255, 0.14)',
    '--rc-shadow': '0 18px 38px -20px rgba(0, 0, 0, 0.5)',
  },
  light: {
    '--rc-base': '#f3f4f1',
    '--rc-ink': '#20231f',
    '--rc-muted': '#767b73',
    '--rc-rim': 'rgba(30, 70, 58, 0.16)',
    '--rc-shadow': '0 18px 38px -22px rgba(24, 40, 32, 0.3)',
  },
}

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))
const toCssSize = (value) => (typeof value === 'number' ? `${value}px` : value)

function ReflectiveCard({
  name = 'Alexander Doe',
  role = 'Senior Developer',
  badge = 'Verified',
  status = 'Active',
  statusColor = '#22c55e',
  idLabel = 'ID number',
  idValue = '8901 2345 6789',
  children,
  theme = 'dark',
  metalness = 1,
  roughness = 0.3,
  shine = 1,
  bevel = 3,
  glare = 0.5,
  enableTilt = true,
  tiltStrength = 12,
  intro = true,
  width = 320,
  height = 500,
  radius = 24,
  className = '',
  style,
}) {
  const bodyRef = useRef(null)
  const selectedTheme = theme === 'light' ? 'light' : 'dark'
  const cardStyle = {
    ...THEMES[selectedTheme],
    '--rc-width': toCssSize(width),
    '--rc-height': toCssSize(height),
    '--rc-radius': `${Math.max(0, radius)}px`,
    '--rc-status': statusColor,
    '--rc-metalness': clamp(metalness, 0, 1),
    '--rc-roughness': clamp(roughness, 0, 1),
    '--rc-shine': clamp(shine, 0, 3),
    '--rc-bevel': `${clamp(bevel, 0, 16)}px`,
    '--rc-glare': clamp(glare, 0, 1),
    ...style,
  }

  function handlePointerMove(event) {
    const body = bodyRef.current
    if (!body || !enableTilt || event.pointerType !== 'mouse') return

    const bounds = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX - bounds.left) / bounds.width
    const y = (event.clientY - bounds.top) / bounds.height
    const strength = clamp(tiltStrength, 0, 20)
    body.style.setProperty('--rc-rotate-x', `${(0.5 - y) * strength}deg`)
    body.style.setProperty('--rc-rotate-y', `${(x - 0.5) * strength}deg`)
    body.style.setProperty('--rc-glare-x', `${x * 100}%`)
    body.style.setProperty('--rc-glare-y', `${y * 100}%`)
  }

  function resetPointer() {
    const body = bodyRef.current
    if (!body) return
    body.style.setProperty('--rc-rotate-x', '0deg')
    body.style.setProperty('--rc-rotate-y', '0deg')
    body.style.setProperty('--rc-glare-x', '50%')
    body.style.setProperty('--rc-glare-y', '50%')
  }

  return (
    <div
      className={`reflective-card${intro ? ' reflective-card--intro' : ''} ${className}`.trim()}
      style={cardStyle}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetPointer}
    >
      <div ref={bodyRef} className="reflective-card__body">
        <div className="reflective-card__content">
          {children ?? (
            <>
              {(badge || status) && (
                <div className="reflective-card__header">
                  {badge && (
                    <span className="reflective-card__badge">
                      <HugeiconsIcon icon={CheckmarkBadge01Icon} size={16} strokeWidth={1.8} />
                      {badge}
                    </span>
                  )}
                  {status && (
                    <span className="reflective-card__status">
                      <span className="reflective-card__dot" />
                      {status}
                    </span>
                  )}
                </div>
              )}
              <div className="reflective-card__identity">
                {name && <h3 className="reflective-card__name">{name}</h3>}
                {role && <p className="reflective-card__role">{role}</p>}
              </div>
              {(idLabel || idValue) && (
                <div className="reflective-card__footer">
                  <div className="reflective-card__id">
                    {idLabel && <span className="reflective-card__label">{idLabel}</span>}
                    {idValue && <span className="reflective-card__value">{idValue}</span>}
                  </div>
                  <span className="reflective-card__tile">
                    <HugeiconsIcon icon={FingerPrintIcon} size={22} strokeWidth={1.6} />
                  </span>
                </div>
              )}
            </>
          )}
        </div>
        <span className="reflective-card__shine" aria-hidden="true" />
        <span className="reflective-card__rim" aria-hidden="true" />
      </div>
    </div>
  )
}

export default memo(ReflectiveCard)
