<script setup lang="ts">

import {
  computed,
  onBeforeUnmount,
  ref,
  watch
} from 'vue'

import {
  Delete,
  Refresh,
  RefreshLeft,
  RefreshRight,
  Top,
  ZoomIn,
  ZoomOut
} from '@element-plus/icons-vue'


// ============================================================
// Types
// ============================================================

interface ConceptAsset {
  id: string
  name: string
  file: string
}


interface CanvasObject extends ConceptAsset {
  x: number
  y: number
  scale: number
  rotation: number
  zIndex: number
  deleted: boolean
}


// ============================================================
// Props
// ============================================================

interface CanvasProps {
  exampleId: string
  assets: ConceptAsset[]
}


const props = defineProps<CanvasProps>()


// ============================================================
// Constants
// ============================================================

const MIN_SCALE = 0.25

const MAX_SCALE = 2.5

const BASE_OBJECT_SIZE = 150


// ============================================================
// State
// ============================================================

const canvasRef = ref<HTMLElement | null>(null)

const objects = ref<CanvasObject[]>([])

const selectedId = ref<string | null>(null)

let highestZIndex = 1

let stopActiveInteraction: (() => void) | null = null


// ============================================================
// Computed
// ============================================================

const selectedObject = computed<CanvasObject | undefined>(() => {

  return objects.value.find((object) => {

    return (
      object.id === selectedId.value
      && !object.deleted
    )

  })

})


const visibleObjectCount = computed(() => {

  return objects.value.filter((object) => {

    return !object.deleted

  }).length

})


// ============================================================
// Helpers
// ============================================================

const clamp = (
  value: number,
  min: number,
  max: number
) => {

  return Math.min(
    max,
    Math.max(min, value)
  )

}


const getInitialScale = (
  objectCount: number
) => {

  if (objectCount >= 7) {
    return 0.55
  }

  if (objectCount >= 5) {
    return 0.65
  }

  if (objectCount >= 3) {
    return 0.78
  }

  return 0.95

}


// ============================================================
// Canvas initialization
// ============================================================

const resetCanvas = () => {

  stopActiveInteraction?.()

  highestZIndex = props.assets.length + 1


  const objectCount = props.assets.length

  const columnCount = Math.ceil(
    Math.sqrt(objectCount)
  )

  const rowCount = Math.ceil(
    objectCount / columnCount
  )

  const initialScale = getInitialScale(
    objectCount
  )


  objects.value = props.assets.map(
    (asset, index) => {

      const columnIndex =
        index % columnCount

      const rowIndex =
        Math.floor(index / columnCount)


      const x =
        (
          (columnIndex + 1)
          / (columnCount + 1)
        )
        * 100

      const y =
        (
          (rowIndex + 1)
          / (rowCount + 1)
        )
        * 100


      return {

        ...asset,

        x,

        y,

        scale: initialScale,

        rotation: 0,

        zIndex: index + 1,

        deleted: false

      }

    }
  )


  selectedId.value =
    objects.value[0]?.id ?? null

}


// 切换案例或资产列表变化时重新初始化

watch(
  () => [
    props.exampleId,
    props.assets
      .map((asset) => `${asset.id}:${asset.file}`)
      .join('|')
  ],
  resetCanvas,
  {
    immediate: true
  }
)


// ============================================================
// Selection
// ============================================================

const selectObject = (
  object: CanvasObject,
  bringForward = false
) => {

  if (object.deleted) {
    return
  }


  selectedId.value = object.id


  if (bringForward) {

    highestZIndex += 1

    object.zIndex = highestZIndex

  }

}


const deselectObject = () => {

  selectedId.value = null

}


// ============================================================
// Pointer tracking
// ============================================================

const startPointerTracking = (
  onMove: (event: PointerEvent) => void
) => {

  stopActiveInteraction?.()


  const stopTracking = () => {

    window.removeEventListener(
      'pointermove',
      onMove
    )

    window.removeEventListener(
      'pointerup',
      stopTracking
    )

    window.removeEventListener(
      'pointercancel',
      stopTracking
    )


    if (
      stopActiveInteraction
      === stopTracking
    ) {

      stopActiveInteraction = null

    }

  }


  window.addEventListener(
    'pointermove',
    onMove
  )

  window.addEventListener(
    'pointerup',
    stopTracking
  )

  window.addEventListener(
    'pointercancel',
    stopTracking
  )


  stopActiveInteraction = stopTracking

}


