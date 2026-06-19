/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-homepage.js
  var import_homepage_exports = {};
  __export(import_homepage_exports, {
    default: () => import_homepage_default
  });

  // tools/importer/parsers/hero-stats.js
  function parse(element, { document }) {
    const bgImage = element.querySelector("img");
    const heading = element.querySelector('h1, h2, [class*="title"]');
    const statEls = Array.from(element.querySelectorAll("stat"));
    const cells = [];
    if (bgImage) {
      const imageCell = document.createDocumentFragment();
      imageCell.appendChild(document.createComment(" field:image "));
      imageCell.appendChild(bgImage);
      cells.push([imageCell]);
    }
    const textCell = document.createDocumentFragment();
    textCell.appendChild(document.createComment(" field:text "));
    if (heading) textCell.appendChild(heading);
    if (statEls.length) {
      const ul = document.createElement("ul");
      statEls.forEach((stat) => {
        const number = stat.querySelector('.number, [class*="number"]');
        const label = stat.querySelector('.text, [class*="label"]');
        const numberText = number ? number.textContent.trim() : "";
        const labelText = label ? label.textContent.replace(/\s+/g, " ").trim() : "";
        const li = document.createElement("li");
        const strong = document.createElement("strong");
        strong.textContent = numberText;
        li.appendChild(strong);
        if (labelText) {
          li.appendChild(document.createTextNode(` ${labelText}`));
        }
        ul.appendChild(li);
      });
      textCell.appendChild(ul);
    }
    cells.push([textCell]);
    if (!heading && !statEls.length && !bgImage) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "hero (stats)", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-dashboard.js
  function parse2(element, { document }) {
    const cards = Array.from(element.querySelectorAll(":scope > div.col-xl-4"));
    const cells = [];
    cards.forEach((col) => {
      const headLink = col.querySelector('a.dashboard-card-head, a[class*="card-head"]');
      if (!headLink) return;
      const titleEl = headLink.querySelector("h5, h2, h3, h4");
      const titleText = titleEl ? titleEl.textContent.trim() : headLink.textContent.trim();
      const href = headLink.getAttribute("href");
      const imageCell = "";
      const textCell = document.createDocumentFragment();
      textCell.appendChild(document.createComment(" field:text "));
      const heading = document.createElement("h3");
      if (href) {
        const a = document.createElement("a");
        a.setAttribute("href", href);
        a.textContent = titleText;
        heading.appendChild(a);
      } else {
        heading.textContent = titleText;
      }
      textCell.appendChild(heading);
      cells.push([imageCell, textCell]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-dashboard", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-split.js
  function parse3(element, { document }) {
    let leftSrc = element.querySelector('wrapper.left, .left, [class*="left"]');
    let rightSrc = element.querySelector('wrapper.right, .right, [class*="right"]');
    if (!leftSrc || !rightSrc) {
      const children = Array.from(element.children).filter(
        (c) => c.textContent.trim().length
      );
      leftSrc = leftSrc || children[0];
      rightSrc = rightSrc || children[1];
    }
    if (!leftSrc && !rightSrc) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cleanColumn = (src) => {
      if (!src) return "";
      const clone = src.cloneNode(true);
      clone.querySelectorAll('img[src^="data:image/svg"]').forEach((img) => {
        const span = img.closest("span");
        if (span && !span.textContent.trim()) span.remove();
        else img.remove();
      });
      const frag = document.createDocumentFragment();
      Array.from(clone.childNodes).forEach((n) => frag.appendChild(n));
      return frag;
    };
    const leftCell = cleanColumn(leftSrc);
    const rightCell = cleanColumn(rightSrc);
    const cells = [[leftCell, rightCell]];
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-split", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-video.js
  function parse4(element, { document }) {
    const tiles = Array.from(
      element.querySelectorAll('videoblock > div, [class*="videoblock"] > div')
    );
    const cells = [];
    tiles.forEach((tile) => {
      const iframe = tile.querySelector("iframe");
      const caption = tile.querySelector('h6, h5, h4, h3, [class*="caption"]');
      if (!iframe && !caption) return;
      const imageCell = "";
      const textCell = document.createDocumentFragment();
      textCell.appendChild(document.createComment(" field:text "));
      if (caption) {
        const h = document.createElement("h3");
        h.textContent = caption.textContent.trim();
        textCell.appendChild(h);
      }
      const src = iframe ? iframe.getAttribute("src") : null;
      if (src) {
        const p = document.createElement("p");
        const a = document.createElement("a");
        a.setAttribute("href", src);
        a.textContent = src;
        p.appendChild(a);
        textCell.appendChild(p);
      }
      cells.push([imageCell, textCell]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards (video)", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/ercot-cleanup.js
  var TransformHook = {
    beforeTransform: "beforeTransform",
    afterTransform: "afterTransform"
  };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      element.querySelectorAll("a.bigbutton").forEach((a) => {
        if (a.closest("strong") || a.closest("em")) return;
        const doc = a.ownerDocument;
        const strong = doc.createElement("strong");
        a.replaceWith(strong);
        strong.appendChild(a);
      });
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        "header.combined",
        // site header (nav, mainheader, utility/search)
        "footer.combined",
        // site footer
        "#bcrumb",
        // breadcrumb trail
        "utility"
        // utility/login + search bar (defensive; normally nested in header)
      ]);
    }
  }

  // tools/importer/transformers/ercot-sections.js
  var TransformHook2 = {
    beforeTransform: "beforeTransform",
    afterTransform: "afterTransform"
  };
  function transform2(hookName, element, payload) {
    if (hookName === TransformHook2.beforeTransform) {
      const sections = payload && payload.template && payload.template.sections;
      if (!sections || sections.length < 2) return;
      const doc = element.ownerDocument;
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        const target = element.querySelector(section.selector);
        if (!target) continue;
        if (section.style) {
          const metaBlock = WebImporter.Blocks.createBlock(doc, {
            name: "Section Metadata",
            cells: { style: section.style }
          });
          target.after(metaBlock);
        }
        if (i > 0) {
          target.before(doc.createElement("hr"));
        }
      }
    }
  }

  // tools/importer/import-homepage.js
  var parsers = {
    "hero-stats": parse,
    "cards-dashboard": parse2,
    "columns-split": parse3,
    "cards-video": parse4
  };
  var PAGE_TEMPLATE = {
    name: "homepage",
    description: "ERCOT homepage with hero + grid status stat block, dashboards section, split content sections, and a videos block. Header and footer are handled by navigation/footer orchestration.",
    urls: ["https://www.ercot.com/"],
    blocks: [
      {
        name: "hero-stats",
        instances: ["#mainContainer > div.page--content > div.container-fluid > div.row > div.col.content-margin > div:nth-of-type(3) > section.hero"]
      },
      {
        name: "cards-dashboard",
        instances: ["#mainContainer > div.page--content > div.container-fluid > div.row > div.col.content-margin > div:nth-of-type(3) > div.mt-5.mx-2.row"]
      },
      {
        name: "columns-split",
        instances: [
          "#mainContainer > div.page--content > div.container-fluid > div.row > div.col.content-margin > div:nth-of-type(3) > section.split:nth-of-type(3)",
          "#mainContainer > div.page--content > div.container-fluid > div.row > div.col.content-margin > div:nth-of-type(3) > section.split:nth-of-type(5)"
        ]
      },
      {
        name: "cards-video",
        instances: ["#mainContainer > div.page--content > div.container-fluid > div.row > div.col.content-margin > div:nth-of-type(3) > section.videos"]
      }
    ],
    sections: [
      { id: "section-1-hero", name: "hero", selector: "#mainContainer > div.page--content > div.container-fluid > div.row > div.col.content-margin > div:nth-of-type(3) > section.hero", style: null, blocks: ["hero-stats"], defaultContent: [] },
      { id: "section-2-dashboard-cards", name: "dashboard-cards-row", selector: "#mainContainer > div.page--content > div.container-fluid > div.row > div.col.content-margin > div:nth-of-type(3) > div.mt-5.mx-2.row", style: null, blocks: ["cards-dashboard"], defaultContent: [] },
      { id: "section-3-dashboards-cta", name: "dashboards-cta", selector: "#mainContainer > div.page--content > div.container-fluid > div.row > div.col.content-margin > div:nth-of-type(3) > section.dashboards.mt-n5", style: null, blocks: [], defaultContent: ["#mainContainer > div.page--content > div.container-fluid > div.row > div.col.content-margin > div:nth-of-type(3) > section.dashboards.mt-n5 a"] },
      { id: "section-4-split-responsibilities", name: "split-responsibilities", selector: "#mainContainer > div.page--content > div.container-fluid > div.row > div.col.content-margin > div:nth-of-type(3) > section.split:nth-of-type(3)", style: "light", blocks: ["columns-split"], defaultContent: [] },
      { id: "section-5-videos", name: "videos", selector: "#mainContainer > div.page--content > div.container-fluid > div.row > div.col.content-margin > div:nth-of-type(3) > section.videos", style: null, blocks: ["cards-video"], defaultContent: [] },
      { id: "section-6-split-assistance", name: "split-assistance", selector: "#mainContainer > div.page--content > div.container-fluid > div.row > div.col.content-margin > div:nth-of-type(3) > section.split:nth-of-type(5)", style: "light", blocks: ["columns-split"], defaultContent: [] }
    ]
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        const elements = document.querySelectorAll(selector);
        if (elements.length === 0) {
          console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        }
        elements.forEach((element) => {
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_homepage_default = {
    transform: (payload) => {
      const { document, url, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const path = WebImporter.FileUtils.sanitizePath(
        new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "") || "/index"
      );
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_homepage_exports);
})();
