/* ©2017-2018 EdgeVerve Systems Limited (a fully owned Infosys subsidiary), Bangalore, India. All Rights Reserved.
The EdgeVerve proprietary software program ("Program"), is protected by copyrights laws, international treaties and other pending or existing intellectual property rights in India, the United States and other countries.
The Program may contain/reference third party or open source components, the rights to which continue to
remain with the applicable third party licensors or the open source community as the case may be and nothing
here transfers the rights to the third party and open source components, except as expressly permitted.
Any unauthorized reproduction, storage, transmission in any form or by any means (including without limitation to electronic, mechanical, printing, photocopying, recording or  otherwise), or any distribution of this Program,or any portion of it, may result in severe civil and criminal penalties, and will be prosecuted to the maximum extent possible under the law. */

import { html, PolymerElement } from '@polymer/polymer/polymer-element.js';
import {OeI18nMixin} from '../oe-i18n-mixin';

class TestElement extends PolymerElement {
  static get is() { return 'oe-i18n-msg-behavior-example'; }

  static get template(){
    return html`
    <h1>[[i18n.days]]</h1>
    <span>[[i18n.hours]]</span>
    `
  }
  static get properties(){
    return {
      i18n: {
        value: {
          days: ''
        }
      }
    }
  }
}



class TestElement2 extends PolymerElement {
  static get is() { return 'oe-i18n-msg-behavior-example-wp'; }

  static get template(){
    return html`
    <h1>[[i18n.days]]</h1>
    <span>[[i18n.hours]]</span>
    `
  }
}

window.customElements.define(TestElement.is,  OeI18nMixin(TestElement));
window.customElements.define(TestElement2.is,  OeI18nMixin(TestElement2));
