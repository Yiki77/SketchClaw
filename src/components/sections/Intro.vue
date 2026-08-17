<script lang="ts" setup>

import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref
} from 'vue'

import {
  Delete,
  Refresh,
  RefreshLeft,
  RefreshRight,
  ZoomIn,
  ZoomOut
} from '@element-plus/icons-vue'


// ============================================================
// Types
// ============================================================

interface GalleryConfig {
  id: string
  title: string
  caption: string
  svg: string
  draft: string

  // Intro 里的三个例子同时承担方法展示。
  // 这些目录只需要放与当前 Intro example 对应的数据。
  conceptManifest: string
  reasoningFolder: string
  refineFolder: string
}


type IntroMethodStage =
  | 'concept'
  | 'reasoning'
  | 'refinement'


interface ConceptAsset {
  id: string
  name: string
  file: string
  markup: string
}


interface ReasoningStep {
  step: number
  image: string
  imageName: string
  code: string
}


interface EditableObject {
  key: string
  label: string

  x: number
  y: number

  scale: number
  rotation: number

  centerX: number
  centerY: number

  deleted: boolean
}


interface GalleryItem extends GalleryConfig {
  loading: boolean
  error: string
  svgMarkup: string

  objects: EditableObject[]
  selectedKey: string | null

  draftExpanded: boolean

  activeMethodStage: IntroMethodStage

  conceptAssets: ConceptAsset[]
  conceptLoading: boolean
  conceptError: string

  reasoningSteps: ReasoningStep[]
  reasoningCurrentStep: number
  reasoningLoading: boolean
  reasoningError: string

  refinementFrames: string[]
  refinementCurrentStep: number
  refinementLoading: boolean
  refinementError: string
}


interface SvgBounds {
  minX: number
  minY: number
  maxX: number
  maxY: number
}


// ============================================================
// Gallery data
// ============================================================

const galleryConfigs: GalleryConfig[] = [

  {
    id: 'gallery-1',

    title: 'Example 1',

    caption:
      'A chef in the kitchen.',

    svg:
      '/carousel/1-chef.svg',

    draft:
      '/carousel/1-chef_draft.jpg',

    conceptManifest:
      '/concept/1/manifest.json',

    reasoningFolder:
      '/layout_process/1',

    refineFolder:
      '/refine/1'
  },


  {
    id: 'gallery-2',

    title: 'Example 2',

    caption:
      'A staggered city skyline of spires, domes, and clock towers; street trees and lampposts line the foreground, and flocks of birds fly in the sky.',

    svg:
      '/carousel/2-city.svg',

    draft:
      '/carousel/2-city_draft.jpg',

    conceptManifest:
      '/concept/2/manifest.json',

    reasoningFolder:
      '/layout_process/2',

    refineFolder:
      '/refine/2'
  },


  {
    id: 'gallery-3',

    title: 'Example 3',

    caption:
      'Four ducks are swimming in the pool.',

    svg:
      '/carousel/3-ducks.svg',

    draft:
      '/carousel/3-ducks_draft.jpg',

    conceptManifest:
      '/concept/3/manifest.json',

    reasoningFolder:
      '/layout_process/3',

    refineFolder:
      '/refine/3'
  }

]


// ============================================================
// State
// ============================================================

const galleryItems = reactive<GalleryItem[]>(

  galleryConfigs.map((config) => ({

    ...config,

    loading: true,

    error: '',

    svgMarkup: '',

    objects: [],

    selectedKey: null,

    // Draft 默认展开
    draftExpanded: true,

    // Intro 默认先展示完整可编辑结果；上方三个方法阶段始终可见。
    activeMethodStage: 'concept',

    conceptAssets: [],
    conceptLoading: true,
    conceptError: '',

    reasoningSteps: [],
    reasoningCurrentStep: 0,
    reasoningLoading: true,
    reasoningError: '',

    refinementFrames: [],
    refinementCurrentStep: 0,
    refinementLoading: true,
    refinementError: ''

  }))

)


// ============================================================
// Constants
// ============================================================

// ============================================================
// Intro example navigation + method state
// ============================================================

const activeExampleIndex = ref(0)

const activeGalleryItem = computed(() => {
  return galleryItems[activeExampleIndex.value]
})

const isReasoningPlaying = ref(false)
const isRefinementPlaying = ref(false)

let reasoningPlaybackTimer:
  number | null = null

let refinementPlaybackTimer:
  number | null = null

const REASONING_PLAYBACK_INTERVAL = 850
const REFINEMENT_PLAYBACK_INTERVAL = 850

const MAX_REFINEMENT_FRAME_COUNT = 100


const SVG_NAMESPACE =
  'http://www.w3.org/2000/svg'


const MIN_SCALE = 0.25

const MAX_SCALE = 2.5


/*
  数值越大，Detailed 场景显示得越小，
  四周留白越多。
*/

const SVG_FIT_PADDING_RATIO = 0.08

const SVG_FIT_MIN_PADDING = 16


/*
  当源 SVG 不包含 width、height 或 viewBox 时，
  使用默认画布尺寸。
*/

const DEFAULT_SVG_WIDTH = 780

const DEFAULT_SVG_HEIGHT = 780

const moreResultsUrl =
  `${import.meta.env.BASE_URL}more-results.html`


let stopActiveInteraction:
  (() => void)
  | null = null


// ============================================================
// General helpers
// ============================================================

const clamp = (
  value: number,
  minimum: number,
  maximum: number
) => {

  return Math.min(
    maximum,
    Math.max(
      minimum,
      value
    )
  )

}


const waitForNextFrame = () => {

  return new Promise<void>((resolve) => {

    window.requestAnimationFrame(() => {

      resolve()

    })

  })

}


const prettifyObjectName = (
  value: string,
  objectIndex: number
) => {

  if (
    !value
    || /^svg_\d+$/i.test(value)
  ) {

    return `Object ${objectIndex + 1}`

  }


  return value
    .replace(
      /[_-]+/g,
      ' '
    )
    .replace(
      /\b\w/g,
      (character) => {

        return character.toUpperCase()

      }
    )

}


const parseSvgLength = (
  value: string | null
) => {

  if (!value) {

    return null

  }


  const parsedValue =
    Number.parseFloat(value)


  if (
    !Number.isFinite(parsedValue)
    || parsedValue <= 0
  ) {

    return null

  }


  return parsedValue

}


// ============================================================
// Draft preview
// ============================================================

const collapseDraft = (
  item: GalleryItem
) => {

  item.draftExpanded =
    false

}


const expandDraft = (
  item: GalleryItem
) => {

  item.draftExpanded =
    true

}


// ============================================================
// SVG sanitization
// ============================================================

const sanitizeSvg = (
  svgRoot: SVGSVGElement
) => {

  svgRoot
    .querySelectorAll(
      'script, foreignObject'
    )
    .forEach((element) => {

      element.remove()

    })


  const allElements: Element[] = [

    svgRoot,

    ...Array.from(
      svgRoot.querySelectorAll('*')
    )

  ]


  allElements.forEach((element) => {

    Array.from(
      element.attributes
    ).forEach((attribute) => {

      if (
        /^on/i.test(
          attribute.name
        )
      ) {

        element.removeAttribute(
          attribute.name
        )

      }


      if (
        (
          attribute.name === 'href'
          || attribute.name === 'xlink:href'
        )
        && /^\s*javascript:/i.test(
          attribute.value
        )
      ) {

        element.removeAttribute(
          attribute.name
        )

      }

    })

  })

}


// ============================================================
// Dark-mode protection for inline SVG
// ============================================================

const protectSvgFromDarkMode = (
  svgRoot: SVGSVGElement
) => {

  const setImportantStyle = (
    element: SVGElement,
    property: string,
    value: string
  ) => {

    element.style.setProperty(
      property,
      value,
      'important'
    )

  }


  const resolvePresentationValue = (
    element: SVGElement,
    property: 'stroke' | 'fill'
  ) => {

    let currentElement: Element | null =
      element


    while (
      currentElement
      && currentElement !== svgRoot.parentElement
    ) {

      if (
        currentElement
        instanceof SVGElement
      ) {

        const inlineValue =
          currentElement.style
            .getPropertyValue(property)
            .trim()


        if (inlineValue) {

          return inlineValue

        }


        const attributeValue =
          currentElement
            .getAttribute(property)
            ?.trim()


        if (attributeValue) {

          return attributeValue

        }

      }


      currentElement =
        currentElement.parentElement

    }


    return ''

  }


  svgRoot.setAttribute(
    'data-sketchclaw-light-svg',
    'true'
  )


  setImportantStyle(
    svgRoot,
    'background',
    '#ffffff'
  )

  setImportantStyle(
    svgRoot,
    'color',
    '#111111'
  )

  setImportantStyle(
    svgRoot,
    'color-scheme',
    'only light'
  )

  setImportantStyle(
    svgRoot,
    'forced-color-adjust',
    'none'
  )

  setImportantStyle(
    svgRoot,
    'filter',
    'none'
  )

  setImportantStyle(
    svgRoot,
    'mix-blend-mode',
    'normal'
  )


  /*
    Disable automatic forced-color conversion without blocking
    the selection drop-shadow applied to editable object wrappers.
  */

  svgRoot
    .querySelectorAll<SVGElement>(
      '*'
    )
    .forEach((element) => {

      setImportantStyle(
        element,
        'forced-color-adjust',
        'none'
      )

    })


  /*
    Restore the original linework inside semantic stroke groups.
    When no explicit paint value is available, use black strokes
    and transparent fill, matching the sketch appearance.
  */

  const graphicTags =
    new Set([
      'path',
      'line',
      'polyline',
      'polygon',
      'rect',
      'circle',
      'ellipse'
    ])


  svgRoot
    .querySelectorAll<SVGElement>(
      'g.stroke-group, g.stroke-group *'
    )
    .forEach((element) => {

      setImportantStyle(
        element,
        'color',
        '#111111'
      )

      setImportantStyle(
        element,
        'filter',
        'none'
      )

      setImportantStyle(
        element,
        'mix-blend-mode',
        'normal'
      )

      setImportantStyle(
        element,
        'opacity',
        '1'
      )


      const tagName =
        element.tagName.toLowerCase()


      if (
        !graphicTags.has(tagName)
      ) {

        return

      }


      const originalStroke =
        resolvePresentationValue(
          element,
          'stroke'
        )


      const normalizedStroke =
        originalStroke
          && originalStroke !== 'currentColor'
          && originalStroke !== 'inherit'
          && originalStroke !== 'none'
          ? originalStroke
          : '#111111'


      setImportantStyle(
        element,
        'stroke',
        normalizedStroke
      )


      const originalFill =
        resolvePresentationValue(
          element,
          'fill'
        )


      if (
        originalFill
        && originalFill !== 'currentColor'
        && originalFill !== 'inherit'
      ) {

        setImportantStyle(
          element,
          'fill',
          originalFill
        )

      } else {

        setImportantStyle(
          element,
          'fill',
          'none'
        )

      }

    })


  /*
    Preserve white object-background shapes.
    This runs after linework restoration so masks remain white
    even when a white-background element is nested in an object.
  */

  svgRoot
    .querySelectorAll<SVGElement>(
      '.white-box-bg, .white-box-bg *'
    )
    .forEach((element) => {

      setImportantStyle(
        element,
        'color',
        '#ffffff'
      )

      setImportantStyle(
        element,
        'fill',
        '#ffffff'
      )

      setImportantStyle(
        element,
        'stroke',
        '#ffffff'
      )

      setImportantStyle(
        element,
        'filter',
        'none'
      )

      setImportantStyle(
        element,
        'mix-blend-mode',
        'normal'
      )

      setImportantStyle(
        element,
        'opacity',
        '1'
      )

    })

}


// ============================================================
// Initial viewBox
// ============================================================

const ensureInitialViewBox = (
  svgRoot: SVGSVGElement
) => {

  const currentViewBox =
    svgRoot.getAttribute('viewBox')


  if (
    currentViewBox
    && currentViewBox.trim()
  ) {

    return

  }


  const sourceWidth =
    parseSvgLength(
      svgRoot.getAttribute('width')
    )
    ?? DEFAULT_SVG_WIDTH


  const sourceHeight =
    parseSvgLength(
      svgRoot.getAttribute('height')
    )
    ?? DEFAULT_SVG_HEIGHT


  svgRoot.setAttribute(
    'viewBox',
    `0 0 ${sourceWidth} ${sourceHeight}`
  )

}


// ============================================================
// SVG group helpers
// ============================================================

const isSvgGroup = (
  element: Element | null
): element is SVGGElement => {

  return Boolean(

    element

    && element.namespaceURI
      === SVG_NAMESPACE

    && element.tagName
      .toLowerCase()
      === 'g'

  )

}


// ============================================================
// Find complete object group
// ============================================================

