import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, staticFile } from 'remotion';

export const Product = ({ imageSrc }) => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();

  const blur = interpolate(
    frame,
    [0, fps * 2, durationInFrames - fps * 1, durationInFrames],
    [20,      0,                          0,               15],
    { extrapolateRight: 'clamp' }
  );

  const scale = interpolate(
    frame,
    [0, durationInFrames * 0.7, durationInFrames],
    [0.8,                  1.25,             0.85],
    { extrapolateRight: 'clamp' }
  );

  const rotate = interpolate(
    frame,
    [0, durationInFrames * 0.7, durationInFrames],
    [7,                      -7,               0],
    { extrapolateRight: 'clamp' }
  );

  // Пик на 70% — вспышка за 10 кадров до и после
  const peakFrame = durationInFrames * 0.7;
  const flashOpacity = interpolate(
    frame,
    [peakFrame - 10, peakFrame, peakFrame + 10],
    [0,                    0.2,              0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill style={{
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: '15%',
      paddingBottom: '25%',
    }}>
      <img
        src={staticFile(imageSrc)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          transform: `scale(${scale}) rotate(${rotate}deg)`,
          filter: `blur(${blur}px)`,
        }}
      />

      {/* Цветной overlay — жёлтая вспышка в пике */}
      <AbsoluteFill style={{
        background: '#FFE600',
        opacity: flashOpacity,
        pointerEvents: 'none',
      }} />
    </AbsoluteFill>
  );
};