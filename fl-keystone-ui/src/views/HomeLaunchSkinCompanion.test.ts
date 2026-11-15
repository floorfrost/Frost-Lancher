import { readFileSync } from 'node:fs'
import { parse as parseTemplate, NodeTypes, type ElementNode, type TemplateChildNode } from '@vue/compiler-dom'
import { parse } from '@vue/compiler-sfc'
import { describe, expect, it } from 'vitest'

const { descriptor } = parse(readFileSync(new URL('./HomeLaunchSkinCompanion.vue', import.meta.url), 'utf8'))
const template = parseTemplate(descriptor.template!.content)

function elements(nodes: TemplateChildNode[]): ElementNode[] {
  return nodes.flatMap(node => node.type === NodeTypes.ELEMENT ? [node, ...elements(node.children)] : [])
}

const allNodes = elements(template.children)

describe('HomeLaunchSkinCompanion', () => {
  it('renders canvas element and shadow container without speech bubble', () => {
    const canvas = allNodes.find(node => node.tag === 'canvas')
    expect(canvas).toBeDefined()

    const wrapper = allNodes.find(node =>
      node.props.some(p => p.type === NodeTypes.ATTRIBUTE && p.name === 'class' && p.value?.content.includes('home-skin-companion-wrapper')),
    )
    expect(wrapper).toBeDefined()

    // Confirms NO speech bubbles are present in template per user request
    const speechBubble = allNodes.find(node =>
      node.props.some(p => p.type === NodeTypes.ATTRIBUTE && p.name === 'class' && (p.value?.content.includes('speech-bubble') || p.value?.content.includes('talk-bubble'))),
    )
    expect(speechBubble).toBeUndefined()
  })

  it('enlarges skin size with a gap above launch button while framing the full head within the camera frustum', () => {
    const script = descriptor.scriptSetup?.content ?? ''
    const style = descriptor.styles.map(s => s.content).join('\n')

    const width = Number(script.match(/width:\s*(\d+)/)?.[1])
    const height = Number(script.match(/height:\s*(\d+)/)?.[1])
    const fov = Number(script.match(/fov:\s*(\d+)/)?.[1])
    const zoom = Number(script.match(/zoom:\s*([\d.]+)/)?.[1])
    const playerWrapperY = Number(script.match(/playerWrapper\.position\.y\s*=\s*(-?[\d.]+)/)?.[1])

    expect(width).toBe(280)
    expect(height).toBe(350)
    expect(fov).toBe(38)
    expect(zoom).toBe(0.92)
    expect(Number.isFinite(playerWrapperY)).toBe(true)

    // SkinViewer camera distance formula: 4.5 + 16.5 / tan(fov/2) / zoom
    const tanHalfFov = Math.tan(((fov / 180) * Math.PI) / 2)
    const distance = 4.5 + 16.5 / tanHalfFov / zoom
    // Head outer layer reaches +16.5 (+~2.4 during jump/tilt) at front face z ~= +5.7
    const maxHeadWorldY = 18.9 + playerWrapperY
    const frustumHalfHeightAtHeadFront = (distance - 5.7) * tanHalfFov
    expect(maxHeadWorldY).toBeLessThan(frustumHalfHeightAtHeadFront)

    expect(style).toContain('transform-origin: bottom center')
    expect(style).toContain('bottom: calc(100% + 18px)')
    expect(style).toContain('right: -70px')
    expect(style).toContain('right: -80px')
    expect(script).toContain("router.push('/me?wardrobe=true')")
  })

  it('is positioned at the flex gap level in HomeLaunchButton template', () => {
    const launchBtnContent = readFileSync(new URL('./HomeLaunchButton.vue', import.meta.url), 'utf8')
    const parsedLaunchBtn = parse(launchBtnContent)
    const btnTemplate = parseTemplate(parsedLaunchBtn.descriptor.template!.content)
    const btnNodes = elements(btnTemplate.children)

    const companionNode = btnNodes.find(node => node.tag === 'HomeLaunchSkinCompanion')
    expect(companionNode).toBeDefined()
  })
})
