<script lang="ts" setup>

import {
  nextTick,
  onBeforeUnmount,
  onMounted,
  reactive
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
}

interface SvgBounds {
  minX: number
  minY: number
  maxX: number
  maxY: number
}

// ============================================================
// Three examples
// ============================================================

const BASE_URL =
  import.meta.env.BASE_URL || '/'

const withBase = (
  path: string
) => {

  if (
    path.startsWith('http://')
    || path.startsWith('https://')
    || path.startsWith('data:')
  ) {

    return path

  }

  const normalizedBase =
    BASE_URL.endsWith('/')
      ? BASE_URL
      : `${BASE_URL}/`

  return (
    normalizedBase
    + path.replace(/^\/+/, '')
  )

}

const moreResultsUrl =
  withBase('more-results.html')

const galleryConfigs: GalleryConfig[] = [

  {
    id: 'gallery-1',
    title: 'Example 1',
    caption: 'A chef in the kitchen.',
    svg: withBase('./carousel/1-chef.svg'),
    draft: ''
  },

  {
    id: 'gallery-2',
    title: 'Example 2',
    caption:
      'A staggered city skyline of spires, domes, and clock towers; street trees and lampposts line the foreground, and flocks of birds fly in the sky.',
    svg: withBase('./carousel/2-city.svg'),
    draft: ''
  },

  {
    id: 'gallery-3',
    title: 'Example 3',
    caption:
      'Four ducks are swimming in the pool.',
    svg: withBase('./carousel/3-ducks.svg'),
    draft: ''
  }

]

const galleryItems =
  reactive<GalleryItem[]>(
    galleryConfigs.map(
      (config) => ({

        ...config,

        loading: true,
        error: '',
        svgMarkup: '',

        objects: [],
        selectedKey: null,

        draftExpanded: false

      })
    )
  )

