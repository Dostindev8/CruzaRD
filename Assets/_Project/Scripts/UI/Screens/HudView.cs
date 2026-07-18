// Purpose: In-run HUD — score, distance, combo, papeletas, pause. Anchors + Safe Area.

using CruzaRD.Core;
using CruzaRD.UI.Components;
using TMPro;
using UnityEngine;
using UnityEngine.UI;

namespace CruzaRD.UI.Screens
{
    public sealed class HudView : MonoBehaviour
    {
        [SerializeField] private TextMeshProUGUI _scoreText;
        [SerializeField] private TextMeshProUGUI _distanceText;
        [SerializeField] private TextMeshProUGUI _comboText;
        [SerializeField] private TextMeshProUGUI _papeletasText;
        [SerializeField] private Button _pauseButton;
        [SerializeField] private GameObject _root;

        private int _papeletas;
        private AnimatedCounter _scoreCounter;

        private void Awake()
        {
            if (_root == null) _root = gameObject;
            if (_pauseButton != null)
                _pauseButton.onClick.AddListener(OnPause);
            EnsureScoreCounter();
        }

        // Conteo animado del puntaje (GDD v3 §11.2) — nunca salto instantáneo
        private void EnsureScoreCounter()
        {
            if (_scoreCounter != null || _scoreText == null)
                return;

            _scoreCounter = gameObject.GetComponent<AnimatedCounter>() ?? gameObject.AddComponent<AnimatedCounter>();
            _scoreCounter.Bind(_scoreText);
        }

        private void OnEnable()
        {
            EventBus.Subscribe<ScoreChangedEvent>(OnScore);
            EventBus.Subscribe<DistanceChangedEvent>(OnDistance);
            EventBus.Subscribe<ComboChangedEvent>(OnCombo);
            EventBus.Subscribe<ItemCollectedEvent>(OnItem);
            EventBus.Subscribe<GameStartedEvent>(OnStarted);
            EventBus.Subscribe<GameOverEvent>(OnGameOver);
            SetVisible(false);
        }

        private void OnDisable()
        {
            EventBus.Unsubscribe<ScoreChangedEvent>(OnScore);
            EventBus.Unsubscribe<DistanceChangedEvent>(OnDistance);
            EventBus.Unsubscribe<ComboChangedEvent>(OnCombo);
            EventBus.Unsubscribe<ItemCollectedEvent>(OnItem);
            EventBus.Unsubscribe<GameStartedEvent>(OnStarted);
            EventBus.Unsubscribe<GameOverEvent>(OnGameOver);
        }

        private void OnStarted(GameStartedEvent _)
        {
            _papeletas = 0;
            SetVisible(true);
            RefreshPapeletas();
            EnsureScoreCounter();
            _scoreCounter?.SetImmediate(0);
        }

        private void OnGameOver(GameOverEvent _) => SetVisible(false);

        private void OnScore(ScoreChangedEvent e)
        {
            EnsureScoreCounter();
            if (_scoreCounter != null)
                _scoreCounter.SetValue(e.Score);
            else if (_scoreText != null)
                _scoreText.text = e.Score.ToString("N0");
        }

        private void OnDistance(DistanceChangedEvent e)
        {
            if (_distanceText != null)
                _distanceText.text = $"{e.DistanceMeters} m";
        }

        private void OnCombo(ComboChangedEvent e)
        {
            if (_comboText == null) return;
            _comboText.gameObject.SetActive(e.Combo > 0);
            _comboText.text = e.Combo > 0 ? $"x{e.Multiplier}  ·  {e.Combo}" : string.Empty;
        }

        private void OnItem(ItemCollectedEvent e)
        {
            if (e.ItemId != "papeleta") return;
            _papeletas += e.Amount;
            RefreshPapeletas();
        }

        private void RefreshPapeletas()
        {
            if (_papeletasText != null)
                _papeletasText.text = _papeletas.ToString();
        }

        private void OnPause()
        {
            if (GameManager.Instance == null) return;
            if (GameManager.Instance.State == GameState.Playing)
                GameManager.Instance.PauseGame();
            else if (GameManager.Instance.State == GameState.Paused)
                GameManager.Instance.ResumeGame();
        }

        public void SetVisible(bool visible)
        {
            if (_root != null) _root.SetActive(visible);
        }

        public void Bind(TextMeshProUGUI score, TextMeshProUGUI distance, TextMeshProUGUI combo,
            TextMeshProUGUI papeletas, Button pause, GameObject root)
        {
            _scoreText = score;
            _distanceText = distance;
            _comboText = combo;
            _papeletasText = papeletas;
            _pauseButton = pause;
            _root = root;
            _scoreCounter = null;
            EnsureScoreCounter();
            if (_pauseButton != null)
            {
                _pauseButton.onClick.RemoveListener(OnPause);
                _pauseButton.onClick.AddListener(OnPause);
            }
        }
    }
}
