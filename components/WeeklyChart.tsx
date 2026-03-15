/**
 * WeeklyChart – SVG bar chart showing daily study minutes
 * Uses react-native-svg for rendering
 */

import React, { useMemo } from 'react'
import { View, StyleSheet, useWindowDimensions } from 'react-native'
import Svg, { Rect, Text as SvgText, G } from 'react-native-svg'
import { useTheme } from '@/context/ThemeContext'
import { spacing, borderRadius, withOpacity } from '@/constants/design'

export interface ChartDay {
  day: string
  minutes: number
}

interface WeeklyChartProps {
  data: ChartDay[]
}

const CHART_HEIGHT = 160
const BAR_VERTICAL_PAD = 32 // space for day labels below bars
const LABEL_HEIGHT = 20
const MIN_BAR_HEIGHT = 4

export default function WeeklyChart({ data }: WeeklyChartProps) {
  const { colors } = useTheme()
  const { width: screenWidth } = useWindowDimensions()

  const chartWidth = screenWidth - spacing.lg * 2 - spacing.md * 2 // account for card padding

  const barAreaHeight = CHART_HEIGHT - LABEL_HEIGHT - spacing.sm

  const maxMinutes = useMemo(() => {
    const max = Math.max(...data.map((d) => d.minutes), 1)
    return max
  }, [data])

  const today = new Date()
  const todayIndex = (today.getDay() + 6) % 7 // Mon=0 … Sun=6

  const barWidth = Math.floor(chartWidth / 7)
  const barInnerWidth = Math.max(barWidth - 10, 12)
  const barX = (i: number) => i * barWidth + (barWidth - barInnerWidth) / 2

  return (
    <View style={styles.container}>
      <Svg width={chartWidth} height={CHART_HEIGHT}>
        {data.map((d, i) => {
          const isActive = i === todayIndex
          const barHeight = Math.max(
            d.minutes > 0 ? Math.round((d.minutes / maxMinutes) * barAreaHeight) : 0,
            d.minutes > 0 ? MIN_BAR_HEIGHT : 0,
          )
          const barY = barAreaHeight - barHeight
          const fillColor = isActive
            ? colors.primary
            : d.minutes > 0
            ? withOpacity(colors.primary, 0.35)
            : withOpacity(colors.border, 0.6)

          return (
            <G key={i}>
              {/* Background track */}
              <Rect
                x={barX(i)}
                y={0}
                width={barInnerWidth}
                height={barAreaHeight}
                rx={barInnerWidth / 2}
                fill={withOpacity(colors.border, 0.3)}
              />
              {/* Value bar */}
              {barHeight > 0 && (
                <Rect
                  x={barX(i)}
                  y={barY}
                  width={barInnerWidth}
                  height={barHeight}
                  rx={barInnerWidth / 2}
                  fill={fillColor}
                />
              )}
              {/* Day label */}
              <SvgText
                x={barX(i) + barInnerWidth / 2}
                y={barAreaHeight + LABEL_HEIGHT}
                textAnchor="middle"
                fontSize={11}
                fontWeight={isActive ? '700' : '500'}
                fill={isActive ? colors.primary : colors.textSecondary}
              >
                {d.day}
              </SvgText>
              {/* Minutes label above bar */}
              {d.minutes > 0 && (
                <SvgText
                  x={barX(i) + barInnerWidth / 2}
                  y={Math.max(barY - 4, 10)}
                  textAnchor="middle"
                  fontSize={9}
                  fontWeight="600"
                  fill={isActive ? colors.primary : colors.textSecondary}
                >
                  {d.minutes >= 60
                    ? `${Math.floor(d.minutes / 60)}h`
                    : `${d.minutes}m`}
                </SvgText>
              )}
            </G>
          )
        })}
      </Svg>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
})