// ============================================================
// Move
// ============================================================

const startMove = (
  event: PointerEvent,
  object: CanvasObject
) => {

  if (event.button !== 0) {
    return
  }


  const eventTarget =
    event.target as HTMLElement


  if (
    eventTarget.closest(
      '.transform-handle'
    )
  ) {

    return

  }


  const canvas =
    canvasRef.value


  if (!canvas) {
    return
  }


  event.preventDefault()

  event.stopPropagation()


  selectObject(
    object,
    true
  )


  const canvasRect =
    canvas.getBoundingClientRect()


  const startPointerX =
    event.clientX

  const startPointerY =
    event.clientY

  const startObjectX =
    object.x

  const startObjectY =
    object.y


  startPointerTracking(
    (moveEvent) => {

      moveEvent.preventDefault()


      const deltaX =
        (
          moveEvent.clientX
          - startPointerX
        )
        / canvasRect.width
        * 100

      const deltaY =
        (
          moveEvent.clientY
          - startPointerY
        )
        / canvasRect.height
        * 100


      object.x = clamp(
        startObjectX + deltaX,
        0,
        100
      )

      object.y = clamp(
        startObjectY + deltaY,
        0,
        100
      )

    }
  )

}


// ============================================================
// Scale
// ============================================================

const startScale = (
  event: PointerEvent,
  object: CanvasObject
) => {

  const canvas =
    canvasRef.value


  if (!canvas) {
    return
  }


  event.preventDefault()

  event.stopPropagation()


  selectObject(
    object,
    true
  )


  const canvasRect =
    canvas.getBoundingClientRect()


  const centerX =
    canvasRect.left
    + object.x / 100
    * canvasRect.width

  const centerY =
    canvasRect.top
    + object.y / 100
    * canvasRect.height


  const initialDistance =
    Math.max(
      1,
      Math.hypot(
        event.clientX - centerX,
        event.clientY - centerY
      )
    )

  const initialScale =
    object.scale


  startPointerTracking(
    (moveEvent) => {

      moveEvent.preventDefault()


      const currentDistance =
        Math.hypot(
          moveEvent.clientX - centerX,
          moveEvent.clientY - centerY
        )


      object.scale = clamp(

        initialScale
        * (
          currentDistance
          / initialDistance
        ),

        MIN_SCALE,

        MAX_SCALE

      )

    }
  )

}


// ============================================================
// Rotation
// ============================================================

const getPointerAngle = (
  pointerX: number,
  pointerY: number,
  centerX: number,
  centerY: number
) => {

  return Math.atan2(
    pointerY - centerY,
    pointerX - centerX
  ) * 180 / Math.PI

}


const startRotation = (
  event: PointerEvent,
  object: CanvasObject
) => {

  const canvas =
    canvasRef.value


  if (!canvas) {
    return
  }


  event.preventDefault()

  event.stopPropagation()


  selectObject(
    object,
    true
  )


  const canvasRect =
    canvas.getBoundingClientRect()


  const centerX =
    canvasRect.left
    + object.x / 100
    * canvasRect.width

  const centerY =
    canvasRect.top
    + object.y / 100
    * canvasRect.height


  const initialPointerAngle =
    getPointerAngle(
      event.clientX,
      event.clientY,
      centerX,
      centerY
    )

  const initialRotation =
    object.rotation


  startPointerTracking(
    (moveEvent) => {

      moveEvent.preventDefault()


      const currentPointerAngle =
        getPointerAngle(
          moveEvent.clientX,
          moveEvent.clientY,
          centerX,
          centerY
        )


      object.rotation =

        initialRotation

        + (
          currentPointerAngle
          - initialPointerAngle
        )

    }
  )

}


// ============================================================
// Toolbar transformations
// ============================================================

const rotateSelected = (
  degrees: number
) => {

  if (!selectedObject.value) {
    return
  }


  selectedObject.value.rotation += degrees

}


const scaleSelected = (
  amount: number
) => {

  if (!selectedObject.value) {
    return
  }


  selectedObject.value.scale = clamp(

    selectedObject.value.scale + amount,

    MIN_SCALE,

    MAX_SCALE

  )

}


const bringSelectedToFront = () => {

  if (!selectedObject.value) {
    return
  }


  highestZIndex += 1

  selectedObject.value.zIndex =
    highestZIndex

}


