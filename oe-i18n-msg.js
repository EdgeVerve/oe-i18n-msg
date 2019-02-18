/**
 * @license
 * ©2018-2019 EdgeVerve Systems Limited (a fully owned Infosys subsidiary),
 * Bangalore, India. All Rights Reserved.
 */
import { PolymerElement } from '@polymer/polymer/polymer-element.js';
import { OeI18nMixin } from "./oe-i18n-mixin.js";

var OEi18nMsg = window.OEi18nMsg || {};

/**
 * `oe-i18n-msg`
 * Custom element to do localization (i18n) message string replacement.
 *
 * @customElement
 * @polymer
 * @appliesMixin OeI18nMixin
 * @demo demo/index.html
 */
class OeI18nMsg extends PolymerElement {
  static get is() { return 'oe-i18n-msg'; }

  static get properties() {
    return {
      /**
       * The message id (key) for this message.
       */
      msgid: {
        type: String,
        observer: '_updateMessages'
      },

      /**
       * The message in the current locale
       */
      msg: {
        type: String,
        notify: true
      },
      /**
       * Placeholders used to insert within the message if it contains replacement
       * patterns to switch with. To use this feature you must include the "placeholders"
       * attribute and use '' for the array and "" for each element.
       * Example: placeholders = '["John Doe","Seattle"]'
       */
      placeholders: {
        type: Object,
        value () {
          return [];
        },
        observer: '_placeholdersChanged'
      },
    };
  }

  /**
   * Returns a message in the current locale (set by `window.OEi18nMsg.lang`).
   * @method getMsg
   * @param {string=} opt_msgId Optional message id to lookup. If left off,
   * the instance's `msgid` property is used.
   * @return {string|null} Translated message or `null` if not found.
   */
  getMsg(opt_msgId) {
    var msgId = opt_msgId || this.msgid;
    var msg = this._parentGetMsg(msgId);

    return msg;
  }

  getInterpolatedMsg(opt_msgId, opt_placeholders) {
    return this._getInterpolatedMsg(opt_msgId, opt_placeholders);
  }

  /**
   * Observer called on change of placeholder 
   * calls `_updateMessages`
   */
  _placeholdersChanged() {
    if(typeof this.placeholders === 'string') {
      this.placeholders = JSON.parse(this.placeholders);
      return;//let above set call placeholdersChanged again.
    }
    if(this.language && this.locales[this.language] && this.placeholders) {
      this._updateMessages(this);
    }
  }

  /**
   * Computes the Interpolated message by replacing the placeholders with corresponding data
   * @param {string} messageId actual message id
   * @param {Object} phData place holder data
   * @return {string|null} returns computed message or null
   */
  _getInterpolatedMsg(messageId, phData) {
    var self = this;
    var msgObj;
    messageId = messageId || self.msgid;
    if(self.locales && self.locales[self.language]) {
      msgObj = self.locales[self.language][messageId];
    }
    if(!msgObj && OEi18nMsg.defaults) {
      msgObj = OEi18nMsg.defaults[messageId];/* || {message: messageId};*/
    }
    if(msgObj && msgObj.message) {
      var message = msgObj.message;
      var placeholders = msgObj.placeholders;
      phData = phData || self.placeholders;
      if (placeholders && phData && phData instanceof Array) {
        var content, pos;
        Object.keys(placeholders).forEach(function (p) {
          content = placeholders[p].content;
          if (content[0] == '$') {
            pos = content.substring(1, content.length);
            if (!isNaN(pos)) {
              content = (phData.length < pos) ? '' : phData[pos - 1];
            }
          }
          message = message.split('$' + p + '$').join(content);
        });
      } else if (phData) {
        placeholders = message.match(/\$\w+\$/g);
        placeholders && placeholders.forEach(function (item) {
          /* IE Does not support startsWith */
          /*if(item.startsWith('$_')){*/
          if (item[0] === '$' && item[1] === '_') {
            var itemValue = phData[item.substr(2, item.length - 3)]; //item=$_label$ -> itemValue='firstName'
            var translation = self.locales[self.language][itemValue] || itemValue;
            translation = (translation && translation.message) ? translation.message : itemValue;
            message = message.split(item).join(translation);
          } else {
            message = message.split(item).join(phData[item.substr(1, item.length - 2)]);
          }
        });
      }
      return message;
    }
    return null;
  }

  /**
   * Updates the textContent of the current Element with interpolated message.
   */
  _updateMessages() {
    if(this.isConnected) { //IE invalid-argument error fix.
      var msg = this._getInterpolatedMsg() || this.defaultMsg || this.msgid;
      this.msg = msg;
      this.textContent = msg;
    }
  }

  /**
   * Connected callback to get the default fallback message.
   * calls `_updateMessages` to set updated textContent.
   */
  connectedCallback() {
    this.defaultMsg = this.textContent.trim();
    this._updateMessages();
  }

}

window.customElements.define(OeI18nMsg.is,  OeI18nMixin(OeI18nMsg));
