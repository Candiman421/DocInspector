# Module Analysis & Build Utility Scripts - Implementation Plan (Updated)

## Overview
Create two comprehensive utility scripts for project-wide auto-discovery, assembly, and statistical analysis of InDesign DOM Discovery Builder modules with context-driven reporting.

---

## Script 1: Module Auto-Assembler
**Location:** `Root/Utils/module-assembler.js` (cleaned up from build-chunk.js)

### Purpose
Project-wide auto-discovery and assembly of script modules with per-folder output and dual-format generation.

### Execution Pattern
```yaml
execution:
  home_directory: "Root/Utils/"
  discovery_scope: "Project-wide (all folders)"
  output_location: "Target folder (where modules are found)"
  file_pattern: "^(\d+(\.\d+){0,3})_.*\.jsx?$"  # Supports 1.2, 1.2.1, 1.4.2.1, etc.

auto_discovery:
  folder_scanning:
    - Scan all project folders for decimal-notation files
    - Process each folder independently
    - Skip folders with no matching files
    - Exclude: node_modules, .git, build artifacts
  
  pattern_matching:
    - Match: "1.2_safety-utilities.jsx"
    - Match: "1.2.1_enhanced-safety.jsx" 
    - Match: "1.4.2.1_micro-patch.jsx"
    - Ignore: "backup_1.2_safety.jsx" (decimal not at start)
    - Support up to 4 decimal levels deep

dual_output_per_folder:
  concatenated_version:
    - Single file with all modules combined
    - Naming: "{FolderName}_ASSEMBLED_{timestamp}.jsx"
    - Full content with headers/verification
  
  include_version:
    - Include-based loader script
    - Naming: "{FolderName}_INCLUDES_{timestamp}.jsx"
    - #include directives for development debugging
```

---

## Script 2: Statistical Module Analyzer
**Location:** `Root/Utils/module-analyzer.js`

### Purpose
Project-wide module analysis with per-folder YAML reports and context-driven comparison statistics.

### Execution Pattern
```yaml
execution:
  home_directory: "Root/Utils/"
  discovery_scope: "Project-wide (all folders)"
  output_location: "Each target folder (alongside modules)"
  report_format: "YAML"

output_naming:
  pattern: "~analysis-{timestamp}-{scope}.yaml"
  examples:
    - "~analysis-20241219-143022-folder-stats.yaml"
    - "~analysis-20241219-143045-comparison-1.2.yaml"
  gitignore_pattern: "~analysis-*.yaml"
  vs_code_sorting: "~ prefix ensures bottom of file list"

### Context-Driven Analysis Strategy
```yaml
folder_analysis:
  per_folder_reports:
    - Generate individual YAML report for each folder
    - Include all decimal-notation files found
    - Output report directly to that folder
  
  comparison_detection:
    - Auto-detect files with same decimal prefix in folder
    - Example: "1.2_original.jsx" + "1.2_updated.jsx" = comparison report
    - Generate additional comparison statistics section
    - Include before/after metrics and change analysis

report_organization:
  folder_statistics:
    - Overall folder health score
    - Module count and distribution
    - Dependency compliance per folder
  
  individual_modules:
    - Detailed per-file analysis
    - Function inventory and compliance
    - Architecture adherence scoring
  
  comparison_analysis:  # Only if same decimal prefix detected
    - Side-by-side statistics
    - Change detection (functions added/removed/modified)
    - Compliance improvement/regression tracking
```

---

## Per-Module Analysis Details

### Basic Metadata
```yaml
file_info:
  - filename
  - file_size_bytes  
  - line_count
  - last_modified
  - character_count
  - estimated_complexity_score

module_header:
  - module_name_extracted
  - version_declared
  - purpose_description
  - dependencies_list
  - size_comment_accuracy_check
```

### Architecture-Specific Code Quality Rules
```yaml
extendscript_compatibility:
  es3_compliance:
    - Check for: const, let, arrow functions, template literals
    - Threshold: 0 violations (CRITICAL)
    - Score impact: -50 points per violation
  
  reserved_word_safety:
    - Detect: 'export' as property name (crashes ExtendScript)
    - Check: Other ES5+ reserved words as variables
    - Threshold: 0 violations (CRITICAL)
    - Score impact: -100 points per violation

dependency_architecture:
  load_order_compliance:
    - Verify: Module N only depends on modules < N
    - Check: Dependency declarations match actual usage
    - Threshold: 100% compliance expected
    - Score impact: -20 points per violation
  
  circular_dependency_detection:
    - Scan: Cross-references between modules
    - Threshold: 0 circular dependencies (CRITICAL)
    - Score impact: -200 points per circular dependency

