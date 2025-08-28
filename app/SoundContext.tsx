// app/context/SoundContext.tsx
import { Audio } from 'expo-av';
import React, { createContext, useContext, useEffect, useState } from 'react';

type SoundContextType = {
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
  playClick: () => void;
};

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export const SoundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [clickSound, setClickSound] = useState<Audio.Sound | null>(null);

  useEffect(() => {
    const loadSound = async () => {
      const { sound } = await Audio.Sound.createAsync(require('../assets/click.wav'));
      setClickSound(sound);
    };
    loadSound();
    return () => {
      if (clickSound) clickSound.unloadAsync();
    };
  }, []);

  const playClick = async () => {
    if (soundEnabled && clickSound) await clickSound.replayAsync();
  };

  return (
    <SoundContext.Provider value={{ soundEnabled, setSoundEnabled, playClick }}>
      {children}
    </SoundContext.Provider>
  );
};

export const useSound = () => {
  const context = useContext(SoundContext);
  if (!context) throw new Error('useSound must be used within SoundProvider');
  return context;
};
