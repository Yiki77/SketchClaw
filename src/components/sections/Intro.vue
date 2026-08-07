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
// Gallery data
// ============================================================

const galleryConfigs: GalleryConfig[] = [

  {
    id: 'gallery-1',

    title: 'Example 1',

    caption:
      'A chef in the kitchen.',

    svg:
      './carousel/1-chef.svg',

    draft:
      './carousel/1-chef_draft.jpg'
  },


  {
    id: 'gallery-2',

    title: 'Example 2',

    caption:
      'A staggered city skyline of spires, domes, and clock towers; street trees and lampposts line the foreground, and flocks of birds fly in the sky.',

    svg:
      './carousel/2-city.svg',

    draft:
      './carousel/2-city_draft.jpg'
  },


  {
    id: 'gallery-3',

    title: 'Example 3',

    caption:
      'Four ducks are swimming in the pool.',

    svg:
      './carousel/3-ducks.svg',

    draft:
      './carousel/3-ducks_draft.jpg'
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
    draftExpanded: true

  }))

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

    loadGalleryItem(
      item
    )

  })

})


onBeforeUnmount(() => {

  stopActiveInteraction?.()

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

        <div class="gallery-grid">


          <article
            v-for="(item, itemIndex) in galleryItems"
            :key="item.id"
            class="gallery-item"
          >

            <!-- Text below image -->

            <div class="gallery-info">


              <div class="gallery-meta">


                <span class="gallery-title">

                  {{ item.title }}

                </span>


                <span class="gallery-index">

                  {{
                    String(itemIndex + 1)
                      .padStart(2, '0')
                  }}

                </span>


              </div>


              <el-tooltip
                :content="item.caption"
                placement="top"
                effect="light"
                :show-after="250"
                :hide-after="0"
                popper-class="
                  intro-caption-tooltip
                "
              >
                <p
                  class="gallery-caption"
                  tabindex="0"
                >

                  “{{ item.caption }}”

                </p>
              </el-tooltip>


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


            




          </article>


        </div>

      </el-col>

    </el-row>


    <!-- ====================================================== -->
    <!-- SketchClaw overview -->
    <!-- ====================================================== -->

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
            SketchClaw
          </h2>

          <p class="overview-definition">
            An automatic agentic framework for text-guided
            multi-concept scene sketch generation.
          </p>

          <p class="sketchclaw-summary">

            Given a scene description, SketchClaw extends sketch generation from isolated objects to coherent
            multi-concept scenes, providing a concise and flexible visual representation
            for communicating ideas and exploring spatial compositions.

          </p>

        

          <div
            class="try-actions"
            aria-label="Applications of scene sketch generation"
          >

            <span class="try-chip try-chip-orange">
              Animation
            </span>

            <span class="try-chip try-chip-green">
              Concept Design
            </span>

            <span class="try-chip try-chip-purple">
              Interactive Design
            </span>

          </div>

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

.gallery-interaction-tip-top {
  margin:
    0
    0
    12px;
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

</style>
