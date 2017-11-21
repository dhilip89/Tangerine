/* jshint esversion: 6 */
/* global window */

import '../tangy-form/tangy-element-styles.js'
import {Element as PolymerElement} from '../../p3/node_modules/@polymer/polymer/polymer-element.js';
import {afterNextRender } from '../../p3/node_modules/@polymer/polymer/lib/utils/render-status.js';
import '../../bower_components/pouchdb/dist/pouchdb.js'
// import '../../node_modules/redux/dist/redux.js'
// import '../../node_modules/redux/es/index.js'
// import 'https://unpkg.com/redux@3.7.2/es/index.js?module'

//   <!-- Tangy Libraries -->
import {TangyFormModel} from './tangy-form-model.js'
import {TangyFormResponseModel} from './tangy-form-response-model.js'
import {TangyFormService} from './tangy-form-service.js'
import { tangyFormReducer, itemsIncompleteCheck, validateItemInputs, calculateTargets } from'./tangy-form-reducer.js'
import {tangyReduxMiddlewareLogger, tangyReduxMiddlewareCrashReporter, tangyReduxMiddlewareTangyHook} from './tangy-form-redux-middleware.js'
import './cat.js'

//
//   <!-- Tangy Form Core Elements -->
import './tangy-form-item.js'
import './tangy-form-questions.js'

//   <!-- Tangy Custom Inputs Elements -->

import '../tangy-input/tangy-input.js'

// <link rel="import" href="../tangy-timed/tangy-timed.html">
//   <link rel="import" href="../tangy-gps/tangy-gps.html">
//   <link rel="import" href="../tangy-location/tangy-location.html">
//   <link rel="import" href="../tangy-checkbox/tangy-checkbox.html">
//   <link rel="import" href="../tangy-checkboxes/tangy-checkboxes.html">
//   <link rel="import" href="../tangy-radio-buttons/tangy-radio-buttons.html">
//   <link rel="import" href="../tangy-eftouch/tangy-eftouch.html">
//   <link rel="import" href="../tangy-toggle-button/tangy-toggle-button.html">
//
//   <!-- Dependencies -->
//   <script src="../../bower_components/moment/min/moment-with-locales.min.js"></script>
//   <link rel="import" href="../../bower_components/paper-tabs/paper-tabs.html">
//   <link rel="import" href="../../bower_components/paper-fab/paper-fab.html">
//   <link rel="import" href="../../bower_components/paper-radio-group/paper-radio-group.html">
//   <link rel="import" href="../../bower_components/paper-radio-button/paper-radio-button.html">
//   <link rel="import" href="../../bower_components/iron-form/iron-form.html">
//   <link rel="import" href="../../bower_components/iron-icon/iron-icon.html">
//   <link rel="import" href="../../bower_components/iron-icons/iron-icons.html">
//   <link rel="import" href="../../bower_components/iron-icons/hardware-icons.html">
//   <link rel="import" href="../../bower_components/vaadin-icons/vaadin-icons.html">
//   <link rel="import" href="../../bower_components/paper-button/paper-button.html">
//   <link rel="import" href="../../bower_components/iron-form/iron-form.html">
//   <link rel="import" href="../../bower_components/paper-input/paper-input.html">
//   <link rel="import" href="../../bower_components/paper-input/paper-textarea.html">
//   <link rel="import" href="../../bower_components/paper-card/paper-card.html">
//   <link rel="import" href="../../bower_components/paper-checkbox/paper-checkbox.html">
//   <link rel="import" href="../../bower_components/paper-progress/paper-progress.html">
//   <link rel="import" href="../../bower_components/paper-dropdown-menu/paper-dropdown-menu.html">
//   <link rel="import" href="../../bower_components/paper-listbox/paper-listbox.html">
//   <link rel="import" href="../../bower_components/paper-item/paper-item.html">
//   <link rel="import" href="../../bower_components/gold-phone-input/gold-phone-input.html">
//   <link rel="import" href="../../bower_components/app-datepicker/app-datepicker.html">


  // /**
  //  * `tangy-form`
  //  * An element used to encapsulate form elements for multipage forms with a response in PouchDB.
  //  *
  //  * @customElement
  //  * @polymer
  //  * @demo demo/index.html
  //  */

export class TangyForm extends PolymerElement {