const findCompleteObjectGroup = (
  semanticGroup: SVGGElement,
  svgRoot: SVGSVGElement
): SVGGElement => {

  let currentElement: Element | null =
    semanticGroup.parentElement


  let fallbackGroup: SVGGElement | null =
    null


  while (
    currentElement
    && currentElement !== svgRoot
  ) {

    if (
      !isSvgGroup(
        currentElement
      )
    ) {

      currentElement =
        currentElement.parentElement

      continue

    }


    const semanticGroupCount =
      currentElement.querySelectorAll(
        'g.stroke-group[id]'
      ).length


    /*
      当前父组包含多个语义对象时，
      说明已经到达场景级父组。
    */

    if (
      semanticGroupCount > 1
    ) {

      break

    }


    if (
      semanticGroupCount === 1
    ) {

      fallbackGroup =
        currentElement


      const hasWhiteBackground =
        currentElement.querySelector(
          '.white-box-bg'
        )


      if (
        hasWhiteBackground
      ) {

        return currentElement

      }

    }


    currentElement =
      currentElement.parentElement

  }


  return (
    fallbackGroup
    ?? semanticGroup
  )

}


// ============================================================
// Prefix SVG IDs
// ============================================================

const prefixSvgIds = (
  svgRoot: SVGSVGElement,
  prefix: string
) => {

  const idMap =
    new Map<string, string>()


  const elementsWithId =
    Array.from(
      svgRoot.querySelectorAll<SVGElement>(
        '[id]'
      )
    )


  elementsWithId.forEach(
    (
      element,
      elementIndex
    ) => {

      const originalId =
        element.getAttribute('id')


      if (!originalId) {

        return

      }


      const safeId =
        originalId.replace(
          /[^a-zA-Z0-9_-]/g,
          '-'
        )


      const newId =
        `${prefix}-${safeId}-${elementIndex}`


      idMap.set(
        originalId,
        newId
      )


      element.setAttribute(
        'id',
        newId
      )

    }
  )


  const allElements: Element[] = [

    svgRoot,

    ...Array.from(
      svgRoot.querySelectorAll('*')
    )

  ]


  allElements.forEach((element) => {

    Array.from(
      element.attributes
    ).forEach((attribute) => {

      let newValue =
        attribute.value


      idMap.forEach(
        (
          newId,
          originalId
        ) => {

          newValue =
            newValue
              .split(
                `url(#${originalId})`
              )
              .join(
                `url(#${newId})`
              )
              .split(
                `#${originalId}`
              )
              .join(
                `#${newId}`
              )

        }
      )


      if (
        newValue
        !== attribute.value
      ) {

        element.setAttribute(
          attribute.name,
          newValue
        )

      }

    })

  })

}


// ============================================================
// Prepare editable SVG
// ============================================================

const prepareEditableSvg = (
  svgText: string,
  galleryId: string
) => {

  const parser =
    new DOMParser()


  const svgDocument =
    parser.parseFromString(
      svgText,
      'image/svg+xml'
    )


  const parserError =
    svgDocument.querySelector(
      'parsererror'
    )


  if (parserError) {

    throw new Error(
      'The SVG file could not be parsed.'
    )

  }


  const svgRoot =
    svgDocument.querySelector<SVGSVGElement>(
      'svg'
    )


  if (!svgRoot) {

    throw new Error(
      'The loaded file is not a valid SVG.'
    )

  }


  sanitizeSvg(
    svgRoot
  )


  ensureInitialViewBox(
    svgRoot
  )


  protectSvgFromDarkMode(
    svgRoot
  )


  svgRoot.setAttribute(
    'width',
    '100%'
  )


  svgRoot.setAttribute(
    'height',
    '100%'
  )


  svgRoot.setAttribute(
    'preserveAspectRatio',
    'xMidYMid meet'
  )


  svgRoot.setAttribute(
    'class',
    'editable-scene-svg'
  )


  // ==========================================================
  // Find semantic object groups
  // ==========================================================

  const semanticGroups =
    Array.from(
      svgRoot.querySelectorAll<SVGGElement>(
        'g.stroke-group[id]'
      )
    )


  if (
    semanticGroups.length === 0
  ) {

    throw new Error(
      'No editable object groups were found.'
    )

  }


  const resolvedObjects =
    semanticGroups.map(
      (semanticGroup) => {

        return {

          semanticGroup,

          objectGroup:
            findCompleteObjectGroup(
              semanticGroup,
              svgRoot
            )

        }

      }
    )


  const seenObjectGroups =
    new Set<SVGGElement>()


  const uniqueObjects =
    resolvedObjects.filter(
      (resolvedObject) => {

        if (
          seenObjectGroups.has(
            resolvedObject.objectGroup
          )
        ) {

          return false

        }


        seenObjectGroups.add(
          resolvedObject.objectGroup
        )


        return true

      }
    )


  const objects: EditableObject[] = []


  // ==========================================================
  // Wrap each object
  // ==========================================================

  uniqueObjects.forEach(
    (
      resolvedObject,
      objectIndex
    ) => {

      const {
        semanticGroup,
        objectGroup
      } = resolvedObject


      const semanticId =
        semanticGroup.getAttribute('id')
        ?? `object-${objectIndex + 1}`


      const objectKey =
        String(objectIndex)


      const parentNode =
        objectGroup.parentNode


      if (!parentNode) {

        return

      }


      const editableWrapper =
        svgDocument.createElementNS(
          SVG_NAMESPACE,
          'g'
        )


      editableWrapper.setAttribute(
        'class',
        'editable-object-wrapper'
      )


      editableWrapper.setAttribute(
        'data-object-key',
        objectKey
      )


      editableWrapper.setAttribute(
        'data-object-label',
        prettifyObjectName(
          semanticId,
          objectIndex
        )
      )


      editableWrapper.setAttribute(
        'data-semantic-id',
        semanticId
      )


      parentNode.insertBefore(
        editableWrapper,
        objectGroup
      )


      editableWrapper.appendChild(
        objectGroup
      )


      objects.push({

        key: objectKey,

        label:
          prettifyObjectName(
            semanticId,
            objectIndex
          ),

        x: 0,

        y: 0,

        scale: 1,

        rotation: 0,

        centerX: 0,

        centerY: 0,

        deleted: false

      })

    }
  )


  if (
    objects.length === 0
  ) {

    throw new Error(
      'Editable SVG objects could not be initialized.'
    )

  }


  prefixSvgIds(
    svgRoot,
    galleryId
  )


  const serializer =
    new XMLSerializer()


  return {

    markup:
      serializer.serializeToString(
        svgRoot
      ),

    objects

  }

}


// ============================================================
// DOM lookup
// ============================================================

const getSvgHost = (
  item: GalleryItem
) => {

  return document.querySelector<HTMLElement>(
    `[data-gallery-editor="${item.id}"]`
  )

}


const getSvgElement = (
  item: GalleryItem
) => {

  return (
    getSvgHost(item)
      ?.querySelector<SVGSVGElement>(
        'svg'
      )
    ?? null
  )

}


const getObjectElement = (
  item: GalleryItem,
  objectKey: string
) => {

  const host =
    getSvgHost(item)


  if (!host) {

    return null

  }


  return (

    Array.from(
      host.querySelectorAll<SVGGElement>(
        '.editable-object-wrapper'
      )
    ).find((element) => {

      return (
        element.getAttribute(
          'data-object-key'
        )
        === objectKey
      )

    })

    ?? null

  )

}


// ============================================================
// Object center
// ============================================================

const cacheObjectCenters = (
  item: GalleryItem
) => {

  item.objects.forEach((object) => {

    const objectElement =
      getObjectElement(
        item,
        object.key
      )


    if (!objectElement) {

      return

    }


    try {

      const boundingBox =
        objectElement.getBBox()


      object.centerX =
        boundingBox.x
        + boundingBox.width / 2


      object.centerY =
        boundingBox.y
        + boundingBox.height / 2

    } catch {

      object.centerX = 0

      object.centerY = 0

    }

  })

}


// ============================================================
// Apply transforms
// ============================================================

const applyObjectTransform = (
  item: GalleryItem,
  object: EditableObject
) => {

  const objectElement =
    getObjectElement(
      item,
      object.key
    )


  if (!objectElement) {

    return

  }


  if (
    object.deleted
  ) {

    objectElement.style.display =
      'none'

    return

  }


  objectElement.style.display =
    ''


  const transform = [

    `translate(${object.x} ${object.y})`,

    `translate(${object.centerX} ${object.centerY})`,

    `rotate(${object.rotation})`,

    `scale(${object.scale})`,

    `translate(${-object.centerX} ${-object.centerY})`

  ].join(' ')


  objectElement.setAttribute(
    'transform',
    transform
  )

}


const applyAllObjectTransforms = (
  item: GalleryItem
) => {

  item.objects.forEach((object) => {

    applyObjectTransform(
      item,
      object
    )

  })

}


// ============================================================
// SVG bounds
// ============================================================

const getElementBoundsInRoot = (
  element: SVGGraphicsElement,
  svgRoot: SVGSVGElement
): SvgBounds | null => {

  try {

    const boundingBox =
      element.getBBox()


    const elementScreenMatrix =
      element.getScreenCTM()


    const rootScreenMatrix =
      svgRoot.getScreenCTM()


    if (
      !elementScreenMatrix
      || !rootScreenMatrix
    ) {

      return null

    }


    const screenToRootMatrix =
      rootScreenMatrix.inverse()


    const convertPoint = (
      x: number,
      y: number
    ) => {

      const point =
        svgRoot.createSVGPoint()


      point.x = x

      point.y = y


      const screenPoint =
        point.matrixTransform(
          elementScreenMatrix
        )


      return screenPoint.matrixTransform(
        screenToRootMatrix
      )

    }


    const topLeft =
      convertPoint(
        boundingBox.x,
        boundingBox.y
      )


    const topRight =
      convertPoint(
        boundingBox.x + boundingBox.width,
        boundingBox.y
      )


    const bottomLeft =
      convertPoint(
        boundingBox.x,
        boundingBox.y + boundingBox.height
      )


    const bottomRight =
      convertPoint(
        boundingBox.x + boundingBox.width,
        boundingBox.y + boundingBox.height
      )


    const xValues = [
      topLeft.x,
      topRight.x,
      bottomLeft.x,
      bottomRight.x
    ]


    const yValues = [
      topLeft.y,
      topRight.y,
      bottomLeft.y,
      bottomRight.y
    ]


    return {

      minX:
        Math.min(...xValues),

      minY:
        Math.min(...yValues),

      maxX:
        Math.max(...xValues),

      maxY:
        Math.max(...yValues)

    }

  } catch {

    return null

  }

}


// ============================================================
// Fit SVG scene
// ============================================================

const fitSvgScene = (
  item: GalleryItem
) => {

  const svgRoot =
    getSvgElement(item)


  const host =
    getSvgHost(item)


  if (
    !svgRoot
    || !host
  ) {

    return

  }


  const editableElements =
    Array.from(
      host.querySelectorAll<SVGGraphicsElement>(
        '.editable-object-wrapper'
      )
    ).filter((element) => {

      return (
        element.style.display
        !== 'none'
      )

    })


  if (
    editableElements.length === 0
  ) {

    return

  }


  let sceneMinX =
    Number.POSITIVE_INFINITY

  let sceneMinY =
    Number.POSITIVE_INFINITY

  let sceneMaxX =
    Number.NEGATIVE_INFINITY

  let sceneMaxY =
    Number.NEGATIVE_INFINITY


  editableElements.forEach((element) => {

    const bounds =
      getElementBoundsInRoot(
        element,
        svgRoot
      )


    if (!bounds) {

      return

    }


    sceneMinX =
      Math.min(
        sceneMinX,
        bounds.minX
      )


    sceneMinY =
      Math.min(
        sceneMinY,
        bounds.minY
      )


    sceneMaxX =
      Math.max(
        sceneMaxX,
        bounds.maxX
      )


    sceneMaxY =
      Math.max(
        sceneMaxY,
        bounds.maxY
      )

  })


  if (
    !Number.isFinite(sceneMinX)
    || !Number.isFinite(sceneMinY)
    || !Number.isFinite(sceneMaxX)
    || !Number.isFinite(sceneMaxY)
  ) {

    return

  }


  const sceneWidth =
    sceneMaxX - sceneMinX


  const sceneHeight =
    sceneMaxY - sceneMinY


  if (
    sceneWidth <= 0
    || sceneHeight <= 0
  ) {

    return

  }


  const padding =
    Math.max(

      Math.max(
        sceneWidth,
        sceneHeight
      )
      * SVG_FIT_PADDING_RATIO,

      SVG_FIT_MIN_PADDING

    )


  svgRoot.setAttribute(
    'viewBox',
    [
      sceneMinX - padding,
      sceneMinY - padding,
      sceneWidth + padding * 2,
      sceneHeight + padding * 2
    ].join(' ')
  )


  svgRoot.setAttribute(
    'preserveAspectRatio',
    'xMidYMid meet'
  )

}


// ============================================================
// Selection
// ============================================================

const updateSelectionClass = (
  item: GalleryItem
) => {

  const host =
    getSvgHost(item)


  if (!host) {

    return

  }


  host
    .querySelectorAll<SVGGElement>(
      '.editable-object-wrapper'
    )
    .forEach((element) => {

      element.classList.toggle(

        'is-selected',

        element.getAttribute(
          'data-object-key'
        )
        === item.selectedKey

      )

    })

}


const clearSelection = (
  item: GalleryItem
) => {

  item.selectedKey =
    null


  updateSelectionClass(
    item
  )

}


