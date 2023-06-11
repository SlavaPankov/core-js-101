/* eslint-disable max-classes-per-file */
/* ************************************************************************************************
 *                                                                                                *
 * Please read the following tutorial before implementing tasks:                                   *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object        *
 *                                                                                                *
 ************************************************************************************************ */


/**
 * Returns the rectangle object with width and height parameters and getArea() method
 *
 * @param {number} width
 * @param {number} height
 * @return {Object}
 *
 * @example
 *    const r = new Rectangle(10,20);
 *    console.log(r.width);       // => 10
 *    console.log(r.height);      // => 20
 *    console.log(r.getArea());   // => 200
 */
function Rectangle(width, height) {
  return {
    width,
    height,
    getArea() {
      return width * height;
    },
  };
}


/**
 * Returns the JSON representation of specified object
 *
 * @param {object} obj
 * @return {string}
 *
 * @example
 *    [1,2,3]   =>  '[1,2,3]'
 *    { width: 10, height : 20 } => '{"height":10,"width":20}'
 */
function getJSON(obj) {
  return JSON.stringify(obj);
}


/**
 * Returns the object of specified type from JSON representation
 *
 * @param {Object} proto
 * @param {string} json
 * @return {object}
 *
 * @example
 *    const r = fromJSON(Circle.prototype, '{"radius":10}');
 *
 */
function fromJSON(proto, json) {
  return Object.setPrototypeOf(JSON.parse(json), proto);
}


/**
 * Css selectors builder
 *
 * Each complex selector can consists of type, id, class, attribute, pseudo-class
 * and pseudo-element selectors:
 *
 *    element#id.class[attr]:pseudoClass::pseudoElement
 *              \----/\----/\----------/
 *              Can be several occurrences
 *
 * All types of selectors can be combined using the combination ' ','+','~','>' .
 *
 * The task is to design a single class, independent classes or classes hierarchy
 * and implement the functionality to build the css selectors using the provided cssSelectorBuilder.
 * Each selector should have the stringify() method to output the string representation
 * according to css specification.
 *
 * Provided cssSelectorBuilder should be used as facade only to create your own classes,
 * for example the first method of cssSelectorBuilder can be like this:
 *   element: function(value) {
 *       return new MySuperBaseElementSelector(...)...
 *   },
 *
 * The design of class(es) is totally up to you, but try to make it as simple,
 * clear and readable as possible.
 *
 * @example
 *
 *  const builder = cssSelectorBuilder;
 *
 *  builder.id('main').class('container').class('editable').stringify()
 *    => '#main.container.editable'
 *
 *  builder.element('a').attr('href$=".png"').pseudoClass('focus').stringify()
 *    => 'a[href$=".png"]:focus'
 *
 *  builder.combine(
 *      builder.element('div').id('main').class('container').class('draggable'),
 *      '+',
 *      builder.combine(
 *          builder.element('table').id('data'),
 *          '~',
 *           builder.combine(
 *               builder.element('tr').pseudoClass('nth-of-type(even)'),
 *               ' ',
 *               builder.element('td').pseudoClass('nth-of-type(even)')
 *           )
 *      )
 *  ).stringify()
 *    => 'div#main.container.draggable + table#data ~ tr:nth-of-type(even)   td:nth-of-type(even)'
 *
 *  For more examples see unit tests.
 */

class CssSelector {
  constructor() {
    this.elements = [];
    this.ids = [];
    this.classes = [];
    this.attrs = [];
    this.pseudoClasses = [];
    this.pseudoElements = [];
    this.partsOreder = {
      first: 0,
      element: 1,
      ID: 2,
      class: 3,
      attr: 4,
      pseudoClass: 5,
      pseudoElement: 6,
    };
    this.lastPart = this.partsOreder.first;
  }

  checkOrder(curPart) {
    if (curPart < this.lastPart) {
      throw new Error('Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element');
    }
    return curPart;
  }

  element(value) {
    if (this.elements.length !== 0) {
      throw new Error('Element, id and pseudo-element should not occur more then one time inside the selector');
    }
    this.lastPart = this.checkOrder(this.partsOreder.element);
    this.elements.push(value);
    return this;
  }

  id(value) {
    if (this.ids.length !== 0) {
      throw new Error('Element, id and pseudo-element should not occur more then one time inside the selector');
    }
    this.lastPart = this.checkOrder(this.partsOreder.ID);
    this.ids.push(`#${value}`);
    return this;
  }

  class(value) {
    this.lastPart = this.checkOrder(this.partsOreder.class);
    this.classes.push(`.${value}`);
    return this;
  }

  attr(value) {
    this.lastPart = this.checkOrder(this.partsOreder.attr);
    this.attrs.push(`[${value}]`);
    return this;
  }

  pseudoClass(value) {
    this.lastPart = this.checkOrder(this.partsOreder.pseudoClass);
    this.pseudoClasses.push(`:${value}`);
    return this;
  }

  pseudoElement(value) {
    if (this.pseudoElements.length !== 0) {
      throw new Error('Element, id and pseudo-element should not occur more then one time inside the selector');
    }
    this.lastPart = this.checkOrder(this.partsOreder.pseudoElement);
    this.pseudoElements.push(`::${value}`);
    return this;
  }

  stringify() {
    return this.elements.join('')
          + this.ids.join('')
          + this.classes.join('')
          + this.attrs.join('')
          + this.pseudoClasses.join('')
          + this.pseudoElements.join('');
  }
}

class CssSelectorCombination {
  constructor() {
    this.selectors = [];
    this.combinator = [];
  }

  combine(selector1, combinator, selector2) {
    this.selectors = [].concat(('selectors' in selector1) ? selector1.selectors : selector1, ('selectors' in selector2) ? selector2.selectors : selector2);
    this.combinators = [].concat(('combinators' in selector1) ? selector1.combinators : [], combinator, ('combinators' in selector2) ? selector2.combinators : []);
    return this;
  }

  stringify() {
    let result = ''.concat(this.selectors[0].stringify());
    for (let i = 1; i < this.selectors.length; i += 1) {
      result = result.concat(' ', this.combinators[i - 1], ' ', this.selectors[i].stringify());
    }
    return result;
  }
}

const cssSelectorBuilder = {
  element(value) {
    return new CssSelector().element(value);
  },

  id(value) {
    return new CssSelector().id(value);
  },

  class(value) {
    return new CssSelector().class(value);
  },

  attr(value) {
    return new CssSelector().attr(value);
  },

  pseudoClass(value) {
    return new CssSelector().pseudoClass(value);
  },

  pseudoElement(value) {
    return new CssSelector().pseudoElement(value);
  },

  combine(selector1, combinator, selector2) {
    return new CssSelectorCombination().combine(selector1, combinator, selector2);
  },
};

module.exports = {
  Rectangle,
  getJSON,
  fromJSON,
  cssSelectorBuilder,
};
