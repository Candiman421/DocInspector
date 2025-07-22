# Framework Function Analysis & Trimming Recommendations

Based on the sample scoring script and considering future scoring needs, this analysis catalogs ALL functions and provides keep/deprecate recommendations. Emphasis on maintaining debuggability and avoiding overly complex abstractions.

---

## ActionDescriptorNavigator.ts

### Constructor
#### `constructor(desc: ActionDescriptor | null)`
**Dependencies:** None
**Recommendation:** **KEEP** - Core constructor, essential

### Static Factory Methods

#### `from(ref: ActionReference): ActionDescriptorNavigator`
**Dependencies:** `executeActionGet`, `createSentinel`
**Recommendation:** **KEEP** - Useful for advanced scenarios, clean error handling

#### `forCurrentLayer(): ActionDescriptorNavigator`
**Dependencies:** `executeActionGet`, `createSentinel`, `charIDToTypeID`
**Recommendation:** **KEEP** - Common entry point for layer-based scoring

#### `forCurrentDocument(): ActionDescriptorNavigator`
**Dependencies:** `executeActionGet`, `createSentinel`, `charIDToTypeID`
**Recommendation:** **KEEP** - Will be needed for document-level scoring (resolution, color mode, etc.)

#### `forLayerByIndex(index: number): ActionDescriptorNavigator`
**Dependencies:** `executeActionGet`, `createSentinel`, `charIDToTypeID`
**Recommendation:** **KEEP** - Used internally by `forLayerByName`, useful for layer iteration

#### `forLayerByName(layerName: string): ActionDescriptorNavigator` ⭐
**Dependencies:** `extractAllLayerNames`, `forLayerByIndex`, `createSentinel`
**Recommendation:** **KEEP** - **USED IN SAMPLE** - Core function for finding target layers

#### `createSentinel(): ActionDescriptorNavigator`
**Dependencies:** None
**Recommendation:** **KEEP** - Essential for error handling throughout framework

#### `getSentinelValue<T>(type: T): SentinelValue<T>`
**Dependencies:** None
**Recommendation:** **KEEP** - Core sentinel system, provides consistent error values

#### `getLayerCount(): number`
**Dependencies:** `executeActionGet`, `stringIDToTypeID`, `charIDToTypeID`
**Recommendation:** **KEEP** - Useful for iteration, used by `extractAllLayerNames`

#### `extractAllLayerNames(): readonly string[]`
**Dependencies:** `getLayerCount`, `forLayerByIndex`, `getValue`
**Recommendation:** **KEEP** - Used by `forLayerByName`, useful for debugging layer structure

### Core Navigation Methods

#### `object(key: string): ActionDescriptorNavigator` ⭐
**Dependencies:** `validateKey`, `stringIDToTypeID`, `createSentinel`
**Recommendation:** **KEEP** - **USED IN SAMPLE** - Core navigation method, direct and debuggable

#### `list(key: string): ActionListNavigator` ⭐
**Dependencies:** `validateKey`, `stringIDToTypeID`, `ActionListNavigator.createSentinel`
**Recommendation:** **KEEP** - **USED IN SAMPLE** - Core navigation method, essential for list access

### Value Extraction Methods

#### `getValue<T>(key: string, type: ValueType, options?: ComparisonOptions): T`
**Dependencies:** `validateKey`, `stringIDToTypeID`, `extractByType`, `getSentinelValue`
**Recommendation:** **KEEP** - Core extraction method, used by all wrapper methods

#### `getStringValue(key: string): string` ⭐
**Dependencies:** `getValue`
**Recommendation:** **KEEP** - **USED IN SAMPLE** - Essential for text/name extraction, simple wrapper

#### `getDoubleValue(key: string): number` ⭐
**Dependencies:** `getValue`
**Recommendation:** **KEEP** - **USED IN SAMPLE** - Essential for numeric values, simple wrapper