const clearOtherSelections = (
  activeItemId: string
) => {

  galleryItems.forEach((item) => {

    if (
      item.id !== activeItemId
    ) {

      clearSelection(
        item
      )

    }

  })

}


const selectObject = (
  item: GalleryItem,
  objectKey: string
) => {

  clearOtherSelections(
    item.id
  )


  item.selectedKey =
    objectKey


  updateSelectionClass(
    item
  )


  getSvgHost(item)
    ?.focus()

}


// ============================================================
// Selected object
// ============================================================

const getSelectedObject = (
  item: GalleryItem
) => {

  return item.objects.find((object) => {

    return (
      object.key
      === item.selectedKey

      && !object.deleted
    )

  })

}


const getSelectedLabel = (
  item: GalleryItem
) => {

  return (

    getSelectedObject(item)
      ?.label

    ?? 'Select an object'

  )

}


// ============================================================
// Pointer coordinates
// ============================================================

const clientToParentPoint = (
  parentElement: SVGGraphicsElement,
  clientX: number,
  clientY: number
) => {

  const svgElement =
    parentElement.ownerSVGElement


  if (!svgElement) {

    return {
      x: 0,
      y: 0
    }

  }


  const point =
    svgElement.createSVGPoint()


  point.x =
    clientX

  point.y =
    clientY


  const screenMatrix =
    parentElement.getScreenCTM()


  if (!screenMatrix) {

    return {
      x: 0,
      y: 0
    }

  }


  const localPoint =
    point.matrixTransform(
      screenMatrix.inverse()
    )


  return {

    x:
      localPoint.x,

    y:
      localPoint.y

  }

}


// ============================================================
// Move one object
// ============================================================

const startObjectMove = (
  event: PointerEvent,
  item: GalleryItem
) => {

  if (
    event.button !== 0
  ) {

    return

  }


  const eventTarget =
    event.target


  if (
    !(eventTarget instanceof Element)
  ) {

    return

  }


  const objectElement =
    eventTarget.closest(
      '.editable-object-wrapper'
    ) as SVGGElement | null


  if (!objectElement) {

    clearSelection(
      item
    )

    return

  }


  const objectKey =
    objectElement.getAttribute(
      'data-object-key'
    )


  if (
    objectKey === null
  ) {

    return

  }


  const object =
    item.objects.find(
      (currentObject) => {

        return (
          currentObject.key
          === objectKey
        )

      }
    )


  if (
    !object
    || object.deleted
  ) {

    return

  }


  const parentElement =
    objectElement.parentElement


  if (
    !parentElement
    || !(
      parentElement
      instanceof SVGGraphicsElement
    )
  ) {

    return

  }


  event.preventDefault()

  event.stopPropagation()


  selectObject(
    item,
    objectKey
  )


  stopActiveInteraction?.()


  const startPointer =
    clientToParentPoint(
      parentElement,
      event.clientX,
      event.clientY
    )


  const startObjectX =
    object.x


  const startObjectY =
    object.y


  const handlePointerMove = (
    moveEvent: PointerEvent
  ) => {

    moveEvent.preventDefault()


    const currentPointer =
      clientToParentPoint(
        parentElement,
        moveEvent.clientX,
        moveEvent.clientY
      )


    object.x =
      startObjectX
      + currentPointer.x
      - startPointer.x


    object.y =
      startObjectY
      + currentPointer.y
      - startPointer.y


    applyObjectTransform(
      item,
      object
    )

  }


  const stopPointerMove = () => {

    window.removeEventListener(
      'pointermove',
      handlePointerMove
    )


    window.removeEventListener(
      'pointerup',
      stopPointerMove
    )


    window.removeEventListener(
      'pointercancel',
      stopPointerMove
    )


    document.body.style.userSelect =
      ''


    if (
      stopActiveInteraction
      === stopPointerMove
    ) {

      stopActiveInteraction =
        null

    }

  }


  document.body.style.userSelect =
    'none'


  window.addEventListener(
    'pointermove',
    handlePointerMove
  )


  window.addEventListener(
    'pointerup',
    stopPointerMove
  )


  window.addEventListener(
    'pointercancel',
    stopPointerMove
  )


  stopActiveInteraction =
    stopPointerMove

}


// ============================================================
// Rotate
// ============================================================

const rotateSelected = (
  item: GalleryItem,
  degrees: number
) => {

  const object =
    getSelectedObject(item)


  if (!object) {

    return

  }


  object.rotation +=
    degrees


  applyObjectTransform(
    item,
    object
  )

}


// ============================================================
// Scale
// ============================================================

const scaleSelected = (
  item: GalleryItem,
  amount: number
) => {

  const object =
    getSelectedObject(item)


  if (!object) {

    return

  }


  object.scale =
    clamp(

      object.scale
      + amount,

      MIN_SCALE,

      MAX_SCALE

    )


  applyObjectTransform(
    item,
    object
  )

}


// ============================================================
// Delete
// ============================================================

const deleteSelected = (
  item: GalleryItem
) => {

  const object =
    getSelectedObject(item)


  if (!object) {

    return

  }


  object.deleted =
    true


  applyObjectTransform(
    item,
    object
  )


  clearSelection(
    item
  )

}


// ============================================================
// Reset
// ============================================================

const resetScene = (
  item: GalleryItem
) => {

  stopActiveInteraction?.()


  item.objects.forEach((object) => {

    object.x = 0

    object.y = 0

    object.scale = 1

    object.rotation = 0

    object.deleted = false

  })


  applyAllObjectTransforms(
    item
  )


  clearSelection(
    item
  )


  window.requestAnimationFrame(() => {

    fitSvgScene(
      item
    )

  })

}


// ============================================================
// Keyboard controls
// ============================================================

const handleEditorKeydown = (
  event: KeyboardEvent,
  item: GalleryItem
) => {

  const object =
    getSelectedObject(item)


  if (!object) {

    return

  }


  const moveAmount =
    event.shiftKey
      ? 10
      : 3


  switch (
    event.key
  ) {

    case 'Delete':

    case 'Backspace':

      event.preventDefault()

      deleteSelected(
        item
      )

      break


    case 'ArrowLeft':

      event.preventDefault()

      object.x -=
        moveAmount

      applyObjectTransform(
        item,
        object
      )

      break


    case 'ArrowRight':

      event.preventDefault()

      object.x +=
        moveAmount

      applyObjectTransform(
        item,
        object
      )

      break


    case 'ArrowUp':

      event.preventDefault()

      object.y -=
        moveAmount

      applyObjectTransform(
        item,
        object
      )

      break


    case 'ArrowDown':

      event.preventDefault()

      object.y +=
        moveAmount

      applyObjectTransform(
        item,
        object
      )

      break

  }

}


// ============================================================
// Load SVG
// ============================================================

const loadGalleryItem = async (
  item: GalleryItem
) => {

  item.loading =
    true


  item.error =
    ''


  try {

    const response =
      await fetch(
        item.svg
      )


    if (
      !response.ok
    ) {

      throw new Error(
        `Unable to load ${item.svg}`
      )

    }


    const svgText =
      await response.text()


    const preparedSvg =
      prepareEditableSvg(
        svgText,
        item.id
      )


    item.svgMarkup =
      preparedSvg.markup


    item.objects =
      preparedSvg.objects


    item.loading =
      false


    await nextTick()

    await waitForNextFrame()

    await waitForNextFrame()


    cacheObjectCenters(
      item
    )


    applyAllObjectTransforms(
      item
    )


    await waitForNextFrame()


    fitSvgScene(
      item
    )

    // 如果没有单独的 concept manifest，使用当前 SVG 中的
    // semantic object groups 生成独立对象预览，保证 Intro 仍可展示方法。
    buildConceptFallbackFromEditableSvg(
      item
    )

  } catch (error) {

    item.error =
      error instanceof Error
        ? error.message
        : 'Failed to load the SVG scene.'


    item.loading =
      false

  }

}


// ============================================================
// Intro method presentation
// ============================================================

const resolveManifestAssetPath = (
  manifestPath: string,
  assetPath: string
) => {

  if (
    assetPath.startsWith('/')
    || assetPath.startsWith('http://')
    || assetPath.startsWith('https://')
    || assetPath.startsWith('data:')
  ) {
    return assetPath
  }

  const baseFolder =
    manifestPath.slice(
      0,
      manifestPath.lastIndexOf('/')
    )

  return `${baseFolder}/${assetPath}`
}


const loadConceptAssets = async (
  item: GalleryItem
) => {

  item.conceptLoading = true
  item.conceptError = ''

  try {

    const response =
      await fetch(item.conceptManifest)

    if (!response.ok) {
      throw new Error(
        `Unable to load ${item.conceptManifest}`
      )
    }

    const data = await response.json()

    const sourceAssets =
      Array.isArray(data)
        ? data
        : data.assets

    if (!Array.isArray(sourceAssets)) {
      throw new Error(
        'Concept manifest must contain an assets array.'
      )
    }

    item.conceptAssets =
      sourceAssets.map(
        (
          asset: {
            id?: string
            name?: string
            file?: string
          },
          assetIndex: number
        ) => ({

          id:
            asset.id
            ?? `asset-${assetIndex + 1}`,

          name:
            asset.name
            ?? `Object ${assetIndex + 1}`,

          file:
            asset.file
              ? resolveManifestAssetPath(
                  item.conceptManifest,
                  asset.file
                )
              : '',

          markup: ''

        })
      )

  } catch (error) {

    // 如果还没有为 Intro 单独准备 concept manifest，
    // loadGalleryItem 完成后会从当前 SVG 中提取对象预览作为 fallback。
    item.conceptError =
      error instanceof Error
        ? error.message
        : 'Failed to load concept assets.'

  } finally {

    item.conceptLoading = false

  }

}


const buildConceptFallbackFromEditableSvg = (
  item: GalleryItem
) => {

  if (item.conceptAssets.length > 0) {
    return
  }

  const svgRoot =
    getSvgElement(item)

  if (!svgRoot) {
    return
  }

  const serializer =
    new XMLSerializer()

  const fallbackAssets: ConceptAsset[] = []

  item.objects.forEach((object) => {

    const sourceObject =
      getObjectElement(
        item,
        object.key
      )

    if (!sourceObject) {
      return
    }

    try {

      const boundingBox =
        sourceObject.getBBox()

      const longestSide =
        Math.max(
          boundingBox.width,
          boundingBox.height,
          1
        )

      const padding =
        Math.max(
          8,
          longestSide * 0.14
        )

      const clonedSvg =
        svgRoot.cloneNode(true) as SVGSVGElement

      clonedSvg
        .querySelectorAll<SVGGElement>(
          '.editable-object-wrapper'
        )
        .forEach((wrapper) => {

          if (
            wrapper.getAttribute(
              'data-object-key'
            )
            !== object.key
          ) {
            wrapper.remove()
          }

        })

      const clonedTarget =
        clonedSvg.querySelector<SVGGElement>(
          `[data-object-key="${object.key}"]`
        )

      clonedTarget
        ?.classList.remove(
          'is-selected'
        )

      clonedSvg.setAttribute(
        'viewBox',
        [
          boundingBox.x - padding,
          boundingBox.y - padding,
          boundingBox.width + padding * 2,
          boundingBox.height + padding * 2
        ].join(' ')
      )

      clonedSvg.removeAttribute('width')
      clonedSvg.removeAttribute('height')

      clonedSvg.setAttribute(
        'preserveAspectRatio',
        'xMidYMid meet'
      )

      fallbackAssets.push({
        id: object.key,
        name: object.label,
        file: '',
        markup:
          serializer.serializeToString(
            clonedSvg
          )
      })

    } catch {
      // 单个对象 bbox 失败时忽略该对象，不影响整个 Intro。
    }

  })

  if (fallbackAssets.length > 0) {
    item.conceptAssets = fallbackAssets
    item.conceptError = ''
  }

}


const parseReasoningOperations = (
  text: string,
  folder: string
): ReasoningStep[] => {

  const lines =
    text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0)

  return lines.map((line, index) => {

    let imageName = ''
    let code = ''

    const tabIndex =
      line.indexOf('\t')

    if (tabIndex >= 0) {

      imageName =
        line.slice(0, tabIndex).trim()

      code =
        line.slice(tabIndex + 1).trim()

    } else {

      const imageCodeMatch =
        line.match(
          /^(\S+\.(?:jpg|jpeg|png|webp|svg))\s+(.+)$/i
        )

      if (imageCodeMatch) {
        imageName = imageCodeMatch[1]
        code = imageCodeMatch[2]
      } else {
        imageName =
          `step_${String(index + 1).padStart(3, '0')}.jpg`
        code = line
      }

    }

    return {
      step: index + 1,
      imageName,
      image: `${folder}/${imageName}`,
      code
    }

  })
}


const loadReasoningProcess = async (
  item: GalleryItem
) => {

  item.reasoningLoading = true
  item.reasoningError = ''

  try {

    const operationsPath =
      `${item.reasoningFolder}/operations.txt`

    const response =
      await fetch(operationsPath)

    if (!response.ok) {
      throw new Error(
        `Unable to load ${operationsPath}`
      )
    }

    const operationText =
      await response.text()

    item.reasoningSteps =
      parseReasoningOperations(
        operationText,
        item.reasoningFolder
      )

    if (item.reasoningSteps.length === 0) {
      throw new Error(
        'No reasoning steps were found.'
      )
    }

    item.reasoningCurrentStep = 0

  } catch (error) {

    item.reasoningError =
      error instanceof Error
        ? error.message
        : 'Failed to load reasoning process.'

  } finally {

    item.reasoningLoading = false

  }

}


