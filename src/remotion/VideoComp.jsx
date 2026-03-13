import { AbsoluteFill, Audio, staticFile, useVideoConfig, interpolate } from 'remotion';
import { Background } from './components/Background.jsx';
import { Product } from './components/Product.jsx';
import { Subtitles } from './components/Subtitles.jsx';

export const VideoComp = ({ input, words, musicClip }) => {
  const { durationInFrames, fps } = useVideoConfig();

  // Нарастание 1 сек в начале, затухание 1 сек в конце
  const musicVolume = (frame) => interpolate(
    frame,
    [0, fps * 1, durationInFrames - fps * 1, durationInFrames],
    [0, 0.12,                          0.12,                0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill>
      <Background />
      <Product imageSrc={input.image} />
      <Subtitles words={words} />
      <Audio src={staticFile('voice.mp3')} />
      {musicClip && (
        <Audio src={staticFile(musicClip)} volume={musicVolume} />
      )}
    </AbsoluteFill>
  );
};