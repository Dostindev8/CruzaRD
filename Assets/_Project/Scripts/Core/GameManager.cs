// Purpose: Single entry point for run lifecycle — start, pause, game over, restart.
// Communicates only via EventBus; never holds direct UI references.

using CruzaRD.Gameplay;
using UnityEngine;

namespace CruzaRD.Core
{
    public enum GameState
    {
        Boot,
        Menu,
        Playing,
        Paused,
        GameOver
    }

    public sealed class GameManager : MonoBehaviour
    {
        public static GameManager Instance { get; private set; }

        [SerializeField] private int _targetFrameRate = 60;
        [SerializeField] private bool _neverSleep = true;

        public GameState State { get; private set; } = GameState.Boot;
        public int CurrentRunId { get; private set; }
        public int Score { get; private set; }
        public int DistanceMeters { get; private set; }
        public int PapeletasThisRun { get; private set; }
        public int Combo { get; private set; }
        public int ComboMax { get; private set; }
        public int ScoreMultiplier { get; private set; } = 1;
        public bool CanRevive { get; private set; } = true;

        private float _distanceAccum;
        private ScoreTracker _scoreTracker;

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }

            Instance = this;
            DontDestroyOnLoad(gameObject);

            Application.targetFrameRate = _targetFrameRate;
            QualitySettings.vSyncCount = 0;
            if (_neverSleep)
                Screen.sleepTimeout = SleepTimeout.NeverSleep;

            _scoreTracker = new ScoreTracker();
        }

        private void OnEnable()
        {
            EventBus.Subscribe<ItemCollectedEvent>(OnItemCollected);
            EventBus.Subscribe<ReviveCompletedEvent>(OnReviveCompleted);
        }

        private void OnDisable()
        {
            EventBus.Unsubscribe<ItemCollectedEvent>(OnItemCollected);
            EventBus.Unsubscribe<ReviveCompletedEvent>(OnReviveCompleted);
        }

        private void Update()
        {
            if (State != GameState.Playing)
                return;

            // 1 cell forward ≈ 1 meter for prototype scoring
            _distanceAccum += Time.deltaTime * 2.5f;
            var meters = Mathf.FloorToInt(_distanceAccum);
            if (meters != DistanceMeters)
            {
                DistanceMeters = meters;
                EventBus.Publish(new DistanceChangedEvent(DistanceMeters));
                AddScore(1);
            }
        }

        public void StartRun()
        {
            CurrentRunId++;
            Score = 0;
            DistanceMeters = 0;
            PapeletasThisRun = 0;
            Combo = 0;
            ComboMax = 0;
            ScoreMultiplier = 1;
            CanRevive = true;
            _distanceAccum = 0f;
            _scoreTracker.Reset();
            Time.timeScale = 1f;
            State = GameState.Playing;

            EventBus.Publish(new GameStartedEvent(CurrentRunId));
            EventBus.Publish(new ScoreChangedEvent(Score, ScoreMultiplier));
            EventBus.Publish(new DistanceChangedEvent(0));
            EventBus.Publish(new ComboChangedEvent(0, 1));
        }

        public void PauseGame()
        {
            if (State != GameState.Playing)
                return;

            State = GameState.Paused;
            Time.timeScale = 0f;
            EventBus.Publish(new GamePausedEvent(true));
        }

        public void ResumeGame()
        {
            if (State != GameState.Paused)
                return;

            State = GameState.Playing;
            Time.timeScale = 1f;
            EventBus.Publish(new GamePausedEvent(false));
        }

        public void TriggerGameOver()
        {
            if (State != GameState.Playing)
                return;

            State = GameState.GameOver;
            Time.timeScale = 0f;
            EventBus.Publish(new GameOverEvent(Score, DistanceMeters, PapeletasThisRun, ComboMax));
        }

        public void RestartRun()
        {
            Time.timeScale = 1f;
            EventBus.Publish(new GameRestartedEvent());
            StartRun();
        }

        public void RequestRevive()
        {
            if (!CanRevive || State != GameState.GameOver)
                return;

            EventBus.Publish(new ReviveRequestedEvent());
        }

        private void OnReviveCompleted(ReviveCompletedEvent evt)
        {
            if (!evt.Success || State != GameState.GameOver)
                return;

            CanRevive = false;
            State = GameState.Playing;
            Time.timeScale = 1f;
            EventBus.Publish(new GamePausedEvent(false));
        }

        public void RegisterForwardStep()
        {
            if (State != GameState.Playing)
                return;

            Combo++;
            if (Combo > ComboMax)
                ComboMax = Combo;

            ScoreMultiplier = _scoreTracker.MultiplierFromCombo(Combo);
            EventBus.Publish(new ComboChangedEvent(Combo, ScoreMultiplier));
            AddScore(10);
        }

        public void BreakCombo()
        {
            Combo = 0;
            ScoreMultiplier = 1;
            EventBus.Publish(new ComboChangedEvent(0, 1));
        }

        private void OnItemCollected(ItemCollectedEvent evt)
        {
            if (State != GameState.Playing)
                return;

            if (evt.ItemId == "papeleta")
            {
                PapeletasThisRun += evt.Amount;
                AddScore(25 * evt.Amount);
            }
            else if (evt.ItemId == "mangu")
            {
                // Mangú restores combo multiplier
                Combo = Mathf.Max(Combo, 5);
                ScoreMultiplier = _scoreTracker.MultiplierFromCombo(Combo);
                EventBus.Publish(new ComboChangedEvent(Combo, ScoreMultiplier));
                AddScore(50);
            }
            else
            {
                AddScore(40);
            }
        }

        private void AddScore(int basePoints)
        {
            Score += basePoints * ScoreMultiplier;
            EventBus.Publish(new ScoreChangedEvent(Score, ScoreMultiplier));
        }

        public void GoToMenu()
        {
            Time.timeScale = 1f;
            State = GameState.Menu;
        }
    }

    /// <summary>Pure score math — unit-testable without Unity scene.</summary>
    public sealed class ScoreTracker
    {
        public void Reset() { }

        public int MultiplierFromCombo(int combo)
        {
            if (combo >= 30) return 5;
            if (combo >= 20) return 4;
            if (combo >= 10) return 3;
            if (combo >= 5) return 2;
            return 1;
        }
    }
}