const getCurrentReasoningStep = (
  item: GalleryItem
) => {

  return item.reasoningSteps[
    item.reasoningCurrentStep
  ]
}


const stopReasoningPlayback = () => {

  isReasoningPlaying.value = false

  if (reasoningPlaybackTimer === null) {
    return
  }

  window.clearInterval(
    reasoningPlaybackTimer
  )

  reasoningPlaybackTimer = null
}


const advanceReasoningPlayback = () => {

  const item =
    activeGalleryItem.value

  if (
    !item
    || item.reasoningLoading
    || Boolean(item.reasoningError)
    || item.reasoningSteps.length === 0
  ) {
    stopReasoningPlayback()
    return
  }

  const finalStepIndex =
    item.reasoningSteps.length - 1

  if (
    item.reasoningCurrentStep
    >= finalStepIndex
  ) {
    stopReasoningPlayback()
    return
  }

  item.reasoningCurrentStep += 1

  if (
    item.reasoningCurrentStep
    >= finalStepIndex
  ) {
    stopReasoningPlayback()
  }
}


const toggleReasoningPlayback = () => {

  const item =
    activeGalleryItem.value

  if (
    !item
    || item.reasoningLoading
    || Boolean(item.reasoningError)
    || item.reasoningSteps.length === 0
  ) {
    return
  }

  if (isReasoningPlaying.value) {
    stopReasoningPlayback()
    return
  }

  const finalStepIndex =
    item.reasoningSteps.length - 1

  if (
    item.reasoningCurrentStep
    >= finalStepIndex
  ) {
    item.reasoningCurrentStep = 0
  }

  isReasoningPlaying.value = true

  reasoningPlaybackTimer =
    window.setInterval(
      advanceReasoningPlayback,
      REASONING_PLAYBACK_INTERVAL
    )
}


const selectReasoningStep = (
  item: GalleryItem,
  stepIndex: number
) => {
  stopReasoningPlayback()
  item.reasoningCurrentStep = stepIndex
}


const handleReasoningSlider = (
  item: GalleryItem,
  value: number | number[]
) => {

  stopReasoningPlayback()

  item.reasoningCurrentStep =
    Number(
      Array.isArray(value)
        ? value[0]
        : value
    )
}


const preloadIntroImage = (
  url: string
): Promise<boolean> => {

  return new Promise((resolve) => {

    const image = new Image()

    image.onload = () =>
      resolve(true)

    image.onerror = () =>
      resolve(false)

    image.src = url

  })
}


const loadRefinementProcess = async (
  item: GalleryItem
) => {

  item.refinementLoading = true
  item.refinementError = ''

  try {

    const discoveredFrames: string[] = []

    for (
      let frameIndex = 1;
      frameIndex <= MAX_REFINEMENT_FRAME_COUNT;
      frameIndex += 1
    ) {

      const frameUrl =
        `${item.refineFolder}/${frameIndex}.jpg`

      const frameExists =
        await preloadIntroImage(frameUrl)

      if (!frameExists) {
        break
      }

      discoveredFrames.push(frameUrl)
    }

    item.refinementFrames =
      discoveredFrames

    item.refinementCurrentStep = 0

    if (discoveredFrames.length === 0) {
      item.refinementError =
        `No refinement frames were found in ${item.refineFolder}.`
    }

  } finally {

    item.refinementLoading = false

  }
}


const getRefinementDisplayFrames = (
  item: GalleryItem
) => {

  // Draft 固定展示在左侧。右侧通过进度条查看 refinement 过程。
  // 如果没有单独的中间帧，则只展示真实的最终 SVG，避免虚构步骤。
  if (item.refinementFrames.length > 0) {
    return item.refinementFrames
  }

  return [item.svg]
}


const getCurrentRefinementImage = (
  item: GalleryItem
) => {

  const frames =
    getRefinementDisplayFrames(item)

  return (
    frames[item.refinementCurrentStep]
    ?? frames[0]
    ?? item.svg
  )
}


const getCurrentRefinementLabel = (
  item: GalleryItem
) => {

  const frames =
    getRefinementDisplayFrames(item)

  if (frames.length <= 1) {
    return 'Final'
  }

  if (
    item.refinementCurrentStep
    === frames.length - 1
  ) {
    return 'Final'
  }

  return `Step ${item.refinementCurrentStep + 1}`
}


const stopRefinementPlayback = () => {

  isRefinementPlaying.value = false

  if (refinementPlaybackTimer === null) {
    return
  }

  window.clearInterval(
    refinementPlaybackTimer
  )

  refinementPlaybackTimer = null
}


const advanceRefinementPlayback = () => {

  const item =
    activeGalleryItem.value

  if (
    !item
    || item.refinementLoading
  ) {
    stopRefinementPlayback()
    return
  }

  const frames =
    getRefinementDisplayFrames(item)

  if (frames.length <= 1) {
    stopRefinementPlayback()
    return
  }

  const finalStepIndex =
    frames.length - 1

  if (
    item.refinementCurrentStep
    >= finalStepIndex
  ) {
    stopRefinementPlayback()
    return
  }

  item.refinementCurrentStep += 1

  if (
    item.refinementCurrentStep
    >= finalStepIndex
  ) {
    stopRefinementPlayback()
  }
}


const toggleRefinementPlayback = () => {

  const item =
    activeGalleryItem.value

  if (
    !item
    || item.refinementLoading
  ) {
    return
  }

  const frames =
    getRefinementDisplayFrames(item)

  if (frames.length <= 1) {
    return
  }

  if (isRefinementPlaying.value) {
    stopRefinementPlayback()
    return
  }

  const finalStepIndex =
    frames.length - 1

  if (
    item.refinementCurrentStep
    >= finalStepIndex
  ) {
    item.refinementCurrentStep = 0
  }

  isRefinementPlaying.value = true

  refinementPlaybackTimer =
    window.setInterval(
      advanceRefinementPlayback,
      REFINEMENT_PLAYBACK_INTERVAL
    )
}


const handleRefinementSlider = (
  item: GalleryItem,
  value: number | number[]
) => {

  stopRefinementPlayback()

  const nextStep =
    Number(
      Array.isArray(value)
        ? value[0]
        : value
    )

  const finalStepIndex =
    Math.max(
      0,
      getRefinementDisplayFrames(item).length - 1
    )

  item.refinementCurrentStep =
    clamp(
      nextStep,
      0,
      finalStepIndex
    )
}


const setIntroMethodStage = (
  item: GalleryItem,
  itemIndex: number,
  stage: IntroMethodStage
) => {

  stopReasoningPlayback()
  stopRefinementPlayback()
  stopActiveInteraction?.()

  activeExampleIndex.value =
    itemIndex

  item.activeMethodStage =
    stage

}


const toggleIntroReasoningPlayback = (
  itemIndex: number
) => {

  if (
    activeExampleIndex.value
    !== itemIndex
  ) {

    stopReasoningPlayback()

    activeExampleIndex.value =
      itemIndex

  }

  toggleReasoningPlayback()

}


const toggleIntroRefinementPlayback = (
  itemIndex: number
) => {

  if (
    activeExampleIndex.value
    !== itemIndex
  ) {

    stopRefinementPlayback()

    activeExampleIndex.value =
      itemIndex

  }

  toggleRefinementPlayback()

}


const refitActiveIntroExample = async () => {

  const item =
    activeGalleryItem.value

  if (!item) {
    return
  }

  await nextTick()
  await waitForNextFrame()
  await waitForNextFrame()

  cacheObjectCenters(item)
  applyAllObjectTransforms(item)
  fitSvgScene(item)

}


const showPreviousIntroExample = async () => {

  stopReasoningPlayback()
  stopRefinementPlayback()
  stopActiveInteraction?.()

  activeExampleIndex.value =
    (
      activeExampleIndex.value
      - 1
      + galleryItems.length
    )
    % galleryItems.length

  await refitActiveIntroExample()

}


const showNextIntroExample = async () => {

  stopReasoningPlayback()
  stopRefinementPlayback()
  stopActiveInteraction?.()

  activeExampleIndex.value =
    (
      activeExampleIndex.value
      + 1
    )
    % galleryItems.length

  await refitActiveIntroExample()

}


// ============================================================
// Lifecycle
// ============================================================

onMounted(() => {

  galleryItems.forEach((item) => {

    loadGalleryItem(item)
    loadConceptAssets(item)
    loadReasoningProcess(item)
    loadRefinementProcess(item)

  })

})


onBeforeUnmount(() => {

  stopActiveInteraction?.()
  stopReasoningPlayback()
  stopRefinementPlayback()

})

</script>