// ============================================================
// Delete and restore
// ============================================================

const deleteObject = (
  object: CanvasObject
) => {

  object.deleted = true


  if (
    selectedId.value
    === object.id
  ) {

    selectedId.value = null

  }

}


const deleteSelected = () => {

  if (!selectedObject.value) {
    return
  }


  deleteObject(
    selectedObject.value
  )

}


const restoreObject = (
  object: CanvasObject
) => {

  object.deleted = false

  object.x = 50

  object.y = 50

  object.rotation = 0

  object.scale = getInitialScale(
    props.assets.length
  )


  highestZIndex += 1

  object.zIndex =
    highestZIndex


  selectedId.value =
    object.id

}


// ============================================================
// Asset palette drag and drop
// ============================================================

const startAssetDrag = (
  event: DragEvent,
  object: CanvasObject
) => {

  event.dataTransfer?.setData(
    'text/plain',
    object.id
  )


  if (event.dataTransfer) {

    event.dataTransfer.effectAllowed =
      'copyMove'

  }

}


const handleCanvasDrop = (
  event: DragEvent
) => {

  event.preventDefault()


  const canvas =
    canvasRef.value


  if (!canvas) {
    return
  }


  const objectId =
    event.dataTransfer?.getData(
      'text/plain'
    )


  if (!objectId) {
    return
  }


  const object =
    objects.value.find((item) => {

      return item.id === objectId

    })


  if (!object) {
    return
  }


  const canvasRect =
    canvas.getBoundingClientRect()


  object.x = clamp(
    (
      event.clientX
      - canvasRect.left
    )
    / canvasRect.width
    * 100,
    0,
    100
  )


  object.y = clamp(
    (
      event.clientY
      - canvasRect.top
    )
    / canvasRect.height
    * 100,
    0,
    100
  )


  object.deleted = false


  highestZIndex += 1

  object.zIndex =
    highestZIndex


  selectedId.value =
    object.id

}


// ============================================================
// Keyboard controls
// ============================================================

const handleCanvasKeydown = (
  event: KeyboardEvent
) => {

  const object =
    selectedObject.value


  if (!object) {
    return
  }


  const moveAmount =
    event.shiftKey
      ? 3
      : 1


  switch (event.key) {

    case 'Delete':
    case 'Backspace':

      event.preventDefault()

      deleteSelected()

      break


    case 'ArrowLeft':

      event.preventDefault()

      object.x = clamp(
        object.x - moveAmount,
        0,
        100
      )

      break


    case 'ArrowRight':

      event.preventDefault()

      object.x = clamp(
        object.x + moveAmount,
        0,
        100
      )

      break


    case 'ArrowUp':

      event.preventDefault()

      object.y = clamp(
        object.y - moveAmount,
        0,
        100
      )

      break


    case 'ArrowDown':

      event.preventDefault()

      object.y = clamp(
        object.y + moveAmount,
        0,
        100
      )

      break

  }

}


// ============================================================
// Style
// ============================================================

const getObjectStyle = (
  object: CanvasObject
) => {

  const objectSize =
    BASE_OBJECT_SIZE
    * object.scale


  return {

    left: `${object.x}%`,

    top: `${object.y}%`,

    width: `${objectSize}px`,

    height: `${objectSize}px`,

    zIndex: object.zIndex,

    transform:
      `translate(-50%, -50%) rotate(${object.rotation}deg)`

  }

}


// ============================================================
// Cleanup
// ============================================================

onBeforeUnmount(() => {

  stopActiveInteraction?.()

})

</script>


