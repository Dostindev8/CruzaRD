interface Props {
  name: string;
  targetScore: number;
  currentScore: number;
}

/**
 * Rival objective tag (prompt §3.2, simple alternative): shows the leaderboard rival
 * the player is chasing. Not a live multiplayer peer — no socket, no position sync.
 */
export function RivalTag({ name, targetScore, currentScore }: Props) {
  const passed = currentScore >= targetScore;
  return (
    <div className={`rival-tag${passed ? ' is-passed' : ''}`} aria-live="polite">
      <span>{name}</span>
      <span className="rival-tag-score">
        {passed ? '¡Superado!' : targetScore.toLocaleString('es-DO')}
      </span>
    </div>
  );
}