#### `getIntegerValue(key: string): number`
**Dependencies:** `getValue`
**Recommendation:** **KEEP** - Will be needed for layer IDs, counts, indices in other scoring scripts

#### `getBooleanValue(key: string): boolean`
**Dependencies:** `getValue`
**Recommendation:** **KEEP** - Will be needed for visibility, locked state, effects enabled, etc.

#### `getUnitDoubleValue(key: string): number` ⭐
**Dependencies:** `getValue`
**Recommendation:** **KEEP** - **USED IN SAMPLE** - Essential for size/dimension values

#### `getEnumeratedNumeric(key: string): number`
**Dependencies:** `validateKey`, `stringIDToTypeID`
**Recommendation:** **DEPRECATE** - String version preferred for readability and debugging

#### `getEnumeratedString(key: string): string` ⭐
**Dependencies:** `validateKey`, `stringIDToTypeID`, `typeIDToStringID`, `getSentinelValue`
**Recommendation:** **KEEP** - **USED IN SAMPLE** - Essential for enumerated values, human-readable

#### `extractByType(typeID: number, type: ValueType): any`
**Dependencies:** `getSentinelValue`
**Recommendation:** **KEEP** - Used internally by `getValue`, handles the core extraction logic

### Utility Methods

#### `hasKey(key: string): boolean`
**Dependencies:** `validateKey`, `stringIDToTypeID`
**Recommendation:** **KEEP** - Useful for conditional navigation and debugging structure

#### `getValues(specs: readonly {...}[]): readonly any[]`
**Dependencies:** `getValue`, `getSentinelValue`
**Recommendation:** **DEPRECATE** - Complex API, hides what's happening, harder to debug

#### `getValuesAsObject<T>(specs: {...}): T`
**Dependencies:** `getValue`, `getSentinelValue`
**Recommendation:** **DEPRECATE** - Complex API, hides what's happening, harder to debug

#### `getBounds(): {...}`
**Dependencies:** `stringIDToTypeID`
**Recommendation:** **KEEP** - **RECONSIDER** - Will be very useful for layout scoring, position validation. Simple enough to debug.

#### `getTextProperties(): {...}`
**Dependencies:** `stringIDToTypeID`
**Recommendation:** **DEPRECATE** - Hides navigation complexity, better to use direct object navigation

#### `extractValueFromDescriptor(subPath: string, valueType: ValueType): any`
**Dependencies:** `validatePath`, `stringIDToTypeID`, `extractByType`, `getSentinelValue`
**Recommendation:** **KEEP** - Used internally for complex paths, needed for the path parsing logic

### Private Methods

#### `validateKey(key: string): boolean`
**Dependencies:** None
**Recommendation:** **KEEP** - Essential validation, prevents crashes

#### `validatePath(path: string): boolean`
**Dependencies:** None
**Recommendation:** **KEEP** - Essential validation, prevents crashes

---

## ActionListNavigator (within ActionDescriptorNavigator.ts)

### Constructor
#### `constructor(list: ActionList | null)`
**Dependencies:** None
**Recommendation:** **KEEP** - Core constructor, essential

### Static Methods

#### `createSentinel(): ActionListNavigator`
**Dependencies:** None
**Recommendation:** **KEEP** - Essential for error handling

### Core Methods

#### `getCount(): number`
**Dependencies:** None
**Recommendation:** **KEEP** - Essential for list iteration and bounds checking

#### `getObject(index: number): ActionDescriptorNavigator`
**Dependencies:** `getCount`, `ActionDescriptorNavigator.createSentinel`
**Recommendation:** **KEEP** - Core list access method, direct and debuggable

### Search Methods

#### `getAllValues<T>(key: string, type: ValueType, options?: ComparisonOptions): readonly T[]`
**Dependencies:** `getCount`, `getObject`, `getSentinelValue`
**Recommendation:** **KEEP** - **RECONSIDER** - Might be useful for collecting all font sizes, colors, etc. across text ranges

