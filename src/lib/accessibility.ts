/**
 * Accessibility Testing Utilities
 *
 * Features:
 * - WCAG 2.1 compliance checking
 * - Color contrast validation
 * - Screen reader testing helpers
 * - Accessibility label validation
 * - Focus management testing
 * - Touch target size validation
 */

import { AccessibilityInfo, Platform } from 'react-native';

// WCAG 2.1 Level AA requires 4.5:1 for normal text, 3:1 for large text
export const WCAG_CONTRAST_RATIOS = {
  AA_NORMAL: 4.5,
  AA_LARGE: 3.0,
  AAA_NORMAL: 7.0,
  AAA_LARGE: 4.5,
};

// Minimum touch target size (44x44 for iOS, 48x48 for Android)
export const MIN_TOUCH_TARGET_SIZE = Platform.select({
  ios: { width: 44, height: 44 },
  android: { width: 48, height: 48 },
  default: { width: 44, height: 44 },
});

export interface ColorContrastResult {
  ratio: number;
  passesAA: boolean;
  passesAAA: boolean;
  level: 'AAA' | 'AA' | 'Fail';
}

export interface AccessibilityIssue {
  type: 'contrast' | 'label' | 'touchTarget' | 'focus' | 'screenReader';
  severity: 'error' | 'warning' | 'info';
  message: string;
  element?: string;
  suggestion?: string;
}

export interface AccessibilityReport {
  passed: boolean;
  issues: AccessibilityIssue[];
  score: number; // 0-100
  wcagLevel: 'AAA' | 'AA' | 'A' | 'Fail';
}

/**
 * Convert hex color to RGB
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: Number.parseInt(result[1], 16),
        g: Number.parseInt(result[2], 16),
        b: Number.parseInt(result[3], 16),
      }
    : null;
}

/**
 * Calculate relative luminance
 * https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 */
