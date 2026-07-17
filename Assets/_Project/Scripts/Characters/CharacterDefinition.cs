// Purpose: Original character archetype data — NEVER real public figures (GDD §4.1).

using UnityEngine;

namespace CruzaRD.Characters
{
    [CreateAssetMenu(fileName = "Char_", menuName = "CruzaRD/Character Definition")]
    public sealed class CharacterDefinition : ScriptableObject
    {
        public string Id = "char_estudiante";
        public string DisplayName = "Estudiante";
        [TextArea] public string OneLineStory = "Sale tarde de la uni y cruza la Churchill.";
        public bool IsOriginalCharacter = true;
        public Sprite Icon;
        public GameObject Prefab;

        private void OnValidate()
        {
            if (!IsOriginalCharacter)
                Debug.LogError($"[Legal] Character {name} marked non-original — blocked by GDD §4.1 until licensed.");
        }
    }
}
