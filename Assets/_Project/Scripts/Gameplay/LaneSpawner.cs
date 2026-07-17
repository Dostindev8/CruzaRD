// Purpose: Endless lane generation with object pooling from day one.

using System.Collections.Generic;
using CruzaRD.Core;
using UnityEngine;

namespace CruzaRD.Gameplay
{
    public enum LaneType
    {
        Safe,
        Traffic,
        River,
        UrbanBlock
    }

    public sealed class LaneSpawner : MonoBehaviour
    {
        [SerializeField] private DifficultyCurve _difficulty;
        [SerializeField] private Transform _player;
        [SerializeField] private GameObject _safeLanePrefab;
        [SerializeField] private GameObject _trafficLanePrefab;
        [SerializeField] private GameObject _vehiclePrefab;
        [SerializeField] private GameObject _collectiblePrefab;
        [SerializeField] private int _lanesAhead = 18;
        [SerializeField] private int _lanesBehind = 6;
        [SerializeField] private float _cellSize = 1f;
        [SerializeField] private int _poolWarm = 24;

        private readonly Dictionary<int, GameObject> _lanes = new();
        private ObjectPool _safePool;
        private ObjectPool _trafficPool;
        private ObjectPool _vehiclePool;
        private ObjectPool _itemPool;
        private Transform _poolRoot;
        private float _spawnTimer;
        private int _lastPlayerRow = -999;

        private void Awake()
        {
            _poolRoot = new GameObject("LanePools").transform;
            _poolRoot.SetParent(transform, false);

            EnsureRuntimePlaceholders();

            _safePool = new ObjectPool(_safeLanePrefab, _poolRoot, _poolWarm);
            _trafficPool = new ObjectPool(_trafficLanePrefab, _poolRoot, _poolWarm);
            _vehiclePool = new ObjectPool(_vehiclePrefab, _poolRoot, _poolWarm * 2);
            _itemPool = new ObjectPool(_collectiblePrefab, _poolRoot, 12);
        }

        private void OnEnable()
        {
            EventBus.Subscribe<GameStartedEvent>(OnStarted);
            EventBus.Subscribe<GameRestartedEvent>(OnRestart);
        }

        private void OnDisable()
        {
            EventBus.Unsubscribe<GameStartedEvent>(OnStarted);
            EventBus.Unsubscribe<GameRestartedEvent>(OnRestart);
        }

        private void Update()
        {
            if (GameManager.Instance == null || GameManager.Instance.State != GameState.Playing)
                return;

            if (_player == null)
                return;

            var row = Mathf.RoundToInt(_player.position.z / _cellSize);
            if (row != _lastPlayerRow)
            {
                _lastPlayerRow = row;
                SyncLanes(row);
            }

            TickVehicles();
        }

        private void OnStarted(GameStartedEvent _)
        {
            ClearAll();
            SyncLanes(0);
            _spawnTimer = 0f;
        }

        private void OnRestart(GameRestartedEvent _) => OnStarted(default);

        private void SyncLanes(int playerRow)
        {
            int min = playerRow - _lanesBehind;
            int max = playerRow + _lanesAhead;

            var toRemove = new List<int>();
            foreach (var kv in _lanes)
            {
                if (kv.Key < min || kv.Key > max)
                    toRemove.Add(kv.Key);
            }

            foreach (var key in toRemove)
            {
                ReturnLane(key);
            }

            for (int z = min; z <= max; z++)
            {
                if (_lanes.ContainsKey(z))
                    continue;

                SpawnLane(z);
            }
        }

        private void SpawnLane(int z)
        {
            var type = ResolveLaneType(z);
            var pool = type == LaneType.Safe ? _safePool : _trafficPool;
            var pos = new Vector3(0f, 0f, z * _cellSize);
            var lane = pool.Get(pos, Quaternion.identity);
            lane.name = $"Lane_{z}_{type}";
            _lanes[z] = lane;

            if (type == LaneType.Traffic)
                SpawnVehiclesOnLane(z);

            if (z > 0 && z % 3 == 0)
                SpawnCollectible(z);
        }

        private LaneType ResolveLaneType(int z)
        {
            if (z <= 1) return LaneType.Safe;
            var danger = _difficulty != null
                ? _difficulty.GetDangerousLaneChance(GameManager.Instance != null ? GameManager.Instance.DistanceMeters : z)
                : 0.4f;
            return Random.value < danger ? LaneType.Traffic : LaneType.Safe;
        }

