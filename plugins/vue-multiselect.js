import Vue from 'vue'

// From https://github.com/shentao/vue-multiselect/pull/1350#issuecomment-826107514

Vue.directive('append-to-body', {
  inserted(el, bindings, { context, child }) {
    let hideScrollLevel = 10 // remove overflow scroll and set it to overflow hidden up to 5 parents by default (useful for scrollable parents)
    let optionsZIndex = 999 // set zindex of options to 999 by default (useful for popups)
    /* usage:
     *  1. => v-append-to-body // default optionsZindex = 999 , default hideScrollLevel = 5
     *  2. => v-append-to-body="true" // default optionsZindex = 999 , default hideScrollLevel = 5
     *  3. => v-append-to-body="{optionsZindex: 999, hideScrollLevel: 5}" // override the optionsZindex and hideScrollLevel
     *  4. => v-append-to-body="{optionsZindex: 999, hideScrollLevel: 5, value: true}" // override the optionsZindex and hideScrollLevel, value is not requried to be set true
     */
    function isScrollable(element) {
      return element.scrollHeight > element.clientHeight
    }
    const overflowStates = []
    if (bindings.value === false) {
      return false
    } else if (typeof bindings.value === 'object') {
      if (bindings.value.value === false) {
        return false
      }
      hideScrollLevel = bindings.value.hideScrollLevel || hideScrollLevel
      optionsZIndex = bindings.value.optionsZIndex || optionsZIndex
    }
    function setSizeAndPosition() {
      context.$children.map((chld) => {
        const optionsRef = chld.$refs.list

        let tempIndex = Number(hideScrollLevel)

        let parentNode = el.parentNode
        while (tempIndex) {
          overflowStates[tempIndex] = parentNode.style.overflow
          if (isScrollable(parentNode)) {
            parentNode.classList.add('drop-overflow')
            parentNode.style.overflow = 'hidden'
          }
          parentNode = parentNode.parentNode
          tempIndex -= 1
        }
        if (optionsRef) {
          const { top, left, width, height } = el.getBoundingClientRect()
          const scrollX = window.scrollX || window.pageXOffset
          const scrollY = window.scrollY || window.pageYOffset
          const totalTop = scrollY + top + height
          let styleAttrib = `position:absolute;
                      width:${width}px;
                      left:${scrollX + left}px;
                      top:${totalTop}px;
                      z-index:${optionsZIndex};`
          const isInTable =
            document.querySelector(
              '.table-dialouge-popup-container .wrapper'
            ) !== null
          const myBox = document.getElementById('my-box')
          const footerHeight = document.getElementsByClassName('js-footer')
            ? document.getElementsByClassName('js-footer')[0].clientHeight
            : 0
          const completeHeight = document.getElementsByTagName('body')
            ? document.getElementsByTagName('body')[0].offsetHeight
            : 0
          if (myBox && !isInTable) {
            const availableHeight = completeHeight - totalTop - footerHeight
            const maxHeightInPixel = Vue.prototype.convertRemToPixels(15)
            if (availableHeight < maxHeightInPixel) {
              styleAttrib = styleAttrib.concat(
                `max-height: ${availableHeight}px;`
              )
            } else {
              styleAttrib = styleAttrib.concat(
                `max-height: ${maxHeightInPixel}px;`
              )
            }
          }
          optionsRef.setAttribute('style', styleAttrib)
          const optionsTestId = get(bindings, 'value.testId', '')
          if (optionsTestId) {
            optionsRef.setAttribute('test-id', optionsTestId)
          }
          document.body.appendChild(optionsRef)
          el._optionsRef = optionsRef
        }
      })
    }
    child.$watch('isOpen', (isOpen) => {
      if (isOpen) {
        setSizeAndPosition()
        window.addEventListener('resize', setSizeAndPosition)
      } else {
        let parentNode = el.parentNode
        let tempIndex = Number(hideScrollLevel)
        while (tempIndex) {
          parentNode.style.overflow = overflowStates[tempIndex]
          parentNode.classList.remove('drop-overflow')
          parentNode = parentNode.parentNode
          tempIndex -= 1
        }
        window.removeEventListener('resize', setSizeAndPosition)
      }
    })
  },

  unbind(el, bindings, { context }) {
    if (el._optionsRef) {
      document.body.removeChild(el._optionsRef)
    }
  },
})
