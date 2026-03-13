import { Composition } from 'remotion';
import { VideoComp } from './VideoComp.jsx';

const FPS = 30;

export const RemotionRoot = () => (
  <Composition
    id="VideoAd"
    component={VideoComp}
    durationInFrames={390}  // запасное значение, перезапишется через inputProps
    fps={FPS}
    width={1080}
    height={1920}
    defaultProps={{
      input: {
        name: '',
        oldPrice: '',
        newPrice: '',
        image: 'product.png',
      },
      words: [],
      audioSrc: 'voice.mp3'
    }}
  />
);