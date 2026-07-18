// Purpose: Game-over summary — Revive (rewarded ad placeholder) + Play Again.
// v3: resumen con conteo animado de recompensas (GDD v3 §11.3), precedido por death-cam.

using CruzaRD.Core;
using CruzaRD.Services;
using CruzaRD.UI.Components;
using TMPro;
using UnityEngine;
using UnityEngine.UI;

namespace CruzaRD.UI.Screens
{
    public sealed class DeathScreenView : MonoBehaviour
    {
        [SerializeField] private GameObject _root;
        [SerializeField] private TextMeshProUGUI _titleText;
        [SerializeField] private TextMeshProUGUI _scoreText;
        [SerializeField] private TextMeshProUGUI _distanceText;
        [SerializeField] private TextMeshProUGUI _bestText;
        [SerializeField] private Button _reviveButton;
        [SerializeField] private Button _retryButton;
        [SerializeField] private Button _menuButton;
        [SerializeField] private TextMeshProUGUI _reviveLabel;

        private void Awake()
        {
            if (_root == null) _root = gameObject;
            WireButtons();
            SetVisible(false);
        }

        private void OnEnable()
        {
            EventBus.Subscribe<GameOverEvent>(OnGameOver);
            EventBus.Subscribe<GameStartedEvent>(_ => SetVisible(false));
            EventBus.Subscribe<ReviveCompletedEvent>(OnReviveDone);
        }

        private void OnDisable()
        {
            EventBus.Unsubscribe<GameOverEvent>(OnGameOver);
            EventBus.Unsubscribe<ReviveCompletedEvent>(OnReviveDone);
        }

        private void WireButtons()
        {
            if (_reviveButton != null) _reviveButton.onClick.AddListener(OnRevive);
            if (_retryButton != null) _retryButton.onClick.AddListener(OnRetry);
            if (_menuButton != null) _menuButton.onClick.AddListener(OnMenu);
        }

        private void OnGameOver(GameOverEvent e)
        {
            SetVisible(true);
            if (_titleText != null) _titleText.text = "¡QUÍTATE DEL MEDIO!";

            // Conteo animado del puntaje final — nunca salto instantáneo (GDD v3 §11.2)
            if (_scoreText != null)
            {
                var counter = _scoreText.GetComponent<AnimatedCounter>()
                              ?? _scoreText.gameObject.AddComponent<AnimatedCounter>();
                counter.Bind(_scoreText, "N0", " pts");
                counter.SetImmediate(0);
                counter.SetValue(e.Score);
            }

            if (_distanceText != null) _distanceText.text = $"Distancia: {e.DistanceMeters} m";

            if (ServiceLocator.TryGet<ISaveService>(out var save))
            {
                var data = save.Data;
                if (e.Score > data.BestScore)
                {
                    data.BestScore = e.Score;
                    save.Save();
                }
                if (_bestText != null) _bestText.text = $"Mejor: {data.BestScore:N0}";
            }

            var canRevive = GameManager.Instance != null && GameManager.Instance.CanRevive;
            if (_reviveButton != null) _reviveButton.interactable = canRevive;
            if (_reviveLabel != null)
                _reviveLabel.text = canRevive ? "Revivir (anuncio)" : "Revive usado";
        }

        private void OnRevive()
        {
            if (!ServiceLocator.TryGet<IAdsService>(out var ads))
            {
                EventBus.Publish(new ReviveCompletedEvent(false));
                return;
            }

            if (_reviveButton != null) _reviveButton.interactable = false;
            ads.ShowRewarded("revive", success =>
            {
                EventBus.Publish(new ReviveCompletedEvent(success));
            });
        }

        private void OnReviveDone(ReviveCompletedEvent e)
        {
            if (e.Success)
                SetVisible(false);
            else if (_reviveLabel != null)
                _reviveLabel.text = "Anuncio no disponible";
        }

        private void OnRetry()
        {
            GameManager.Instance?.RestartRun();
            SetVisible(false);
        }

        private void OnMenu()
        {
            GameManager.Instance?.GoToMenu();
            SetVisible(false);
            FindFirstObjectByType<MainMenuView>()?.Show();
        }

        public void SetVisible(bool visible)
        {
            if (_root != null) _root.SetActive(visible);
        }

        public void Bind(GameObject root, TextMeshProUGUI title, TextMeshProUGUI score, TextMeshProUGUI distance,
            TextMeshProUGUI best, Button revive, Button retry, Button menu, TextMeshProUGUI reviveLabel)
        {
            _root = root;
            _titleText = title;
            _scoreText = score;
            _distanceText = distance;
            _bestText = best;
            _reviveButton = revive;
            _retryButton = retry;
            _menuButton = menu;
            _reviveLabel = reviveLabel;
            WireButtons();
        }
    }
}
