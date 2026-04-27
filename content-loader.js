/**
 * HustleWave content-loader.js
 *
 * Hydrates HTML elements from content/site.json.
 *
 * Usage:
 *   <element data-content="path.to.field">Default text</element>
 *   <img data-image="path.to.image" src="default.jpg" />
 *   <a data-content="cta.text" data-attr-href="cta.link">Default</a>
 *   <div data-content-list="services">
 *     <template data-list-item>
 *       <div class="card">
 *         <h3 data-field="title"></h3>
 *         <p data-field="description"></p>
 *       </div>
 *     </template>
 *   </div>
 */
(function () {
  'use strict';

  const CONTENT_URL = 'content/site.json';

  function getValue(obj, path) {
    if (!path) return undefined;
    return path.split('.').reduce(function (acc, key) {
      if (acc === undefined || acc === null) return undefined;
      // support array index like services.0.title
      if (Array.isArray(acc) && /^\d+$/.test(key)) return acc[parseInt(key, 10)];
      return acc[key];
    }, obj);
  }

  function setText(el, value) {
    if (value === undefined || value === null) return;
    el.textContent = String(value);
  }

  function applyAttrBindings(el, content) {
    // any attribute starting with data-attr- maps to that attribute on the element
    // supports formats: data-attr-href="path.to.field" or data-attr-href="path.to.field:tel"
    Array.from(el.attributes).forEach(function (attr) {
      if (!attr.name.startsWith('data-attr-')) return;
      const targetAttr = attr.name.replace('data-attr-', '');
      const spec = attr.value;
      const [path, prefix] = spec.split(':');
      const value = getValue(content, path);
      if (value === undefined || value === null) return;
      el.setAttribute(targetAttr, prefix ? prefix + ':' + value : value);
    });
  }

  function hydrateContent(content) {
    // simple text fields
    document.querySelectorAll('[data-content]').forEach(function (el) {
      const path = el.getAttribute('data-content');
      const value = getValue(content, path);
      if (value !== undefined && value !== null) setText(el, value);
      applyAttrBindings(el, content);
    });

    // attribute-only elements (no data-content but have data-attr-*)
    document.querySelectorAll('[data-attr-href], [data-attr-src], [data-attr-alt]').forEach(function (el) {
      if (el.hasAttribute('data-content')) return; // already handled above
      applyAttrBindings(el, content);
    });

    // image swaps
    document.querySelectorAll('[data-image]').forEach(function (el) {
      const path = el.getAttribute('data-image');
      const value = getValue(content, path);
      if (value) el.setAttribute('src', value);
    });

    // repeating lists
    document.querySelectorAll('[data-content-list]').forEach(function (container) {
      const path = container.getAttribute('data-content-list');
      const list = getValue(content, path);
      if (!Array.isArray(list)) return;
      const tpl = container.querySelector('template[data-list-item]');
      if (!tpl) return;

      // remove existing rendered items (anything not the template)
      Array.from(container.children).forEach(function (child) {
        if (child !== tpl) container.removeChild(child);
      });

      list.forEach(function (item) {
        const clone = tpl.content.cloneNode(true);
        clone.querySelectorAll('[data-field]').forEach(function (fieldEl) {
          const fieldName = fieldEl.getAttribute('data-field');
          const value = item[fieldName];
          if (value !== undefined && value !== null) setText(fieldEl, value);
        });
        // attribute bindings inside list items
        clone.querySelectorAll('[data-image-field]').forEach(function (imgEl) {
          const fieldName = imgEl.getAttribute('data-image-field');
          if (item[fieldName]) imgEl.setAttribute('src', item[fieldName]);
        });
        container.appendChild(clone);
      });
    });
  }

  function init() {
    fetch(CONTENT_URL, { cache: 'no-cache' })
      .then(function (res) {
        if (!res.ok) throw new Error('content/site.json not found');
        return res.json();
      })
      .then(hydrateContent)
      .catch(function (err) {
        // silent fail — defaults stay in HTML
        console.warn('[content-loader] using HTML defaults:', err.message);
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
