import { writePsd, Psd } from 'ag-psd';
import * as fs from 'fs';
import * as path from 'path';

interface TestCase {
    name: string;
    filename: string;
    description: string;
    complexity: 'simple' | 'medium' | 'complex';
    expectedProperties: {
        layerCount: number;
        hasText: boolean;
        textLayers: string[];
        expectedFonts: string[];
    };
}

interface TestResult {
    buffer: Buffer;
    testCase: TestCase;
}

export class TestPSDGenerator {

    private static get assetsDir(): string {
        return './tests/assets';
    }

    /**
     * LEVEL 1: Simple single text layer
     * Tests: Basic font extraction, layer detection
     */
    static createSimpleTitle(): TestResult {
        const testCase: TestCase = {
            name: 'simple-title',
            filename: 'simple-title.psd',
            description: 'Single text layer, Arial 48pt, white text',
            complexity: 'simple',
            expectedProperties: {
                layerCount: 1,
                hasText: true,
                textLayers: ['Sample Title'],
                expectedFonts: ['ArialMT']
            }
        };

        const psd: Psd = {
            width: 800,
            height: 600,
            channels: 3,
            bitsPerChannel: 8,
            colorMode: 3, // RGB
            children: [
                {
                    name: "Sample Title",
                    text: {
                        text: "Hello World",
                        style: {
                            font: { name: "ArialMT" },
                            fontSize: 48,
                            fillColor: { r: 255, g: 255, b: 255 }
                        },
                        antiAlias: "smooth",
                        transform: [1, 0, 0, 1, 100, 200]
                    }
                }
            ]
        };

        return {
            buffer: Buffer.from(writePsd(psd)),
            testCase: testCase
        };
    }

    /**
     * LEVEL 2: Multiple text layers
     * Tests: Layer navigation, bounds comparison, layer-by-name selection
     */
    static createMultiLayerBounds(): TestResult {
        const testCase: TestCase = {
            name: 'multi-layer-bounds',
            filename: 'multi-layer-bounds.psd',
            description: 'Multiple text layers at different positions for bounds testing',
            complexity: 'medium',
            expectedProperties: {
                layerCount: 3,
                hasText: true,
                textLayers: ['Header Text', 'Body Text', 'Footer Text'],
                expectedFonts: ['ArialMT']
            }
        };

        const psd: Psd = {
            width: 1200,
            height: 800,
            channels: 3,
            bitsPerChannel: 8,
            colorMode: 3,
            children: [
                {
                    name: "Header Text",
                    text: {
                        text: "Header Title",
                        style: {
                            font: { name: "ArialMT" },
                            fontSize: 72,
                            fillColor: { r: 255, g: 255, b: 255 }
                        },
                        transform: [1, 0, 0, 1, 100, 100]
                    }
                },
                {
                    name: "Body Text",
                    text: {
                        text: "Body content goes here",
                        style: {
                            font: { name: "ArialMT" },
                            fontSize: 24,
                            fillColor: { r: 200, g: 200, b: 200 }
                        },
                        transform: [1, 0, 0, 1, 100, 300]
                    }
                },
                {
                    name: "Footer Text",
                    text: {
                        text: "Footer information",
                        style: {
                            font: { name: "ArialMT" },
                            fontSize: 18,
                            fillColor: { r: 150, g: 150, b: 150 }
                        },
                        transform: [1, 0, 0, 1, 100, 600]
                    }
                }
            ]
        };

        return {
            buffer: Buffer.from(writePsd(psd)),
            testCase: testCase
        };
    }

    /**
     * LEVEL 3: Complex text with multiple colors
     * Tests: Color extraction, style variation
     */
    static createComplexText(): TestResult {
        const testCase: TestCase = {
            name: 'complex-text',
            filename: 'complex-text.psd',
            description: 'Text with multiple colors and styles',
            complexity: 'complex',
            expectedProperties: {
                layerCount: 2,
                hasText: true,
                textLayers: ['Title Layer', 'Subtitle Layer'],
                expectedFonts: ['ArialMT']
            }
        };

        const psd: Psd = {
            width: 1000,
            height: 600,
            channels: 3,
            bitsPerChannel: 8,
            colorMode: 3,
            children: [
                {
                    name: "Title Layer",
                    text: {
                        text: "Main Title Text",
                        style: {
                            font: { name: "ArialMT" },
                            fontSize: 64,
                            fillColor: { r: 255, g: 0, b: 0 } // Red
                        },
                        transform: [1, 0, 0, 1, 50, 150]
                    }
                },
                {
                    name: "Subtitle Layer",
                    text: {
                        text: "Subtitle content here",
                        style: {
                            font: { name: "ArialMT" },
                            fontSize: 32,
                            fillColor: { r: 0, g: 0, b: 255 } // Blue
                        },
                        transform: [1, 0, 0, 1, 50, 300]
                    }
                }
            ]
        };

        return {
            buffer: Buffer.from(writePsd(psd)),
            testCase: testCase
        };
    }

    /**
     * Generate all test PSDs with metadata
     */
    static generateAllTestAssets(): TestCase[] {
        // Ensure directories exist
        if (!fs.existsSync(this.assetsDir)) {
            fs.mkdirSync(this.assetsDir, { recursive: true });
        }

        const testCases: TestCase[] = [];

        // Generate each test case
        const generators = [
            this.createSimpleTitle,
            this.createMultiLayerBounds,
            this.createComplexText
        ];

        generators.forEach(generator => {
            const result = generator();
            const { buffer, testCase } = result;

            // Save PSD file
            const psdPath = path.join(this.assetsDir, testCase.filename);
            fs.writeFileSync(psdPath, buffer);

            // Save test case metadata
            const metadataPath = path.join(this.assetsDir, `${testCase.name}-metadata.json`);
            fs.writeFileSync(metadataPath, JSON.stringify(testCase, null, 2));

            testCases.push(testCase);

            console.log(`✅ Generated: ${testCase.filename} (${testCase.complexity})`);
        });

        // Save master test manifest
        const manifestPath = path.join(this.assetsDir, 'test-manifest.json');
        fs.writeFileSync(manifestPath, JSON.stringify({ testCases }, null, 2));

        console.log(`✅ Generated ${testCases.length} test PSDs with metadata`);
        console.log(`📁 Assets: ${this.assetsDir}`);

        return testCases;
    }
}

// Execute if run directly
async function main() {
    console.log('🚀 Generating test PSDs...\n');

    const testCases = TestPSDGenerator.generateAllTestAssets();

    console.log('\n📋 Test Cases Generated:');
    testCases.forEach(tc => {
        console.log(`  • ${tc.name}: ${tc.description}`);
        console.log(`    Complexity: ${tc.complexity}, Layers: ${tc.expectedProperties.layerCount}`);
    });

    console.log('\n🎯 Next: Open PSDs in Photoshop to verify they work!');
    console.log('\n⚠️  MANUAL STEPS REQUIRED:');
    console.log('1. Open each PSD in Photoshop to verify it loads correctly');
    console.log('2. Copy to work computer with Photoshop for ActionManager testing');
    console.log('3. Run XML dump generation scripts');
}

if (require.main === module) {
    main().catch(console.error);
}