export function getRelativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((channel) => {
    const sRGB = channel / 255;
    return sRGB <= 0.03928 ? sRGB / 12.92 : ((sRGB + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 * https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio
 */
export function getContrastRatio(foreground: string, background: string): number | null {
  const fg = hexToRgb(foreground);
  const bg = hexToRgb(background);

  if (!fg || !bg) {
    console.warn('[Accessibility] Invalid color format for contrast calculation', {
      foreground,
      background,
    });
    return null;
  }

  const l1 = getRelativeLuminance(fg.r, fg.g, fg.b);
  const l2 = getRelativeLuminance(bg.r, bg.g, bg.b);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Validate color contrast against WCAG standards
 */
export function validateColorContrast(
  foreground: string,
  background: string,
  isLargeText = false
): ColorContrastResult {
  const ratio = getContrastRatio(foreground, background);

  if (ratio === null) {
    return {
      ratio: 0,
      passesAA: false,
      passesAAA: false,
      level: 'Fail',
    };
  }

  const aaThreshold = isLargeText ? WCAG_CONTRAST_RATIOS.AA_LARGE : WCAG_CONTRAST_RATIOS.AA_NORMAL;
  const aaaThreshold = isLargeText
    ? WCAG_CONTRAST_RATIOS.AAA_LARGE
    : WCAG_CONTRAST_RATIOS.AAA_NORMAL;

  const passesAA = ratio >= aaThreshold;
  const passesAAA = ratio >= aaaThreshold;

  let level: 'AAA' | 'AA' | 'Fail';
  if (passesAAA) {
    level = 'AAA';
  } else if (passesAA) {
    level = 'AA';
  } else {
    level = 'Fail';
  }

  return {
    ratio,
    passesAA,
    passesAAA,
    level,
  };
}

/**
 * Validate touch target size
 */
export function validateTouchTargetSize(
  width: number,
  height: number
): { valid: boolean; message?: string } {
  const minSize = MIN_TOUCH_TARGET_SIZE;

  if (width < minSize.width || height < minSize.height) {
    return {
      valid: false,
      message: `Touch target too small: ${width}x${height}. Minimum is ${minSize.width}x${minSize.height}`,
    };
  }

  return { valid: true };
}

/**
 * Validate accessibility label
 */
export function validateAccessibilityLabel(label: string | undefined): {
  valid: boolean;
  message?: string;
} {
  if (!label || label.trim().length === 0) {
    return {
      valid: false,
      message: 'Missing accessibility label',
    };
  }

  if (label.length > 100) {
    return {
      valid: false,
      message: `Accessibility label too long (${label.length} characters). Keep it concise.`,
    };
  }

  // Check for unhelpful labels
  const unhelpfulPatterns = [/^button$/i, /^image$/i, /^icon$/i, /^tap here$/i, /^click here$/i];

  for (const pattern of unhelpfulPatterns) {
    if (pattern.test(label)) {
      return {
        valid: false,
        message: `Accessibility label "${label}" is not descriptive enough`,
      };
    }
  }

  return { valid: true };
}

/**
 * Check if screen reader is enabled
 */
export async function isScreenReaderEnabled(): Promise<boolean> {
  try {
    return await AccessibilityInfo.isScreenReaderEnabled();
  } catch (error) {
    console.error('[Accessibility] Failed to check screen reader status', error);
    return false;
  }
}

/**
 * Announce message to screen reader
 */
export function announceForAccessibility(message: string): void {
  try {
    AccessibilityInfo.announceForAccessibility(message);
    console.debug('[Accessibility] Screen reader announcement', { message });
  } catch (error) {
    console.error('[Accessibility] Failed to announce for accessibility', { message }, error);
  }
}

/**
 * Set accessibility focus to element
 */
export function setAccessibilityFocus(reactTag: number): void {
  try {
    AccessibilityInfo.setAccessibilityFocus(reactTag);
  } catch (error) {
    console.error('[Accessibility] Failed to set accessibility focus', { reactTag }, error);
  }
}

/**
 * Generate accessibility report for component
 */
export class AccessibilityAuditor {
  private issues: AccessibilityIssue[] = [];

  /**
   * Audit color contrast
   */
  auditColorContrast(
    foreground: string,
    background: string,
    elementName: string,
    isLargeText = false
  ): void {
    const result = validateColorContrast(foreground, background, isLargeText);

    if (!result.passesAA) {
      this.issues.push({
        type: 'contrast',
        severity: 'error',
        message: `Poor color contrast: ${result.ratio.toFixed(2)}:1 (needs ${
          isLargeText ? WCAG_CONTRAST_RATIOS.AA_LARGE : WCAG_CONTRAST_RATIOS.AA_NORMAL
        }:1)`,
        element: elementName,
        suggestion: 'Increase contrast between foreground and background colors',
      });
    } else if (!result.passesAAA) {
      this.issues.push({
        type: 'contrast',
        severity: 'warning',
        message: `Contrast could be improved: ${result.ratio.toFixed(2)}:1 (AAA requires ${
          isLargeText ? WCAG_CONTRAST_RATIOS.AAA_LARGE : WCAG_CONTRAST_RATIOS.AAA_NORMAL
        }:1)`,
        element: elementName,
        suggestion: 'Consider improving contrast for AAA compliance',
      });
    }
  }

  /**
   * Audit accessibility label
   */
  auditAccessibilityLabel(label: string | undefined, elementName: string): void {
    const result = validateAccessibilityLabel(label);

    if (!result.valid) {
      this.issues.push({
        type: 'label',
        severity: 'error',
        message: result.message || 'Invalid accessibility label',
        element: elementName,
        suggestion: 'Add a clear, concise accessibility label describing the element',
      });
    }
  }

  /**
   * Audit touch target size
   */
  auditTouchTargetSize(width: number, height: number, elementName: string): void {
    const result = validateTouchTargetSize(width, height);

    if (!result.valid) {
      this.issues.push({
        type: 'touchTarget',
        severity: 'error',
        message: result.message || 'Touch target too small',
        element: elementName,
        suggestion: `Increase size to at least ${MIN_TOUCH_TARGET_SIZE.width}x${MIN_TOUCH_TARGET_SIZE.height}`,
      });
    }
  }

  /**
   * Audit interactive element
   */
  auditInteractiveElement(config: {
    label?: string;
    width: number;
    height: number;
    foreground?: string;
    background?: string;
    elementName: string;
    isLargeText?: boolean;
  }): void {
    // Check label
    this.auditAccessibilityLabel(config.label, config.elementName);

    // Check touch target
    this.auditTouchTargetSize(config.width, config.height, config.elementName);

    // Check contrast if colors provided
    if (config.foreground && config.background) {
      this.auditColorContrast(
        config.foreground,
        config.background,
        config.elementName,
        config.isLargeText
      );
    }
  }

  /**
   * Generate final report
   */
  generateReport(): AccessibilityReport {
    const totalIssues = this.issues.length;
    const errors = this.issues.filter((i) => i.severity === 'error').length;
    const warnings = this.issues.filter((i) => i.severity === 'warning').length;

    // Calculate score (100 - deductions)
    let score = 100;
    score -= errors * 20; // Each error costs 20 points
    score -= warnings * 5; // Each warning costs 5 points
    score = Math.max(0, score);

    // Determine WCAG level
    let wcagLevel: 'AAA' | 'AA' | 'A' | 'Fail';
    if (errors === 0 && warnings === 0) {
      wcagLevel = 'AAA';
    } else if (errors === 0) {
      wcagLevel = 'AA';
    } else if (errors <= 2) {
      wcagLevel = 'A';
    } else {
      wcagLevel = 'Fail';
    }

    const passed = errors === 0;

    console.info('[Accessibility] Audit completed', {
      totalIssues,
      errors,
      warnings,
      score,
      wcagLevel,
    });

    return {
      passed,
      issues: this.issues,
      score,
      wcagLevel,
    };
  }

  /**
   * Clear all issues
   */
  reset(): void {
    this.issues = [];
  }

  /**
   * Get issues
   */
  getIssues(): AccessibilityIssue[] {
    return this.issues;
  }
}

/**
 * Accessibility testing helpers for Jest
 */
interface TestElement {
  props?: {
    accessibilityLabel?: string;
    style?: {
      width?: number;
      height?: number;
    };
  };
}

export const a11yTestHelpers = {
  /**
   * Assert element has accessibility label
   */
  assertHasAccessibilityLabel(
    element: TestElement,
    expectedLabel?: string
  ): { pass: boolean; message: string } {
    const label = element.props?.accessibilityLabel;

    if (!label) {
      return {
        pass: false,
        message: 'Element is missing accessibilityLabel',
      };
    }

    if (expectedLabel && label !== expectedLabel) {
      return {
        pass: false,
        message: `Expected label "${expectedLabel}" but got "${label}"`,
      };
    }

    const validation = validateAccessibilityLabel(label);
    if (!validation.valid) {
      return {
        pass: false,
        message: validation.message || 'Invalid accessibility label',
      };
    }

    return {
      pass: true,
      message: `Element has valid accessibility label: "${label}"`,
    };
  },

  /**
   * Assert element has proper touch target size
   */
  assertHasTouchTargetSize(element: TestElement): { pass: boolean; message: string } {
    const style = element.props?.style || {};
    const width = style.width || 0;
    const height = style.height || 0;

    const validation = validateTouchTargetSize(width, height);

    return {
      pass: validation.valid,
      message: validation.message || `Touch target size is valid: ${width}x${height}`,
    };
  },

  /**
   * Assert color contrast meets WCAG standards
   */
  assertColorContrast(
    foreground: string,
    background: string,
    level: 'AA' | 'AAA' = 'AA',
    isLargeText = false
  ): { pass: boolean; message: string } {
    const result = validateColorContrast(foreground, background, isLargeText);

    const passes = level === 'AAA' ? result.passesAAA : result.passesAA;

    return {
      pass: passes,
      message: passes
        ? `Color contrast passes ${level} (${result.ratio.toFixed(2)}:1)`
        : `Color contrast fails ${level} (${result.ratio.toFixed(2)}:1)`,
    };
  },
};

// Export singleton auditor
export const accessibilityAuditor = new AccessibilityAuditor();