  static get template() {
    return `
  <style>
:host {
  display: block;
  margin: 0px;
  padding: 0px;
}
        #tangy-form-responses,
        #tangy-form-questions {
  margin: 0px;
  padding: 0px;
}
        #show-responses-fab {
  position: fixed;
  top: 73px;
  right: 7px;
}
        #new-response-fab {
  position: fixed;
  top: 10px;
  right: 7px;
}

:host([hide-responses]) #show-responses-fab,
:host([hide-responses]) #new-response-fab {
  display: none;
}
</style>

<slot></slot>
<div id="tangy-form-questions">
  <slot id="tangy-form-questions--form"></slot>
  <paper-fab id="new-response-fab" on-click="newResponse" icon="icons:add"></paper-fab>
  <paper-fab id="show-responses-fab" on-click="showResponses" icon="icons:save"></paper-fab>
  </div>

  <div id="tangy-form-responses" hidden>
<paper-button on-click='newResponse' raised><iron-icon icon="icons:add"></iron-icon></paper-button>
<paper-button on-click='generateCSV' raised><iron-icon icon="icons:file-download"></iron-icon></paper-button>
<ul>
<template is="dom-repeat" items="{{responses}}">
  <li>
  [[item.startDatetime]]
  <iron-icon data-response-id="[[item._id]]" on-click="resumeResponse" icon="icons:launch"></iron-icon>
  <template is="dom-if" if="{{item.isCurrentTangyFormResponse}}">
  <span style="color: #8BC34A;"> *</span>
  </template>
  </li>
  </template>
  </ul>
  </div>`;
  }

    static get is() { return 'tangy-form'; }

    constructor() {
      super()
      // Create Redux Store.
      window.tangyFormStore = Redux.createStore(
        tangyFormReducer,
        window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
        Redux.applyMiddleware(tangyReduxMiddlewareTangyHook)
        // Redux.applyMiddleware(tangyReduxMiddlewareCrashReporter, tangyReduxMiddlewareLogger, tangyReduxMiddlewareTangyHook)
      )
      this.store = window.tangyFormStore
    }

    static get properties() {
      return {
        id: {
          type: String,
          value: 'tangy-form',
          reflectToAttribute: true
        },
        // Configure PouchDB database to be used.
        databaseName: {
          type: String,
          value: 'tangy-form',
          reflectToAttribute: true
        },
        responseId: {
          type: String,
          value: '',
          reflectToAttribute: true
        },
        // Attributes to hand down to tangy-form-questions.
        onChange: {
          type: String,
          value: '',
          reflectToAttribute: true
        },
        linearMode: {
          type: Boolean,
          value: false,
          reflectToAttribute: true
        },
        hideClosedItems: {
          type: Boolean,
          value: false,
          reflectToAttribute: true
        },
        hideResponses: {
          type: Boolean,
          value: false,
          reflectToAttribute: true
        },
        hideCompleteButton: {
          type: Boolean,
          value: false,
          reflectToAttribute: true
        }
      };
    }

    async ready() {
      super.ready();
      afterNextRender(this, this.afterNextRender)
    }

    async afterNextRender() {
      /*
       * Setup
       */
      this.initialState = new TangyFormResponseModel({ form: this.getProps() })
      this.querySelectorAll('tangy-form-item').forEach(item => {
        this.initialState.items.push(item.getProps())
      })

      // Stash the tangy-form-items to pass down to tangy-form-questions element when we showQuestions().
      this._formDefinition = this.innerHTML
      this.innerHTML = ''

      // Set up the TangyFormService for interacting with TangyForm and TangyFormResponse docs in the database.
      this.service = new TangyFormService({databaseName: this.databaseName})
      await this.service.initialize()

      /*
       * Get data
       */

      // Get our formDoc.
      this.formDoc = await this.service.getForm(this.id)

      // No formDoc? Create one.
      if (!this.formDoc) {
        this.formDoc = new TangyFormModel({formId: this.id})
        this.formDoc = await this.service.saveForm(this.formDoc)
      }

      // Determine our current response ID.
      if (!this.responseId && this.formDoc.responseId) {
        this.responseId = this.formDoc.responseId
      }

      // No response ID? Create one.
      if (!this.responseId) {
        this.response = new TangyFormResponseModel(Object.assign({
          _id: this.responseId,
          formId: this.id
        }, serializeElement(this)))
        this.response = await this.service.saveResponse(this.response)
        // Now we definitely have a response ID.
        this.responseId = this.response._id
      }

      // Get our current response.
      this.response = await this.service.getResponse(this.responseId)

      // No response by this ID? Create it. Useful if someone made up a response ID.
      if (!this.response) {
        this.response = new TangyFormResponseModel({_id: this.responseId, formId: this.id})
        this.response = await this.service.saveResponse(this.response)
      }

      // Good or bad idea? Handy if the attribute configuration of tangy-form changes...
      Object.assign(this.response.form, this.getProps())

      // Save this response as our current response.
      this.formDoc.responseId = this.response._id
      this.formDoc = await this.service.saveForm(this.formDoc)

      // Subscribe to store to update it in the database.
      this.store.subscribe(this.throttledSaveResponse.bind(this))

      // Set location list as a global.
      let res = await fetch('/content/location-list.json')
      window.locationList = await res.json()

      // Show questions.
      this.showQuestions()
    }

