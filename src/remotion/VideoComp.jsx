import { AbsoluteFill, Audio, useVideoConfig } from 'remotion';
import { Background } from './components/Background.jsx';
import { Product } from './components/Product.jsx';
import { Subtitles } from './components/Subtitles.jsx';

export const VideoComp = ({ input, words, audioSrc }) => {
  return (
    <AbsoluteFill>
      <Background />
      <Product imageSrc={input.image} />
      <Subtitles words={words} />
      <Audio src={audioSrc} />
    </AbsoluteFill>
  );
};