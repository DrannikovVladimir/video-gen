import { Composition } from 'remotion';
import { VideoComp } from './VideoComp.jsx';
import inputData from '../../input.json' assert { type: 'json' };
import wordTimings from '../../tmp/words.json' assert { type: 'json' };

const FPS = 30;
const DURATION_SEC = wordTimings[wordTimings.length - 1].end + 1;
const DURATION_FRAMES = Math.ceil(DURATION_SEC * FPS);

export const RemotionRoot = () => (
  <Composition
    id="VideoAd"
    component={VideoComp}
    durationInFrames={DURATION_FRAMES}
    fps={FPS}
    width={1080}
    height={1920}
    defaultProps={{
      input: inputData,
      words: wordTimings,
      audioSrc: '../../tmp/voice.mp3'
    }}
  />
);