#### `findValue<T>(key: string, type: ValueType, predicate: (value: T) => boolean, options?: ComparisonOptions): T`
**Dependencies:** `getCount`, `getObject`, `getSentinelValue`
**Recommendation:** **KEEP** - **RECONSIDER** - Useful for finding values with conditions (e.g., "font size > 20")

#### `findIndex(key: string, value: any): number`
**Dependencies:** `getCount`, `getObject`
**Recommendation:** **KEEP** - Useful for finding positions, used by `findObjectBy`

#### `findObjectBy(key: string, value: any): ActionDescriptorNavigator`
**Dependencies:** `findIndex`, `getObject`, `ActionDescriptorNavigator.createSentinel`
**Recommendation:** **KEEP** - Simpler alternative to `findObjectWhereNested` for direct property matching

#### `getValueAt<T>(index: number, key: string, type: ValueType): T`
**Dependencies:** `getCount`, `getObject`, `getSentinelValue`
**Recommendation:** **KEEP** - Useful for direct indexed access, combines two operations efficiently

#### `findObjectWhereNested(nestedObjectKey: string, propertyKey: string, searchValue: any): ActionDescriptorNavigator` ⭐
**Dependencies:** `getCount`, `getObject`, `ActionDescriptorNavigator.createSentinel`
**Recommendation:** **KEEP** - **USED IN SAMPLE** - Critical for finding text styles, direct logic that's debuggable

---

## ListExtractors.ts

### Interface

#### `ListExtractor`
**Dependencies:** None
**Recommendation:** **DEPRECATE** - Abstraction that hides navigation complexity, makes debugging harder

### Class: ListValueExtractor

**Overall Assessment:** This entire class implements a complex abstraction over list navigation that hides what's actually happening. The sample shows direct navigation is preferred for debuggability.

#### `constructor(basePath: ListExtractor, subPath: string, valueType: ValueType, transformer?: ValueTransformer)`
**Dependencies:** `validateAndParsePath`
**Recommendation:** **DEPRECATE** - Complex API that abstracts away the navigation

#### `extractAll<T>(rootDesc: ActionDescriptor): readonly T[]`
**Dependencies:** `basePath.extract`, `extractValueFromDescriptor`, `getSentinelValue`
**Recommendation:** **DEPRECATE** - Same functionality available through direct navigation + getAllValues

#### `extractAt<T>(rootDesc: ActionDescriptor, index: number): T`
**Dependencies:** `basePath.extract`, `extractValueFromDescriptor`, `getSentinelValue`
**Recommendation:** **DEPRECATE** - Same functionality available through direct navigation + getValueAt

#### `findFirst<T>(rootDesc: ActionDescriptor, predicate: (value: T, index: number) => boolean): T`
**Dependencies:** `basePath.extract`, `extractValueFromDescriptor`, `getSentinelValue`
**Recommendation:** **DEPRECATE** - Same functionality available through direct navigation + findValue

#### `extractExactly<T>(rootDesc: ActionDescriptor, count: number): readonly T[]`
**Dependencies:** `basePath.extract`, `extractValueFromDescriptor`, `getSentinelValue`
**Recommendation:** **DEPRECATE** - Complex API, edge case functionality

#### `transform(transformer: ValueTransformer): ListValueExtractor`
**Dependencies:** Constructor
**Recommendation:** **DEPRECATE** - Transformations can be done inline for better debuggability

#### `round(decimals = 0): ListValueExtractor`
**Dependencies:** `transform`
**Recommendation:** **DEPRECATE** - Math.round() is clearer inline

### Private Methods

#### `extractValueFromDescriptor(desc: ActionDescriptor): any`
**Dependencies:** `cachedPath`, `extractSingleValue`, `extractNestedValue`, `transformer`
**Recommendation:** **DEPRECATE** - Complex internal logic, direct navigation preferred

#### `extractSingleValue(desc: ActionDescriptor, propertyName: string): any`
**Dependencies:** `stringIDToTypeID`, `ActionDescriptorNavigator`
**Recommendation:** **DEPRECATE** - Redundant with direct navigation