<template>

  <div class="gallery-section">


    <el-divider />


    <!-- Interactive examples -->

    <el-row justify="center">

      <el-col
        :xs="24"
        :sm="20"
        :md="16"
        :lg="12"
        :xl="12"
      >

        <div class="sketchclaw-overview">

          <div
            class="overview-kicker"
            aria-hidden="true"
          >
            <span class="overview-kicker-bar overview-kicker-orange" />
            <span class="overview-kicker-bar overview-kicker-yellow" />
            <span class="overview-kicker-bar overview-kicker-green" />
            <span class="overview-kicker-bar overview-kicker-purple" />
          </div>

          <h2 class="overview-title">
            TL;DR: SketchClaw is an automatic agentic framework for text-guided
            multi-concept scene sketch generation.
          </h2>

        </div>

      </el-col>

    </el-row>


    <!-- Interactive examples -->

    <el-row justify="center">

      <el-col
        :xs="24"
        :sm="20"
        :md="16"
        :lg="12"
        :xl="12"
      >

        <div class="gallery-interaction-row">

          <p class="gallery-interaction-tip gallery-interaction-tip-top">

            <span
              class="gallery-interaction-icon"
              aria-hidden="true"
            >
              ✦
            </span>

            <span>
              Click and move any object below to explore different
              compositions and spark new ideas.
            </span>

          </p>

          <a
            class="more-results-button"
            :href="moreResultsUrl"
            aria-label="View more SketchClaw results"
          >
            <span>More results</span>
            <span
              class="more-results-arrow"
              aria-hidden="true"
            >
              →
            </span>
          </a>

        </div>

        <div class="intro-example-carousel">

          <article
            v-for="(item, itemIndex) in galleryItems"
            v-show="itemIndex === activeExampleIndex"
            :key="item.id"
            class="gallery-item intro-method-example intro-single-example"
          >

            <!-- ================================================== -->
            <!-- Shared example header: arrows + Example + Prompt -->
            <!-- ================================================== -->

            <div class="intro-example-header">

              <button
                type="button"
                class="intro-example-nav-button intro-example-nav-button-left"
                aria-label="Previous example"
                @click="showPreviousIntroExample"
              >
                <span aria-hidden="true">‹</span>
              </button>

              <div class="gallery-info intro-example-info">

                <div class="gallery-meta">
                  <span class="gallery-title">
                    {{ item.title }}
                  </span>

                  <span class="gallery-index">
                    {{ String(itemIndex + 1).padStart(2, '0') }}
                    /
                    {{ String(galleryItems.length).padStart(2, '0') }}
                  </span>
                </div>

                <el-tooltip
                  :content="item.caption"
                  placement="top"
                  effect="light"
                  :show-after="250"
                  :hide-after="0"
                  popper-class="intro-caption-tooltip"
                >
                  <p
                    class="gallery-caption intro-example-caption"
                    tabindex="0"
                  >
                    “{{ item.caption }}”
                  </p>
                </el-tooltip>

              </div>

              <button
                type="button"
                class="intro-example-nav-button intro-example-nav-button-right"
                aria-label="Next example"
                @click="showNextIntroExample"
              >
                <span aria-hidden="true">›</span>
              </button>

            </div>


            <!-- ================================================== -->
            <!-- Prompt below: fixed editable result | method tabs -->
            <!-- ================================================== -->

            <div class="intro-example-workspace">

              <div class="intro-editable-column">
              <section class="intro-editable-panel">

                            <div class="intro-editable-heading">
                              <div>
                                <h3 class="intro-editable-title">
                                  Editable Vector Result
                                </h3>

                                <p class="intro-editable-subtitle">
                                  Select and directly manipulate individual scene objects
                                </p>
                              </div>
                            </div>

                          <!-- Interactive card -->

                          <div class="gallery-card">


                            <div class="detail-stage">


                              <!-- Loading -->

                              <div
                                v-if="item.loading"
                                class="gallery-state"
                              >

                                <el-skeleton
                                  animated
                                  :rows="5"
                                />

                              </div>


                              <!-- Error -->

                              <div
                                v-else-if="item.error"
                                class="gallery-state gallery-error"
                              >

                                {{ item.error }}

                              </div>


                              <!-- Editable SVG -->

                              <div
                                v-else
                                class="svg-host"
                                :data-gallery-editor="item.id"
                                tabindex="0"
                                role="application"
                                :aria-label="
                                  `${item.title} editable SVG scene`
                                "
                                v-html="item.svgMarkup"
                                @pointerdown="
                                  startObjectMove(
                                    $event,
                                    item
                                  )
                                "
                                @keydown="
                                  handleEditorKeydown(
                                    $event,
                                    item
                                  )
                                "
                              />


                              <!-- Editable label -->

                              <span
                                v-if="
                                  !item.loading
                                  && !item.error
                                "
                                class="detail-label"
                              >

                                Editable SVG

                              </span>


                              <!-- ================================================== -->
                              <!-- Expanded Draft -->
                              <!-- ================================================== -->

                              <div
                                v-if="item.draftExpanded"
                                class="draft-preview"
                                @pointerdown.stop
                                @click.stop
                              >


                                <div class="draft-preview-header">


                                  <span class="draft-preview-title">

                                    Draft

                                  </span>


                                  <button
                                    type="button"
                                    class="draft-close-button"
                                    aria-label="Collapse draft preview"
                                    title="Collapse draft preview"
                                    @click="
                                      collapseDraft(item)
                                    "
                                  >

                                    ×

                                  </button>


                                </div>


                                <div class="draft-preview-image-stage">

                                  <img
                                    :src="item.draft"
                                    :alt="
                                      `${item.title} initial draft`
                                    "
                                    class="draft-preview-image"
                                    loading="eager"
                                    draggable="false"
                                  />

                                </div>


                              </div>


                              <!-- ================================================== -->
                              <!-- Collapsed Draft button -->
                              <!-- ================================================== -->

                              <button
                                v-else
                                type="button"
                                class="draft-expand-button"
                                aria-label="Show draft preview"
                                title="Show draft preview"
                                @pointerdown.stop
                                @click.stop="
                                  expandDraft(item)
                                "
                              >

                                <span class="draft-expand-icon">

                                  ◫

                                </span>


                                <span>

                                  Draft

                                </span>


                              </button>


                            </div>


                            <!-- Toolbar -->

                            <div
                              v-if="
                                !item.loading
                                && !item.error
                              "
                              class="object-toolbar"
                            >


                              <div class="selection-info">


                                <span class="selection-label">

                                  Selected

                                </span>


                                <span class="selection-name">

                                  {{ getSelectedLabel(item) }}

                                </span>


                              </div>


                              <div class="toolbar-actions">


                                <el-button
                                  circle
                                  size="small"
                                  title="Rotate left"
                                  :disabled="
                                    !getSelectedObject(item)
                                  "
                                  @click="
                                    rotateSelected(
                                      item,
                                      -15
                                    )
                                  "
                                >

                                  <el-icon>
                                    <RefreshLeft />
                                  </el-icon>

                                </el-button>


                                <el-button
                                  circle
                                  size="small"
                                  title="Rotate right"
                                  :disabled="
                                    !getSelectedObject(item)
                                  "
                                  @click="
                                    rotateSelected(
                                      item,
                                      15
                                    )
                                  "
                                >

                                  <el-icon>
                                    <RefreshRight />
                                  </el-icon>

                                </el-button>


                                <el-button
                                  circle
                                  size="small"
                                  title="Scale down"
                                  :disabled="
                                    !getSelectedObject(item)
                                  "
                                  @click="
                                    scaleSelected(
                                      item,
                                      -0.1
                                    )
                                  "
                                >

                                  <el-icon>
                                    <ZoomOut />
                                  </el-icon>

                                </el-button>


                                <el-button
                                  circle
                                  size="small"
                                  title="Scale up"
                                  :disabled="
                                    !getSelectedObject(item)
                                  "
                                  @click="
                                    scaleSelected(
                                      item,
                                      0.1
                                    )
                                  "
                                >

                                  <el-icon>
                                    <ZoomIn />
                                  </el-icon>

                                </el-button>


                                <el-button
                                  circle
                                  plain
                                  size="small"
                                  type="danger"
                                  title="Delete object"
                                  :disabled="
                                    !getSelectedObject(item)
                                  "
                                  @click="
                                    deleteSelected(item)
                                  "
                                >

                                  <el-icon>
                                    <Delete />
                                  </el-icon>

                                </el-button>


                                <el-button
                                  circle
                                  size="small"
                                  title="Reset scene"
                                  @click="
                                    resetScene(item)
                                  "
                                >

                                  <el-icon>
                                    <Refresh />
                                  </el-icon>

                                </el-button>


                              </div>


                            </div>


                          </div>







                                    </section>
              </div>


              <div class="intro-method-column">

                <div
                  class="intro-stage-switcher"
                  role="tablist"
                  :aria-label="`${item.title} workflow stages`"
                >

                  <button
                    type="button"
                    class="intro-stage-button intro-stage-button-concept"
                    :class="{
                      'intro-stage-button-active':
                        item.activeMethodStage === 'concept'
                    }"
                    :aria-selected="item.activeMethodStage === 'concept'"
                    @click="setIntroMethodStage(item, itemIndex, 'concept')"
                  >
                    <span class="intro-stage-index">01</span>
                    <span class="intro-stage-name">Concept Representation</span>
                  </button>

                  <button
                    type="button"
                    class="intro-stage-button intro-stage-button-reasoning"
                    :class="{
                      'intro-stage-button-active':
                        item.activeMethodStage === 'reasoning'
                    }"
                    :aria-selected="item.activeMethodStage === 'reasoning'"
                    @click="setIntroMethodStage(item, itemIndex, 'reasoning')"
                  >
                    <span class="intro-stage-index">02</span>
                    <span class="intro-stage-name">Agentic Reasoning</span>
                  </button>

                  <button
                    type="button"
                    class="intro-stage-button intro-stage-button-refinement"
                    :class="{
                      'intro-stage-button-active':
                        item.activeMethodStage === 'refinement'
                    }"
                    :aria-selected="item.activeMethodStage === 'refinement'"
                    @click="setIntroMethodStage(item, itemIndex, 'refinement')"
                  >
                    <span class="intro-stage-index">03</span>
                    <span class="intro-stage-name">Structure-aware Refinement</span>
                  </button>

                </div>

                <div class="intro-stage-content">

                <section
                              v-show="item.activeMethodStage === 'concept'"
                              class="intro-method-block intro-concept-block"
                            >

                              <div class="intro-method-heading">
                                <span class="intro-method-number">01</span>

                                <div>
                                  <h3 class="intro-method-title">
                                    Concept Representation
                                  </h3>

                                  <p class="intro-method-subtitle">
                                    Scene text → independently editable SVG objects
                                  </p>
                                </div>
                              </div>

                              <div
                                v-if="
                                  item.conceptLoading
                                  && item.conceptAssets.length === 0
                                "
                                class="intro-method-state"
                              >
                                Loading object assets…
                              </div>

                              <div
                                v-else-if="item.conceptAssets.length > 0"
                                class="intro-concept-grid"
                              >

                                <article
                                  v-for="(asset, assetIndex) in item.conceptAssets"
                                  :key="`${item.id}-concept-${asset.id}`"
                                  class="intro-concept-card"
                                >

                                  <span class="intro-concept-index">
                                    {{ String(assetIndex + 1).padStart(2, '0') }}
                                  </span>

                                  <div class="intro-concept-image-wrapper">

                                    <img
                                      v-if="asset.file"
                                      :src="asset.file"
                                      :alt="asset.name"
                                      class="intro-concept-image"
                                      draggable="false"
                                    />

                                    <div
                                      v-else
                                      class="intro-concept-svg-preview"
                                      v-html="asset.markup"
                                    />

                                  </div>

                                  <div class="intro-concept-name">
                                    {{ asset.name }}
                                  </div>

                                  <div class="intro-concept-format">
                                    Independent SVG Asset
                                  </div>

                                </article>

                              </div>

                              <div
                                v-else
                                class="intro-method-state intro-method-state-error"
                              >
                                {{ item.conceptError }}
                              </div>

                            </section>

                <section
                              v-show="item.activeMethodStage === 'reasoning'"
                              class="intro-method-block intro-reasoning-block"
                            >

                              <div class="intro-method-heading">
                                <span class="intro-method-number">02</span>

                                <div>
                                  <h3 class="intro-method-title">
                                    Agentic Layout Reasoning
                                  </h3>

                                  <p class="intro-method-subtitle">
                                    Executable code → corresponding intermediate layout
                                  </p>
                                </div>
                              </div>

                              <div
                                v-if="item.reasoningLoading"
                                class="intro-method-state intro-reasoning-state"
                              >
                                Loading reasoning trace…
                              </div>

                              <div
                                v-else-if="item.reasoningError"
                                class="intro-method-state intro-method-state-error"
                              >
                                {{ item.reasoningError }}
                              </div>

                              <div
                                v-else
                                class="intro-reasoning-card"
                              >

                                <div class="intro-reasoning-viewer">

                                  <!-- Left: executable code -->
                                  <div class="intro-program-panel">

                                    <div class="intro-panel-header">
                                      <span>Executable Program</span>
                                      <span>
                                        {{ String(item.reasoningSteps.length).padStart(2, '0') }} steps
                                      </span>
                                    </div>

                                    <div class="intro-program-list">

                                      <button
                                        v-for="(step, codeIndex) in item.reasoningSteps"
                                        :key="`${item.id}-reasoning-code-${codeIndex}`"
                                        type="button"
                                        class="intro-program-line"
                                        :class="{
                                          'intro-program-line-active':
                                            codeIndex === item.reasoningCurrentStep
                                        }"
                                        @click="
                                          selectReasoningStep(
                                            item,
                                            codeIndex
                                          )
                                        "
                                      >

                                        <span class="intro-program-index">
                                          {{ String(codeIndex + 1).padStart(2, '0') }}
                                        </span>

                                        <code class="intro-program-code">
                                          {{ step.code }}
                                        </code>

                                      </button>

                                    </div>

                                  </div>


                                  <!-- Right: corresponding layout -->
                                  <div class="intro-result-panel">

                                    <div class="intro-panel-header">
                                      <span>Intermediate Layout</span>
                                      <span>
                                        STEP
                                        {{
                                          String(item.reasoningCurrentStep + 1)
                                            .padStart(2, '0')
                                        }}
                                      </span>
                                    </div>

                                    <div class="intro-result-image-stage">

                                      <img
                                        v-if="getCurrentReasoningStep(item)"
                                        :src="getCurrentReasoningStep(item)?.image"
                                        :alt="
                                          `${item.title}, reasoning step ${
                                            item.reasoningCurrentStep + 1
                                          }`
                                        "
                                        class="intro-result-image"
                                        draggable="false"
                                      />

                                    </div>

                                  </div>

                                </div>


                                <div class="intro-reasoning-progress">

                                  <div class="intro-progress-info">

                                    <div class="intro-progress-left">

                                      <button
                                        type="button"
                                        class="intro-reasoning-play-button"
                                        :class="{
                                          'intro-reasoning-play-button-active':
                                            isReasoningPlaying
                                            && activeExampleIndex === itemIndex
                                        }"
                                        :aria-label="
                                          isReasoningPlaying
                                            ? 'Pause reasoning playback'
                                            : 'Play reasoning process'
                                        "
                                        @click="toggleIntroReasoningPlayback(itemIndex)"
                                      >
                                        {{ isReasoningPlaying ? 'Ⅱ' : '▶' }}
                                      </button>

                                      <span class="intro-current-operation">
                                        {{ getCurrentReasoningStep(item)?.code }}
                                      </span>

                                    </div>

                                    <span class="intro-step-indicator">
                                      STEP
                                      {{
                                        String(item.reasoningCurrentStep + 1)
                                          .padStart(2, '0')
                                      }}
                                      /
                                      {{
                                        String(item.reasoningSteps.length)
                                          .padStart(2, '0')
                                      }}
                                    </span>

                                  </div>

                                  <el-slider
                                    :model-value="item.reasoningCurrentStep"
                                    :min="0"
                                    :max="Math.max(0, item.reasoningSteps.length - 1)"
                                    :step="1"
                                    :show-tooltip="false"
                                    class="intro-reasoning-slider"
                                    @input="
                                      (value) =>
                                        handleReasoningSlider(
                                          item,
                                          value
                                        )
                                    "
                                  />

                                </div>

                              </div>

                            </section>

                <section
                              v-show="item.activeMethodStage === 'refinement'"
                              class="intro-method-block intro-refinement-block"
                            >

                              <div class="intro-method-heading">
                                <span class="intro-method-number">03</span>

                                <div>
                                  <h3 class="intro-method-title">
                                    Structure-aware Refinement
                                  </h3>

                                  <p class="intro-method-subtitle">
                                    Draft → progressive refinement → final detailed sketch
                                  </p>
                                </div>
                              </div>

                              <div
                                v-if="item.refinementLoading"
                                class="intro-method-state"
                              >
                                Loading refinement sequence…
                              </div>

                              <div
                                v-else
                                class="intro-refinement-card"
                              >

                                <div class="intro-refinement-viewer">

                                  <!-- Left: fixed initial draft -->
                                  <div class="intro-refinement-panel intro-refinement-draft-panel">

                                    <div class="intro-panel-header">
                                      <span>Initial Draft</span>
                                      <span>Draft</span>
                                    </div>

                                    <div class="intro-refinement-stage">
                                      <el-image
                                        class="intro-refinement-main-image"
                                        :src="item.draft"
                                        :alt="`${item.title} initial draft`"
                                        :preview-src-list="[item.draft]"
                                        fit="contain"
                                        preview-teleported
                                        hide-on-click-modal
                                      />
                                    </div>

                                  </div>


                                  <!-- Right: current refinement step -->
                                  <div class="intro-refinement-panel intro-refinement-current-panel">

                                    <div class="intro-panel-header">
                                      <span>Refinement Process</span>
                                      <span>
                                        {{ getCurrentRefinementLabel(item) }}
                                      </span>
                                    </div>

                                    <div class="intro-refinement-stage">
                                      <el-image
                                        class="intro-refinement-main-image"
                                        :src="getCurrentRefinementImage(item)"
                                        :alt="
                                          `${item.title} ${getCurrentRefinementLabel(item)}`
                                        "
                                        :preview-src-list="getRefinementDisplayFrames(item)"
                                        :initial-index="item.refinementCurrentStep"
                                        fit="contain"
                                        preview-teleported
                                        hide-on-click-modal
                                      />
                                    </div>

                                  </div>

                                </div>


                                <div class="intro-refinement-progress">

                                  <div class="intro-refinement-progress-info">

                                    <div class="intro-progress-left">

                                      <button
                                        type="button"
                                        class="intro-reasoning-play-button"
                                        :class="{
                                          'intro-reasoning-play-button-active':
                                            isRefinementPlaying
                                            && activeExampleIndex === itemIndex
                                        }"
                                        :aria-label="
                                          isRefinementPlaying
                                            ? 'Pause refinement playback'
                                            : 'Play refinement process'
                                        "
                                        :disabled="
                                          getRefinementDisplayFrames(item).length <= 1
                                        "
                                        @click="toggleIntroRefinementPlayback(itemIndex)"
                                      >
                                        {{ isRefinementPlaying ? 'Ⅱ' : '▶' }}
                                      </button>

                                      <span class="intro-refinement-progress-label">
                                        Draft → {{ getCurrentRefinementLabel(item) }}
                                      </span>

                                    </div>

                                    <span class="intro-refinement-step-indicator">
                                      STEP
                                      {{
                                        String(item.refinementCurrentStep + 1)
                                          .padStart(2, '0')
                                      }}
                                      /
                                      {{
                                        String(getRefinementDisplayFrames(item).length)
                                          .padStart(2, '0')
                                      }}
                                    </span>
                                  </div>

                                  <el-slider
                                    :model-value="item.refinementCurrentStep"
                                    :min="0"
                                    :max="
                                      Math.max(
                                        0,
                                        getRefinementDisplayFrames(item).length - 1
                                      )
                                    "
                                    :step="1"
                                    :show-tooltip="false"
                                    class="intro-refinement-slider"
                                    @input="
                                      (value) =>
                                        handleRefinementSlider(
                                          item,
                                          value
                                        )
                                    "
                                  />

                                </div>

                              </div>

                              <p
                                v-if="item.refinementError"
                                class="intro-refinement-note"
                              >
                                No additional intermediate frames are configured yet;
                                the real Draft and Final are shown without inventing steps.
                              </p>

                            </section>

                </div>

              </div>

            </div>

          </article>

        </div>

      </el-col>

    </el-row>



  </div>