<template>

  <div class="canvas-editor">


    <!-- ================================================== -->
    <!-- Toolbar -->
    <!-- ================================================== -->

    <div class="editor-toolbar">


      <div class="selection-status">


        <span class="selection-label">
          Selected Object
        </span>


        <span class="selection-name">

          {{
            selectedObject
              ? selectedObject.name
              : 'None'
          }}

        </span>


      </div>


      <div class="toolbar-actions">


        <el-button
          size="small"
          :disabled="!selectedObject"
          title="Rotate left"
          @click="rotateSelected(-15)"
        >

          <el-icon>
            <RefreshLeft />
          </el-icon>

        </el-button>


        <el-button
          size="small"
          :disabled="!selectedObject"
          title="Rotate right"
          @click="rotateSelected(15)"
        >

          <el-icon>
            <RefreshRight />
          </el-icon>

        </el-button>


        <el-button
          size="small"
          :disabled="!selectedObject"
          title="Scale down"
          @click="scaleSelected(-0.1)"
        >

          <el-icon>
            <ZoomOut />
          </el-icon>

        </el-button>


        <el-button
          size="small"
          :disabled="!selectedObject"
          title="Scale up"
          @click="scaleSelected(0.1)"
        >

          <el-icon>
            <ZoomIn />
          </el-icon>

        </el-button>


        <el-button
          size="small"
          :disabled="!selectedObject"
          title="Bring to front"
          @click="bringSelectedToFront"
        >

          <el-icon>
            <Top />
          </el-icon>

        </el-button>


        <el-button
          size="small"
          type="danger"
          plain
          :disabled="!selectedObject"
          title="Delete selected object"
          @click="deleteSelected"
        >

          <el-icon>
            <Delete />
          </el-icon>

        </el-button>


        <el-button
          size="small"
          title="Reset canvas"
          @click="resetCanvas"
        >

          <el-icon>
            <Refresh />
          </el-icon>

          Reset

        </el-button>


      </div>


    </div>


    <!-- ================================================== -->
    <!-- Composition canvas -->
    <!-- ================================================== -->

    <div
      ref="canvasRef"
      class="composition-canvas"
      tabindex="0"
      @pointerdown.self="deselectObject"
      @dragover.prevent
      @drop="handleCanvasDrop"
      @keydown="handleCanvasKeydown"
    >


      <div class="canvas-grid" />


      <div class="canvas-header">


        <span>
          Interactive Composition Canvas
        </span>


        <span>
          {{ visibleObjectCount }}
          /
          {{ objects.length }}
          Objects
        </span>


      </div>


      <div
        v-if="visibleObjectCount === 0"
        class="empty-canvas"
      >

        Drag an asset from the object library
        into the canvas.

      </div>


      <div
        v-for="object in objects"
        v-show="!object.deleted"
        :key="`${exampleId}-${object.id}`"
        class="canvas-object"
        :class="{
          'canvas-object-selected':
            selectedId === object.id
        }"
        :style="getObjectStyle(object)"
        @pointerdown="
          startMove(
            $event,
            object
          )
        "
        @click.stop="
          selectObject(
            object
          )
        "
      >


        <img
          :src="object.file"
          :alt="object.name"
          class="canvas-object-image"
          draggable="false"
        />


        <div
          v-if="selectedId === object.id"
          class="selection-name-tag"
        >

          {{ object.name }}

        </div>


        <!-- Rotation handle -->

        <button
          v-if="selectedId === object.id"
          type="button"
          class="
            transform-handle
            rotation-handle
          "
          title="Drag to rotate"
          @pointerdown="
            startRotation(
              $event,
              object
            )
          "
        />


        <!-- Scale handle -->

        <button
          v-if="selectedId === object.id"
          type="button"
          class="
            transform-handle
            scale-handle
          "
          title="Drag to scale"
          @pointerdown="
            startScale(
              $event,
              object
            )
          "
        />


        <!-- Delete button -->

        <button
          v-if="selectedId === object.id"
          type="button"
          class="
            transform-handle
            object-delete-button
          "
          title="Delete object"
          @pointerdown.stop
          @click.stop="
            deleteObject(object)
          "
        >

          ×

        </button>


      </div>


    </div>


    <!-- ================================================== -->
    <!-- Usage hint -->
    <!-- ================================================== -->

    <div class="editor-help">

      Drag an object to move it. Use the top handle
      to rotate and the lower-right handle to scale.
      Press Delete to remove the selected object.

    </div>


    <!-- ================================================== -->
    <!-- Asset palette -->
    <!-- ================================================== -->

    <div class="asset-library">


      <div class="asset-library-title">

        Object Asset Library

        <span>
          Drag an asset into the canvas
        </span>

      </div>


      <div class="asset-library-grid">


        <div
          v-for="object in objects"
          :key="`${exampleId}-${object.id}-library`"
          class="library-asset"
          :class="{
            'library-asset-selected':
              selectedId === object.id,
            'library-asset-deleted':
              object.deleted
          }"
          draggable="true"
          role="button"
          tabindex="0"
          @dragstart="
            startAssetDrag(
              $event,
              object
            )
          "
          @click="
            object.deleted
              ? restoreObject(object)
              : selectObject(object, true)
          "
        >


          <div class="library-image-wrapper">

            <img
              :src="object.file"
              :alt="object.name"
              class="library-image"
              draggable="false"
            />

          </div>


          <div class="library-asset-info">


            <span class="library-asset-name">

              {{ object.name }}

            </span>


            <span class="library-asset-status">

              {{
                object.deleted
                  ? 'Removed · Click to restore'
                  : 'Drag into canvas'
              }}

            </span>


          </div>


        </div>


      </div>


    </div>


  </div>

