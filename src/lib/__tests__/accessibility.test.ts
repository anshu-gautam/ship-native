/**
 * Accessibility Testing Utilities Tests
 */

import {
  AccessibilityAuditor,
  WCAG_CONTRAST_RATIOS,
  a11yTestHelpers,
  getContrastRatio,
  getRelativeLuminance,
  hexToRgb,
  validateAccessibilityLabel,
  validateColorContrast,
  validateTouchTargetSize,
} from '../accessibility';

describe('Accessibility Utilities', () => {
  describe('hexToRgb', () => {
    it('converts hex color to RGB', () => {
      expect(hexToRgb('#FFFFFF')).toEqual({ r: 255, g: 255, b: 255 });
      expect(hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 });
      expect(hexToRgb('#FF5733')).toEqual({ r: 255, g: 87, b: 51 });
    });

    it('handles hex without # prefix', () => {
      expect(hexToRgb('FFFFFF')).toEqual({ r: 255, g: 255, b: 255 });
    });

    it('returns null for invalid hex', () => {
      expect(hexToRgb('invalid')).toBeNull();
      expect(hexToRgb('ZZZ')).toBeNull();
    });
  });

  describe('getRelativeLuminance', () => {
    it('calculates luminance for white', () => {
      const luminance = getRelativeLuminance(255, 255, 255);
      expect(luminance).toBeCloseTo(1.0, 2);
    });

    it('calculates luminance for black', () => {
      const luminance = getRelativeLuminance(0, 0, 0);
      expect(luminance).toBeCloseTo(0.0, 2);
    });

    it('calculates luminance for gray', () => {
      const luminance = getRelativeLuminance(128, 128, 128);
      expect(luminance).toBeGreaterThan(0);
      expect(luminance).toBeLessThan(1);
    });
  });

  describe('getContrastRatio', () => {
    it('calculates contrast ratio for black on white', () => {
      const ratio = getContrastRatio('#000000', '#FFFFFF');
      expect(ratio).toBeCloseTo(21, 0);
    });

    it('calculates contrast ratio for white on black', () => {
      const ratio = getContrastRatio('#FFFFFF', '#000000');
      expect(ratio).toBeCloseTo(21, 0);
    });

    it('returns 1 for same colors', () => {
      const ratio = getContrastRatio('#FF0000', '#FF0000');
      expect(ratio).toBeCloseTo(1, 1);
    });

    it('returns null for invalid colors', () => {
      expect(getContrastRatio('invalid', '#FFFFFF')).toBeNull();
      expect(getContrastRatio('#FFFFFF', 'invalid')).toBeNull();
    });
  });

  describe('validateColorContrast', () => {
    it('validates high contrast (AAA)', () => {
      const result = validateColorContrast('#000000', '#FFFFFF');
      expect(result.passesAA).toBe(true);
      expect(result.passesAAA).toBe(true);
      expect(result.level).toBe('AAA');
      expect(result.ratio).toBeGreaterThan(WCAG_CONTRAST_RATIOS.AAA_NORMAL);
    });

    it('validates AA contrast', () => {
      // Dark gray on white should pass AA but not AAA
      const result = validateColorContrast('#767676', '#FFFFFF');
      expect(result.passesAA).toBe(true);
      expect(result.level).toBe('AA');
    });

    it('fails insufficient contrast', () => {
      // Light gray on white
      const result = validateColorContrast('#CCCCCC', '#FFFFFF');
      expect(result.passesAA).toBe(false);
      expect(result.passesAAA).toBe(false);
      expect(result.level).toBe('Fail');
    });

    it('uses different thresholds for large text', () => {
      // #8A8A8A on white is approximately 3.1:1, passes AA for large text
      const result = validateColorContrast('#8A8A8A', '#FFFFFF', true);
      expect(result.passesAA).toBe(true); // 3:1 for large text
    });

    it('handles invalid colors', () => {
      const result = validateColorContrast('invalid', '#FFFFFF');
      expect(result.ratio).toBe(0);
      expect(result.passesAA).toBe(false);
      expect(result.level).toBe('Fail');
    });
  });

  describe('validateTouchTargetSize', () => {
    it('validates sufficient touch target', () => {
      const result = validateTouchTargetSize(48, 48);
      expect(result.valid).toBe(true);
      expect(result.message).toBeUndefined();
    });

    it('validates large touch target', () => {
      const result = validateTouchTargetSize(100, 100);
      expect(result.valid).toBe(true);
    });

    it('fails small width', () => {
      const result = validateTouchTargetSize(30, 48);
      expect(result.valid).toBe(false);
      expect(result.message).toContain('too small');
    });

    it('fails small height', () => {
      const result = validateTouchTargetSize(48, 30);
      expect(result.valid).toBe(false);
      expect(result.message).toContain('too small');
    });

    it('fails both dimensions too small', () => {
      const result = validateTouchTargetSize(20, 20);
      expect(result.valid).toBe(false);
    });
  });

  describe('validateAccessibilityLabel', () => {
    it('validates good label', () => {
      const result = validateAccessibilityLabel('Submit form');
      expect(result.valid).toBe(true);
      expect(result.message).toBeUndefined();
    });

    it('fails missing label', () => {
      const result = validateAccessibilityLabel(undefined);
      expect(result.valid).toBe(false);
      expect(result.message).toContain('Missing');
    });

    it('fails empty label', () => {
      const result = validateAccessibilityLabel('');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('Missing');
    });

    it('fails whitespace-only label', () => {
      const result = validateAccessibilityLabel('   ');
      expect(result.valid).toBe(false);
    });

    it('fails too long label', () => {
      const longLabel = 'a'.repeat(101);
      const result = validateAccessibilityLabel(longLabel);
      expect(result.valid).toBe(false);
      expect(result.message).toContain('too long');
    });

    it('fails unhelpful label - button', () => {
      const result = validateAccessibilityLabel('Button');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('not descriptive');
    });

    it('fails unhelpful label - image', () => {
      const result = validateAccessibilityLabel('Image');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('not descriptive');
    });

    it('fails unhelpful label - click here', () => {
      const result = validateAccessibilityLabel('Click here');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('not descriptive');
    });
  });

  describe('AccessibilityAuditor', () => {
    let auditor: AccessibilityAuditor;

    beforeEach(() => {
      auditor = new AccessibilityAuditor();
    });

    describe('auditColorContrast', () => {
      it('adds error for poor contrast', () => {
        auditor.auditColorContrast('#CCCCCC', '#FFFFFF', 'Text');
        const issues = auditor.getIssues();

        expect(issues).toHaveLength(1);
        expect(issues[0].type).toBe('contrast');
        expect(issues[0].severity).toBe('error');
        expect(issues[0].element).toBe('Text');
      });

      it('adds warning for AA but not AAA', () => {
        auditor.auditColorContrast('#767676', '#FFFFFF', 'Text');
        const issues = auditor.getIssues();

        expect(issues).toHaveLength(1);
        expect(issues[0].type).toBe('contrast');
        expect(issues[0].severity).toBe('warning');
      });

      it('adds no issues for AAA contrast', () => {
        auditor.auditColorContrast('#000000', '#FFFFFF', 'Text');
        const issues = auditor.getIssues();

        expect(issues).toHaveLength(0);
      });
    });

    describe('auditAccessibilityLabel', () => {
      it('adds error for missing label', () => {
        auditor.auditAccessibilityLabel(undefined, 'Button');
        const issues = auditor.getIssues();

        expect(issues).toHaveLength(1);
        expect(issues[0].type).toBe('label');
        expect(issues[0].severity).toBe('error');
      });

      it('adds error for unhelpful label', () => {
        auditor.auditAccessibilityLabel('Button', 'Submit Button');
        const issues = auditor.getIssues();

        expect(issues).toHaveLength(1);
        expect(issues[0].type).toBe('label');
      });

      it('adds no issues for good label', () => {
        auditor.auditAccessibilityLabel('Submit form', 'Button');
        const issues = auditor.getIssues();

        expect(issues).toHaveLength(0);
      });
    });

    describe('auditTouchTargetSize', () => {
      it('adds error for small touch target', () => {
        auditor.auditTouchTargetSize(30, 30, 'Button');
        const issues = auditor.getIssues();

        expect(issues).toHaveLength(1);
        expect(issues[0].type).toBe('touchTarget');
        expect(issues[0].severity).toBe('error');
      });

      it('adds no issues for sufficient size', () => {
        auditor.auditTouchTargetSize(48, 48, 'Button');
        const issues = auditor.getIssues();

        expect(issues).toHaveLength(0);
      });
    });

    describe('auditInteractiveElement', () => {
      it('audits all aspects of interactive element', () => {
        auditor.auditInteractiveElement({
          label: undefined,
          width: 30,
          height: 30,
          foreground: '#CCCCCC',
          background: '#FFFFFF',
          elementName: 'Button',
        });

        const issues = auditor.getIssues();

        // Should have issues for: label, touch target, contrast
        expect(issues.length).toBeGreaterThanOrEqual(3);
        expect(issues.some((i) => i.type === 'label')).toBe(true);
        expect(issues.some((i) => i.type === 'touchTarget')).toBe(true);
        expect(issues.some((i) => i.type === 'contrast')).toBe(true);
      });

      it('passes well-designed element', () => {
        auditor.auditInteractiveElement({
          label: 'Submit form',
          width: 100,
          height: 50,
          foreground: '#000000',
          background: '#FFFFFF',
          elementName: 'Submit Button',
        });

        const issues = auditor.getIssues();
        expect(issues).toHaveLength(0);
      });
    });

    describe('generateReport', () => {
      it('generates perfect report', () => {
        const report = auditor.generateReport();

        expect(report.passed).toBe(true);
        expect(report.score).toBe(100);
        expect(report.wcagLevel).toBe('AAA');
        expect(report.issues).toHaveLength(0);
      });

      it('generates report with errors', () => {
        auditor.auditAccessibilityLabel(undefined, 'Button');
        auditor.auditTouchTargetSize(20, 20, 'Button');

        const report = auditor.generateReport();

        expect(report.passed).toBe(false);
        expect(report.score).toBeLessThan(100);
        expect(report.wcagLevel).not.toBe('AAA');
        expect(report.issues).toHaveLength(2);
      });

      it('calculates score correctly', () => {
        // Add 1 error (20 points) and 1 warning (5 points)
        auditor.auditAccessibilityLabel(undefined, 'Button'); // error
        auditor.auditColorContrast('#767676', '#FFFFFF', 'Text'); // warning

        const report = auditor.generateReport();

        expect(report.score).toBe(75); // 100 - 20 - 5
        expect(report.wcagLevel).toBe('A'); // 1 error = 'A'
      });

      it('determines WCAG level correctly', () => {
        // AAA: no issues
        expect(auditor.generateReport().wcagLevel).toBe('AAA');

        auditor.reset();
        auditor.auditColorContrast('#767676', '#FFFFFF', 'Text'); // warning only
        expect(auditor.generateReport().wcagLevel).toBe('AA');

        auditor.reset();
        auditor.auditAccessibilityLabel(undefined, 'Button'); // 1 error
        expect(auditor.generateReport().wcagLevel).toBe('A');

        auditor.reset();
        auditor.auditAccessibilityLabel(undefined, 'Button1'); // errors
        auditor.auditAccessibilityLabel(undefined, 'Button2');
        auditor.auditAccessibilityLabel(undefined, 'Button3');
        expect(auditor.generateReport().wcagLevel).toBe('Fail');
      });
    });

    describe('reset', () => {
      it('clears all issues', () => {
        auditor.auditAccessibilityLabel(undefined, 'Button');
        expect(auditor.getIssues()).toHaveLength(1);

        auditor.reset();
        expect(auditor.getIssues()).toHaveLength(0);
      });
    });
  });

  describe('a11yTestHelpers', () => {
    describe('assertHasAccessibilityLabel', () => {
      it('passes for valid label', () => {
        const element = {
          props: { accessibilityLabel: 'Submit form' },
        };

        const result = a11yTestHelpers.assertHasAccessibilityLabel(element);
        expect(result.pass).toBe(true);
      });

      it('fails for missing label', () => {
        const element = { props: {} };

        const result = a11yTestHelpers.assertHasAccessibilityLabel(element);
        expect(result.pass).toBe(false);
        expect(result.message).toContain('missing');
      });

      it('validates expected label', () => {
        const element = {
          props: { accessibilityLabel: 'Submit' },
        };

        const result = a11yTestHelpers.assertHasAccessibilityLabel(element, 'Submit');
        expect(result.pass).toBe(true);

        const wrongResult = a11yTestHelpers.assertHasAccessibilityLabel(element, 'Cancel');
        expect(wrongResult.pass).toBe(false);
      });

      it('fails for unhelpful label', () => {
        const element = {
          props: { accessibilityLabel: 'Button' },
        };

        const result = a11yTestHelpers.assertHasAccessibilityLabel(element);
        expect(result.pass).toBe(false);
        expect(result.message).toContain('not descriptive');
      });
    });

    describe('assertHasTouchTargetSize', () => {
      it('passes for sufficient size', () => {
        const element = {
          props: { style: { width: 48, height: 48 } },
        };

        const result = a11yTestHelpers.assertHasTouchTargetSize(element);
        expect(result.pass).toBe(true);
      });

      it('fails for small size', () => {
        const element = {
          props: { style: { width: 20, height: 20 } },
        };

        const result = a11yTestHelpers.assertHasTouchTargetSize(element);
        expect(result.pass).toBe(false);
        expect(result.message).toContain('too small');
      });
    });

    describe('assertColorContrast', () => {
      it('passes for high contrast', () => {
        const result = a11yTestHelpers.assertColorContrast('#000000', '#FFFFFF', 'AA');
        expect(result.pass).toBe(true);
      });

      it('fails for low contrast', () => {
        const result = a11yTestHelpers.assertColorContrast('#CCCCCC', '#FFFFFF', 'AA');
        expect(result.pass).toBe(false);
      });

      it('validates AAA level', () => {
        const result = a11yTestHelpers.assertColorContrast('#000000', '#FFFFFF', 'AAA');
        expect(result.pass).toBe(true);

        const aaResult = a11yTestHelpers.assertColorContrast('#767676', '#FFFFFF', 'AAA');
        expect(aaResult.pass).toBe(false); // Passes AA but not AAA
      });

      it('handles large text threshold', () => {
        const result = a11yTestHelpers.assertColorContrast('#8A8A8A', '#FFFFFF', 'AA', true);
        expect(result.pass).toBe(true); // 3:1 threshold for large text
      });
    });
  });
});
