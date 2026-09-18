import React, { createContext, useContext } from 'react';
import { View } from 'react-native';

export const BlurTargetContext = createContext<React.RefObject<View | null> | null>(null);

export const useBlurTarget = () => useContext(BlurTargetContext);