</template>


<style scoped>


/* ============================================================
   Editor
   ============================================================ */

.canvas-editor {

  width: 100%;

  margin-top: 16px;

}


/* ============================================================
   Toolbar
   ============================================================ */

.editor-toolbar {

  display: flex;

  align-items: center;

  justify-content: space-between;

  gap: 16px;

  padding:
    10px
    12px;

  background: #f3f3f3;

  border:
    1px
    solid
    #dadada;

  border-bottom: 0;

  border-radius:
    8px
    8px
    0
    0;

  box-sizing: border-box;

}


.selection-status {

  display: flex;

  flex-direction: column;

  min-width: 130px;

}


.selection-label {

  color: #929292;

  font-size: 9px;

  font-weight: 600;

  letter-spacing: 0.04em;

  text-transform: uppercase;

}


.selection-name {

  margin-top: 2px;

  overflow: hidden;

  color: #333;

  font-size: 12px;

  font-weight: 600;

  text-overflow: ellipsis;

  white-space: nowrap;

}


.toolbar-actions {

  display: flex;

  flex-wrap: wrap;

  justify-content: flex-end;

  gap: 6px;

}


.toolbar-actions :deep(.el-button + .el-button) {

  margin-left: 0;

}


/* ============================================================
   Canvas
   ============================================================ */

.composition-canvas {

  position: relative;

  width: 100%;

  min-height: 420px;

  aspect-ratio: 16 / 10;

  overflow: hidden;

  background: #fff;

  border:
    1.5px
    solid
    #292929;

  outline: none;

  box-sizing: border-box;

  touch-action: none;

  user-select: none;

}


.composition-canvas:focus {

  box-shadow:
    inset
    0
    0
    0
    2px
    rgba(60, 60, 60, 0.12);

}


.canvas-grid {

  position: absolute;

  inset: 0;

  pointer-events: none;

  background-image:
    linear-gradient(
      to right,
      rgba(0, 0, 0, 0.035) 1px,
      transparent 1px
    ),
    linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0.035) 1px,
      transparent 1px
    );

  background-size:
    24px
    24px;

}


.canvas-header {

  position: absolute;

  top: 9px;

  left: 11px;

  right: 11px;

  z-index: 10000;

  display: flex;

  justify-content: space-between;

  color: #999;

  font-size: 9px;

  font-weight: 600;

  letter-spacing: 0.035em;

  pointer-events: none;

  text-transform: uppercase;

}


.empty-canvas {

  position: absolute;

  top: 50%;

  left: 50%;

  width: 70%;

  color: #aaa;

  font-size: 13px;

  line-height: 1.6;

  text-align: center;

  transform:
    translate(
      -50%,
      -50%
    );

}


/* ============================================================
   Canvas object
   ============================================================ */

.canvas-object {

  position: absolute;

  display: flex;

  align-items: center;

  justify-content: center;

  min-width: 42px;

  min-height: 42px;

  cursor: grab;

  touch-action: none;

  transform-origin: center;

}


.canvas-object:active {

  cursor: grabbing;

}


.canvas-object-selected {

  outline:
    1.5px
    dashed
    #cf343a;

  outline-offset: 4px;

}


.canvas-object-image {

  display: block;

  width: 100%;

  height: 100%;

  pointer-events: none;

  object-fit: contain;

  user-select: none;

}


.selection-name-tag {

  position: absolute;

  left: 50%;

  bottom: -24px;

  max-width: 160px;

  padding:
    3px
    7px;

  overflow: hidden;

  color: #fff;

  font-size: 9px;

  line-height: 1.2;

  text-overflow: ellipsis;

  white-space: nowrap;

  background: #cf343a;

  border-radius: 3px;

  pointer-events: none;

  transform:
    translateX(-50%);

}