    showQuestions() {
      this.$['tangy-form-responses'].hidden = true
      this.$['tangy-form-questions'].hidden = false
      // If there is something inside of Tangy Form, remove it. Could be blanking innerHTML...
      if (this.childElementCount > 0) this.removeChild(this.childNodes[0])
      // Load items from item stash that was made on connected callback. Good for resuming fresh.
      let tangyFormQuestions = document.createElement('tangy-form-questions')
      Object.assign(tangyFormQuestions, { response: this.response })
      tangyFormQuestions.setProps(this.getProps())
      // Pass what was the tangy-form's innerHTML to the innerHTML of tangyFormQuestions.
      tangyFormQuestions.innerHTML = this._formDefinition
      this.appendChild(tangyFormQuestions)
      // Pass up events from questions.
      this.questionsListener = tangyFormQuestions.addEventListener('ALL_ITEMS_CLOSED', () => {
        // Prevent firing while saving.
        let buffer = () => {
          if (this.throttledSaveFiring || this.throttledSaveLoaded) {
            setTimeout(() => buffer(), 200)
          } else {
            fireEvent()
          }
        }
        let fireEvent = () => this.dispatchEvent(new CustomEvent('ALL_ITEMS_CLOSED'))
        buffer()
      })
    }

    async showResponses() {
      this.$['tangy-form-questions'].hidden = true
      this.$['tangy-form-responses'].hidden = false
      // @TODO Paginate and mark current response.
      this.responses = await this.service.getResponsesByFormId(this.id)
    }

    // Prevent parallel saves which leads to race conditions.
    async throttledSaveResponse() {
      // If already loaded, return.
      if (this.throttledSaveLoaded) return
      // Throttle this fire by waiting until last fire is done.
      if (this.throttledSaveFiring) {
        this.throttledSaveLoaded = true
        while(this.throttledSaveFiring) await sleep(200)
        this.throttledSaveLoaded = false
      }
      // Fire it.
      this.throttledSaveFiring = true
      await this.saveResponse()
      this.throttledSaveFiring = false
    }

    async saveResponse() {
      const state = this.store.getState()
      let stateDoc = {}
      try {
        stateDoc = await this.service.getResponse(state._id)
      } catch(e) {
        let r = await this.service.saveResponse(state)
        stateDoc = await this.service.getResponse(state._id)
      }
      let newStateDoc = Object.assign({}, state, { _rev: stateDoc._rev })
      await this.service.saveResponse(newStateDoc)
    }

    /*
     * Responses helpers
     */

    async newResponse() {
      this.response = await this.service.saveResponse(Object.assign({}, this.initialState))
      this.formDoc = await this.service.getForm(this.id)
      this.formDoc.responseId = this.response._id
      this.formDoc = await this.service.saveForm(this.formDoc)
      this.showQuestions()
    }

    async resumeResponse(event) {
      let resumeResponseId = event.currentTarget.dataResponseId
      this.response = await this.service.getResponse(resumeResponseId)
      this.formDoc = await this.service.getForm(this.id)
      this.formDoc.responseId = this.response._id
      this.formDoc = await this.service.saveForm(this.formDoc)
      this.showQuestions()
    }

    async generateCSV() {
      this.responses = await this.service.getResponsesByFormId(this.id)
      let blob = new Blob([], {type: 'application/csv;charset=utf-8;' });
      // TODO: Scan for keys. Bonus points for doing it 100 sessions at a time.
      // Get header row.
      let keys = []
      for (let response of this.responses) {
        keys = _.uniq(keys.concat(Object.getOwnPropertyNames(response)))
      }
      // Get all data row.
      blob = new Blob([blob, keys.join(',') + '\n'], { type: 'application/csv;charset=utf-8;' });
      for (let response of this.responses) {
        let row = []
        // TODO: Loop through keys, assign empty values for nonmatching keys.
        for (let key of keys) {
          if (response.hasOwnProperty(key)) {
            let value = response[key]
            if (typeof value === 'object') value = JSON.stringify(value)
            if (typeof value === 'number') value = value.toString()
            // @TODO Using encodeURI for every string is a bummer, it makes output look weird.
            // value = value.replace(/"/g,'\\\"')
            // value = value.replace(/,/g,'\\,')
            value = encodeURI(value)
            row.push(`"${value}"`)
          } else {
            row.push('""')
          }
        }
        blob = new Blob([blob, row.join(',') + '\n'], { type: 'application/csv;charset=utf-8;' });
      }
      console.log('creating element');
      const element = window.document.createElement('a');
      element.setAttribute('href', URL.createObjectURL(blob));
      element.setAttribute('download', this.id + '.csv');
      console.log('appending to DOM');
      element.style.display = 'none';
      window.document.body.appendChild(element);
      console.log('Triggering download.');
      element.click();
      console.log('Cleaning up.');
      window.document.body.removeChild(element);
    }
  }

window.customElements.define(TangyForm.is, TangyForm);