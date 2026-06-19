/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroStatsParser from './parsers/hero-stats.js';
import cardsDashboardParser from './parsers/cards-dashboard.js';
import columnsSplitParser from './parsers/columns-split.js';
import cardsVideoParser from './parsers/cards-video.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/ercot-cleanup.js';
import sectionsTransformer from './transformers/ercot-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero-stats': heroStatsParser,
  'cards-dashboard': cardsDashboardParser,
  'columns-split': columnsSplitParser,
  'cards-video': cardsVideoParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'homepage',
  description: 'ERCOT homepage with hero + grid status stat block, dashboards section, split content sections, and a videos block. Header and footer are handled by navigation/footer orchestration.',
  urls: ['https://www.ercot.com/'],
  blocks: [
    {
      name: 'hero-stats',
      instances: ['#mainContainer > div.page--content > div.container-fluid > div.row > div.col.content-margin > div:nth-of-type(3) > section.hero'],
    },
    {
      name: 'cards-dashboard',
      instances: ['#mainContainer > div.page--content > div.container-fluid > div.row > div.col.content-margin > div:nth-of-type(3) > div.mt-5.mx-2.row'],
    },
    {
      name: 'columns-split',
      instances: [
        '#mainContainer > div.page--content > div.container-fluid > div.row > div.col.content-margin > div:nth-of-type(3) > section.split:nth-of-type(3)',
        '#mainContainer > div.page--content > div.container-fluid > div.row > div.col.content-margin > div:nth-of-type(3) > section.split:nth-of-type(5)',
      ],
    },
    {
      name: 'cards-video',
      instances: ['#mainContainer > div.page--content > div.container-fluid > div.row > div.col.content-margin > div:nth-of-type(3) > section.videos'],
    },
  ],
  sections: [
    { id: 'section-1-hero', name: 'hero', selector: '#mainContainer > div.page--content > div.container-fluid > div.row > div.col.content-margin > div:nth-of-type(3) > section.hero', style: null, blocks: ['hero-stats'], defaultContent: [] },
    { id: 'section-2-dashboard-cards', name: 'dashboard-cards-row', selector: '#mainContainer > div.page--content > div.container-fluid > div.row > div.col.content-margin > div:nth-of-type(3) > div.mt-5.mx-2.row', style: null, blocks: ['cards-dashboard'], defaultContent: [] },
    { id: 'section-3-dashboards-cta', name: 'dashboards-cta', selector: '#mainContainer > div.page--content > div.container-fluid > div.row > div.col.content-margin > div:nth-of-type(3) > section.dashboards.mt-n5', style: null, blocks: [], defaultContent: ['#mainContainer > div.page--content > div.container-fluid > div.row > div.col.content-margin > div:nth-of-type(3) > section.dashboards.mt-n5 a'] },
    { id: 'section-4-split-responsibilities', name: 'split-responsibilities', selector: '#mainContainer > div.page--content > div.container-fluid > div.row > div.col.content-margin > div:nth-of-type(3) > section.split:nth-of-type(3)', style: 'light', blocks: ['columns-split'], defaultContent: [] },
    { id: 'section-5-videos', name: 'videos', selector: '#mainContainer > div.page--content > div.container-fluid > div.row > div.col.content-margin > div:nth-of-type(3) > section.videos', style: null, blocks: ['cards-video'], defaultContent: [] },
    { id: 'section-6-split-assistance', name: 'split-assistance', selector: '#mainContainer > div.page--content > div.container-fluid > div.row > div.col.content-margin > div:nth-of-type(3) > section.split:nth-of-type(5)', style: 'light', blocks: ['columns-split'], defaultContent: [] },
  ],
};

// TRANSFORMER REGISTRY
const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 */
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
          section: blockDef.section || null,
        });
      });
    });
  });
  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

// EXPORT DEFAULT CONFIGURATION
export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;

    // 1. beforeTransform (initial cleanup)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return; // already replaced
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

    // 4. afterTransform (final cleanup + section breaks/metadata)
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Generate sanitized path
    const path = WebImporter.FileUtils.sanitizePath(
      new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, '') || '/index',
    );

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