/* ============================================================
   Transform handles
   ============================================================ */

.transform-handle {

  position: absolute;

  z-index: 10;

  width: 14px;

  height: 14px;

  padding: 0;

  background: #fff;

  border:
    2px
    solid
    #cf343a;

  box-sizing: border-box;

  cursor: pointer;

}


.rotation-handle {

  top: -27px;

  left: 50%;

  border-radius: 50%;

  cursor: crosshair;

  transform:
    translateX(-50%);

}


.rotation-handle::after {

  position: absolute;

  top: 11px;

  left: 4px;

  width: 2px;

  height: 13px;

  background: #cf343a;

  content: '';

}


.scale-handle {

  right: -10px;

  bottom: -10px;

  border-radius: 2px;

  cursor: nwse-resize;

}


.object-delete-button {

  top: -10px;

  right: -10px;

  display: flex;

  align-items: center;

  justify-content: center;

  color: #cf343a;

  font-size: 13px;

  font-weight: 700;

  line-height: 1;

  border-radius: 50%;

}


/* ============================================================
   Help
   ============================================================ */

.editor-help {

  padding:
    8px
    11px;

  color: #888;

  font-size: 10px;

  line-height: 1.5;

  background: #f5f5f5;

  border:
    1px
    solid
    #dadada;

  border-top: 0;

  border-radius:
    0
    0
    8px
    8px;

}


/* ============================================================
   Asset library
   ============================================================ */

.asset-library {

  margin-top: 12px;

  padding: 11px;

  background: #f4f4f4;

  border:
    1px
    solid
    #dedede;

  border-radius: 8px;

}


.asset-library-title {

  display: flex;

  align-items: center;

  justify-content: space-between;

  margin-bottom: 9px;

  color: #696969;

  font-size: 10px;

  font-weight: 600;

  letter-spacing: 0.04em;

  text-transform: uppercase;

}


.asset-library-title span {

  color: #999;

  font-size: 9px;

  font-weight: 500;

  letter-spacing: 0;

  text-transform: none;

}


.asset-library-grid {

  display: grid;

  grid-template-columns:
    repeat(
      auto-fit,
      minmax(130px, 1fr)
    );

  gap: 8px;

}


.library-asset {

  display: flex;

  align-items: center;

  gap: 8px;

  min-width: 0;

  padding: 7px;

  background: #fff;

  border:
    1px
    solid
    #dedede;

  border-radius: 6px;

  box-sizing: border-box;

  cursor: grab;

  transition:
    border-color 0.18s ease,
    opacity 0.18s ease,
    transform 0.18s ease;

}


.library-asset:hover {

  border-color: #aaa;

  transform:
    translateY(-1px);

}


.library-asset-selected {

  border-color: #cf343a;

}


.library-asset-deleted {

  opacity: 0.48;

}


.library-image-wrapper {

  display: flex;

  flex-shrink: 0;

  align-items: center;

  justify-content: center;

  width: 42px;

  height: 42px;

}


.library-image {

  display: block;

  width: 100%;

  height: 100%;

  object-fit: contain;

  pointer-events: none;

}


.library-asset-info {

  display: flex;

  flex-direction: column;

  min-width: 0;

}


.library-asset-name {

  overflow: hidden;

  color: #333;

  font-size: 10px;

  font-weight: 600;

  text-overflow: ellipsis;

  white-space: nowrap;

}


.library-asset-status {

  margin-top: 3px;

  overflow: hidden;

  color: #999;

  font-size: 8px;

  text-overflow: ellipsis;

  white-space: nowrap;

}


/* ============================================================
   Responsive
   ============================================================ */

@media (max-width: 767px) {

  .editor-toolbar {

    align-items: flex-start;

    flex-direction: column;

  }


  .toolbar-actions {

    justify-content: flex-start;

    width: 100%;

  }


  .composition-canvas {

    min-height: 430px;

    aspect-ratio: auto;

  }


  .asset-library-title {

    align-items: flex-start;

    flex-direction: column;

    gap: 3px;

  }

}


@media (max-width: 480px) {

  .asset-library-grid {

    grid-template-columns:
      repeat(
        2,
        minmax(0, 1fr)
      );

  }


  .library-image-wrapper {

    width: 36px;

    height: 36px;

  }


  .library-asset {

    gap: 5px;

    padding: 5px;

  }


  .library-asset-status {

    display: none;

  }

}

</style>