// ============================================================
// Constants
// ============================================================

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
  parentElement: SVGGraphicsElement | SVGSVGElement,
  clientX: number,
  clientY: number
) => {

  // If the editable object is a direct child of the root <svg>,
  // parentElement.ownerSVGElement is null. In that case the parent
  // itself is the coordinate-system root and must be used directly.
  const svgElement =
    parentElement instanceof SVGSVGElement
      ? parentElement
      : parentElement.ownerSVGElement


  if (!svgElement) {

    return null

  }


  const screenMatrix =
    parentElement.getScreenCTM()


  if (!screenMatrix) {

    return null

  }


  try {

    const point =
      svgElement.createSVGPoint()


    point.x =
      clientX

    point.y =
      clientY


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

  } catch {

    // A non-invertible SVG transform should not silently become (0, 0),
    // otherwise dragging appears to be enabled but the object never moves.
    return null

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
      parentElement instanceof SVGGraphicsElement
      || parentElement instanceof SVGSVGElement
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


  if (!startPointer) {

    return

  }


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


    if (!currentPointer) {

      return

    }


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
// Lifecycle
// ============================================================

onMounted(() => {

  galleryItems.forEach((item) => {

    loadGalleryItem(item)

  })

})

onBeforeUnmount(() => {

  stopActiveInteraction?.()

})

</script>


<template>

  <section class="examples-section">

    <el-divider />


    <!-- ====================================================== -->
    <!-- TL;DR -->
    <!-- ====================================================== -->

    <el-row justify="center">

      <el-col
        :xs="24"
        :sm="20"
        :md="16"
        :lg="12"
        :xl="12"
      >

        <div class="examples-shell">

      <section class="overview-card">

        <div
          class="overview-kicker"
          aria-hidden="true"
        >
          <span class="overview-kicker-color kicker-orange" />
          <span class="overview-kicker-color kicker-yellow" />
          <span class="overview-kicker-color kicker-green" />
          <span class="overview-kicker-color kicker-purple" />
        </div>

        <h2 class="overview-title">
          TL;DR: SketchClaw is an automatic agentic framework for
          text-guided multi-concept scene sketch generation.
        </h2>

      </section>


      <!-- ==================================================== -->
      <!-- Interaction hint + More results -->
      <!-- ==================================================== -->

      <div class="gallery-interaction-row">

        <p class="gallery-interaction-tip">

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


      <!-- ==================================================== -->
      <!-- Three examples shown simultaneously -->
      <!-- ==================================================== -->

      <div class="examples-grid">

        <article
          v-for="(item, itemIndex) in galleryItems"
          :key="item.id"
          class="example-column"
        >

          <!-- ----------------------------------------------- -->
          <!-- Example heading -->
          <!-- ----------------------------------------------- -->

          <div class="example-copy">

            <div class="example-heading-row">

              <h3 class="example-label">
                {{ item.title }}
              </h3>

              <span class="example-index">
                {{
                  String(
                    itemIndex + 1
                  ).padStart(
                    2,
                    '0'
                  )
                }}
              </span>

            </div>

            <el-tooltip
              :content="item.caption"
              placement="top"
              effect="light"
              :show-after="180"
              :hide-after="0"
              popper-class="example-caption-tooltip"
            >
              <p
                class="example-caption"
                tabindex="0"
              >
                “{{ item.caption }}”
              </p>
            </el-tooltip>

          </div>


          <!-- ----------------------------------------------- -->
          <!-- Editable SVG card -->
          <!-- ----------------------------------------------- -->

          <div class="gallery-card">

            <div class="detail-stage">

              <div
                v-if="item.loading"
                class="gallery-state"
              >
                <el-skeleton
                  animated
                  :rows="5"
                />
              </div>

              <div
                v-else-if="item.error"
                class="gallery-state gallery-error"
              >
                {{ item.error }}
              </div>

              <div
                v-else
                class="svg-host"
                :data-gallery-editor="item.id"
                tabindex="0"
                role="application"
                :aria-label="`${item.title} editable SVG scene`"
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

              <span
                v-if="
                  !item.loading
                  && !item.error
                "
                class="detail-label"
              >
                Editable SVG
              </span>

            </div>

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
                  :disabled="!getSelectedObject(item)"
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
                  :disabled="!getSelectedObject(item)"
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
                  :disabled="!getSelectedObject(item)"
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
                  :disabled="!getSelectedObject(item)"
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
                  :disabled="!getSelectedObject(item)"
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

        </article>

      </div>

        </div>

      </el-col>

    </el-row>

  </section>

</template>

<style scoped>
/* ============================================================
   Section
   ============================================================ */

.examples-section {
  width: 100%;
}

.examples-shell {
    width: 100%;
  margin: 0 0 54px;
  padding: 0;
  box-sizing: border-box;
}


/* ============================================================
   TL;DR colorful highlight
   ============================================================ */

.overview-card {
  position: relative;

  width: 100%;

  margin:
    8px
    0
    34px;

  padding:
    24px
    30px
    22px;

  overflow: hidden;

  background:
    linear-gradient(
      135deg,
      rgba(
        255,
        249,
        238,
        0.97
      ),
      rgba(
        248,
        252,
        244,
        0.97
      )
      48%,
      rgba(
        249,
        246,
        255,
        0.97
      )
    );

  border:
    1px
    solid
    #e3e0db;

  border-radius: 14px;

  box-shadow:
    0
    6px
    18px
    rgba(
      35,
      35,
      35,
      0.055
    );

  box-sizing:
    border-box;
}

.overview-card::after {
  position: absolute;

  right: -72px;

  bottom: -98px;

  width: 225px;

  height: 225px;

  background:
    radial-gradient(
      circle,
      rgba(
        165,
        138,
        208,
        0.13
      ),
      rgba(
        165,
        138,
        208,
        0
      )
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

  margin-bottom: 13px;
}

.overview-kicker-color {
  display: block;

  width: 29px;

  height: 5px;

  border-radius: 999px;
}

.kicker-orange {
  background: #f39a54;
}

.kicker-yellow {
  background: #e9c957;
}

.kicker-green {
  background: #85bd74;
}

.kicker-purple {
  background: #a58ad0;
}

.overview-title {
  position: relative;

  z-index: 1;

  max-width: 950px;

  margin: 0;

  color: #222;

  font-size:
    clamp(
      21px,
      2vw,
      27px
    );

  font-weight: 740;

  line-height: 1.4;

  text-align: left;
}


/* ============================================================
   Interaction hint + More results
   ============================================================ */

.gallery-interaction-row {
  display: flex;

  align-items: center;

  justify-content:
    space-between;

  gap: 16px;

  width: 100%;

  margin:
    0
    0
    18px;
}

.gallery-interaction-tip {
  display: flex;

  flex:
    1
    1
    auto;

  align-items: center;

  gap: 8px;

  min-width: 0;

  margin: 0;

  padding:
    0
    2px;

  color: #b56b2f;

  font-size: 16px;

  font-weight: 600;

  line-height: 1.6;

  text-align: left;
}

.gallery-interaction-icon {
  flex-shrink: 0;

  color: #e58b43;

  font-size: 15px;

  line-height: 1;
}

.more-results-button {
  display: inline-flex;

  flex:
    0
    0
    auto;

  align-items: center;

  justify-content: center;

  gap: 7px;

  min-height: 34px;

  margin-left: auto;

  padding:
    6px
    13px;

  color: #7f4a20;

  font-size: 14px;

  font-weight: 650;

  line-height: 1;

  text-decoration: none;

  background: #fffaf5;

  border:
    1px
    solid
    #edb98e;

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

  box-shadow:
    0
    4px
    12px
    rgba(
      181,
      107,
      47,
      0.12
    );

  transform:
    translateY(
      -1px
    );
}

.more-results-button:focus-visible {
  outline:
    2px
    solid
    rgba(
      229,
      139,
      67,
      0.45
    );

  outline-offset: 3px;
}

.more-results-arrow {
  font-size: 16px;

  line-height: 1;

  transition:
    transform
    0.2s
    ease;
}

.more-results-button:hover
.more-results-arrow {
  transform:
    translateX(
      2px
    );
}


/* ============================================================
   Three-column layout
   ============================================================ */

.examples-grid {
  display: grid;

  grid-template-columns:
    repeat(
      3,
      minmax(
        0,
        1fr
      )
    );

  align-items: start;

  gap: 18px;

  width: 100%;
}

.example-column {
  --example-accent:
    #ffc862c4;

  --example-accent-soft:
    rgba(
      255,
      200,
      98,
      0.16
    );

  --example-accent-text:
    #8a640f;

  min-width: 0;
}


/* ============================================================
   Example heading and prompt
   ============================================================ */

.example-copy {
  /*
    Keep the top text area identical for all three examples.
    The prompt always reserves exactly two lines; longer text is
    truncated visually and shown in full through the tooltip.
  */
  height: 92px;

  display: flex;

  flex-direction: column;

  box-sizing: border-box;
}

.example-heading-row {
  display: flex;

  align-items: center;

  justify-content:
    space-between;

  gap: 16px;

  margin-bottom: 6px;
}

.example-label {
  display: inline-flex;

  align-items: center;

  gap: 9px;

  min-width: 0;

  margin: 0;

  color: #252525;

  font-family: inherit;

  font-size: 18px;

  font-style: normal;

  font-weight: 600;

  line-height: 1.4;

  text-align: left;
}

.example-label::before {
  flex-shrink: 0;

  width: 9px;

  height: 9px;

  background:
    var(
      --example-accent
    );

  border-radius: 50%;

  box-shadow:
    0
    0
    0
    5px
    var(
      --example-accent-soft
    );

  content: '';
}

.example-index {
  flex-shrink: 0;

  padding:
    7px
    12px;

  color:
    var(
      --example-accent-text
    );

  font-size: 12px;

  font-weight: 700;

  letter-spacing: 0.04em;

  line-height: 1.2;

  background:
    var(
      --example-accent-soft
    );

  border:
    1px
    solid
    var(
      --example-accent
    );

  border-radius: 999px;
}

.example-caption {
  /*
    Typography follows the reference Vue:
    15px / 1.65 / italic / inherited project font.
    The current page color (#333) is intentionally preserved.
  */
  display: -webkit-box;

  width: 100%;

  height: 49.5px;

  margin:
    0
    5px
    0;

  overflow: hidden;

  color: #333;

  font-family: inherit;

  font-size: 15px;

  font-style: italic;

  font-weight: 400;

  line-height: 1.65;

  text-align: left;

  text-overflow: ellipsis;

  -webkit-box-orient: vertical;

  -webkit-line-clamp: 2;

  cursor: help;

  box-sizing: border-box;
}


/* Full prompt shown on hover/focus */
:global(.example-caption-tooltip) {
  max-width: 420px;

  font-size: 13px;

  line-height: 1.55;

  white-space: normal;
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

  background: var(--example-accent, #ffc862c4);

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



/* Subtle affordance before selection */
.svg-host
:deep(
  .editable-object-wrapper:hover
) {
  filter:
    drop-shadow(
      0
      0
      1px
      rgba(205, 48, 54, 0.72)
    )
    drop-shadow(
      0
      0
      3px
      rgba(205, 48, 54, 0.22)
    );
}

/* Keep selected feedback stronger than hover */
.svg-host
:deep(
  .editable-object-wrapper.is-selected
) {
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


.example-column .object-toolbar {
  min-height: 80px;
}

.example-column .selection-name {
  max-width: 150px;
}

/* ============================================================
   Responsive
   ============================================================ */

@media (
  max-width: 1100px
) {

  .examples-grid {
    gap: 18px;
  }

  .example-copy {
    height: 92px;
  }

}


@media (
  max-width: 767px
) {

  .gallery-interaction-row {
    align-items: flex-start;
    flex-direction: column;
    gap: 10px;
  }

  .gallery-interaction-tip {
    font-size: 14px;
  }

  .more-results-button {
    margin-left: 0;
  }

  .examples-shell {
    width: 100%;

    margin-bottom: 40px;
  }

  .overview-card {
    margin-bottom: 25px;

    padding:
      21px
      18px
      19px;
  }

  .overview-title {
    font-size: 21px;
  }

  .examples-grid {
    grid-template-columns:
      1fr;

    gap: 30px;
  }

  .example-copy {
    height: auto;
    min-height: 92px;

    margin-bottom: 11px;
  }

  .example-label {
    font-size: 18px;
  }

  .example-caption {
    height: auto;
    min-height: 49.5px;

    margin-right: 0;

    font-size: 15px;
  }

  .gallery-card {
    width: 100%;
  }

}


/* ============================================================
   Dark-mode protection
   ============================================================ */

:global(
  html.dark
  .examples-section
  .gallery-card
),

:global(
  html.dark
  .examples-section
  .svg-host
),

:global(
  body.dark
  .examples-section
  .gallery-card
),

:global(
  body.dark
  .examples-section
  .svg-host
),

:global(
  [data-theme='dark']
  .examples-section
  .gallery-card
),

:global(
  [data-theme='dark']
  .examples-section
  .svg-host
) {
  color-scheme:
    only light;

  forced-color-adjust:
    none;

  background:
    #ffffff
    !important;

  filter:
    none
    !important;

  mix-blend-mode:
    normal
    !important;
}

</style>
