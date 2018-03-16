export class TangyFormItemHelpers {

  constructor(element) {
    this.element = element
    this.inputs = this.element.shadowRoot.querySelectorAll(`[name]`)
    if (typeof this.inputs !== 'object') {
      this.inputs = []
    }
  }

  getValue(name) {
    let value = ''
    let foundInput = undefined
    // Look in the shadow DOM.
    this.inputs.forEach(input => {
      if (input.name === name) {
        foundInput = input
      }
    })
    // Look in the store.
    if (!foundInput) {
      let state = window.tangyFormStore.getState()
      let inputs = []
      state.items.forEach(item => inputs = [...inputs, ...item.inputs])
      foundInput = inputs.find(input => {
        if (input.name === name) {
          return input
        }
      })
    }
    if(foundInput && typeof foundInput.value === 'object') {
      let values = []
      foundInput.value.forEach(subInput => {
        if (subInput.value) {
          values.push(subInput.name)
        }
      })
      value = values
    } else if (foundInput && foundInput.value !== undefined) {
      value = foundInput.value
    }
    if (!value) {
      value = ''
    }
    return value
  }

  inputShow(name) {
    this.inputs.forEach(inputEl => {
      if (inputEl.name === name) {
        inputEl.hidden = false
      }
    })
  } 

  inputHide(name) {
    this.inputs.forEach(inputEl => {
      if (inputEl.name === name) {
        inputEl.hidden = true
      }
    })
  }

  inputEnable(name) {
    this.inputs.forEach(inputEl => {
      if (inputEl.name === name) {
        inputEl.disabled = false
      }
    })
  } 

  inputDisable(name) {
    this.inputs.forEach(inputEl => {
      if (inputEl.name === name) {
        inputEl.disabled = true
      }
    })
  }

}