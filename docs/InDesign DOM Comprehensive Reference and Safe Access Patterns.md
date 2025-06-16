# InDesign DOM Comprehensive Reference & Safe Access Patterns

**Version:** 3.1 Enhanced Safety Edition  
**Last Updated:** June 2025  
**Compatibility:** InDesign CS3+ with ExtendScript  
**TypeScript-Style Examples:** Modern syntax for reference purposes  

---

## Table of Contents

1. [Application Object](#application-object)
2. [Document Object](#document-object)
3. [Page Objects](#page-objects)
4. [Text Objects](#text-objects)
5. [Image & Graphics Objects](#image--graphics-objects)
6. [Link Objects](#link-objects)
7. [Style Objects](#style-objects)
8. [Color Objects](#color-objects)
9. [Layer Objects](#layer-objects)
10. [Page Item Objects](#page-item-objects)
11. [Safe Access Patterns](#safe-access-patterns)
12. [Error Handling Strategies](#error-handling-strategies)
13. [Performance Considerations](#performance-considerations)

---

## Application Object

### Primary Properties
```typescript
interface InDesignApplication {
  // Core application properties
  name: string;                           // "Adobe InDesign"
  version: string;                        // e.g., "20.0.0.95"
  build: string;                         // Build number
  locale: string;                        // Current locale
  
  // Document management
  documents: Documents;                   // All open documents
  activeDocument: Document | null;       // Currently active document
  
  // Collections
  fonts: Fonts;                          // Available fonts
  menuActions: MenuActions;              // Available menu actions
  scriptMenuActions: ScriptMenuActions; // Custom script actions
  
  // Preferences
  preferences: Preferences;              // Application preferences
  clipboardPreferences: ClipboardPreference;
  generalPreferences: GeneralPreference;
  
  // File system
  filePath: File;                        // Application executable path
  
  // UI state
  layoutWindows: LayoutWindows;          // Open layout windows
  storyWindows: StoryWindows;           // Open story windows
}

// Safe access examples:
const appName = emergencyGetProperty(app, 'name', 'Unknown');
const docCount = emergencyGetLength(app.documents, 1000);
const activeDoc = emergencyGetProperty(app, 'activeDocument', null);
```

### Alternative Access Paths
```typescript
// Multiple ways to access the same information:
app.name                    // Direct property
app['name']                // Bracket notation
emergencyGetProperty(app, 'name')  // Safe emergency access

// Document access patterns:
app.documents.length        // Collection length
app.documents.count        // Alternative count property
emergencyGetLength(app.documents)  // Safe length access

app.documents[0]           // First document (array-style)
app.documents.item(0)      // First document (method)
app.documents.firstItem()  // First document (InDesign method)
```

⚠️ **Warning:** Always check `app.documents.length > 0` before accessing documents.

---

## Document Object

### Core Document Properties
```typescript
interface Document {
  // Identity
  name: string;                          // Document name
  filePath: File | null;                // File path (null if unsaved)
  id: number;                           // Unique document ID
  label: string;                        // Custom label
  
  // State
  saved: boolean;                       // Save status
  modified: boolean;                    // Modified since last save
  recovered: boolean;                   // Recovered from crash
  readOnly: boolean;                   // Read-only status
  
  // Structure collections
  pages: Pages;                         // All pages
  spreads: Spreads;                     // All spreads
  masterSpreads: MasterSpreads;         // Master spreads
  layers: Layers;                       // All layers
  
  // Content collections
  stories: Stories;                     // All stories
  textFrames: TextFrames;              // All text frames
  images: Images;                       // All images
  graphics: Graphics;                   // All graphics
  pageItems: PageItems;                // All page items
  
  // Asset collections
  links: Links;                         // All linked files
  fonts: Fonts;                        // Used fonts
  colors: Colors;                       // Document colors
  swatches: Swatches;                  // Color swatches
  
  // Style collections
  paragraphStyles: ParagraphStyles;     // Paragraph styles
  characterStyles: CharacterStyles;     // Character styles
  objectStyles: ObjectStyles;           // Object styles
  cellStyles: CellStyles;              // Table cell styles
  tableStyles: TableStyles;            // Table styles
  
  // Preferences
  documentPreferences: DocumentPreference;
  marginPreferences: MarginPreference;
  textPreferences: TextPreference;
  viewPreferences: ViewPreference;
}

// Safe access patterns:
const docName = emergencyGetProperty(doc, 'name', 'Untitled');
const pageCount = emergencyGetLength(doc.pages, 2000);
const isSaved = emergencyGetProperty(doc, 'saved', false);
```

### Document Preferences Deep Dive
```typescript
interface DocumentPreferences {
  // Page setup
  pageWidth: UnitValue;                 // Page width
  pageHeight: UnitValue;               // Page height
  pageOrientation: PageOrientation;     // Portrait/landscape
  pagesPerDocument: number;            // Total pages
  
  // Layout
  facingPages: boolean;                // Facing pages enabled
  allowPageShuffle: boolean;           // Page shuffle allowed
  
  // Margins and columns
  columnCount: number;                 // Number of columns
  columnGutter: UnitValue;            // Column gutter width
  
  // Intent
  intent: DocumentIntentOptions;        // Print/web/digital
}

// Access examples:
const pageWidth = emergencyGetProperty(doc.documentPreferences, 'pageWidth', 0);
const columnCount = emergencyGetProperty(doc.documentPreferences, 'columnCount', 1);
const intent = emergencyGetProperty(doc.documentPreferences, 'intent', 'Unknown');
```

### Alternative Access Methods
```typescript
// Different approaches to document properties:
doc.name                              // Direct access
doc['name']                          // Bracket notation
emergencyGetProperty(doc, 'name')    // Emergency safe access

// Collection access:
doc.pages.length                     // Standard length
doc.pages.count                      // Alternative count
emergencyGetLength(doc.pages)        // Safe length access

// Navigation shortcuts:
doc.pages.firstItem()               // First page
doc.pages.lastItem()                // Last page
doc.pages.middleItem()              // Middle page
doc.pages.previousItem(somePage)    // Previous page
doc.pages.nextItem(somePage)        // Next page
```

⚠️ **Safety Notes:**
- Always verify document exists before accessing properties
- Check `saved` status before making modifications
- Use emergency access for unreliable documents

---

## Page Objects

### Page Structure
```typescript
interface Page {
  // Identity
  name: string;                         // Page name/number
  id: number;                          // Unique page ID
  documentOffset: number;              // Page index in document
  
  // Layout properties
  side: PageSideOptions;               // Left/right page
  bounds: Bounds;                      // Page boundaries
  geometricBounds: Bounds;             // Geometric boundaries
  
  // Collections
  pageItems: PageItems;                // All items on page
  textFrames: TextFrames;             // Text frames on page
  rectangles: Rectangles;             // Rectangle objects
  ovals: Ovals;                       // Oval objects
  polygons: Polygons;                 // Polygon objects
  lines: Lines;                       // Line objects
  groups: Groups;                     // Grouped objects
  
  // Navigation
  appliedMaster: MasterSpread;        // Applied master spread
  parent: Spread;                     // Parent spread
  
  // Guides and margins
  guides: Guides;                     // Page guides
  marginPreferences: MarginPreference; // Page margins
}

// Safe access patterns:
const pageName = emergencyGetProperty(page, 'name', 'Unknown');
const itemCount = emergencyGetLength(page.pageItems, 1500);
const bounds = emergencyGetProperty(page, 'bounds', null);
```

### Page Item Enumeration
```typescript
// Multiple methods to access page items:

// Method 1: Direct collection access
for (let i = 0; i < page.pageItems.length; i++) {
  const item = emergencyGetCollectionItem(page.pageItems, i, 1000);
  if (item) {
    // Process item safely
    const itemType = emergencyGetProperty(item, 'constructor', 'Unknown');
  }
}

// Method 2: Using everyItem() for bulk operations
const allItems = page.pageItems.everyItem();
const itemProperties = emergencyGetProperty(allItems, 'properties', {});

// Method 3: Type-specific collections
const textFrames = emergencyGetProperty(page, 'textFrames', null);
const images = emergencyGetProperty(page, 'images', null);
const rectangles = emergencyGetProperty(page, 'rectangles', null);
```

### Page Navigation Patterns
```typescript
// Safe page navigation:
const currentPage = app.activeDocument.pages[0];
const spreadParent = emergencyGetProperty(currentPage, 'parent', null);
const nextPage = emergencyGetProperty(currentPage, 'nextItem', null);

// Page numbering and sections:
const pageNumber = emergencyGetProperty(currentPage, 'name', 'Unknown');
const documentOffset = emergencyGetProperty(currentPage, 'documentOffset', -1);

// Master page relationships:
const appliedMaster = emergencyGetProperty(currentPage, 'appliedMaster', null);
if (appliedMaster) {
  const masterName = emergencyGetProperty(appliedMaster, 'name', 'Unknown');
}
```

⚠️ **Performance Warning:** Page item collections can be very large. Always use sample limits for analysis.

---

## Text Objects

### Text Frame Structure
```typescript
interface TextFrame {
  // Basic properties
  id: number;                          // Unique ID
  label: string;                       // Custom label
  name: string;                        // Frame name
  
  // Content
  contents: string;                    // Text content
  length: number;                      // Character count
  overflows: boolean;                  // Text overflow status
  
  // Threading
  previousTextFrame: TextFrame | null; // Previous in thread
  nextTextFrame: TextFrame | null;     // Next in thread
  parentStory: Story;                  // Parent story
  
  // Geometry
  geometricBounds: Bounds;             // Frame boundaries
  visibleBounds: Bounds;              // Visible area
  
  // Collections
  characters: Characters;              // All characters
  words: Words;                       // All words
  lines: Lines;                       // All lines
  paragraphs: Paragraphs;             // All paragraphs
  textColumns: TextColumns;           // Text columns
  
  // Formatting
  textFramePreferences: TextFramePreference;
  texts: Texts;                       // Text objects
}

// Safe text access:
const textContent = emergencyGetProperty(textFrame, 'contents', '');
const hasOverflow = emergencyGetProperty(textFrame, 'overflows', false);
const charCount = emergencyGetProperty(textFrame, 'length', 0);
```

### Story Object Deep Dive
```typescript
interface Story {
  // Identity
  id: number;                          // Story ID
  length: number;                      // Total character count
  
  // Content hierarchy
  characters: Characters;              // All characters
  words: Words;                       // All words
  lines: Lines;                       // All lines
  paragraphs: Paragraphs;             // All paragraphs
  texts: Texts;                       // Text ranges
  
  // Text frames
  textContainers: TextFrames;         // Frames containing story
  
  // Navigation
  insertionPoints: InsertionPoints;   // Cursor positions
}

// Story traversal patterns:
const storyLength = emergencyGetLength(story.characters, 2000);
const paragraphCount = emergencyGetLength(story.paragraphs, 1000);
const containerCount = emergencyGetLength(story.textContainers, 500);
```

### Character and Paragraph Properties
```typescript
interface Character {
  // Content
  contents: string;                    // Character content
  
  // Font properties
  appliedFont: Font;                  // Applied font
  fontStyle: string;                  // Font style (Bold, Italic, etc.)
  pointSize: UnitValue;               // Font size
  
  // Color and effects
  fillColor: Color;                   // Fill color
  strokeColor: Color;                 // Stroke color
  
  // Position and spacing
  baselineShift: UnitValue;           // Baseline shift
  tracking: number;                   // Character tracking
  horizontalScale: number;            // Horizontal scaling
  verticalScale: number;              // Vertical scaling
}

interface Paragraph {
  // Content
  contents: string;                   // Paragraph text
  length: number;                     // Character count
  
  // Style
  appliedParagraphStyle: ParagraphStyle;
  
  // Alignment and spacing
  justification: Justification;       // Text justification
  spaceBefore: UnitValue;            // Space before paragraph
  spaceAfter: UnitValue;             // Space after paragraph
  leftIndent: UnitValue;             // Left indent
  rightIndent: UnitValue;            // Right indent
  firstLineIndent: UnitValue;        // First line indent
  
  // Collections
  characters: Characters;             // Characters in paragraph
  words: Words;                      // Words in paragraph
  lines: Lines;                      // Lines in paragraph
}

// Safe character analysis:
const charContent = emergencyGetProperty(character, 'contents', '');
const fontSize = emergencyGetProperty(character, 'pointSize', 0);
const fontName = emergencyGetProperty(character, 'appliedFont', null);

// Safe paragraph analysis:
const paraText = emergencyGetProperty(paragraph, 'contents', '');
const paraStyle = emergencyGetProperty(paragraph, 'appliedParagraphStyle', null);
const justification = emergencyGetProperty(paragraph, 'justification', 'Unknown');
```

### Text Content Sampling Strategies
```typescript
// Strategy 1: Sample by character count
function sampleTextContent(textFrame: TextFrame, maxChars: number = 500): string {
  const fullContent = emergencyGetProperty(textFrame, 'contents', '');
  if (fullContent.length <= maxChars) {
    return fullContent;
  }
  return fullContent.substring(0, maxChars) + '... [truncated]';
}

// Strategy 2: Sample by paragraph
function sampleParagraphs(story: Story, maxParagraphs: number = 3): string[] {
  const paragraphs = emergencyGetProperty(story, 'paragraphs', null);
  if (!paragraphs) return [];
  
  const paraCount = emergencyGetLength(paragraphs, 1000);
  const sampleCount = Math.min(paraCount, maxParagraphs);
  const samples = [];
  
  for (let i = 0; i < sampleCount; i++) {
    const para = emergencyGetCollectionItem(paragraphs, i, 500);
    if (para) {
      const content = emergencyGetProperty(para, 'contents', '');
      samples.push(content);
    }
  }
  
  return samples;
}

// Strategy 3: Word frequency analysis
function analyzeWordFrequency(textFrame: TextFrame, topN: number = 10): Array<{word: string, count: number}> {
  const content = emergencyGetProperty(textFrame, 'contents', '');
  const words = content.toLowerCase().split(/\s+/).filter(w => w.length > 0);
  const frequency: {[key: string]: number} = {};
  
  words.forEach(word => {
    frequency[word] = (frequency[word] || 0) + 1;
  });
  
  return Object.entries(frequency)
    .map(([word, count]) => ({word, count}))
    .sort((a, b) => b.count - a.count)
    .slice(0, topN);
}
```

⚠️ **Text Access Warnings:**
- Large text collections can cause InDesign to hang
- Always use sample limits for text content analysis
- Be careful with overset text frames
- Text content may contain special characters that need escaping

---

## Image & Graphics Objects

### Image Object Structure
```typescript
interface Image {
  // Identity
  id: number;                          // Image ID
  name: string;                        // Image name
  
  // Link information
  itemLink: Link;                      // Associated link
  
  // Resolution and quality
  actualResolution: number[];          // Actual resolution [x, y]
  effectiveResolution: number[];       // Effective resolution [x, y]
  
  // Color and space
  space: ColorSpace;                   // Color space
  profile: string;                     // Color profile
  
  // Geometry in parent
  geometricBounds: Bounds;             // Bounds in parent
  
  // Transparency
  transparencySettings: TransparencySettings;
  
  // Parent container
  parent: PageItem;                    // Parent page item
}

// Safe image analysis:
const imageLink = emergencyGetProperty(image, 'itemLink', null);
const actualRes = emergencyGetProperty(image, 'actualResolution', [0, 0]);
const effectiveRes = emergencyGetProperty(image, 'effectiveResolution', [0, 0]);
const colorSpace = emergencyGetProperty(image, 'space', 'Unknown');
```

### Graphic Object Properties
```typescript
interface Graphic {
  // Basic properties
  id: number;                          // Graphic ID
  
  // Link relationship
  itemLink: Link;                      // Associated link
  
  // Positioning and transformation
  horizontalScale: number;             // Horizontal scaling
  verticalScale: number;               // Vertical scaling
  rotation: number;                    // Rotation angle
  
  // Fitting
  fit: FitOptions;                     // Fit option applied
  
  // Collections
  images: Images;                      // Images within graphic
  epss: EPSs;                         // EPS objects
  pdfs: PDFs;                         // PDF objects
  
  // Parent relationship
  parent: PageItem;                    // Parent page item
}

// Safe graphic inspection:
const graphicLink = emergencyGetProperty(graphic, 'itemLink', null);
const hScale = emergencyGetProperty(graphic, 'horizontalScale', 100);
const vScale = emergencyGetProperty(graphic, 'verticalScale', 100);
const rotation = emergencyGetProperty(graphic, 'rotation', 0);
```

### Image Analysis Patterns
```typescript
// Comprehensive image analysis:
function analyzeImage(image: Image): ImageAnalysis {
  const analysis = {
    hasLink: false,
    linkStatus: 'unknown',
    resolution: { actual: [0, 0], effective: [0, 0] },
    colorSpace: 'unknown',
    scaling: { horizontal: 100, vertical: 100 },
    fileInfo: null,
    errors: []
  };
  
  try {
    // Link analysis
    const itemLink = emergencyGetProperty(image, 'itemLink', null);
    if (itemLink) {
      analysis.hasLink = true;
      analysis.linkStatus = emergencyGetProperty(itemLink, 'status', 'unknown');
      
      const linkName = emergencyGetProperty(itemLink, 'name', 'Unknown');
      const filePath = emergencyGetProperty(itemLink, 'filePath', 'Unknown');
      analysis.fileInfo = { name: linkName, path: filePath };
    }
    
    // Resolution analysis
    const actualRes = emergencyGetProperty(image, 'actualResolution', null);
    const effectiveRes = emergencyGetProperty(image, 'effectiveResolution', null);
    
    if (actualRes) analysis.resolution.actual = actualRes;
    if (effectiveRes) analysis.resolution.effective = effectiveRes;
    
    // Color space
    analysis.colorSpace = emergencyGetProperty(image, 'space', 'unknown');
    
    // Parent graphic scaling
    const parent = emergencyGetProperty(image, 'parent', null);
    if (parent) {
      analysis.scaling.horizontal = emergencyGetProperty(parent, 'horizontalScale', 100);
      analysis.scaling.vertical = emergencyGetProperty(parent, 'verticalScale', 100);
    }
    
  } catch (error) {
    analysis.errors.push(error.message);
  }
  
  return analysis;
}

// Image quality assessment:
function assessImageQuality(image: Image): QualityAssessment {
  const assessment = {
    resolution: 'unknown',
    scaling: 'unknown',
    colorSpace: 'unknown',
    recommendations: []
  };
  
  const effectiveRes = emergencyGetProperty(image, 'effectiveResolution', [0, 0]);
  const avgResolution = (effectiveRes[0] + effectiveRes[1]) / 2;
  
  // Resolution assessment
  if (avgResolution < 150) {
    assessment.resolution = 'low';
    assessment.recommendations.push('Consider higher resolution image');
  } else if (avgResolution > 400) {
    assessment.resolution = 'excessive';
    assessment.recommendations.push('Image may be unnecessarily large');
  } else {
    assessment.resolution = 'good';
  }
  
  // Scaling assessment
  const parent = emergencyGetProperty(image, 'parent', null);
  if (parent) {
    const hScale = emergencyGetProperty(parent, 'horizontalScale', 100);
    const vScale = emergencyGetProperty(parent, 'verticalScale', 100);
    const maxScale = Math.max(Math.abs(hScale), Math.abs(vScale));
    
    if (maxScale > 120) {
      assessment.scaling = 'enlarged';
      assessment.recommendations.push('Image is significantly enlarged');
    } else if (maxScale < 80) {
      assessment.scaling = 'reduced';
      assessment.recommendations.push('Image is significantly reduced');
    } else {
      assessment.scaling = 'appropriate';
    }
  }
  
  return assessment;
}
```

⚠️ **Graphics Safety Notes:**
- Images may have complex nested structures
- Link status can change during analysis
- Large images can cause memory issues
- EPS and PDF graphics require special handling

---

## Link Objects

### Link Object Structure
```typescript
interface Link {
  // Identity
  name: string;                        // Link name/filename
  id: number;                         // Link ID
  
  // File information
  filePath: string;                   // Full file path
  size: number;                       // File size in bytes
  date: Date;                         // File modification date
  
  // Status
  status: LinkStatus;                 // Link status (Normal, Missing, etc.)
  needed: boolean;                    // Whether link is needed
  
  // Relationships
  linkXmp: LinkMetadata;              // XMP metadata
  parent: Document;                   // Parent document
  
  // Resource information
  linkResourceURI: string;            // Resource URI
}

// Safe link inspection:
const linkName = emergencyGetProperty(link, 'name', 'Unknown');
const linkStatus = emergencyGetProperty(link, 'status', 'Unknown');
const filePath = emergencyGetProperty(link, 'filePath', 'Unknown');
const fileSize = emergencyGetProperty(link, 'size', 0);
const isNeeded = emergencyGetProperty(link, 'needed', false);
```

### Link Status Analysis
```typescript
// Link status enumeration:
const LINK_STATUS_DESCRIPTIONS = {
  'Normal': 'Link is up to date',
  'Missing': 'Linked file cannot be found',
  'Modified': 'Linked file has been modified',
  'Embedded': 'File is embedded in document',
  'Unknown': 'Link status cannot be determined'
};

// Comprehensive link analysis:
function analyzeLinkCollection(document: Document): LinkAnalysis {
  const links = emergencyGetProperty(document, 'links', null);
  if (!links) {
    return { error: 'Cannot access links collection' };
  }
  
  const linkCount = emergencyGetLength(links, 2000);
  const analysis = {
    totalLinks: linkCount,
    statusBreakdown: {},
    missingLinks: [],
    modifiedLinks: [],
    sizeAnalysis: { total: 0, average: 0, largest: 0 },
    fileTypes: {},
    errors: []
  };
  
  let totalSize = 0;
  let largestSize = 0;
  
  for (let i = 0; i < Math.min(linkCount, 50); i++) { // Sample limit for safety
    try {
      const link = emergencyGetCollectionItem(links, i, 1000);
      if (!link) continue;
      
      const status = emergencyGetProperty(link, 'status', 'Unknown');
      const name = emergencyGetProperty(link, 'name', 'Unknown');
      const size = emergencyGetProperty(link, 'size', 0);
      const filePath = emergencyGetProperty(link, 'filePath', '');
      
      // Status tracking
      analysis.statusBreakdown[status] = (analysis.statusBreakdown[status] || 0) + 1;
      
      // Problem links
      if (status === 'Missing') {
        analysis.missingLinks.push({ name, path: filePath });
      } else if (status === 'Modified') {
        analysis.modifiedLinks.push({ name, path: filePath });
      }
      
      // Size analysis
      totalSize += size;
      if (size > largestSize) {
        largestSize = size;
      }
      
      // File type analysis
      const extension = name.split('.').pop()?.toLowerCase() || 'unknown';
      analysis.fileTypes[extension] = (analysis.fileTypes[extension] || 0) + 1;
      
    } catch (error) {
      analysis.errors.push(`Link ${i}: ${error.message}`);
    }
  }
  
  analysis.sizeAnalysis.total = totalSize;
  analysis.sizeAnalysis.average = linkCount > 0 ? totalSize / linkCount : 0;
  analysis.sizeAnalysis.largest = largestSize;
  
  return analysis;
}

// Link health check:
function checkLinkHealth(link: Link): LinkHealthStatus {
  const status = emergencyGetProperty(link, 'status', 'Unknown');
  const needed = emergencyGetProperty(link, 'needed', false);
  const name = emergencyGetProperty(link, 'name', 'Unknown');
  
  const health = {
    isHealthy: false,
    status: status,
    issues: [],
    recommendations: []
  };
  
  switch (status) {
    case 'Normal':
      health.isHealthy = true;
      break;
    case 'Missing':
      health.issues.push('File cannot be found');
      health.recommendations.push('Relink file or remove reference');
      break;
    case 'Modified':
      health.issues.push('File has been modified');
      health.recommendations.push('Update link to reflect changes');
      break;
    case 'Embedded':
      health.isHealthy = true;
      health.recommendations.push('Consider external linking for editability');
      break;
    default:
      health.issues.push('Unknown link status');
      health.recommendations.push('Check link manually');
  }
  
  if (!needed) {
    health.recommendations.push('Link may not be needed for output');
  }
  
  return health;
}
```

### Link Update Patterns
```typescript
// Safe link operations:
function safeLinkUpdate(link: Link): boolean {
  try {
    const status = emergencyGetProperty(link, 'status', 'Unknown');
    
    if (status === 'Missing') {
      // Cannot update missing link safely
      return false;
    }
    
    if (status === 'Modified') {
      // Update link if it exists and is accessible
      const filePath = emergencyGetProperty(link, 'filePath', '');
      if (filePath && filePath !== 'Unknown') {
        try {
          link.update();
          return true;
        } catch (updateError) {
          // Update failed, link may be locked or inaccessible
          return false;
        }
      }
    }
    
    return true; // No update needed
    
  } catch (error) {
    return false;
  }
}
```

⚠️ **Link Safety Warnings:**
- Missing links can cause script errors
- Large link collections can slow analysis
- Never attempt to update missing links
- File system permissions can affect link access

---

## Style Objects

### Paragraph Style Structure
```typescript
interface ParagraphStyle {
  // Identity
  name: string;                        // Style name
  id: number;                         // Style ID
  
  // Hierarchy
  basedOn: ParagraphStyle | null;     // Parent style
  nextStyle: ParagraphStyle | null;   // Following style
  
  // Character formatting
  appliedFont: Font;                  // Font family
  fontStyle: string;                  // Font style (Bold, Italic)
  pointSize: UnitValue;               // Font size
  leading: UnitValue;                 // Line spacing
  tracking: number;                   // Character tracking
  
  // Paragraph formatting
  justification: Justification;       // Text alignment
  leftIndent: UnitValue;             // Left indent
  rightIndent: UnitValue;            // Right indent
  firstLineIndent: UnitValue;        // First line indent
  spaceBefore: UnitValue;            // Space before paragraph
  spaceAfter: UnitValue;             // Space after paragraph
  
  // Advanced features
  hyphenation: boolean;              // Hyphenation enabled
  composer: string;                  // Text composer
  keepWithNext: number;              // Keep with next lines
  
  // Color
  fillColor: Color;                  // Text fill color
  strokeColor: Color;                // Text stroke color
}

// Safe style analysis:
const styleName = emergencyGetProperty(style, 'name', 'Unknown');
const fontSize = emergencyGetProperty(style, 'pointSize', 0);
const fontFamily = emergencyGetProperty(style, 'appliedFont', null);
const justification = emergencyGetProperty(style, 'justification', 'Unknown');
```

### Character Style Structure
```typescript
interface CharacterStyle {
  // Identity
  name: string;                        // Style name
  id: number;                         // Style ID
  
  // Hierarchy
  basedOn: CharacterStyle | null;     // Parent style
  
  // Font properties
  appliedFont: Font;                  // Font family
  fontStyle: string;                  // Font style
  pointSize: UnitValue;               // Font size
  
  // Spacing and position
  tracking: number;                   // Character tracking
  baselineShift: UnitValue;          // Baseline shift
  horizontalScale: number;            // Horizontal scaling
  verticalScale: number;              // Vertical scaling
  
  // Color and effects
  fillColor: Color;                   // Fill color
  strokeColor: Color;                 // Stroke color
  underline: boolean;                 // Underline enabled
  strikeThru: boolean;               // Strikethrough enabled
  
  // OpenType features
  otfFigureStyle: OTFFigureStyle;    // Figure style
  capitalization: Capitalization;     // Capitalization style
}

// Character style inspection:
const charStyleName = emergencyGetProperty(charStyle, 'name', 'Unknown');
const charFont = emergencyGetProperty(charStyle, 'appliedFont', null);
const charSize = emergencyGetProperty(charStyle, 'pointSize', 0);
const hasUnderline = emergencyGetProperty(charStyle, 'underline', false);
```

### Style Analysis Patterns
```typescript
// Style hierarchy analysis:
function analyzeStyleHierarchy(document: Document): StyleHierarchy {
  const paraStyles = emergencyGetProperty(document, 'paragraphStyles', null);
  const charStyles = emergencyGetProperty(document, 'characterStyles', null);
  
  const analysis = {
    paragraphStyles: { total: 0, withParents: 0, orphaned: 0 },
    characterStyles: { total: 0, withParents: 0, orphaned: 0 },
    hierarchy: [],
    unused: [],
    errors: []
  };
  
  // Analyze paragraph styles
  if (paraStyles) {
    const paraCount = emergencyGetLength(paraStyles, 1000);
    analysis.paragraphStyles.total = paraCount;
    
    for (let i = 0; i < Math.min(paraCount, 20); i++) {
      try {
        const style = emergencyGetCollectionItem(paraStyles, i, 500);
        if (!style) continue;
        
        const name = emergencyGetProperty(style, 'name', 'Unknown');
        const basedOn = emergencyGetProperty(style, 'basedOn', null);
        
        if (basedOn) {
          analysis.paragraphStyles.withParents++;
          const parentName = emergencyGetProperty(basedOn, 'name', 'Unknown');
          analysis.hierarchy.push({ child: name, parent: parentName, type: 'paragraph' });
        } else {
          analysis.paragraphStyles.orphaned++;
        }
        
      } catch (error) {
        analysis.errors.push(`Paragraph style ${i}: ${error.message}`);
      }
    }
  }
  
  // Analyze character styles
  if (charStyles) {
    const charCount = emergencyGetLength(charStyles, 1000);
    analysis.characterStyles.total = charCount;
    
    for (let i = 0; i < Math.min(charCount, 15); i++) {
      try {
        const style = emergencyGetCollectionItem(charStyles, i, 500);
        if (!style) continue;
        
        const name = emergencyGetProperty(style, 'name', 'Unknown');
        const basedOn = emergencyGetProperty(style, 'basedOn', null);
        
        if (basedOn) {
          analysis.characterStyles.withParents++;
          const parentName = emergencyGetProperty(basedOn, 'name', 'Unknown');
          analysis.hierarchy.push({ child: name, parent: parentName, type: 'character' });
        } else {
          analysis.characterStyles.orphaned++;
        }
        
      } catch (error) {
        analysis.errors.push(`Character style ${i}: ${error.message}`);
      }
    }
  }
  
  return analysis;
}

// Style usage analysis:
function analyzeStyleUsage(document: Document, styleName: string): StyleUsage {
  const usage = {
    styleName: styleName,
    usageCount: 0,
    documents: [],
    locations: [],
    recommendations: []
  };
  
  try {
    // Find style references in text
    const stories = emergencyGetProperty(document, 'stories', null);
    if (stories) {
      const storyCount = emergencyGetLength(stories, 1000);
      
      for (let i = 0; i < Math.min(storyCount, 10); i++) {
        const story = emergencyGetCollectionItem(stories, i, 1000);
        if (!story) continue;
        
        const paragraphs = emergencyGetProperty(story, 'paragraphs', null);
        if (paragraphs) {
          const paraCount = emergencyGetLength(paragraphs, 500);
          
          for (let j = 0; j < Math.min(paraCount, 25); j++) {
            const para = emergencyGetCollectionItem(paragraphs, j, 500);
            if (!para) continue;
            
            const appliedStyle = emergencyGetProperty(para, 'appliedParagraphStyle', null);
            if (appliedStyle) {
              const currentStyleName = emergencyGetProperty(appliedStyle, 'name', '');
              if (currentStyleName === styleName) {
                usage.usageCount++;
                usage.locations.push({ story: i, paragraph: j });
              }
            }
          }
        }
      }
    }
    
    // Generate recommendations
    if (usage.usageCount === 0) {
      usage.recommendations.push('Style appears to be unused - consider removal');
    } else if (usage.usageCount > 100) {
      usage.recommendations.push('Heavy usage - changes will affect many elements');
    }
    
  } catch (error) {
    usage.recommendations.push(`Analysis error: ${error.message}`);
  }
  
  return usage;
}
```

⚠️ **Style Analysis Warnings:**
- Style collections can be large in complex documents
- Style hierarchy loops can cause infinite recursion
- Unused styles may still be referenced indirectly
- Style modifications during analysis can cause inconsistencies

---

## Color Objects

### Color Structure
```typescript
interface Color {
  // Identity
  name: string;                        // Color name
  id: number;                         // Color ID
  
  // Color definition
  model: ColorModel;                  // Color model (RGB, CMYK, LAB, etc.)
  space: ColorSpace;                  // Color space
  colorValue: number[];               // Color values array
  
  // Properties
  visible: boolean;                   // Visible in swatches panel
  
  // Parent
  parent: Document;                   // Parent document
}

interface Swatch {
  // Identity
  name: string;                       // Swatch name
  id: number;                        // Swatch ID
  
  // Color information
  color: Color;                      // Associated color
  colorValue: number[];              // Color values
  model: ColorModel;                 // Color model
  space: ColorSpace;                 // Color space
  
  // Properties
  alias: string;                     // Color alias
  spotInkInfo: SpotInkInfo;         // Spot ink information
}

// Safe color analysis:
const colorName = emergencyGetProperty(color, 'name', 'Unknown');
const colorModel = emergencyGetProperty(color, 'model', 'Unknown');
const colorValues = emergencyGetProperty(color, 'colorValue', []);
const colorSpace = emergencyGetProperty(color, 'space', 'Unknown');
```

### Color Analysis Patterns
```typescript
// Comprehensive color analysis:
function analyzeDocumentColors(document: Document): ColorAnalysis {
  const colors = emergencyGetProperty(document, 'colors', null);
  const swatches = emergencyGetProperty(document, 'swatches', null);
  
  const analysis = {
    colors: { total: 0, byModel: {}, bySpace: {} },
    swatches: { total: 0, spots: 0, process: 0 },
    colorBreakdown: [],
    recommendations: [],
    errors: []
  };
  
  // Analyze colors
  if (colors) {
    const colorCount = emergencyGetLength(colors, 1000);
    analysis.colors.total = colorCount;
    
    for (let i = 0; i < Math.min(colorCount, 30); i++) {
      try {
        const color = emergencyGetCollectionItem(colors, i, 500);
        if (!color) continue;
        
        const name = emergencyGetProperty(color, 'name', 'Unknown');
        const model = emergencyGetProperty(color, 'model', 'Unknown');
        const space = emergencyGetProperty(color, 'space', 'Unknown');
        const values = emergencyGetProperty(color, 'colorValue', []);
        
        // Count by model
        analysis.colors.byModel[model] = (analysis.colors.byModel[model] || 0) + 1;
        
        // Count by space
        analysis.colors.bySpace[space] = (analysis.colors.bySpace[space] || 0) + 1;
        
        // Store color info
        analysis.colorBreakdown.push({
          name: name,
          model: model,
          space: space,
          values: values.slice(0, 4) // Limit array size
        });
        
      } catch (error) {
        analysis.errors.push(`Color ${i}: ${error.message}`);
      }
    }
  }
  
  // Analyze swatches
  if (swatches) {
    const swatchCount = emergencyGetLength(swatches, 1000);
    analysis.swatches.total = swatchCount;
    
    for (let i = 0; i < Math.min(swatchCount, 25); i++) {
      try {
        const swatch = emergencyGetCollectionItem(swatches, i, 500);
        if (!swatch) continue;
        
        const spotInfo = emergencyGetProperty(swatch, 'spotInkInfo', null);
        if (spotInfo) {
          analysis.swatches.spots++;
        } else {
          analysis.swatches.process++;
        }
        
      } catch (error) {
        analysis.errors.push(`Swatch ${i}: ${error.message}`);
      }
    }
  }
  
  // Generate recommendations
  if (analysis.colors.total > 50) {
    analysis.recommendations.push('Large number of colors - consider color management');
  }
  
  if (analysis.swatches.spots > 4) {
    analysis.recommendations.push('Many spot colors - verify printing requirements');
  }
  
  const hasRGB = analysis.colors.bySpace['RGB'] > 0;
  const hasCMYK = analysis.colors.bySpace['CMYK'] > 0;
  if (hasRGB && hasCMYK) {
    analysis.recommendations.push('Mixed RGB/CMYK colors - check output intent');
  }
  
  return analysis;
}

// Color usage tracking:
function trackColorUsage(document: Document, colorName: string): ColorUsage {
  const usage = {
    colorName: colorName,
    usageLocations: [],
    totalUsages: 0,
    usageTypes: { fill: 0, stroke: 0, other: 0 }
  };
  
  try {
    // Check text usage
    const stories = emergencyGetProperty(document, 'stories', null);
    if (stories) {
      const storyCount = emergencyGetLength(stories, 500);
      
      for (let i = 0; i < Math.min(storyCount, 5); i++) {
        const story = emergencyGetCollectionItem(stories, i, 1000);
        if (!story) continue;
        
        const characters = emergencyGetProperty(story, 'characters', null);
        if (characters) {
          const charCount = emergencyGetLength(characters, 1000);
          
          // Sample characters for color usage
          for (let j = 0; j < Math.min(charCount, 100); j += 10) {
            const char = emergencyGetCollectionItem(characters, j, 300);
            if (!char) continue;
            
            const fillColor = emergencyGetProperty(char, 'fillColor', null);
            const strokeColor = emergencyGetProperty(char, 'strokeColor', null);
            
            if (fillColor) {
              const fillName = emergencyGetProperty(fillColor, 'name', '');
              if (fillName === colorName) {
                usage.usageTypes.fill++;
                usage.totalUsages++;
                usage.usageLocations.push({ type: 'text-fill', story: i, character: j });
              }
            }
            
            if (strokeColor) {
              const strokeName = emergencyGetProperty(strokeColor, 'name', '');
              if (strokeName === colorName) {
                usage.usageTypes.stroke++;
                usage.totalUsages++;
                usage.usageLocations.push({ type: 'text-stroke', story: i, character: j });
              }
            }
          }
        }
      }
    }
    
  } catch (error) {
    usage.usageLocations.push({ type: 'error', message: error.message });
  }
  
  return usage;
}
```

### Color Conversion Utilities
```typescript
// Color value interpretation:
function interpretColorValues(color: Color): ColorInterpretation {
  const model = emergencyGetProperty(color, 'model', 'Unknown');
  const values = emergencyGetProperty(color, 'colorValue', []);
  
  const interpretation = {
    model: model,
    values: values,
    displayValue: 'Unknown',
    webHex: null,
    printValues: null
  };
  
  try {
    switch (model) {
      case 'RGB':
        if (values.length >= 3) {
          const r = Math.round(values[0] * 255);
          const g = Math.round(values[1] * 255);
          const b = Math.round(values[2] * 255);
          interpretation.displayValue = `RGB(${r}, ${g}, ${b})`;
          interpretation.webHex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
        }
        break;
        
      case 'CMYK':
        if (values.length >= 4) {
          const c = Math.round(values[0] * 100);
          const m = Math.round(values[1] * 100);
          const y = Math.round(values[2] * 100);
          const k = Math.round(values[3] * 100);
          interpretation.displayValue = `CMYK(${c}%, ${m}%, ${y}%, ${k}%)`;
          interpretation.printValues = { c, m, y, k };
        }
        break;
        
      case 'LAB':
        if (values.length >= 3) {
          const l = Math.round(values[0]);
          const a = Math.round(values[1]);
          const b = Math.round(values[2]);
          interpretation.displayValue = `LAB(${l}, ${a}, ${b})`;
        }
        break;
        
      default:
        interpretation.displayValue = `${model}: [${values.join(', ')}]`;
    }
  } catch (error) {
    interpretation.displayValue = `Error: ${error.message}`;
  }
  
  return interpretation;
}
```

⚠️ **Color Analysis Warnings:**
- Color values may be in different ranges (0-1 vs 0-255)
- Spot colors have special properties that require careful handling
- Color collections can be large in brand-heavy documents
- Color space conversions may not be exact

---

## Layer Objects

### Layer Structure
```typescript
interface Layer {
  // Identity
  name: string;                        // Layer name
  id: number;                         // Layer ID
  
  // Visibility and state
  visible: boolean;                   // Layer visibility
  locked: boolean;                    // Layer lock status
  printable: boolean;                 // Print layer
  
  // Appearance
  layerColor: LayerColor;            // Layer color for display
  
  // Collections
  pageItems: PageItems;              // Items on this layer
  
  // Parent
  parent: Document;                  // Parent document
}

// Safe layer analysis:
const layerName = emergencyGetProperty(layer, 'name', 'Unknown');
const isVisible = emergencyGetProperty(layer, 'visible', true);
const isLocked = emergencyGetProperty(layer, 'locked', false);
const layerColor = emergencyGetProperty(layer, 'layerColor', 'Unknown');
const itemCount = emergencyGetLength(layer.pageItems, 1000);
```

### Layer Analysis Patterns
```typescript
// Comprehensive layer analysis:
function analyzeLayerStructure(document: Document): LayerAnalysis {
  const layers = emergencyGetProperty(document, 'layers', null);
  if (!layers) {
    return { error: 'Cannot access layers collection' };
  }
  
  const layerCount = emergencyGetLength(layers, 500);
  const analysis = {
    totalLayers: layerCount,
    visibleLayers: 0,
    lockedLayers: 0,
    emptyLayers: 0,
    layerDetails: [],
    recommendations: [],
    errors: []
  };
  
  for (let i = 0; i < layerCount; i++) {
    try {
      const layer = emergencyGetCollectionItem(layers, i, 1000);
      if (!layer) continue;
      
      const name = emergencyGetProperty(layer, 'name', 'Unknown');
      const visible = emergencyGetProperty(layer, 'visible', true);
      const locked = emergencyGetProperty(layer, 'locked', false);
      const printable = emergencyGetProperty(layer, 'printable', true);
      const layerColor = emergencyGetProperty(layer, 'layerColor', 'Unknown');
      
      const pageItems = emergencyGetProperty(layer, 'pageItems', null);
      const itemCount = pageItems ? emergencyGetLength(pageItems, 1000) : 0;
      
      // Statistics
      if (visible) analysis.visibleLayers++;
      if (locked) analysis.lockedLayers++;
      if (itemCount === 0) analysis.emptyLayers++;
      
      // Store layer details
      analysis.layerDetails.push({
        name: name,
        visible: visible,
        locked: locked,
        printable: printable,
        color: layerColor,
        itemCount: itemCount
      });
      
    } catch (error) {
      analysis.errors.push(`Layer ${i}: ${error.message}`);
    }
  }
  
  // Generate recommendations
  if (analysis.emptyLayers > 0) {
    analysis.recommendations.push(`${analysis.emptyLayers} empty layers found - consider cleanup`);
  }
  
  if (analysis.totalLayers > 10) {
    analysis.recommendations.push('Many layers - consider layer organization');
  }
  
  if (analysis.lockedLayers === analysis.totalLayers) {
    analysis.recommendations.push('All layers are locked - may limit editing');
  }
  
  return analysis;
}

// Layer content analysis:
function analyzeLayerContent(layer: Layer): LayerContent {
  const content = {
    layerName: emergencyGetProperty(layer, 'name', 'Unknown'),
    totalItems: 0,
    itemTypes: {},
    textFrames: 0,
    images: 0,
    graphics: 0,
    groups: 0,
    errors: []
  };
  
  try {
    const pageItems = emergencyGetProperty(layer, 'pageItems', null);
    if (!pageItems) {
      content.errors.push('Cannot access page items');
      return content;
    }
    
    const itemCount = emergencyGetLength(pageItems, 1000);
    content.totalItems = itemCount;
    
    // Sample items for type analysis
    const sampleSize = Math.min(itemCount, 20);
    for (let i = 0; i < sampleSize; i++) {
      try {
        const item = emergencyGetCollectionItem(pageItems, i, 500);
        if (!item) continue;
        
        const constructor = emergencyGetProperty(item, 'constructor', null);
        const typeName = constructor ? emergencyGetProperty(constructor, 'name', 'Unknown') : 'Unknown';
        
        // Count by type
        content.itemTypes[typeName] = (content.itemTypes[typeName] || 0) + 1;
        
        // Specific type counting
        switch (typeName) {
          case 'TextFrame':
            content.textFrames++;
            break;
          case 'Image':
            content.images++;
            break;
          case 'Graphic':
            content.graphics++;
            break;
          case 'Group':
            content.groups++;
            break;
        }
        
      } catch (error) {
        content.errors.push(`Item ${i}: ${error.message}`);
      }
    }
    
    // Extrapolate counts if we sampled
    if (sampleSize < itemCount) {
      const ratio = itemCount / sampleSize;
      content.textFrames = Math.round(content.textFrames * ratio);
      content.images = Math.round(content.images * ratio);
      content.graphics = Math.round(content.graphics * ratio);
      content.groups = Math.round(content.groups * ratio);
    }
    
  } catch (error) {
    content.errors.push(`Layer content analysis failed: ${error.message}`);
  }
  
  return content;
}
```

⚠️ **Layer Safety Notes:**
- Layer collections are usually small and safe to iterate
- Hidden layers may still contain accessible content
- Locked layers prevent modifications but allow reading
- Layer order affects object stacking and selection

---

## Page Item Objects

### Generic Page Item Structure
```typescript
interface PageItem {
  // Identity
  id: number;                          // Item ID
  name: string;                        // Item name
  label: string;                       // Custom label
  
  // Type information
  constructor: Function;               // Object constructor
  
  // Visibility and state
  visible: boolean;                   // Visibility
  locked: boolean;                    // Lock status
  
  // Geometry
  geometricBounds: Bounds;            // Geometric boundaries
  visibleBounds: Bounds;             // Visible boundaries
  
  // Transformation
  absoluteHorizontalScale: number;    // Absolute horizontal scale
  absoluteVerticalScale: number;      // Absolute vertical scale
  absoluteRotationAngle: number;      // Absolute rotation
  
  // Relationships
  parent: Page | Spread | Group;      // Parent container
  layer: Layer;                       // Associated layer
  
  // Collections (varies by item type)
  pageItems?: PageItems;              // Child items (for groups)
}

// Safe page item inspection:
const itemId = emergencyGetProperty(pageItem, 'id', 0);
const itemName = emergencyGetProperty(pageItem, 'name', 'Unknown');
const isVisible = emergencyGetProperty(pageItem, 'visible', true);
const isLocked = emergencyGetProperty(pageItem, 'locked', false);
const bounds = emergencyGetProperty(pageItem, 'geometricBounds', null);
```

### Specific Page Item Types
```typescript
// Rectangle object
interface Rectangle extends PageItem {
  // Rectangle-specific properties
  cornerRadius: UnitValue;            // Corner radius
  cornerOptions: CornerOptions[];     // Corner effects
  
  // Content
  contentType: ContentType;           // Content type
  contents: any;                      // Content object
  
  // Graphics
  graphics: Graphics;                 // Graphics collection
  images: Images;                     // Images collection
}

// Text Frame object (extends Rectangle)
interface TextFrame extends Rectangle {
  // Text-specific properties
  contents: string;                   // Text content
  overflows: boolean;                 // Overflow status
  
  // Threading
  previousTextFrame: TextFrame | null;
  nextTextFrame: TextFrame | null;
  parentStory: Story;
  
  // Text collections
  characters: Characters;
  words: Words;
  lines: Lines;
  paragraphs: Paragraphs;
  textColumns: TextColumns;
  
  // Text preferences
  textFramePreferences: TextFramePreference;
}

// Group object
interface Group extends PageItem {
  // Group-specific collections
  pageItems: PageItems;              // Items in group
  textFrames: TextFrames;           // Text frames in group
  rectangles: Rectangles;           // Rectangles in group
  ovals: Ovals;                     // Ovals in group
  groups: Groups;                   // Nested groups
}
```

### Page Item Analysis Patterns
```typescript
// Comprehensive page item analysis:
function analyzePageItems(container: Page | Spread | Document): PageItemAnalysis {
  const pageItems = emergencyGetProperty(container, 'pageItems', null);
  if (!pageItems) {
    return { error: 'Cannot access page items collection' };
  }
  
  const itemCount = emergencyGetLength(pageItems, 2000);
  const analysis = {
    totalItems: itemCount,
    itemTypes: {},
    visibilityStats: { visible: 0, hidden: 0 },
    lockStats: { locked: 0, unlocked: 0 },
    geometryStats: { withBounds: 0, withoutBounds: 0 },
    contentStats: { withContent: 0, empty: 0 },
    itemDetails: [],
    errors: []
  };
  
  // Sample items for analysis (limit for performance)
  const sampleSize = Math.min(itemCount, 25);
  
  for (let i = 0; i < sampleSize; i++) {
    try {
      const item = emergencyGetCollectionItem(pageItems, i, 1000);
      if (!item) continue;
      
      // Basic properties
      const itemId = emergencyGetProperty(item, 'id', 0);
      const itemName = emergencyGetProperty(item, 'name', 'Unknown');
      const visible = emergencyGetProperty(item, 'visible', true);
      const locked = emergencyGetProperty(item, 'locked', false);
      const bounds = emergencyGetProperty(item, 'geometricBounds', null);
      
      // Type detection
      const constructor = emergencyGetProperty(item, 'constructor', null);
      const typeName = constructor ? emergencyGetProperty(constructor, 'name', 'Unknown') : 'Unknown';
      
      // Statistics
      analysis.itemTypes[typeName] = (analysis.itemTypes[typeName] || 0) + 1;
      if (visible) analysis.visibilityStats.visible++; else analysis.visibilityStats.hidden++;
      if (locked) analysis.lockStats.locked++; else analysis.lockStats.unlocked++;
      if (bounds) analysis.geometryStats.withBounds++; else analysis.geometryStats.withoutBounds++;
      
      // Content analysis (type-specific)
      let hasContent = false;
      if (typeName === 'TextFrame') {
        const contents = emergencyGetProperty(item, 'contents', '');
        hasContent = contents && contents.length > 0;
      } else if (typeName === 'Rectangle' || typeName === 'Oval') {
        const contentType = emergencyGetProperty(item, 'contentType', null);
        hasContent = contentType && contentType !== 'Unassigned';
      } else if (typeName === 'Group') {
        const childItems = emergencyGetProperty(item, 'pageItems', null);
        hasContent = childItems && emergencyGetLength(childItems, 500) > 0;
      }
      
      if (hasContent) analysis.contentStats.withContent++; else analysis.contentStats.empty++;
      
      // Store item details
      analysis.itemDetails.push({
        id: itemId,
        name: itemName,
        type: typeName,
        visible: visible,
        locked: locked,
        hasBounds: !!bounds,
        hasContent: hasContent
      });
      
    } catch (error) {
      analysis.errors.push(`Item ${i}: ${error.message}`);
    }
  }
  
  // Extrapolate statistics if we sampled
  if (sampleSize < itemCount && sampleSize > 0) {
    const ratio = itemCount / sampleSize;
    
    // Scale up type counts
    for (const typeName in analysis.itemTypes) {
      analysis.itemTypes[typeName] = Math.round(analysis.itemTypes[typeName] * ratio);
    }
    
    // Scale up other stats
    analysis.visibilityStats.visible = Math.round(analysis.visibilityStats.visible * ratio);
    analysis.visibilityStats.hidden = Math.round(analysis.visibilityStats.hidden * ratio);
    analysis.lockStats.locked = Math.round(analysis.lockStats.locked * ratio);
    analysis.lockStats.unlocked = Math.round(analysis.lockStats.unlocked * ratio);
    analysis.geometryStats.withBounds = Math.round(analysis.geometryStats.withBounds * ratio);
    analysis.geometryStats.withoutBounds = Math.round(analysis.geometryStats.withoutBounds * ratio);
    analysis.contentStats.withContent = Math.round(analysis.contentStats.withContent * ratio);
    analysis.contentStats.empty = Math.round(analysis.contentStats.empty * ratio);
  }
  
  return analysis;
}

// Specific item type analysis:
function analyzeTextFrameSpecifics(textFrame: TextFrame): TextFrameAnalysis {
  const analysis = {
    name: emergencyGetProperty(textFrame, 'name', 'Unknown'),
    hasContent: false,
    contentLength: 0,
    overflows: false,
    isThreaded: false,
    threadPosition: 'single',
    columnInfo: null,
    errors: []
  };
  
  try {
    // Content analysis
    const contents = emergencyGetProperty(textFrame, 'contents', '');
    analysis.hasContent = contents && contents.length > 0;
    analysis.contentLength = contents ? contents.length : 0;
    
    // Overflow status
    analysis.overflows = emergencyGetProperty(textFrame, 'overflows', false);
    
    // Threading analysis
    const prevFrame = emergencyGetProperty(textFrame, 'previousTextFrame', null);
    const nextFrame = emergencyGetProperty(textFrame, 'nextTextFrame', null);
    
    if (prevFrame || nextFrame) {
      analysis.isThreaded = true;
      
      if (prevFrame && nextFrame) {
        analysis.threadPosition = 'middle';
      } else if (prevFrame) {
        analysis.threadPosition = 'end';
      } else {
        analysis.threadPosition = 'start';
      }
    }
    
    // Column information
    const textColumns = emergencyGetProperty(textFrame, 'textColumns', null);
    if (textColumns) {
      const columnCount = emergencyGetLength(textColumns, 500);
      analysis.columnInfo = { count: columnCount };
    }
    
  } catch (error) {
    analysis.errors.push(`Text frame analysis failed: ${error.message}`);
  }
  
  return analysis;
}
```

⚠️ **Page Item Safety Warnings:**
- Page item collections can be extremely large (1000+ items)
- Always use sample limits for page item analysis
- Complex nested groups can cause deep recursion
- Some page items may have circular references
- Text frames with large content can cause performance issues

---

## Safe Access Patterns

### Emergency Property Access
```typescript
// Primary safe access function with timeout protection
function emergencyGetProperty(obj: any, prop: string, defaultValue?: any, timeoutMs: number = 1000): any {
  const startTime = Date.now();
  
  try {
    if (!obj) return defaultValue ?? null;
    
    // Timeout check
    if (Date.now() - startTime > timeoutMs) {
      console.warn(`Timeout accessing property: ${prop}`);
      return defaultValue ?? null;
    }
    
    // Method 1: hasOwnProperty check (safest)
    if (obj.hasOwnProperty && obj.hasOwnProperty(prop)) {
      const value = obj[prop];
      return value !== undefined ? value : (defaultValue ?? null);
    }
    
    // Method 2: Direct access
    const directValue = obj[prop];
    if (directValue !== undefined) {
      return directValue;
    }
    
    // Method 3: Alternative property names
    const alternatives = getPropertyAlternatives(prop);
    for (const altProp of alternatives) {
      if (obj[altProp] !== undefined) {
        console.info(`Using alternative property: ${altProp} for ${prop}`);
        return obj[altProp];
      }
    }
    
    return defaultValue ?? null;
    
  } catch (error) {
    console.error(`Property access failed: ${prop} - ${error.message}`);
    return defaultValue ?? null;
  }
}

// Alternative property names for common InDesign properties
function getPropertyAlternatives(prop: string): string[] {
  const alternatives: { [key: string]: string[] } = {
    'contents': ['content', 'text', 'textContents'],
    'content': ['contents', 'text', 'textContent'],
    'text': ['contents', 'content', 'textContents'],
    'length': ['count', 'size'],
    'count': ['length', 'size'],
    'name': ['title', 'label', 'displayName'],
    'id': ['ID', 'identifier', 'uid'],
    'visible': ['visibility', 'isVisible'],
    'locked': ['isLocked', 'lockState'],
    'width': ['w', 'pageWidth'],
    'height': ['h', 'pageHeight']
  };
  
  return alternatives[prop] || [];
}
```

### Collection Access Patterns
```typescript
// Safe collection length getter
function emergencyGetLength(collection: any, timeoutMs: number = 1000): number {
  const startTime = Date.now();
  
  try {
    if (!collection) return 0;
    
    // Timeout check
    if (Date.now() - startTime > timeoutMs) {
      console.warn('Timeout getting collection length');
      return 0;
    }
    
    // Try different length properties
    if (collection.length !== undefined) {
      return parseInt(String(collection.length)) || 0;
    }
    
    if (collection.count !== undefined) {
      return parseInt(String(collection.count)) || 0;
    }
    
    return 0;
    
  } catch (error) {
    console.error(`Collection length access failed: ${error.message}`);
    return 0;
  }
}

// Safe collection item getter with multiple fallback methods
function emergencyGetCollectionItem(collection: any, index: number, timeoutMs: number = 1000): any {
  const startTime = Date.now();
  
  try {
    if (!collection || index < 0) return null;
    
    // Timeout check
    if (Date.now() - startTime > timeoutMs) {
      console.warn(`Timeout getting collection item ${index}`);
      return null;
    }
    
    // Method 1: Array-style access
    if (collection[index] !== undefined) {
      return collection[index];
    }
    
    // Method 2: item() method
    if (collection.item && typeof collection.item === 'function') {
      return collection.item(index);
    }
    
    // Method 3: itemByIndex() method
    if (collection.itemByIndex && typeof collection.itemByIndex === 'function') {
      return collection.itemByIndex(index);
    }
    
    return null;
    
  } catch (error) {
    console.error(`Collection item access failed: ${index} - ${error.message}`);
    return null;
  }
}

// Safe collection iteration with sample limits
function safeIterateCollection(collection: any, callback: (item: any, index: number) => void, maxItems: number = 10, timeoutMs: number = 5000): void {
  const startTime = Date.now();
  
  try {
    if (!collection || !callback) return;
    
    const length = emergencyGetLength(collection, 1000);
    const iterateCount = Math.min(length, maxItems);
    
    for (let i = 0; i < iterateCount; i++) {
      // Check timeout
      if (Date.now() - startTime > timeoutMs) {
        console.warn(`Collection iteration timeout at item ${i}`);
        break;
      }
      
      const item = emergencyGetCollectionItem(collection, i, 500);
      if (item) {
        try {
          callback(item, i);
        } catch (callbackError) {
          console.error(`Callback error at item ${i}: ${callbackError.message}`);
          // Continue with next item
        }
      }
    }
    
  } catch (error) {
    console.error(`Collection iteration failed: ${error.message}`);
  }
}
```

### Nested Property Access
```typescript
// Safe nested property access with dot notation
function safeGetNestedProperty(obj: any, path: string, defaultValue?: any, timeoutMs: number = 1000): any {
  const startTime = Date.now();
  
  try {
    if (!obj || !path) return defaultValue ?? null;
    
    const pathParts = path.split('.');
    let current = obj;
    
    for (const part of pathParts) {
      // Timeout check
      if (Date.now() - startTime > timeoutMs) {
        console.warn(`Timeout accessing nested property: ${path} at ${part}`);
        return defaultValue ?? null;
      }
      
      if (!current) {
        console.warn(`Null object in path: ${path} at ${part}`);
        return defaultValue ?? null;
      }
      
      const nextValue = emergencyGetProperty(current, part, undefined, timeoutMs / pathParts.length);
      
      if (nextValue === undefined || nextValue === null) {
        console.warn(`Property not found in path: ${path} at ${part}`);
        return defaultValue ?? null;
      }
      
      current = nextValue;
    }
    
    return current;
    
  } catch (error) {
    console.error(`Nested property access failed: ${path} - ${error.message}`);
    return defaultValue ?? null;
  }
}

// Safe property existence check
function safeHasProperty(obj: any, prop: string): boolean {
  try {
    if (!obj) return false;
    
    // Check hasOwnProperty if available
    if (obj.hasOwnProperty && typeof obj.hasOwnProperty === 'function') {
      return obj.hasOwnProperty(prop);
    }
    
    // Check direct property existence
    return obj[prop] !== undefined;
    
  } catch (error) {
    return false;
  }
}

// Safe property type checking
function safeGetPropertyType(obj: any, prop: string): string {
  try {
    const value = emergencyGetProperty(obj, prop, undefined, 500);
    
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    
    const type = typeof value;
    
    // More specific type checking for objects
    if (type === 'object') {
      if (Array.isArray && Array.isArray(value)) {
        return 'array';
      }
      
      if (value.constructor) {
        const constructorName = emergencyGetProperty(value.constructor, 'name', 'Object');
        return constructorName.toLowerCase();
      }
    }
    
    return type;
    
  } catch (error) {
    return 'error';
  }
}
```

### Batch Operations with Safety
```typescript
// Safe batch property collection
function safeBatchGetProperties(obj: any, properties: string[], timeoutMs: number = 2000): { [key: string]: any } {
  const startTime = Date.now();
  const results: { [key: string]: any } = {};
  
  try {
    if (!obj || !properties) return results;
    
    const timeoutPerProperty = timeoutMs / properties.length;
    
    for (const prop of properties) {
      // Check overall timeout
      if (Date.now() - startTime > timeoutMs) {
        console.warn(`Batch operation timeout at property: ${prop}`);
        break;
      }
      
      try {
        results[prop] = emergencyGetProperty(obj, prop, null, timeoutPerProperty);
      } catch (propError) {
        console.warn(`Failed to get property ${prop}: ${propError.message}`);
        results[prop] = null;
      }
    }
    
  } catch (error) {
    console.error(`Batch property collection failed: ${error.message}`);
  }
  
  return results;
}

// Safe object analysis with comprehensive property discovery
function safeAnalyzeObject(obj: any, maxProperties: number = 20, timeoutMs: number = 3000): ObjectAnalysis {
  const startTime = Date.now();
  const analysis: ObjectAnalysis = {
    type: 'unknown',
    properties: {},
    methods: [],
    collections: [],
    errors: [],
    timestamp: new Date().toISOString()
  };
  
  try {
    if (!obj) {
      analysis.errors.push('Object is null or undefined');
      return analysis;
    }
    
    // Get object type
    const constructor = emergencyGetProperty(obj, 'constructor', null);
    if (constructor) {
      analysis.type = emergencyGetProperty(constructor, 'name', 'Unknown');
    }
    
    // Discover properties
    let propertyCount = 0;
    
    for (const key in obj) {
      // Check timeout
      if (Date.now() - startTime > timeoutMs) {
        analysis.errors.push('Analysis timeout reached');
        break;
      }
      
      // Limit property discovery
      if (propertyCount >= maxProperties) {
        analysis.errors.push(`Property limit reached (${maxProperties})`);
        break;
      }
      
      try {
        if (obj.hasOwnProperty && !obj.hasOwnProperty(key)) {
          continue; // Skip inherited properties
        }
        
        const value = emergencyGetProperty(obj, key, undefined, 200);
        const valueType = safeGetPropertyType(obj, key);
        
        analysis.properties[key] = {
          type: valueType,
          hasValue: value !== undefined && value !== null,
          isFunction: typeof value === 'function'
        };
        
        // Categorize special properties
        if (typeof value === 'function') {
          analysis.methods.push(key);
        } else if (valueType === 'object' && value && emergencyGetLength(value, 200) > 0) {
          analysis.collections.push(key);
        }
        
        propertyCount++;
        
      } catch (propError) {
        analysis.errors.push(`Property ${key}: ${propError.message}`);
      }
    }
    
  } catch (error) {
    analysis.errors.push(`Object analysis failed: ${error.message}`);
  }
  
  return analysis;
}

interface ObjectAnalysis {
  type: string;
  properties: { [key: string]: { type: string; hasValue: boolean; isFunction: boolean; } };
  methods: string[];
  collections: string[];
  errors: string[];
  timestamp: string;
}
```

---

## Error Handling Strategies

### Error Classification and Recovery
```typescript
// Error category definitions
enum InDesignErrorCategory {
  PROPERTY_ACCESS = 'property_access',
  COLLECTION_ACCESS = 'collection_access',
  TIMEOUT = 'timeout',
  PERMISSION_DENIED = 'permission_denied',
  INVALID_REFERENCE = 'invalid_reference',
  MEMORY_LIMIT = 'memory_limit',
  DOCUMENT_STATE = 'document_state',
  UNKNOWN = 'unknown'
}

// Error severity levels
enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Comprehensive error handling
function handleInDesignError(error: Error, context: string, attemptRecovery: boolean = true): ErrorResult {
  const errorResult: ErrorResult = {
    category: categorizeError(error),
    severity: determineSeverity(error),
    message: error.message,
    context: context,
    timestamp: new Date().toISOString(),
    recovered: false,
    recoveryAction: null
  };
  
  // Log error for debugging
  console.error(`InDesign Error [${errorResult.category}:${errorResult.severity}] in ${context}: ${error.message}`);
  
  // Attempt recovery if requested
  if (attemptRecovery) {
    errorResult.recovered = attemptErrorRecovery(errorResult);
  }
  
  return errorResult;
}

// Error categorization based on message patterns
function categorizeError(error: Error): InDesignErrorCategory {
  const message = error.message.toLowerCase();
  
  if (message.includes('object does not support') || message.includes('property')) {
    return InDesignErrorCategory.PROPERTY_ACCESS;
  } else if (message.includes('invalid index') || message.includes('collection')) {
    return InDesignErrorCategory.COLLECTION_ACCESS;
  } else if (message.includes('timeout') || message.includes('time')) {
    return InDesignErrorCategory.TIMEOUT;
  } else if (message.includes('access denied') || message.includes('permission')) {
    return InDesignErrorCategory.PERMISSION_DENIED;
  } else if (message.includes('invalid') || message.includes('reference')) {
    return InDesignErrorCategory.INVALID_REFERENCE;
  } else if (message.includes('memory') || message.includes('limit')) {
    return InDesignErrorCategory.MEMORY_LIMIT;
  } else if (message.includes('document') || message.includes('state')) {
    return InDesignErrorCategory.DOCUMENT_STATE;
  } else {
    return InDesignErrorCategory.UNKNOWN;
  }
}

// Error severity determination
function determineSeverity(error: Error): ErrorSeverity {
  const message = error.message.toLowerCase();
  
  if (message.includes('critical') || message.includes('fatal') || message.includes('crash')) {
    return ErrorSeverity.CRITICAL;
  } else if (message.includes('access denied') || message.includes('permission') || message.includes('locked')) {
    return ErrorSeverity.HIGH;
  } else if (message.includes('timeout') || message.includes('invalid') || message.includes('missing')) {
    return ErrorSeverity.MEDIUM;
  } else {
    return ErrorSeverity.LOW;
  }
}

// Recovery attempt strategies
function attemptErrorRecovery(errorResult: ErrorResult): boolean {
  try {
    switch (errorResult.category) {
      case InDesignErrorCategory.TIMEOUT:
        errorResult.recoveryAction = 'Increased timeout thresholds';
        return true;
        
      case InDesignErrorCategory.PROPERTY_ACCESS:
        errorResult.recoveryAction = 'Using alternative property access method';
        return true;
        
      case InDesignErrorCategory.COLLECTION_ACCESS:
        errorResult.recoveryAction = 'Reduced collection sample size';
        return true;
        
      case InDesignErrorCategory.MEMORY_LIMIT:
        // Trigger garbage collection if available
        if (typeof $.gc === 'function') {
          $.gc();
          errorResult.recoveryAction = 'Triggered garbage collection';
          return true;
        }
        break;
        
      case InDesignErrorCategory.DOCUMENT_STATE:
        errorResult.recoveryAction = 'Skipped operation due to document state';
        return true;
        
      default:
        errorResult.recoveryAction = 'No specific recovery available';
        return false;
    }
    
  } catch (recoveryError) {
    errorResult.recoveryAction = `Recovery failed: ${recoveryError.message}`;
    return false;
  }
  
  return false;
}

interface ErrorResult {
  category: InDesignErrorCategory;
  severity: ErrorSeverity;
  message: string;
  context: string;
  timestamp: string;
  recovered: boolean;
  recoveryAction: string | null;
}
```

### Defensive Programming Patterns
```typescript
// Defensive object access with comprehensive validation
function defensiveObjectAccess<T>(
  obj: any,
  accessor: (obj: any) => T,
  defaultValue: T,
  validationRules?: ValidationRule[]
): T {
  try {
    // Pre-access validation
    if (!obj) {
      console.warn('Defensive access: Object is null or undefined');
      return defaultValue;
    }
    
    // Apply validation rules if provided
    if (validationRules) {
      for (const rule of validationRules) {
        if (!rule.validate(obj)) {
          console.warn(`Validation failed: ${rule.message}`);
          return defaultValue;
        }
      }
    }
    
    // Attempt access with timeout protection
    const timeoutId = setTimeout(() => {
      throw new Error('Defensive access timeout');
    }, 2000);
    
    try {
      const result = accessor(obj);
      clearTimeout(timeoutId);
      
      // Post-access validation
      if (result === undefined || result === null) {
        console.warn('Defensive access: Result is null or undefined');
        return defaultValue;
      }
      
      return result;
      
    } catch (accessError) {
      clearTimeout(timeoutId);
      throw accessError;
    }
    
  } catch (error) {
    console.error(`Defensive access failed: ${error.message}`);
    return defaultValue;
  }
}

interface ValidationRule {
  validate: (obj: any) => boolean;
  message: string;
}

// Common validation rules
const CommonValidationRules = {
  hasRequiredProperty: (propertyName: string): ValidationRule => ({
    validate: (obj) => safeHasProperty(obj, propertyName),
    message: `Missing required property: ${propertyName}`
  }),
  
  isCorrectType: (expectedType: string): ValidationRule => ({
    validate: (obj) => {
      const constructor = emergencyGetProperty(obj, 'constructor', null);
      const typeName = constructor ? emergencyGetProperty(constructor, 'name', 'Unknown') : 'Unknown';
      return typeName === expectedType;
    },
    message: `Incorrect object type, expected: ${expectedType}`
  }),
  
  hasNonZeroLength: (): ValidationRule => ({
    validate: (obj) => emergencyGetLength(obj, 500) > 0,
    message: 'Collection is empty'
  }),
  
  isNotLocked: (): ValidationRule => ({
    validate: (obj) => !emergencyGetProperty(obj, 'locked', false),
    message: 'Object is locked'
  }),
  
  isVisible: (): ValidationRule => ({
    validate: (obj) => emergencyGetProperty(obj, 'visible', true),
    message: 'Object is not visible'
  })
};

// Example usage of defensive access:
const pageItems = defensiveObjectAccess(
  page,
  (p) => emergencyGetProperty(p, 'pageItems', null),
  null,
  [
    CommonValidationRules.hasRequiredProperty('pageItems'),
    CommonValidationRules.isCorrectType('Page')
  ]
);
```

### Error Recovery Patterns
```typescript
// Progressive fallback strategy
function progressiveFallback<T>(
  attempts: Array<() => T>,
  context: string,
  defaultValue: T
): T {
  const errors: string[] = [];
  
  for (let i = 0; i < attempts.length; i++) {
    try {
      const result = attempts[i]();
      
      if (result !== null && result !== undefined) {
        if (i > 0) {
          console.info(`Progressive fallback succeeded on attempt ${i + 1} for ${context}`);
        }
        return result;
      }
      
    } catch (error) {
      errors.push(`Attempt ${i + 1}: ${error.message}`);
      console.warn(`Fallback attempt ${i + 1} failed for ${context}: ${error.message}`);
    }
  }
  
  console.error(`All fallback attempts failed for ${context}:`, errors);
  return defaultValue;
}

// Example: Progressive text content access
function getTextContentWithFallback(textFrame: any): string {
  return progressiveFallback([
    // Attempt 1: Standard contents property
    () => emergencyGetProperty(textFrame, 'contents', null),
    
    // Attempt 2: Alternative content property
    () => emergencyGetProperty(textFrame, 'content', null),
    
    // Attempt 3: Text property
    () => emergencyGetProperty(textFrame, 'text', null),
    
    // Attempt 4: Try to get from parent story
    () => {
      const story = emergencyGetProperty(textFrame, 'parentStory', null);
      return story ? emergencyGetProperty(story, 'contents', null) : null;
    },
    
    // Attempt 5: Character-by-character reconstruction
    () => {
      const characters = emergencyGetProperty(textFrame, 'characters', null);
      if (characters) {
        const charCount = emergencyGetLength(characters, 1000);
        let text = '';
        for (let i = 0; i < Math.min(charCount, 100); i++) {
          const char = emergencyGetCollectionItem(characters, i, 100);
          if (char) {
            const charContent = emergencyGetProperty(char, 'contents', '');
            text += charContent;
          }
        }
        return text;
      }
      return null;
    }
  ], 'text content access', '[Content unavailable]');
}
```

---

## Performance Considerations

### Memory Management
```typescript
// Memory-conscious analysis with cleanup
class MemoryManagedAnalysis {
  private memoryThreshold: number = 50 * 1024 * 1024; // 50MB
  private currentMemoryUsage: number = 0;
  private analysisCache: Map<string, any> = new Map();
  
  // Estimate object memory usage
  private estimateMemoryUsage(obj: any): number {
    try {
      if (!obj) return 0;
      
      let estimate = 0;
      const type = typeof obj;
      
      switch (type) {
        case 'string':
          estimate = obj.length * 2; // Unicode characters
          break;
        case 'number':
          estimate = 8; // 64-bit numbers
          break;
        case 'boolean':
          estimate = 4;
          break;
        case 'object':
          if (Array.isArray(obj)) {
            estimate = obj.length * 8; // Rough estimate for array overhead
          } else {
            estimate = Object.keys(obj).length * 20; // Rough estimate for object properties
          }
          break;
        default:
          estimate = 16; // Default object overhead
      }
      
      return estimate;
      
    } catch (error) {
      return 16; // Fallback estimate
    }
  }
  
  // Check if memory threshold would be exceeded
  private checkMemoryThreshold(additionalUsage: number): boolean {
    return (this.currentMemoryUsage + additionalUsage) > this.memoryThreshold;
  }
  
  // Cleanup memory-intensive objects
  private cleanup(): void {
    try {
      // Clear cache
      this.analysisCache.clear();
      
      // Reset memory counter
      this.currentMemoryUsage = 0;
      
      // Trigger garbage collection if available
      if (typeof $.gc === 'function') {
        $.gc();
      }
      
      console.info('Memory cleanup completed');
      
    } catch (error) {
      console.error(`Memory cleanup failed: ${error.message}`);
    }
  }
  
  // Memory-safe object analysis
  public analyzeWithMemoryManagement(obj: any, maxDepth: number = 3): any {
    const analysisKey = this.generateAnalysisKey(obj);
    
    // Check cache first
    if (this.analysisCache.has(analysisKey)) {
      return this.analysisCache.get(analysisKey);
    }
    
    // Estimate memory requirements
    const estimatedUsage = this.estimateMemoryUsage(obj) * maxDepth;
    
    // Check if we need to cleanup first
    if (this.checkMemoryThreshold(estimatedUsage)) {
      console.warn('Memory threshold approached, cleaning up...');
      this.cleanup();
    }
    
    try {
      const result = this.performAnalysis(obj, maxDepth);
      
      // Cache result if it's not too large
      if (estimatedUsage < this.memoryThreshold / 10) {
        this.analysisCache.set(analysisKey, result);
      }
      
      this.currentMemoryUsage += estimatedUsage;
      return result;
      
    } catch (error) {
      console.error(`Memory-managed analysis failed: ${error.message}`);
      return { error: error.message };
    }
  }
  
  private generateAnalysisKey(obj: any): string {
    try {
      const id = emergencyGetProperty(obj, 'id', 'unknown');
      const type = emergencyGetProperty(obj.constructor, 'name', 'unknown');
      return `${type}-${id}`;
    } catch {
      return `unknown-${Date.now()}`;
    }
  }
  
  private performAnalysis(obj: any, maxDepth: number): any {
    // Implement your analysis logic here
    return { analyzed: true, depth: maxDepth };
  }
}
```

### Batch Processing Strategies
```typescript
// Efficient batch processing with progress reporting
class BatchProcessor {
  private batchSize: number = 10;
  private processingDelay: number = 100; // ms between batches
  private timeoutPerItem: number = 500; // ms per item
  
  // Process collection in batches with progress callbacks
  public async processBatches<T>(
    collection: any,
    processor: (item: any, index: number) => T,
    progressCallback?: (progress: number, total: number) => void,
    errorCallback?: (error: Error, index: number) => void
  ): Promise<T[]> {
    const results: T[] = [];
    const collectionLength = emergencyGetLength(collection, 2000);
    
    if (collectionLength === 0) {
      return results;
    }
    
    console.info(`Starting batch processing of ${collectionLength} items (batch size: ${this.batchSize})`);
    
    for (let batchStart = 0; batchStart < collectionLength; batchStart += this.batchSize) {
      const batchEnd = Math.min(batchStart + this.batchSize, collectionLength);
      
      // Process current batch
      for (let i = batchStart; i < batchEnd; i++) {
        try {
          const item = emergencyGetCollectionItem(collection, i, this.timeoutPerItem);
          
          if (item) {
            const result = processor(item, i);
            results.push(result);
          }
          
        } catch (error) {
          console.error(`Batch processing error at item ${i}: ${error.message}`);
          if (errorCallback) {
            errorCallback(error, i);
          }
        }
      }
      
      // Report progress
      if (progressCallback) {
        progressCallback(batchEnd, collectionLength);
      }
      
      // Delay between batches to prevent overwhelming InDesign
      if (batchEnd < collectionLength) {
        await this.delay(this.processingDelay);
      }
    }
    
    console.info(`Batch processing completed: ${results.length} items processed`);
    return results;
  }
  
  // Delay utility for ExtendScript
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => {
      if (typeof $.sleep === 'function') {
        $.sleep(ms);
        resolve();
      } else {
        // Fallback for environments without $.sleep
        const start = Date.now();
        while (Date.now() - start < ms) {
          // Busy wait
        }
        resolve();
      }
    });
  }
  
  // Configure batch processing parameters
  public configure(options: {
    batchSize?: number;
    processingDelay?: number;
    timeoutPerItem?: number;
  }): void {
    if (options.batchSize !== undefined) {
      this.batchSize = Math.max(1, options.batchSize);
    }
    if (options.processingDelay !== undefined) {
      this.processingDelay = Math.max(0, options.processingDelay);
    }
    if (options.timeoutPerItem !== undefined) {
      this.timeoutPerItem = Math.max(100, options.timeoutPerItem);
    }
  }
}

// Usage example:
const processor = new BatchProcessor();
processor.configure({ batchSize: 5, processingDelay: 200 });

const pageAnalysis = await processor.processBatches(
  document.pages,
  (page, index) => ({
    name: emergencyGetProperty(page, 'name', `Page ${index + 1}`),
    itemCount: emergencyGetLength(page.pageItems, 1000)
  }),
  (progress, total) => console.log(`Progress: ${progress}/${total}`),
  (error, index) => console.error(`Error processing page ${index}: ${error.message}`)
);
```

### Performance Monitoring
```typescript
// Performance monitoring and optimization recommendations
class PerformanceMonitor {
  private operations: Map<string, OperationMetrics> = new Map();
  private globalStartTime: number = Date.now();
  
  // Start timing an operation
  public startOperation(operationName: string): OperationTimer {
    return new OperationTimer(operationName, this);
  }
  
  // Record operation completion
  public recordOperation(name: string, duration: number, success: boolean, details?: any): void {
    if (!this.operations.has(name)) {
      this.operations.set(name, {
        name: name,
        totalCalls: 0,
        totalDuration: 0,
        successCount: 0,
        failureCount: 0,
        averageDuration: 0,
        minDuration: Number.MAX_VALUE,
        maxDuration: 0,
        lastDuration: 0
      });
    }
    
    const metrics = this.operations.get(name)!;
    metrics.totalCalls++;
    metrics.totalDuration += duration;
    metrics.lastDuration = duration;
    
    if (success) {
      metrics.successCount++;
    } else {
      metrics.failureCount++;
    }
    
    metrics.averageDuration = metrics.totalDuration / metrics.totalCalls;
    metrics.minDuration = Math.min(metrics.minDuration, duration);
    metrics.maxDuration = Math.max(metrics.maxDuration, duration);
  }
  
  // Generate performance report
  public generateReport(): PerformanceReport {
    const totalRuntime = Date.now() - this.globalStartTime;
    const operations = Array.from(this.operations.values());
    
    // Calculate totals
    const totalOperations = operations.reduce((sum, op) => sum + op.totalCalls, 0);
    const totalDuration = operations.reduce((sum, op) => sum + op.totalDuration, 0);
    const overallSuccessRate = operations.reduce((sum, op) => sum + op.successCount, 0) / Math.max(totalOperations, 1);
    
    // Find performance bottlenecks
    const slowestOperations = operations
      .sort((a, b) => b.averageDuration - a.averageDuration)
      .slice(0, 5);
    
    const mostFrequentOperations = operations
      .sort((a, b) => b.totalCalls - a.totalCalls)
      .slice(0, 5);
    
    // Generate recommendations
    const recommendations = this.generateOptimizationRecommendations(operations);
    
    return {
      totalRuntime,
      totalOperations,
      totalDuration,
      overallSuccessRate,
      operations,
      slowestOperations,
      mostFrequentOperations,
      recommendations,
      timestamp: new Date().toISOString()
    };
  }
  
  private generateOptimizationRecommendations(operations: OperationMetrics[]): string[] {
    const recommendations: string[] = [];
    
    operations.forEach(op => {
      if (op.averageDuration > 1000) {
        recommendations.push(`${op.name}: Consider reducing timeout or sample size (avg: ${op.averageDuration}ms)`);
      }
      
      if (op.failureCount / op.totalCalls > 0.1) {
        recommendations.push(`${op.name}: High failure rate (${Math.round(op.failureCount / op.totalCalls * 100)}%) - check error handling`);
      }
      
      if (op.totalCalls > 100 && op.averageDuration > 500) {
        recommendations.push(`${op.name}: Frequently called but slow - consider caching or optimization`);
      }
    });
    
    return recommendations;
  }
}

class OperationTimer {
  private startTime: number = Date.now();
  
  constructor(
    private operationName: string,
    private monitor: PerformanceMonitor
  ) {}
  
  public stop(success: boolean = true, details?: any): number {
    const duration = Date.now() - this.startTime;
    this.monitor.recordOperation(this.operationName, duration, success, details);
    return duration;
  }
}

interface OperationMetrics {
  name: string;
  totalCalls: number;
  totalDuration: number;
  successCount: number;
  failureCount: number;
  averageDuration: number;
  minDuration: number;
  maxDuration: number;
  lastDuration: number;
}

interface PerformanceReport {
  totalRuntime: number;
  totalOperations: number;
  totalDuration: number;
  overallSuccessRate: number;
  operations: OperationMetrics[];
  slowestOperations: OperationMetrics[];
  mostFrequentOperations: OperationMetrics[];
  recommendations: string[];
  timestamp: string;
}
```

---

## Summary

This comprehensive reference provides detailed information about InDesign's DOM structure with modern TypeScript-style examples for clarity. Key points for safe scripting:

### Critical Safety Rules

1. **Always use emergency access functions** for any property or collection access
2. **Implement timeout protection** for all operations (1-5 seconds recommended)
3. **Use sample limits** for large collections (5-25 items maximum)
4. **Check object existence** before accessing properties
5. **Handle errors gracefully** with fallback strategies
6. **Monitor memory usage** and clean up regularly
7. **Test with small documents first** before processing large files

### Common Patterns

- **Document Analysis**: Start with basic properties, then move to collections
- **Collection Processing**: Always get length first, then sample items
- **Text Analysis**: Use content previews instead of full text for large documents
- **Image Analysis**: Focus on link status and basic properties
- **Error Recovery**: Implement progressive fallback strategies

### Performance Guidelines

- **Batch Processing**: Process items in small batches with delays
- **Memory Management**: Clear caches and trigger garbage collection regularly
- **Timeout Management**: Use appropriate timeouts for different operation types
- **Progress Reporting**: Provide feedback for long-running operations

### ExtendScript Compatibility

All examples are designed to work with ES3-compatible ExtendScript:
- No arrow functions or modern ES6+ features
- Compatible with InDesign CS3 through CC 2025
- Defensive programming patterns throughout
- Comprehensive error handling for all operations

This reference serves as both a learning tool and a practical guide for building robust InDesign automation scripts. Always prioritize safety over speed, and test thoroughly with various document types and sizes.