        private void SpawnVehiclesOnLane(int z)
        {
            var distance = GameManager.Instance != null ? GameManager.Instance.DistanceMeters : 0;
            var speed = _difficulty != null ? _difficulty.GetTrafficSpeed(distance) : 5f;
            var fromLeft = Random.value > 0.5f;
            var x = fromLeft ? -6f : 6f;
            var vehicle = _vehiclePool.Get(new Vector3(x, 0.5f, z * _cellSize), Quaternion.identity);
            var mover = vehicle.GetComponent<PooledVehicle>() ?? vehicle.AddComponent<PooledVehicle>();
            mover.Init(_vehiclePool, fromLeft ? Vector3.right : Vector3.left, speed, 10f);
        }

        private void SpawnCollectible(int z)
        {
            var laneX = Random.Range(-2, 3);
            var item = _itemPool.Get(new Vector3(laneX * _cellSize, 0.6f, z * _cellSize), Quaternion.identity);
            var col = item.GetComponent<CollectibleItem>() ?? item.AddComponent<CollectibleItem>();
            col.Init(_itemPool, "papeleta", 1);
        }

        private void TickVehicles()
        {
            // Vehicles self-tick via PooledVehicle.Update
            var distance = GameManager.Instance != null ? GameManager.Instance.DistanceMeters : 0;
            var interval = _difficulty != null ? _difficulty.GetSpawnInterval(distance) : 1.2f;
            _spawnTimer += Time.deltaTime;
            if (_spawnTimer < interval)
                return;

            _spawnTimer = 0f;
            if (_player == null) return;
            var ahead = Mathf.RoundToInt(_player.position.z / _cellSize) + Random.Range(6, _lanesAhead);
            if (_lanes.ContainsKey(ahead))
                SpawnVehiclesOnLane(ahead);
        }

        private void ReturnLane(int z)
        {
            if (!_lanes.TryGetValue(z, out var lane))
                return;

            _lanes.Remove(z);
            if (lane.name.Contains("Safe"))
                _safePool.Return(lane);
            else
                _trafficPool.Return(lane);
        }

        private void ClearAll()
        {
            var keys = new List<int>(_lanes.Keys);
            foreach (var k in keys)
                ReturnLane(k);

            _vehiclePool.ReturnAll();
            _itemPool.ReturnAll();
        }

        private void EnsureRuntimePlaceholders()
        {
            if (_safeLanePrefab == null)
                _safeLanePrefab = CreateLanePlaceholder("SafeLanePrefab", new Color(0.35f, 0.7f, 0.35f));
            if (_trafficLanePrefab == null)
                _trafficLanePrefab = CreateLanePlaceholder("TrafficLanePrefab", new Color(0.25f, 0.25f, 0.28f));
            if (_vehiclePrefab == null)
                _vehiclePrefab = CreateBoxPlaceholder("VehiclePrefab", new Color(0.1f, 0.4f, 0.9f), new Vector3(1.2f, 0.8f, 0.8f));
            if (_collectiblePrefab == null)
                _collectiblePrefab = CreateBoxPlaceholder("CollectiblePrefab", new Color(0.96f, 0.65f, 0.14f), Vector3.one * 0.45f);
        }

        private static GameObject CreateLanePlaceholder(string name, Color color)
        {
            var go = GameObject.CreatePrimitive(PrimitiveType.Cube);
            go.name = name;
            go.transform.localScale = new Vector3(7f, 0.1f, 0.95f);
            var rend = go.GetComponent<Renderer>();
            rend.sharedMaterial = new Material(Shader.Find("Universal Render Pipeline/Lit") ?? Shader.Find("Standard"))
            {
                color = color
            };
            var col = go.GetComponent<Collider>();
            if (col != null) col.enabled = false;
            go.SetActive(false);
            return go;
        }

        private static GameObject CreateBoxPlaceholder(string name, Color color, Vector3 scale)
        {
            var go = GameObject.CreatePrimitive(PrimitiveType.Cube);
            go.name = name;
            go.transform.localScale = scale;
            var rend = go.GetComponent<Renderer>();
            rend.sharedMaterial = new Material(Shader.Find("Universal Render Pipeline/Lit") ?? Shader.Find("Standard"))
            {
                color = color
            };
            var col = go.GetComponent<BoxCollider>();
            col.isTrigger = true;
            go.SetActive(false);
            return go;
        }
    }
}