#### `extractNestedValue(desc: ActionDescriptor): any`
**Dependencies:** `cachedPath`, `stringIDToTypeID`, `extractSingleValue`
**Recommendation:** **DEPRECATE** - Complex path parsing, direct navigation preferred

#### `validateAndParsePath(subPath: string): readonly string[]`
**Dependencies:** None
**Recommendation:** **DEPRECATE** - Path parsing not needed with direct navigation

---

## PathAccessor.ts

### Class: ActionDescriptorPath

**Overall Assessment:** This entire fluent API approach is not used in the sample and creates a complex abstraction that makes debugging harder. The user prefers direct, imperative navigation.

#### `static create(): ActionDescriptorPath`
**Dependencies:** Constructor
**Recommendation:** **DEPRECATE** - Fluent API not used, direct navigation preferred

#### `constructor(segments: readonly PathSegment[], transformations: readonly ValueTransformer[], defaultReturnValue?: any)`
**Dependencies:** None
**Recommendation:** **DEPRECATE** - Part of unused fluent API

#### `object(key: string): ActionDescriptorPath`
**Dependencies:** `validateKey`, `createSentinelPath`
**Recommendation:** **DEPRECATE** - Fluent API not used, direct object() calls preferred

#### `list(key: string): ActionDescriptorPath`
**Dependencies:** `validateKey`, `createSentinelPath`
**Recommendation:** **DEPRECATE** - Fluent API not used, direct list() calls preferred

#### `at(index: number): ActionDescriptorPath`
**Dependencies:** `getLastSegment`
**Recommendation:** **DEPRECATE** - Fluent API not used, direct getObject() calls preferred

#### `value(key: string, valueType: ValueType): ActionDescriptorPath`
**Dependencies:** `validateKey`
**Recommendation:** **DEPRECATE** - Fluent API not used, direct getValue() calls preferred

#### `transform(transformer: ValueTransformer): ActionDescriptorPath`
**Dependencies:** Constructor
**Recommendation:** **DEPRECATE** - Inline transformations are clearer

#### `floor(): ActionDescriptorPath`
**Dependencies:** `transform`
**Recommendation:** **DEPRECATE** - Math.floor() inline is clearer

#### `round(decimals = 0): ActionDescriptorPath`
**Dependencies:** `transform`
**Recommendation:** **DEPRECATE** - Math.round() inline is clearer

#### `toPixels(fromUnit = 'pt', dpi = 72): ActionDescriptorPath`
**Dependencies:** `transform`, `convertToPixels`
**Recommendation:** **DEPRECATE** - Unit conversion can be done inline

#### `toPercentage(): ActionDescriptorPath`
**Dependencies:** `transform`
**Recommendation:** **DEPRECATE** - Percentage conversion (* 100) is clearer inline

#### `defaultTo<T>(value: T): ActionDescriptorPath`
**Dependencies:** Constructor
**Recommendation:** **DEPRECATE** - Direct fallback logic is clearer

#### `extract<T>(rootDesc: ActionDescriptor): T`
**Dependencies:** `resolvePath`, `applyTransformations`, `getFallbackValue`
**Recommendation:** **DEPRECATE** - Complex path resolution, direct navigation preferred

#### `tryExtract<T>(rootDesc: ActionDescriptor): T`
**Dependencies:** `extract`
**Recommendation:** **DEPRECATE** - Redundant error handling, sentinels handle this

#### `extractOr<T>(rootDesc: ActionDescriptor, fallback: T): T`
**Dependencies:** `extract`, `SENTINEL_SET`
**Recommendation:** **DEPRECATE** - Direct comparison with sentinel values is clearer

#### `extractAllLayerNames(): readonly string[]`
**Dependencies:** `ActionDescriptorNavigator.extractAllLayerNames`
**Recommendation:** **DEPRECATE** - Redundant wrapper

### Static Complex Methods