</template>



<style scoped>


/* ============================================================
   Section
   ============================================================ */

.gallery-section {
  width: 100%;
}


/* ============================================================
   Introduction
   ============================================================ */

.gallery-desc {
  margin: 0 0 30px;

  color: #000;

  font-size: 18px;
  line-height: 1.8;

  text-align: justify;
}

.gallery-subheading {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  margin:
    0
    0
    14px;
}

.gallery-subheading-label {
  flex-shrink: 0;
  margin: 0;
  padding:
    6px
    13px;
  color: #222;
  font-family: inherit;
  font-size: 24px;
  font-style: normal;
  font-weight: 700;
  line-height: 1.3;
  text-align: left;
  background:
    linear-gradient(
      90deg,
      #fff0e5,
      #fff8d8,
      #eaf7ed,
      #f1ecfb
    );
  border-radius: 999px;
}

.gallery-subheading-line {
  width: 100%;
  height: 1px;
  background:
    linear-gradient(
      90deg,
      #d9d9d9,
      rgba(217, 217, 217, 0)
    );
}


/* Application chips at the lower right */

.try-actions {
  position: relative;
  z-index: 1;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  width: 100%;
  margin-top: 16px;
}

.try-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 28px;
  padding:
    5px
    11px;
  color: #303030;
  font-size: 12px;
  font-weight: 650;
  line-height: 1.2;
  border:
    1px
    solid
    transparent;
  border-radius: 999px;
  box-sizing: border-box;
  white-space: nowrap;
}

.try-chip-orange {
  background: #fff0e5;
  border-color: #f3b17f;
}

.try-chip-yellow {
  background: #FFF8D8;
  border-color: #e9c957;
}
.try-chip-green {
  background: #eaf7ed;
  border-color: #9dccaa;
}

.try-chip-purple {
  background: #f1ecfb;
  border-color: #b7a2df;
}


/* ============================================================
   SketchClaw title highlight
   ============================================================ */














.sketchclaw-overview {
  position: relative;
  width: 100%;
  margin:
    8px
    0
    30px;
  padding:
    26px
    30px
    24px;
  overflow: hidden;
  background:
    linear-gradient(
      135deg,
      rgba(255, 249, 238, 0.97),
      rgba(248, 252, 244, 0.97) 48%,
      rgba(249, 246, 255, 0.97)
    );
  border: 1px solid #e3e0db;
  border-radius: 14px;
  box-shadow:
    0
    6px
    18px
    rgba(35, 35, 35, 0.055);
  box-sizing: border-box;
}

.sketchclaw-overview::after {
  position: absolute;
  right: -72px;
  bottom: -98px;
  width: 225px;
  height: 225px;
  background:
    radial-gradient(
      circle,
      rgba(165, 138, 208, 0.13),
      rgba(165, 138, 208, 0)
    );
  border-radius: 50%;
  pointer-events: none;
  content: '';
}

.overview-kicker {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 14px;
}

.overview-kicker-bar {
  display: block;
  width: 29px;
  height: 5px;
  border-radius: 999px;
}

.overview-kicker-orange {
  background: #f39a54;
}

.overview-kicker-yellow {
  background: #e9c957;
}

.overview-kicker-green {
  background: #85bd74;
}

.overview-kicker-purple {
  background: #a58ad0;
}

.overview-title {
  position: relative;
  z-index: 1;
  margin:
    0
    0
    7px;
  color: #222;
  font-size: 30px;
  font-weight: 750;
  line-height: 1.3;
  text-align: left;
}

.overview-definition {
  position: relative;
  z-index: 1;
  max-width: 850px;
  margin:
    0
    0
    16px;
  color: #303030;
  font-size: 18px;
  font-weight: 600;
  line-height: 1.6;
  text-align: left;
}

.sketchclaw-summary {
  position: relative;
  z-index: 1;
  max-width: 860px;
  margin: 0;
  color: #333;
  font-size: 18px;
  font-weight: 400;
  line-height: 1.65;
  text-align: left;
}

.sketchclaw-summary-secondary {
  margin-top: 7px;
}



/* Responsive */

@media (max-width: 767px) {

  .sketchclaw-overview {
    padding:
      22px
      18px
      20px;
  }

  .overview-title {
    font-size: 27px;
  }

  .overview-definition {
    font-size: 17px;
  }

  .try-actions {
    justify-content: flex-start;
  }

  .sketchclaw-summary {
    font-size: 15px;
  }

}

/* Instruction before the examples */

.more-results-button {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  gap: 7px;
  min-height: 34px;
  padding: 6px 13px;
  color: #7f4a20;
  font-size: 14px;
  font-weight: 650;
  line-height: 1;
  text-decoration: none;
  background: #fffaf5;
  border: 1px solid #edb98e;
  border-radius: 999px;
  box-sizing: border-box;
  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.more-results-button:hover {
  color: #6f3f1a;
  background: #fff3e8;
  border-color: #df9a62;
  box-shadow: 0 4px 12px rgba(181, 107, 47, 0.12);
  transform: translateY(-1px);
}

.more-results-button:focus-visible {
  outline: 2px solid rgba(229, 139, 67, 0.45);
  outline-offset: 3px;
}

.more-results-arrow {
  font-size: 16px;
  line-height: 1;
  transition: transform 0.2s ease;
}

.more-results-button:hover .more-results-arrow {
  transform: translateX(2px);
}

.gallery-try-instruction p {
  margin: 0;
  color: #222;
  font-size: 18px;
  line-height: 1.65;
  text-align: justify;
}

.gallery-interaction-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  padding: 0;
  color: #b56b2f;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.6;
  text-align: left;
}

.gallery-interaction-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  width: 100%;
  margin: 0 0 12px;
}

.gallery-interaction-row .gallery-interaction-tip {
  flex: 1 1 auto;
  min-width: 0;
}

.gallery-interaction-row .more-results-button {
  flex: 0 0 auto;
  margin-left: auto;
}

.gallery-interaction-tip-top {
  margin: 0;
  padding:
    0
    2px;
}

.gallery-interaction-icon {
  flex-shrink: 0;
  color: #e58b43;
  font-size: 15px;
  line-height: 1;
}


/* Responsive */

@media (max-width: 767px) {

  .try-panel {
    padding:
      23px
      18px
      18px;
  }

  .try-title {
    font-size: 18px;
  }

  .try-description {
    text-align: left;
  }

  .try-actions {
    justify-content: flex-start;
  }

  .gallery-subheading {
    gap: 10px;
    margin-bottom: 12px;
  }

  .gallery-subheading-label {
    padding:
      5px
      11px;
    font-size: 21px;
  }

  .gallery-try-instruction p {
    text-align: left;
  }

}

/* ============================================================
   Gallery grid
   ============================================================ */

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  align-items: stretch;
  gap: 22px;
  width: 100%;
  margin: 0 0 38px;
  box-sizing: border-box;
}


/* ============================================================
   Gallery item
   ============================================================ */

.gallery-item {
  --gallery-accent: #ffc862c4;
  --gallery-accent-soft: rgba(255, 200, 98, 0.18);


  display: flex;
  flex-direction: column;

  width: 100%;
  min-width: 0;
  height: 100%;
}


/* ============================================================
   Text below image
   ============================================================ */

.gallery-info {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: auto;
  margin-top: 12px;
  padding: 0 2px;
  box-sizing: border-box;
}


.gallery-meta {
  display: flex;

  align-items: center;
  justify-content: space-between;

  gap: 8px;

  margin-bottom: 5px;
}


.gallery-title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #252525;
  font-size: 18px;
  font-weight: 650;
}


