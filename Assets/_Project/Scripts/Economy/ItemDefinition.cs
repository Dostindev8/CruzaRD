// Purpose: Catalog entry for collectibles / shop cosmetics (Addressables-ready).

using UnityEngine;

namespace CruzaRD.Economy
{
    public enum ItemCategory
    {
        SoftCurrency,
        PowerUp,
        CosmeticSkin,
        CosmeticVehicle,
        SeasonReward
    }

    [CreateAssetMenu(fileName = "Item_", menuName = "CruzaRD/Item Definition")]
    public sealed class ItemDefinition : ScriptableObject
    {
        public string Id;
        public string DisplayNameEs;
        public string DisplayNameEn;
        public ItemCategory Category;
        public int SoftPrice;
        public int HardPrice;
        public bool AffectsGameplay;
        [TextArea] public string LegalNote;

        private void OnValidate()
        {
            // Cosmetics must never affect gameplay (pay-to-win guard)
            if (Category is ItemCategory.CosmeticSkin or ItemCategory.CosmeticVehicle)
                AffectsGameplay = false;
        }
    }
}
