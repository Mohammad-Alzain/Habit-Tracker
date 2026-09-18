import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  Animated,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { ThemeColors } from '../../constants/theme';
import { BlurOverlay } from './BlurOverlay';

export interface FrostedDialogModalProps {
  visible: boolean;
  theme: ThemeColors;
  onClose?: () => void;
  children: React.ReactNode;
  avoidKeyboard?: boolean;
  dismissibleOnTouchOutside?: boolean;
  blurTarget?: React.RefObject<any>;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

export const FrostedDialogModal: React.FC<FrostedDialogModalProps> = ({
  visible,
  theme,
  onClose,
  children,
  avoidKeyboard = false,
  dismissibleOnTouchOutside = true,
  blurTarget,
  style,
  contentContainerStyle,
}) => {
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        damping: 24,
        stiffness: 300,
        useNativeDriver: true,
      }).start();
    } else {
      scaleAnim.setValue(0.95);
    }
  }, [visible, scaleAnim]);

  const content = (
    <TouchableWithoutFeedback onPress={dismissibleOnTouchOutside && onClose ? onClose : undefined}>
      <View style={[styles.touchableBackdrop, contentContainerStyle]}>
        <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
          <Animated.View
            style={[
              styles.dialogCardWrapper,
              style,
              {
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            {children}
          </Animated.View>
        </TouchableWithoutFeedback>
      </View>
    </TouchableWithoutFeedback>
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <BlurOverlay theme={theme} blurTarget={blurTarget} style={StyleSheet.absoluteFill}>
        {avoidKeyboard ? (
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.keyboardContainer}
          >
            {content}
          </KeyboardAvoidingView>
        ) : (
          content
        )}
      </BlurOverlay>
    </Modal>
  );
};

const styles = StyleSheet.create({
  touchableBackdrop: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  dialogCardWrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyboardContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

