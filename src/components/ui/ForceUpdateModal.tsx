/**
 * Force Update Modal Component
 *
 * Displays a modal prompting users to update the app
 * Supports both required and optional updates
 */

import type { VersionInfo } from '@/services/forceUpdate';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

interface ForceUpdateModalProps {
  /**
   * Whether modal is visible
   */
  visible: boolean;

  /**
   * Version information
   */
  versionInfo: VersionInfo;

  /**
   * Callback when update button is pressed
   */
  onUpdate: () => void;

  /**
   * Callback when later button is pressed (optional updates only)
   */
  onLater?: () => void;

  /**
   * Custom title
   */
  title?: string;

  /**
   * Custom message
   */
  message?: string;
}

/**
 * Force Update Modal Component
 *
 * @example
 * ```tsx
 * const [showUpdate, setShowUpdate] = useState(false);
 * const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null);
 *
 * useEffect(() => {
 *   const checkVersion = async () => {
 *     const info = await fetchVersionInfo();
 *     if (info && (info.updateRequired || info.updateRecommended)) {
 *       setVersionInfo(info);
 *       setShowUpdate(true);
 *     }
 *   };
 *   checkVersion();
 * }, []);
 *
 * if (!versionInfo) return null;
 *
 * <ForceUpdateModal
 *   visible={showUpdate}
 *   versionInfo={versionInfo}
 *   onUpdate={async () => {
 *     await openStore(versionInfo.storeUrl);
 *   }}
 *   onLater={() => setShowUpdate(false)}
 * />
 * ```
 */
export function ForceUpdateModal({
  visible,
  versionInfo,
  onUpdate,
  onLater,
  title,
  message,
}: ForceUpdateModalProps) {
  const isRequired = versionInfo.updateRequired;

  const defaultTitle = isRequired ? 'Update Required' : 'Update Available';

  const defaultMessage = isRequired
    ? `A new version of the app is available. Please update to version ${versionInfo.latestVersion} to continue.`
    : `Version ${versionInfo.latestVersion} is now available. Update now to get the latest features and improvements.`;

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.backdrop}>
        <View style={styles.container}>
          <Text style={styles.title}>{title || defaultTitle}</Text>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <Text style={styles.message}>{message || defaultMessage}</Text>

            {versionInfo.releaseNotes && (
              <View style={styles.releaseNotes}>
                <Text style={styles.releaseNotesTitle}>What&apos;s New:</Text>
                <Text style={styles.releaseNotesText}>{versionInfo.releaseNotes}</Text>
              </View>
            )}

            <View style={styles.versionInfo}>
              <Text style={styles.versionText}>Current Version: {versionInfo.currentVersion}</Text>
              <Text style={styles.versionText}>Latest Version: {versionInfo.latestVersion}</Text>
            </View>
          </ScrollView>

          <View style={styles.buttons}>
            <Pressable
              style={({ pressed }) => [styles.updateButton, pressed && styles.buttonPressed]}
              onPress={onUpdate}
            >
              <Text style={styles.updateButtonText}>Update Now</Text>
            </Pressable>

            {!isRequired && onLater && (
              <Pressable
                style={({ pressed }) => [styles.laterButton, pressed && styles.buttonPressed]}
                onPress={onLater}
              >
                <Text style={styles.laterButtonText}>Later</Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  content: {
    maxHeight: 300,
  },
  message: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
    marginBottom: 16,
  },
  releaseNotes: {
    backgroundColor: '#f3f4f6',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  releaseNotesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  releaseNotesText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  versionInfo: {
    gap: 4,
  },
  versionText: {
    fontSize: 14,
    color: '#9ca3af',
  },
  buttons: {
    marginTop: 24,
    gap: 12,
  },
  updateButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  updateButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  laterButton: {
    backgroundColor: 'transparent',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  laterButtonText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonPressed: {
    opacity: 0.7,
  },
});
