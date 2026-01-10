/**
 * Bottom Sheet Component
 *
 * Wrapper around @gorhom/bottom-sheet with sensible defaults
 * Provides a swipeable bottom sheet for modal content
 */

import GorhomBottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
  type BottomSheetProps as GorhomBottomSheetProps,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { forwardRef, useCallback, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface BottomSheetProps extends Partial<GorhomBottomSheetProps> {
  /**
   * Snap points for the bottom sheet
   * Can be percentages or pixel values
   * @example ['25%', '50%', '90%']
   */
  snapPoints?: (string | number)[];

  /**
   * Show backdrop when open
   * @default true
   */
  showBackdrop?: boolean;

  /**
   * Enable dismiss on backdrop press
   * @default true
   */
  backdropDismiss?: boolean;

  /**
   * Title for the bottom sheet (optional)
   */
  title?: string;

  /**
   * Content to render inside the bottom sheet
   */
  children: React.ReactNode;
}

/**
 * Bottom Sheet Component
 *
 * @example
 * ```tsx
 * const bottomSheetRef = useRef<BottomSheet>(null);
 *
 * // Open bottom sheet
 * bottomSheetRef.current?.expand();
 *
 * // Close bottom sheet
 * bottomSheetRef.current?.close();
 *
 * return (
 *   <BottomSheet
 *     ref={bottomSheetRef}
 *     snapPoints={['25%', '50%', '90%']}
 *     title="Select an option"
 *   >
 *     <View>
 *       <Text>Bottom sheet content</Text>
 *     </View>
 *   </BottomSheet>
 * );
 * ```
 */
export const BottomSheet = forwardRef<GorhomBottomSheet, BottomSheetProps>(
  (
    {
      snapPoints: snapPointsProp,
      showBackdrop = true,
      backdropDismiss = true,
      title,
      children,
      ...props
    },
    ref
  ) => {
    const snapPoints = useMemo(() => snapPointsProp || ['25%', '50%', '90%'], [snapPointsProp]);

    const renderBackdrop = useCallback(
      (backdropProps: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...backdropProps}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          enableTouchThrough={!backdropDismiss}
        />
      ),
      [backdropDismiss]
    );

    return (
      <GorhomBottomSheet
        ref={ref}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={showBackdrop ? renderBackdrop : undefined}
        {...props}
      >
        <BottomSheetView style={styles.contentContainer}>
          {title && (
            <View style={styles.header}>
              <View style={styles.handle} />
              <Text style={styles.title}>{title}</Text>
            </View>
          )}
          {children}
        </BottomSheetView>
      </GorhomBottomSheet>
    );
  }
);

BottomSheet.displayName = 'BottomSheet';

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  handle: {
    width: 32,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#d1d5db',
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
  },
});