#### `extractTextStyleValues<T>(...): readonly T[]`
**Dependencies:** `stringIDToTypeID`, `ActionDescriptorNavigator`, `getSentinelValue`
**Recommendation:** **DEPRECATE** - Complex API that hides navigation, direct approach preferred

#### `findInList<T>(...): T`
**Dependencies:** `resolvePath`, `ActionDescriptorNavigator`, `getSentinelValue`
**Recommendation:** **DEPRECATE** - Complex API that hides navigation

#### `findTextStyleByProperty(...): any`
**Dependencies:** `stringIDToTypeID`, `ActionDescriptorNavigator`, `getSentinelValue`
**Recommendation:** **DEPRECATE** - Complex search logic, direct findObjectWhereNested preferred

#### `findFilterByName(...): any`
**Dependencies:** `stringIDToTypeID`, `ActionDescriptorNavigator`, `getSentinelValue`
**Recommendation:** **DEPRECATE** - Similar to findTextStyleByProperty, direct navigation preferred

### Private Methods (Path Resolution)

#### `resolvePath(rootDesc: ActionDescriptor): any`
**Dependencies:** `stringIDToTypeID`, `ActionDescriptorNavigator`
**Recommendation:** **DEPRECATE** - Complex path parsing, direct navigation is clearer

#### `applyTransformations(value: any): any`
**Dependencies:** `transformations`, `defaultReturnValue`
**Recommendation:** **DEPRECATE** - Inline transformations are clearer

#### `convertToPixels(value: number, fromUnit: string, dpi: number): number`
**Dependencies:** `UNIT_CONVERTERS`
**Recommendation:** **DEPRECATE** - Unit conversion can be done inline when needed

#### `getFallbackValue(): any`
**Dependencies:** `defaultReturnValue`, `getLastSegment`, `getSentinelValue`
**Recommendation:** **DEPRECATE** - Sentinel system handles this

#### `createSentinelPath(): ActionDescriptorPath`
**Dependencies:** `ActionDescriptorPath.create`
**Recommendation:** **DEPRECATE** - Part of unused fluent API

#### `getLastSegment(): PathSegment | null`
**Dependencies:** None
**Recommendation:** **DEPRECATE** - Part of unused fluent API

#### `validateKey(key: string): boolean`
**Dependencies:** None
**Recommendation:** **DEPRECATE** - Redundant with ActionDescriptorNavigator validation

### Class: PathFactory

**Overall Assessment:** Factory for fluent API that's not used in sample scoring approach.

#### `obj(key: string): ActionDescriptorPath`
**Dependencies:** `ActionDescriptorPath.create`
**Recommendation:** **DEPRECATE** - Fluent API not used

#### `list(key: string): ActionDescriptorPath`
**Dependencies:** `ActionDescriptorPath.create`
**Recommendation:** **DEPRECATE** - Fluent API not used

#### `val(key: string, type: ValueType): ActionDescriptorPath`
**Dependencies:** `ActionDescriptorPath.create`, `DEFAULT_VALUES`
**Recommendation:** **DEPRECATE** - Direct getValue() calls preferred

#### `bounds(property: BoundsProperty): ActionDescriptorPath`
**Dependencies:** `ActionDescriptorPath.create`
**Recommendation:** **DEPRECATE** - Direct bounds object navigation preferred

#### `textStyleByFont(fontName: string, property: string, type: ValueType): ActionDescriptorPath`
**Dependencies:** `ActionDescriptorPath.create`, `findTextStyleByProperty`
**Recommendation:** **DEPRECATE** - Direct findObjectWhereNested preferred

#### `textStyleBySize(fontSize: number, property: string, type: ValueType): ActionDescriptorPath`
**Dependencies:** `ActionDescriptorPath.create`, `findTextStyleByProperty`
**Recommendation:** **DEPRECATE** - Direct findObjectWhereNested preferred

#### `filterByName(filterName: string, property: string, type: ValueType): ActionDescriptorPath`
**Dependencies:** `ActionDescriptorPath.create`, `findFilterByName`
**Recommendation:** **DEPRECATE** - Direct navigation preferred