logging_system_compliance:
  modern_logging_usage:
    - Prefer: logDebug(), logInfo(), logWarn(), logError()
    - Avoid: $.writeln() direct calls
    - Threshold: >90% modern logging adoption
    - Score impact: +10 points per modern call, -5 per legacy call
  
  category_usage:
    - Verify: Appropriate categories used (enumeration, exportData, etc.)
    - Check: No reserved word 'export' category
    - Threshold: 100% valid categories
    - Score impact: -25 points per invalid category

memory_management:
  function_length_limits:
    - Warning threshold: >100 lines per function
    - Critical threshold: >200 lines per function
    - Score impact: -1 point per line over 100, -5 per line over 200
  
  variable_cleanup:
    - Check for: Proper null assignments in cleanup functions
    - Look for: memoryCleanup() usage patterns
    - Threshold: Cleanup functions present in modules >500 lines
    - Score impact: +20 points for proper cleanup patterns

function_architecture:
  registration_compliance:
    - Verify: All functions in registerModule() exist in code
    - Verify: All global functions are registered (except internal helpers)
    - Threshold: 100% accuracy expected
    - Score impact: -15 points per missing/orphaned function
  
  nested_function_management:
    - Track: Nesting depth and complexity
    - Warning threshold: >3 levels deep
    - Score impact: -2 points per level beyond 3

error_handling_patterns:
  try_catch_coverage:
    - Expected: Main functions have try-catch blocks
    - Threshold: >80% of public functions protected
    - Score impact: +5 points per protected function
  
  graceful_degradation:
    - Check for: Fallback behavior on errors
    - Look for: Proper error logging with categories
    - Threshold: >90% of catch blocks have logging
    - Score impact: +10 points per proper error handling pattern

indesign_api_safety:
  dangerous_property_avoidance:
    - Check: Usage of isDangerousProperty() validation
    - Verify: No direct access to prototype, constructor, etc.
    - Threshold: 100% safe property access
    - Score impact: -50 points per dangerous access pattern
  
  document_validation:
    - Verify: validateInDesignEnvironment() usage
    - Check: Document state validation before operations
    - Threshold: All entry points validate environment
    - Score impact: +15 points per validation, -30 for missing validation
```

### Health Score Calculation
```yaml
scoring_system:
  total_possible_points: 1000
  
  grade_thresholds:
    - A+ (950-1000): Exemplary architecture compliance
    - A  (900-949):  Excellent with minor issues
    - B+ (850-899):  Good compliance, some improvements needed
    - B  (800-849):  Acceptable with notable issues
    - C+ (750-799):  Below standard, requires attention
    - C  (700-749):  Poor compliance, needs refactoring
    - D  (600-699):  Critical issues present
    - F  (<600):     Unacceptable, major problems

  critical_failure_conditions:
    - ES3 compatibility violations
    - Reserved word crashes
    - Circular dependencies
    - Missing dependency validation
    - Dangerous property access without protection
```

### Dependency Analysis
```yaml
dependencies:
  declared_dependencies:
    - list_from_header
    - validation_calls_present
  
  actual_usage:
    - functions_called_from_other_modules
    - external_references_found
    - potential_missing_dependencies
  
  load_order_compliance:
    - numeric_order_correct: true/false
    - dependency_order_violations: [list]
```

### Code Quality Metrics
```yaml
error_handling:
  try_catch_blocks:
    - total_count
    - functions_with_error_handling
    - functions_without_error_handling
    - error_handling_coverage_percentage
  
  logging_analysis:
    - logging_calls_present: true/false
    - logging_types_used: [logDebug, logInfo, logWarn, logError]
    - logging_categories_used: [list]
    - functions_with_logging
    - functions_without_logging
    - legacy_logging_patterns: [$.writeln, etc.]
    - modern_logging_compliance_percentage

documentation:
  comments:
    - comment_lines_count
    - documentation_coverage_estimate
    - jsdoc_style_comments: count
    - inline_comments: count
  
  code_organization:
    - section_headers_present: [list]
    - consistent_formatting: estimated_score
```

---

## Project Execution Strategy

### Both Scripts Auto-Discovery Flow
```yaml
discovery_process:
  1_scan_project:
    - Start from Root/Utils/ execution location
    - Scan all sibling and child folders
    - Detect folders containing decimal-notation files
    - Skip: node_modules, .git, Utils, any folder starting with '.'
  
  2_per_folder_processing:
    - Process each folder independently
    - Generate assembler outputs IN the target folder
    - Generate analysis reports IN the target folder
    - Maintain folder isolation (no cross-folder dependencies)
  
  3_context_aware_analysis:
    - Detect multiple files with same decimal prefix
    - Auto-generate comparison statistics if found
    - Create comprehensive folder-level health reports
