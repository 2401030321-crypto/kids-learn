import { memo } from "react";

type SkySceneProps = {
  isSpeaking: boolean;
};

function SkyScene({ isSpeaking }: SkySceneProps) {
  return (
    <div className="skybot-wrap" aria-label="SkyBuddy animated bot" role="img">
      <div className={`skybot-aura ${isSpeaking ? "skybot-aura-speaking" : ""}`} />
      <div className="skybot-body">
        <div className="skybot-eyes">
          <span className="skybot-eye" />
          <span className="skybot-eye" />
        </div>
        <div className={`skybot-mouth ${isSpeaking ? "skybot-mouth-speaking" : ""}`} />
      </div>
    </div>
  );
}

export default memo(SkyScene);