#### `findLayerByName(namePattern: string | RegExp): ActionDescriptorPath`
**Dependencies:** `ActionDescriptorPath.create`, `extractAllLayerNames`
**Recommendation:** **DEPRECATE** - Direct forLayerByName preferred

#### `textStyle(property: string, type: ValueType, textIndex = 0): ActionDescriptorPath`
**Dependencies:** `ActionDescriptorPath.create`
**Recommendation:** **DEPRECATE** - Direct navigation with getObject(index) preferred

#### `filter(property: string, type: ValueType, filterIndex = 0): ActionDescriptorPath`
**Dependencies:** `ActionDescriptorPath.create`
**Recommendation:** **DEPRECATE** - Direct navigation with getObject(index) preferred

### P Instance
#### `const P = new PathFactory()`
**Dependencies:** `PathFactory`
**Recommendation:** **DEPRECATE** - Entire fluent API approach not used

---

## Summary Recommendations

### **KEEP (Essential for Scoring Architecture)**

**Core Navigation & Values (Used in Sample):**
- `ActionDescriptorNavigator.forLayerByName()` ⭐
- `ActionDescriptorNavigator.object()` ⭐  
- `ActionDescriptorNavigator.list()` ⭐
- `ActionDescriptorNavigator.getStringValue()` ⭐
- `ActionDescriptorNavigator.getDoubleValue()` ⭐
- `ActionDescriptorNavigator.getUnitDoubleValue()` ⭐
- `ActionDescriptorNavigator.getEnumeratedString()` ⭐
- `ActionListNavigator.findObjectWhereNested()` ⭐

**Supporting Infrastructure:**
- Constructor methods
- Sentinel system (`getSentinelValue`, `createSentinel`)
- Core validation (`validateKey`, `validatePath`)
- Factory methods (`forCurrentLayer`, `forCurrentDocument`, `forLayerByIndex`)
- Utility navigation (`hasKey`, `extractByType`, `extractValueFromDescriptor`)

**Will Be Needed for Other Scoring Scripts:**
- `ActionDescriptorNavigator.getBooleanValue()` - visibility, locked, effects enabled
- `ActionDescriptorNavigator.getIntegerValue()` - layer IDs, counts, indices
- `ActionDescriptorNavigator.getBounds()` - layout scoring, position validation
- `ActionListNavigator.getAllValues()` - collecting all sizes, colors across ranges
- `ActionListNavigator.findValue()` - finding values with conditions
- `ActionListNavigator.getValueAt()` - direct indexed access
- `ActionListNavigator.findObjectBy()` - simpler search patterns

### **DEPRECATE (Complex Abstractions)**

**Entire Files:**
- **`ListExtractors.ts`** (~100% removal) - Complex abstraction, hides navigation
- **`PathAccessor.ts`** (~100% removal) - Fluent API not used, complex abstractions

**Complex Batch Methods:**
- `getValues()`, `getValuesAsObject()` - Hide what's happening, hard to debug
- `getTextProperties()` - Hides navigation complexity
- `getEnumeratedNumeric()` - String version preferred for clarity

### **Architecture Principles Confirmed**
1. **Direct Navigation Preferred** - `object()` and `list()` chaining is clear and debuggable
2. **Simple Value Getters** - Individual typed getters are clear and predictable
3. **Search When Needed** - `findObjectWhereNested()` for complex searches, direct access otherwise
4. **Avoid Abstractions** - Don't hide the navigation path or transformation logic

### **Estimated Code Reduction**
- **ListExtractors.ts**: ~100% removal (~500 lines)
- **PathAccessor.ts**: ~100% removal (~1200 lines)  
- **ActionDescriptorNavigator.ts**: ~30% reduction (~300 lines of 1000)

**Total: ~2000 lines → ~700 lines** while maintaining all functionality needed for the scoring architecture and anticipated future scoring scripts.