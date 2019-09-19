/**
 * @license
 * ©2018-2019 EdgeVerve Systems Limited (a fully owned Infosys subsidiary),
 * Bangalore, India. All Rights Reserved.
 */
import { dedupingMixin } from '@polymer/polymer/lib/utils/mixin.js';
import 'observe-js'; // Loads and sets window.PathObserver Global

window.OEi18nMsg = window.OEi18nMsg || {
    lang: null,
    url: 'locales',
    locales: {},
    defaults: {
        'valueMissing': { message: 'A value is required' },
        'rangeOverflow': { message: 'Value is more than prescribed' },
        'rangeUnderflow': { message: 'Value is less than prescribed' },
        'tooShort': { message: 'Lengthen the value' },
        'tooLong': { message: 'Shorten the value' },
        'patternMismatch': { message: 'Value does not match prescribed pattern' },
        'numberFormat': { message: 'Please enter a valid number' },
        'dateFormat': { message: 'Please enter a valid date' },
        'record-created': { message: 'Saved successfully' },
        'record-deleted': { message: 'Deleted successfully' },
        'record-updated': { message: 'Saved successfully' },
    }
};

/**
 * This is the Mixin that takes care of oe-i18n translations
 * 
 * @polymer
 * @mixinFunction
 */
const I18nMixin = function (superClass) {

    var _instances = []; // Holds all i18n-msg elements to have them easily updated with translation messages.
    var _numInstancesUpdated = 0;

    /**
     * @polymer
     * @mixinClass
     */
    return class extends superClass {
        /**
        * The `oe-i18n-language-ready` is fired after the locale was fetched and all `<oe-i18n-msg>` elements were updated.
        *
        * @event oe-i18n-language-ready
        * @detail {{language: String}}
        */
        static get properties() {
            return {

                /**
                 * The language being used.
                 */
                language: {
                    type: String,
                    value: "en",
                    readOnly:true,
                    notify: true
                },

                /**
                 * The folder name where the localized `<lang>.json` files are located.
                 * Overrides `window.OEi18nMsg.url` if not `null`.
                 */
                messagesUrl: {
                    type: String,
                    value: 'locales'
                },

                /**
                 * An object containing the set of known language locales that have been loaded.
                 */
                locales: {
                    type: Object,
                    value: {}
                },

                /**
                 * i18n object, by default it contains all translations.
                 */
                i18n: {
                    type: Object,
                    value: {}
                }
            };
        }

        init(OEi18nMsg) {
            this.OEi18nMsg = OEi18nMsg;
            this.messagesUrl = this.OEi18nMsg.url;
            this._setLanguage(this.OEi18nMsg.lang);
            this._languageChanged();
            // Have instances observe window.OEi18nMsg.lang changes
            // and go fetch the localized messages.json file.
            var observerLang = new PathObserver(this.OEi18nMsg, 'lang');
            observerLang.open(function (newValue, oldValue) {
                _numInstancesUpdated = 0;
                this._setLanguage(newValue);
                this._languageChanged();
            }.bind(this));

            // Have instances observe window.OEi18nMsg.url changes
            // and go fetch the localized messages.json file.
            var observerUrl = new PathObserver(this.OEi18nMsg, 'url');
            observerUrl.open(function (newValue, oldValue) {
                _numInstancesUpdated = 0;
                this.messagesUrl = newValue;
                this._fetchLanguage();
            }.bind(this));

            _instances.push(this);
            
        }


        /**
         * Returns a message in the current locale (set by `window.OEi18nMsg.lang`).
         * @method parentGetMsg
         * @param {string=} opt_msgId Optional message id to lookup.
         * @return {string|null} Translated message or `null` if not found.
         */
        _parentGetMsg(opt_msgId) {
            var msgId = opt_msgId;
            if (this.locales) {
                var lang = this.locales[this.language];
                if (lang && lang[msgId]) {
                    return lang[msgId].message;
                }
            }
            return null;
        }

        /**
         * Update the messages when the language is changed
         * 
         */
        _languageChanged() {
            if (!this.language) {
                return;
            }

            if (this.language && this.locales[this.language]) {
                // Send one signal that language changed to outside.
                if (_numInstancesUpdated == _instances.length - 1) {
                    this.fire('oe-i18n-language-ready', { language: this.language });
                }

                this._updateMessages();
                _numInstancesUpdated++;
            } else {
                this._fetchLanguage();
            }

        }

        /**
         * Fetch the language json based on the `url`
         */
        _fetchLanguage() {
            var url = /*this.baseURI + */this.messagesUrl + '/' + this.language + '.json';

            window.OEi18nMsg._loading = window.OEi18nMsg._loading || [];
            if (window.OEi18nMsg._loading.indexOf(url) >= 0) {
                //Somebody has already initiated this load.
                return;
            }
            window.OEi18nMsg._loading.push(url);
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url);
            xhr.onload = function (e) {
                var index = window.OEi18nMsg._loading.indexOf(url);
                if (index >= 0) {
                    window.OEi18nMsg._loading.splice(index, 1);
                }

                if (e.target.status !== 200 && e.target.status !== 0) {
                    return;
                }

                var resp = JSON.parse(e.target.response);

                this.locales[this.language] = resp; // cache this locale.

                this._notifyInstances();

                this.fire('oe-i18n-language-ready', { language: this.language });
            }.bind(this);
            xhr.onerror = function (e) {
                var index = window.OEi18nMsg._loading.indexOf(url);
                if (index >= 0) {
                    window.OEi18nMsg._loading.splice(index, 1);
                }
            }.bind(this);
            xhr.send();
        }


        _notifyInstances() {
            let i = 0;
            let instance = _instances[i];
            while(typeof instance !== "undefined"){
                instance._setLanguage(this.OEi18nMsg.lang);
                instance._languageChanged();
                instance.locales[this.language] = this.locales[this.language];
                instance._updateMessages();
                i++;
                instance = _instances[i];
            }
        }

        constructor() {
            super();
            this.init(window.OEi18nMsg);
        }

        _setMsgs(msgid) {
            var msg = this._parentGetMsg(msgid);
            if (msg) {
                this.set('i18n.' + msgid, msg);
            } else {
                console.warn(this.language + ': "' + msgid + '" message id was not found in ' + this.OEi18nMsg.url);
            }
        }

        _updateMessages() {
            if(super._updateMessages){
                super._updateMessages();
                return;
            }

            if (this.locales && this.locales[this.language]) {
                // If i18n is empty fill it with the keys from the first locale
                if (Object.keys(this.i18n).length === 0) {
                    var localesArray = Object.keys(this.locales);
                    if (localesArray.length > 0) {
                        this.locales[localesArray[0]] && Object.keys(this.locales[localesArray[0]]).forEach(function (i18nKey) {
                            this.i18n[i18nKey] = '';
                            this._setMsgs(i18nKey);
                        }.bind(this));
                    }
                } else {
                    this.i18n && Object.keys(this.i18n).forEach(this._setMsgs.bind(this));
                }
            }
        }

        /**
         * Polymer `fire` function
         * @param {string} eventName event name
         * @param {Object} detail detail to be passed in the event
         */
        fire(eventName, detail) {
            this.dispatchEvent(new CustomEvent(eventName, { detail: detail, bubbles: true, composed: true }));
        }
    };
};


export const OeI18nMixin = dedupingMixin(I18nMixin);