.gallery-title::before {
  flex-shrink: 0;

  width: 8px;
  height: 8px;

  background: var(--gallery-accent, #ff8a45);
  border-radius: 50%;

  box-shadow:
    0
    0
    0
    4px
    var(--gallery-accent-soft, #fff1e8);

  content: '';
}



.gallery-index {
  flex-shrink: 0;

  padding:
    5px
    9px;

  color: #6f551d;

  font-size: 12px;

  font-weight: 600;

  letter-spacing: 0.04em;

  background: var(--gallery-accent-soft);

  border:
    1px
    solid
    var(--gallery-accent);

  border-radius: 999px;
}


.gallery-caption {
  display: -webkit-box;
  flex: 1;
  min-height: 72px;
  margin: 0;
  overflow: hidden;
  color: #404040;
  font-size: 15px;
  font-style: italic;
  line-height: 1.55;
  text-align: left;
  cursor: help;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}


.gallery-caption:focus-visible {
  outline:
    2px
    solid
    var(--gallery-accent);

  outline-offset: 3px;

  border-radius: 3px;
}


/*
  The tooltip is teleported outside this scoped component,
  so a global selector is required.
*/

:global(.intro-caption-tooltip) {
  max-width: 380px;

  padding:
    10px
    12px;

  color: #333;

  font-size: 14px;
  font-style: italic;

  line-height: 1.6;

  text-align: left;

  white-space: normal;

  word-break: normal;
}


/* ============================================================
   Card
   ============================================================ */

.gallery-card {
  position: relative;
  width: 100%;
  margin-top: auto;
  overflow: hidden;
  background: #fff;
  border: 1px solid #d9dce1;
  border-radius: 14px;
  box-shadow: 0 8px 24px rgba(25, 30, 38, 0.07);
  box-sizing: border-box;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}


.gallery-card::before {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  z-index: 80;

  height: 4px;

  background: var(--gallery-accent, #ff8a45);

  pointer-events: none;

  content: '';
}


.gallery-card:hover {
  border-color: #bfc2c7;

  box-shadow:
    0
    7px
    18px
    rgba(0, 0, 0, 0.08);

  transform:
    translateY(-2px);
}


/* ============================================================
   Detail stage
   ============================================================ */

.detail-stage {
  position: relative;
  width: 100%;
  min-width: 0;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  color-scheme: only light;
  forced-color-adjust: none;
  background: #fff !important;
  filter: none !important;
  mix-blend-mode: normal !important;
  isolation: isolate;
}


/* ============================================================
   SVG host
   ============================================================ */

.svg-host {
  width: 100%;
  height: 100%;

  overflow: hidden;

  color-scheme: only light;

  forced-color-adjust: none;

  background: #fff !important;

  filter: none !important;

  mix-blend-mode: normal !important;

  isolation: isolate;

  outline: none;

  box-sizing: border-box;

  cursor: default;

  touch-action: none;
  user-select: none;
}


.svg-host:focus-visible {
  box-shadow:
    inset
    0
    0
    0
    2px
    rgba(50, 50, 50, 0.14);
}


.svg-host :deep(svg) {
  display: block;

  width: 100%;
  height: 100%;

  overflow: hidden;

  color-scheme: only light;

  forced-color-adjust: none;

  color: #111 !important;

  background: #fff !important;

  filter: none !important;

  mix-blend-mode: normal !important;

  opacity: 1 !important;

  cursor: default;

  touch-action: none;
  user-select: none;
}


/*
  Keep white object masks white and restore black sketch strokes
  even when global dark-mode rules target inline SVG elements.
*/

.svg-host
:deep(
  .white-box-bg,
  .white-box-bg *
) {
  color: #fff !important;

  fill: #fff !important;

  stroke: #fff !important;

  filter: none !important;

  mix-blend-mode: normal !important;

  opacity: 1 !important;
}


.svg-host
:deep(
  g.stroke-group,
  g.stroke-group *
) {
  color: #111 !important;

  filter: none !important;

  mix-blend-mode: normal !important;

  opacity: 1 !important;
}


.svg-host
:deep(
  g.stroke-group path,
  g.stroke-group line,
  g.stroke-group polyline,
  g.stroke-group polygon,
  g.stroke-group rect,
  g.stroke-group circle,
  g.stroke-group ellipse
) {
  stroke: #111 !important;
}


/* ============================================================
   Editable objects
   ============================================================ */

.svg-host :deep(.editable-object-wrapper) {
  cursor: grab;

  pointer-events: all;

  touch-action: none;

  transition:
    filter
    0.15s
    ease;
}


.svg-host :deep(.editable-object-wrapper:active) {
  cursor: grabbing;
}


.svg-host :deep(.editable-object-wrapper .white-box-bg) {
  pointer-events: all;
}


.svg-host :deep(.editable-object-wrapper.is-selected) {
  filter:
    drop-shadow(
      0
      0
      2px
      rgba(205, 48, 54, 0.95)
    )
    drop-shadow(
      0
      0
      5px
      rgba(205, 48, 54, 0.42)
    );
}


/* ============================================================
   Loading and error
   ============================================================ */

.gallery-state {
  display: flex;

  align-items: center;
  justify-content: center;

  width: 100%;
  height: 100%;

  padding: 16px;

  box-sizing: border-box;
}


.gallery-error {
  color: #c7373d;

  font-size: 11px;
  line-height: 1.6;

  text-align: center;
}


/* ============================================================
   Editable label
   ============================================================ */

.detail-label {
  position: absolute;
  right: 12px;
  bottom: 12px;
  z-index: 30;
  padding: 6px 10px;
  color: #4f5358;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.045em;
  text-transform: uppercase;
  background: rgba(248, 248, 248, 0.94);
  border: 1px solid rgba(207, 210, 215, 0.9);
  border-radius: 999px;
  pointer-events: none;
  backdrop-filter: blur(5px);
}


/* ============================================================
   Toolbar
   ============================================================ */

.object-toolbar {
  display: flex;
  align-items: stretch;
  flex-direction: column;
  gap: 8px;
  min-height: 82px;
  padding: 9px 11px 11px;
  background: #f5f5f4;
  border-top: 1px solid #dedfe2;
  box-sizing: border-box;
}


.selection-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-width: 0;
}


.selection-label {
  color: #777a80;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}


.selection-name {
  max-width: 165px;
  margin-top: 0;
  overflow: hidden;
  color: #2f3237;
  font-size: 12px;
  font-weight: 650;
  text-overflow: ellipsis;
  white-space: nowrap;
}


.toolbar-actions {
  display: flex;

  flex-wrap: nowrap;
  justify-content: center;

  gap: 4px;
}


.toolbar-actions :deep(.el-button + .el-button) {
  margin-left: 0;
}


.toolbar-actions :deep(.el-button--small.is-circle) {
  width: 29px;
  height: 29px;
}


/* ============================================================
   Tablet
   ============================================================ */

@media (max-width: 991px) {

  .gallery-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 28px 22px;
  }

  .gallery-caption {
    min-height: 66px;
  }

}


/* ============================================================
   Mobile
   ============================================================ */

@media (max-width: 767px) {

  .gallery-info {
    height: auto;
  }

  .gallery-desc {
    padding: 0 4px;
    font-size: 15px;
  }

}


/* ============================================================
   Narrow mobile
   ============================================================ */

@media (max-width: 480px) {

  .gallery-card {
    border-radius: 10px;
  }

  .gallery-interaction-icon {
    width: 26px;
    height: 26px;
  }

  .selection-name {
    max-width: 150px;
  }

  .toolbar-actions {
    justify-content: space-between;
    width: 100%;
  }

}

.abstract-text strong {
  color: #222;
  font-weight: 700;
  
}



/* ============================================================
   Global dark-mode protection for inline SVG
   ============================================================ */

/*
  These selectors cover common dark-theme implementations and
  browser extensions that attempt to recolor inline SVG.
*/

:global(html.dark .svg-host),
:global(body.dark .svg-host),
:global([data-theme='dark'] .svg-host),
:global([data-color-scheme='dark'] .svg-host),
:global(html.dark .svg-host svg),
:global(body.dark .svg-host svg),
:global([data-theme='dark'] .svg-host svg),
:global([data-color-scheme='dark'] .svg-host svg) {
  color-scheme: only light;

  forced-color-adjust: none;

  background: #fff !important;

  filter: none !important;

  mix-blend-mode: normal !important;

  opacity: 1 !important;
}


:global(
  html.dark
  .svg-host
  g.stroke-group
  *
),
:global(
  body.dark
  .svg-host
  g.stroke-group
  *
),
:global(
  [data-theme='dark']
  .svg-host
  g.stroke-group
  *
),
:global(
  [data-color-scheme='dark']
  .svg-host
  g.stroke-group
  *
) {
  color: #111 !important;

  stroke: #111 !important;

  filter: none !important;

  mix-blend-mode: normal !important;

  opacity: 1 !important;
}


:global(
  html.dark
  .svg-host
  .white-box-bg
),
:global(
  html.dark
  .svg-host
  .white-box-bg
  *
),
:global(
  body.dark
  .svg-host
  .white-box-bg
),
:global(
  body.dark
  .svg-host
  .white-box-bg
  *
),
:global(
  [data-theme='dark']
  .svg-host
  .white-box-bg
),
:global(
  [data-theme='dark']
  .svg-host
  .white-box-bg
  *
) {
  color: #fff !important;

  fill: #fff !important;

  stroke: #fff !important;

  filter: none !important;

  mix-blend-mode: normal !important;

  opacity: 1 !important;
}



/* ============================================================
   Intro caption tooltip dark-mode protection
   ============================================================ */

:global(.intro-caption-tooltip.el-popper) {
  color-scheme: only light;

  forced-color-adjust: none;

  color: #333 !important;

  background: #ffffff !important;

  border-color: #d8d8d8 !important;

  filter: none !important;

  mix-blend-mode: normal !important;
}


:global(
  .intro-caption-tooltip.el-popper
  .el-popper__arrow::before
) {
  background: #ffffff !important;

  border-color: #d8d8d8 !important;
}



/* ============================================================
   Intro examples now carry the three method stages directly.
   TL;DR / overview and More Results are intentionally untouched.
   ============================================================ */

.intro-method-gallery {
  grid-template-columns: repeat(3, minmax(0, 1fr));
  align-items: start;
  gap: 18px;
}

.intro-method-example {
  width: 100%;
  min-width: 0;
  padding: 12px;
  background: #fbfbfa;
  border: 1px solid #e1e2e5;
  border-radius: 15px;
  box-shadow: 0 6px 18px rgba(25, 30, 38, 0.045);
  box-sizing: border-box;
}

/*
  Three method stages remain unchanged in content.  Only one stage is
  visible at a time, so all three examples can stay in one desktop row.
*/
.intro-method-block {
  width: 100%;
  height: 470px;
  margin: 10px 0 0;
  padding: 11px;
  overflow: hidden;
  background: #fff;
  border: 1px solid #dedfe3;
  border-radius: 12px;
  box-sizing: border-box;
  animation: intro-stage-fade 0.18s ease;
}

@keyframes intro-stage-fade {
  from {
    opacity: 0.45;
    transform: translateY(3px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Standalone Try action: directly below each Example heading. */
.intro-result-trigger {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  min-height: 31px;
  margin: 3px 0 7px;
  padding: 5px 10px;
  color: #8a542a;
  font-size: 10px;
  font-weight: 720;
  line-height: 1.2;
  background: #fffaf5;
  border: 1px solid #edc29e;
  border-radius: 9px;
  cursor: pointer;
  box-sizing: border-box;
  transition:
    color 0.18s ease,
    background-color 0.18s ease,
    border-color 0.18s ease,
    box-shadow 0.18s ease,
    transform 0.18s ease;
}

.intro-result-trigger:hover {
  color: #6f3f1a;
  background: #fff3e8;
  border-color: #df9a62;
  box-shadow: 0 3px 9px rgba(181, 107, 47, 0.10);
  transform: translateY(-1px);
}

.intro-result-trigger-active {
  color: #70421f;
  background: #fff1e4;
  border-color: #e0a36f;
  box-shadow: inset 0 0 0 1px rgba(224, 163, 111, 0.14);
}

.intro-result-trigger-star {
  flex: 0 0 auto;
  color: #e58b43;
  font-size: 10px;
}

.intro-result-trigger-arrow {
  flex: 0 0 auto;
  margin-left: 1px;
  font-size: 12px;
  transition: transform 0.18s ease;
}

.intro-result-trigger:hover .intro-result-trigger-arrow {
  transform: translateX(2px);
}

/* Compact workflow tabs: 01 / 02 / 03 are the three method stages. */
.intro-stage-switcher {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 4px;
  width: 100%;
  margin-top: 10px;
  padding: 4px;
  background: #f2f2f1;
  border: 1px solid #dedfe2;
  border-radius: 11px;
  box-sizing: border-box;
}

.intro-stage-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  min-width: 0;
  min-height: 42px;
  padding: 5px 6px;
  color: #737373;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  box-sizing: border-box;
  transition:
    color 0.18s ease,
    background-color 0.18s ease,
    border-color 0.18s ease,
    box-shadow 0.18s ease,
    transform 0.18s ease;
}

.intro-stage-button:hover {
  color: #333;
  background: rgba(255, 255, 255, 0.76);
}

.intro-stage-button-active {
  color: #292929;
  background: #fff;
  border-color: #d6d7da;
  box-shadow: 0 2px 7px rgba(20, 24, 30, 0.07);
}

.intro-stage-button-active:hover {
  transform: translateY(-1px);
}

.intro-stage-index {
  flex: 0 0 auto;
  color: #967123;
  font-family: Consolas, Monaco, "Courier New", monospace;
  font-size: 8px;
  font-weight: 750;
}

.intro-stage-name {
  min-width: 0;
  overflow: visible;
  font-size: 9px;
  font-weight: 700;
  line-height: 1.15;
  text-align: center;
  white-space: normal;
}

.intro-stage-button-concept.intro-stage-button-active {
  border-color: #e8c681;
}

.intro-stage-button-reasoning.intro-stage-button-active {
  border-color: #9dccaa;
}

.intro-stage-button-refinement.intro-stage-button-active {
  border-color: #b7a2df;
}


.intro-method-heading {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  min-height: 47px;
  margin-bottom: 9px;
}

.intro-method-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  min-width: 31px;
  height: 23px;
  margin-top: 1px;
  padding: 0 7px;
  color: #79591b;
  font-size: 10px;
  font-weight: 750;
  letter-spacing: 0.05em;
  background: rgba(255, 200, 98, 0.18);
  border: 1px solid #e7c46e;
  border-radius: 999px;
  box-sizing: border-box;
}

.intro-method-number-result {
  color: #8b5428;
  background: #fff4e9;
  border-color: #edb98e;
}

.intro-method-title {
  margin: 0;
  color: #292929;
  font-size: 16px;
  font-weight: 720;
  line-height: 1.3;
}

.intro-method-subtitle {
  margin: 3px 0 0;
  color: #777;
  font-size: 11px;
  line-height: 1.45;
}

.intro-method-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 120px;
  padding: 18px;
  color: #777;
  font-size: 12px;
  line-height: 1.6;
  text-align: center;
  background: #fafafa;
  border: 1px dashed #d9dade;
  border-radius: 10px;
  box-sizing: border-box;
}

.intro-method-state-error {
  color: #a94b4f;
}

/* Concept: preserve the independent-object card language from Concept.vue */

.intro-concept-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-content: start;
  gap: 8px;
  max-height: 385px;
  padding-right: 3px;
  overflow-y: auto;
  scrollbar-width: thin;
}

.intro-concept-card {
  position: relative;
  min-width: 0;
  overflow: hidden;
  background: #fff;
  border: 1px solid #dfe1e5;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(25, 30, 38, 0.045);
}

.intro-concept-index {
  position: absolute;
  top: 7px;
  left: 7px;
  z-index: 3;
  min-width: 24px;
  padding: 3px 5px;
  color: #555;
  font-size: 9px;
  font-weight: 700;
  text-align: center;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid #dedfe2;
  border-radius: 999px;
}

.intro-concept-image-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1 / 0.78;
  padding: 8px;
  overflow: hidden;
  color-scheme: only light;
  forced-color-adjust: none;
  background: #fff !important;
  box-sizing: border-box;
}

