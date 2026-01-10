/**
 * React Hook for Accessibility Auditing
 *
 * Usage:
 * ```tsx
 * const { audit, report, issues } = useAccessibilityAudit();
 *
 * // Audit a button
 * audit.interactiveElement({
 *   label: 'Submit',
 *   width: 48,
 *   height: 48,
 *   foreground: '#000',
 *   background: '#FFF',
 *   elementName: 'Submit Button'
 * });
 *
 * // Get report
 * const finalReport = report();
 * ```
 */

import { useRef, useCallback, useMemo } from 'react';
import { AccessibilityAuditor } from '@/lib/accessibility';
import type { AccessibilityReport, AccessibilityIssue } from '@/lib/accessibility';

export interface UseAccessibilityAuditReturn {
  /**
   * Auditing methods
   */
  audit: {
    colorContrast: (
      foreground: string,
      background: string,
      elementName: string,
      isLargeText?: boolean
    ) => void;
    accessibilityLabel: (label: string | undefined, elementName: string) => void;
    touchTargetSize: (width: number, height: number, elementName: string) => void;
    interactiveElement: (config: {
      label?: string;
      width: number;
      height: number;
      foreground?: string;
      background?: string;
      elementName: string;
      isLargeText?: boolean;
    }) => void;
  };

  /**
   * Get current issues
   */
  issues: AccessibilityIssue[];

  /**
   * Generate report
   */
  report: () => AccessibilityReport;

  /**
   * Reset auditor
   */
  reset: () => void;
}

/**
 * Hook for accessibility auditing in components
 */
export function useAccessibilityAudit(): UseAccessibilityAuditReturn {
  const auditorRef = useRef(new AccessibilityAuditor());

  const auditMethods = useMemo(
    () => ({
      colorContrast: (
        foreground: string,
        background: string,
        elementName: string,
        isLargeText = false
      ) => {
        auditorRef.current.auditColorContrast(
          foreground,
          background,
          elementName,
          isLargeText
        );
      },

      accessibilityLabel: (label: string | undefined, elementName: string) => {
        auditorRef.current.auditAccessibilityLabel(label, elementName);
      },

      touchTargetSize: (width: number, height: number, elementName: string) => {
        auditorRef.current.auditTouchTargetSize(width, height, elementName);
      },

      interactiveElement: (config: {
        label?: string;
        width: number;
        height: number;
        foreground?: string;
        background?: string;
        elementName: string;
        isLargeText?: boolean;
      }) => {
        auditorRef.current.auditInteractiveElement(config);
      },
    }),
    []
  );

  const getIssues = useCallback(() => {
    return auditorRef.current.getIssues();
  }, []);

  const generateReport = useCallback(() => {
    return auditorRef.current.generateReport();
  }, []);

  const reset = useCallback(() => {
    auditorRef.current.reset();
  }, []);

  return {
    audit: auditMethods,
    issues: getIssues(),
    report: generateReport,
    reset,
  };
}