```

### File Naming & GitIgnore Strategy
```yaml
assembler_outputs:
  concatenated: "{FolderName}_ASSEMBLED_{YYYYMMDD-HHMMSS}.jsx"
  includes: "{FolderName}_INCLUDES_{YYYYMMDD-HHMMSS}.jsx"

analysis_outputs:
  folder_report: "~analysis-{YYYYMMDD-HHMMSS}-folder.yaml"
  comparison_report: "~analysis-{YYYYMMDD-HHMMSS}-compare-{decimal}.yaml"
  
gitignore_patterns:
  - "*_ASSEMBLED_*.jsx"
  - "*_INCLUDES_*.jsx" 
  - "~analysis-*.yaml"

vs_code_sorting:
  - Tilde prefix (~) ensures reports appear at bottom of file list
  - Consistent timestamp format for chronological organization
  - Clear descriptive suffixes for quick identification
```

### Execution Commands
```yaml
module_assembler:
  full_project: "node Root/Utils/module-assembler.js"
  specific_folder: "node Root/Utils/module-assembler.js --folder path/to/folder"
  
module_analyzer:
  full_project: "node Root/Utils/module-analyzer.js"
  specific_folder: "node Root/Utils/module-analyzer.js --folder path/to/folder"
  comparison_only: "node Root/Utils/module-analyzer.js --compare-mode"
```

---

## Static Analysis Capabilities (What .js Scripts Can Reliably Detect)

### Reliably Detectable Patterns
```yaml
syntax_analysis:
  - ES3 vs ES5+ feature usage
  - Reserved word violations
  - Function declaration patterns
  - Variable naming conventions
  - Comment structure and JSDoc compliance

structural_analysis:
  - Function signatures and parameter counts
  - Nesting depth and complexity
  - Module registration accuracy
  - Import/dependency declarations
  - File size and line count metrics

pattern_matching:
  - Logging function usage (logDebug vs $.writeln)
  - Error handling patterns (try-catch coverage)
  - Memory cleanup patterns
  - API safety patterns (dangerous property checks)
  - Architecture compliance (dependency order)

content_parsing:
  - Extract module headers and metadata
  - Parse registerModule() function lists
  - Identify nested vs global functions
  - Detect circular reference patterns
  - Map function call relationships

quality_metrics:
  - Code duplication detection (basic)
  - Consistent formatting patterns
  - Documentation coverage estimation
  - Architecture pattern adherence
```

### Limitations & Boundaries
```yaml
cannot_reliably_detect:
  - Runtime behavior and performance
  - Actual InDesign API compatibility beyond syntax
  - Dynamic function calls and eval usage
  - Complex logical flow analysis
  - Actual memory usage patterns

approximations_only:
  - Complexity scoring (heuristic-based)
  - Performance impact estimation
  - Memory usage prediction
  - API safety beyond known patterns
```

---

## Implementation Priority & Phases

### Phase 1: Core Infrastructure (Week 1)
```yaml
module_assembler:
  - Project-wide auto-discovery
  - Per-folder dual-output generation
  - Basic validation and error handling
  - Timestamp-based file naming

module_analyzer:
  - Basic file parsing and metadata extraction
  - Function discovery and registration validation
  - Simple YAML output generation
  - Folder-level statistics
```

### Phase 2: Quality Analysis (Week 2) 
```yaml
code_quality_rules:
  - ES3 compatibility checking
  - Logging system compliance
  - Architecture pattern validation
  - Health scoring system implementation

comparison_features:
  - Same-decimal-prefix detection
  - Before/after statistical analysis
  - Change tracking and reporting
```

### Phase 3: Advanced Features (Week 3)
```yaml
enhanced_analysis:
  - Dependency graph visualization (text-based)
  - Memory pattern analysis
  - Performance optimization suggestions
  - Architecture compliance scoring

integration:
  - Cross-folder project health summary
  - Trend analysis over time
  - Automated quality gates
```

---

## Final Questions for Approval

1. **Execution Flow**: Does the per-folder output approach work for your workflow?
2. **File Naming**: Are the tilde-prefix and timestamp patterns acceptable?
3. **Quality Rules**: Do the architecture-specific rules cover your main concerns?
4. **Scope**: Should comparison only happen within folders, or also across folders?
5. **Performance**: Any concerns about processing large projects with many folders?

This approach gives you maximum flexibility - drop modules anywhere, run analysis, get contextual reports with automatic comparisons when relevant. The scripts will handle the complexity while providing clean, actionable output.