.intro-concept-image,
.intro-concept-svg-preview {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  color-scheme: only light;
  forced-color-adjust: none;
  background: #fff !important;
}

.intro-concept-svg-preview :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
  background: #fff !important;
}

.intro-concept-name {
  padding: 8px 8px 2px;
  overflow: hidden;
  color: #333;
  font-size: 11px;
  font-weight: 650;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.intro-concept-format {
  padding: 0 8px 9px;
  color: #929292;
  font-size: 8px;
  font-weight: 650;
  letter-spacing: 0.035em;
  text-transform: uppercase;
}

/* Reasoning: left code / right corresponding rendered layout */

.intro-reasoning-card {
  overflow: hidden;
  background: #fff;
  border: 1px solid #d8dade;
  border-radius: 11px;
}

.intro-reasoning-viewer {
  display: grid;
  grid-template-columns:
    minmax(0, 0.9fr)
    minmax(0, 1.1fr);
  height: 315px;
}

.intro-program-panel,
.intro-result-panel {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
}

.intro-program-panel {
  background: #f7f7f7;
  border-right: 1px solid #dedfe2;
}

.intro-result-panel {
  background: #fff;
}

.intro-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex: 0 0 auto;
  min-height: 35px;
  padding: 0 10px;
  color: #686868;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  background: #f1f1f1;
  border-bottom: 1px solid #dedfe2;
  box-sizing: border-box;
}

.intro-program-list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 7px 0;
}

.intro-program-line {
  display: grid;
  grid-template-columns: 29px minmax(0, 1fr);
  align-items: start;
  width: 100%;
  padding: 6px 8px;
  color: #555;
  text-align: left;
  background: transparent;
  border: 0;
  cursor: pointer;
  box-sizing: border-box;
}

.intro-program-line:hover {
  background: #ededed;
}

.intro-program-line-active {
  color: #b3373d;
  background: #fff0f0;
  box-shadow: inset 3px 0 0 #c9484e;
}

.intro-program-index {
  color: #aaa;
  font-family: Consolas, Monaco, "Courier New", monospace;
  font-size: 9px;
  line-height: 1.5;
}

.intro-program-code {
  min-width: 0;
  overflow-wrap: anywhere;
  color: inherit;
  font-family: Consolas, Monaco, "Courier New", monospace;
  font-size: 10px;
  line-height: 1.5;
  white-space: pre-wrap;
}

.intro-result-image-stage {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  min-height: 0;
  padding: 8px;
  overflow: hidden;
  color-scheme: only light;
  forced-color-adjust: none;
  background: #fff !important;
  box-sizing: border-box;
}

.intro-result-image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: #fff !important;
}

.intro-reasoning-progress {
  padding: 8px 11px 6px;
  background: #fafafa;
  border-top: 1px solid #dedfe2;
}

.intro-progress-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 9px;
  margin-bottom: 2px;
}

.intro-progress-left {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
  gap: 8px;
}

.intro-reasoning-play-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  width: 28px;
  height: 28px;
  padding: 0;
  color: #444;
  font-size: 10px;
  background: #fff;
  border: 1px solid #bfc1c5;
  border-radius: 50%;
  cursor: pointer;
}

.intro-reasoning-play-button-active {
  color: #fff;
  background: #3f3f3f;
  border-color: #3f3f3f;
}

.intro-current-operation {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  color: #777;
  font-family: Consolas, Monaco, "Courier New", monospace;
  font-size: 9px;
  line-height: 1.35;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.intro-step-indicator {
  flex: 0 0 auto;
  color: #444;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.035em;
}

.intro-reasoning-slider {
  --el-slider-main-bg-color: #3b3b3b;
  --el-slider-runway-bg-color: #dedede;
  --el-slider-stop-bg-color: #dedede;
  padding: 0 2px;
}

.intro-reasoning-slider :deep(.el-slider__runway),
.intro-reasoning-slider :deep(.el-slider__bar) {
  height: 4px;
}

.intro-reasoning-slider :deep(.el-slider__button) {
  width: 12px;
  height: 12px;
  background: #fff;
  border: 2px solid #3b3b3b;
}

/* Refinement: fixed Draft on the left, current step on the right, slider below */

.intro-refinement-card {
  overflow: hidden;
  background: #fff;
  border: 1px solid #d8dade;
  border-radius: 11px;
}

.intro-refinement-viewer {
  display: grid;
  grid-template-columns:
    minmax(0, 0.88fr)
    minmax(0, 1.12fr);
  height: 315px;
}

.intro-refinement-panel {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  background: #fff;
}

.intro-refinement-draft-panel {
  border-right: 1px solid #dedfe2;
}

.intro-refinement-stage {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  min-height: 0;
  padding: 8px;
  overflow: hidden;
  color-scheme: only light;
  forced-color-adjust: none;
  background: #fff !important;
  box-sizing: border-box;
}

.intro-refinement-main-image {
  display: block;
  width: 100%;
  height: 100%;
  background: #fff !important;
}

.intro-refinement-progress {
  padding: 8px 11px 6px;
  background: #fafafa;
  border-top: 1px solid #dedfe2;
}

.intro-refinement-progress-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 2px;
}

.intro-refinement-progress-label {
  min-width: 0;
  overflow: hidden;
  color: #777;
  font-size: 9px;
  font-weight: 600;
  line-height: 1.35;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.intro-refinement-progress .intro-progress-left {
  min-width: 0;
}

.intro-refinement-progress .intro-reasoning-play-button:disabled {
  color: #aaa;
  background: #f4f4f4;
  border-color: #d8dade;
  cursor: not-allowed;
  opacity: 0.7;
}

.intro-refinement-step-indicator {
  flex: 0 0 auto;
  color: #444;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.035em;
}

.intro-refinement-slider {
  --el-slider-main-bg-color: #3b3b3b;
  --el-slider-runway-bg-color: #dedede;
  --el-slider-stop-bg-color: #dedede;
  padding: 0 2px;
}

.intro-refinement-slider :deep(.el-slider__runway),
.intro-refinement-slider :deep(.el-slider__bar) {
  height: 4px;
}

.intro-refinement-slider :deep(.el-slider__button) {
  width: 12px;
  height: 12px;
  background: #fff;
  border: 2px solid #3b3b3b;
}

.intro-refinement-note {
  margin: 8px 0 0;
  color: #999;
  font-size: 9px;
  line-height: 1.5;
  text-align: left;
}

.intro-final-block .gallery-card {
  margin-top: 0;
}

/* Keep the editable result compact inside the three-column Intro layout. */
.intro-final-block .detail-stage {
  height: 300px;
  aspect-ratio: auto;
}

@media (max-width: 991px) {

  .intro-method-gallery {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

}

@media (max-width: 767px) {

  .intro-method-gallery {
    grid-template-columns: minmax(0, 1fr);
  }

  .intro-method-block {
    height: auto;
    min-height: 460px;
  }

  .intro-stage-switcher {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .intro-concept-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .intro-reasoning-viewer {
    grid-template-columns: minmax(0, 1fr);
    height: auto;
  }

  .intro-program-panel {
    height: 220px;
    border-right: 0;
    border-bottom: 1px solid #dedfe2;
  }

  .intro-result-panel {
    min-height: 290px;
  }

  .intro-refinement-viewer {
    grid-template-columns: minmax(0, 1fr);
    height: auto;
  }

  .intro-refinement-draft-panel {
    border-right: 0;
    border-bottom: 1px solid #dedfe2;
  }

  .intro-refinement-panel {
    min-height: 245px;
  }

  .intro-method-block {
    padding: 12px;
  }

}



/* ============================================================
   Single-example split view
   Example + prompt are shared; editable result stays on the left;
   Concept / Reasoning / Refinement switch only on the right.
   ============================================================ */

.intro-example-carousel {
  width: 100%;
}

.intro-single-example {
  width: 100%;
  min-width: 0;
  padding: 16px;
  background: #fbfbfa;
  border: 1px solid #e1e2e5;
  border-radius: 15px;
  box-shadow: 0 6px 18px rgba(25, 30, 38, 0.045);
  box-sizing: border-box;
}

.intro-example-header {
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr) 40px;
  align-items: center;
  gap: 12px;
  width: 100%;
  margin-bottom: 14px;
}

.intro-example-info {
  min-width: 0;
  margin: 0;
  padding: 0 2px;
}

.intro-example-caption {
  display: block;
  width: 100%;
  min-width: 0;
  min-height: 0;
  margin-top: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  -webkit-line-clamp: unset;
}

.intro-example-nav-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  padding: 0;
  color: #555;
  font-size: 27px;
  line-height: 1;
  background: #fff;
  border: 1px solid #d4d6da;
  border-radius: 50%;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.07);
  cursor: pointer;
  box-sizing: border-box;
  transition:
    color 0.18s ease,
    background-color 0.18s ease,
    border-color 0.18s ease,
    box-shadow 0.18s ease,
    transform 0.18s ease;
}

.intro-example-nav-button:hover {
  color: #6f551d;
  background: rgba(255, 200, 98, 0.12);
  border-color: #e1b759;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.09);
  transform: translateY(-1px);
}

.intro-example-nav-button:focus-visible {
  outline: 2px solid rgba(225, 183, 89, 0.45);
  outline-offset: 3px;
}

.intro-example-workspace {
  display: grid;
  grid-template-columns:
    minmax(0, 0.82fr)
    minmax(0, 1.18fr);
  align-items: start;
  gap: 16px;
  width: 100%;
}

.intro-editable-column,
.intro-method-column {
  min-width: 0;
}

.intro-editable-panel {
  width: 100%;
  padding: 11px;
  background: #fff;
  border: 1px solid #dedfe3;
  border-radius: 12px;
  box-sizing: border-box;
}

.intro-editable-heading {
  min-height: 47px;
  margin-bottom: 9px;
}

.intro-editable-title {
  margin: 0;
  color: #292929;
  font-size: 16px;
  font-weight: 720;
  line-height: 1.3;
}

.intro-editable-subtitle {
  margin: 3px 0 0;
  color: #777;
  font-size: 11px;
  line-height: 1.45;
}

.intro-editable-panel .gallery-card {
  margin-top: 0;
}

.intro-editable-panel .detail-stage {
  height: 390px;
  aspect-ratio: auto;
}

.intro-method-column .intro-stage-switcher {
  margin-top: 0;
}

.intro-stage-content {
  width: 100%;
  margin-top: 10px;
}

.intro-method-column .intro-method-block {
  width: 100%;
  height: 492px;
  margin: 0;
  padding: 11px;
  overflow: hidden;
  background: #fff;
  border: 1px solid #dedfe3;
  border-radius: 12px;
  box-sizing: border-box;
  animation: intro-stage-fade 0.18s ease;
}

.intro-method-column .intro-concept-grid {
  max-height: 405px;
}

.intro-method-column .intro-reasoning-viewer,
.intro-method-column .intro-refinement-viewer {
  height: 345px;
}

/* Old Try/result-tab styles are intentionally not used in this layout. */
.intro-result-trigger,
.intro-method-number-result {
  display: none;
}

@media (max-width: 991px) {

  .intro-example-workspace {
    grid-template-columns: minmax(0, 1fr);
  }

  .intro-editable-panel .detail-stage {
    height: auto;
    aspect-ratio: 1 / 1;
  }

  .intro-method-column .intro-method-block {
    height: auto;
    min-height: 470px;
  }

}

@media (max-width: 767px) {

  .intro-single-example {
    padding: 12px;
  }

  .intro-example-header {
    grid-template-columns: 34px minmax(0, 1fr) 34px;
    gap: 8px;
  }

  .intro-example-nav-button {
    width: 34px;
    height: 34px;
    font-size: 23px;
  }

  .intro-stage-switcher {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .intro-method-column .intro-reasoning-viewer {
    grid-template-columns: minmax(0, 1fr);
    height: auto;
  }

  .intro-method-column .intro-program-panel {
    height: 220px;
    border-right: 0;
    border-bottom: 1px solid #dedfe2;
  }

  .intro-method-column .intro-result-panel {
    min-height: 290px;
  }

}



@media (max-width: 480px) {
  .gallery-interaction-row {
    gap: 10px;
  }

  .gallery-interaction-tip {
    font-size: 13px;
  }

  .more-results-button {
    min-height: 32px;
    padding: 5px 10px;
    font-size: 12px;
  }

  .intro-stage-name {
    font-size: 8px;
  }
}
</style>