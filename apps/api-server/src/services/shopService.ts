import { store } from '../store/index.js';
import { badRequest, conflict, notFound } from '../utils/errors.js';
import { toPublicPlayer, touchPlayer } from './playerMapper.js';
import { requirePlayer } from './leaderboardService.js';

export function listShopItems() {
  return { items: store.getShopItems() };
}

export function purchaseShopItem(playerId: string, itemId: string) {
  const player = requirePlayer(playerId);
  const item = store.getShopItem(itemId);
  if (!item) throw notFound('Shop item not found');

  if (item.iapProductId && item.priceCoins === undefined) {
    throw badRequest('This item requires IAP. Use POST /iap/verify.');
  }

  const price = item.priceCoins ?? 0;
  if (price <= 0 && item.category !== 'character') {
    // free defaults / already owned path
  }

  if (
    (item.category === 'character' ||
      item.category === 'backpack' ||
      item.category === 'skateboard') &&
    player.ownedSkins.includes(item.id)
  ) {
    throw conflict('Item already owned');
  }

  if (player.coins < price) {
    throw conflict('Insufficient coins');
  }

  let next = touchPlayer({
    ...player,
    coins: player.coins - price,
  });

  if (
    item.category === 'character' ||
    item.category === 'backpack' ||
    item.category === 'skateboard'
  ) {
    next = {
      ...next,
      ownedSkins: [...new Set([...next.ownedSkins, item.id])],
      equippedSkins: {
        ...next.equippedSkins,
        ...(item.category === 'character' ? { character: item.id } : {}),
        ...(item.category === 'backpack' ? { backpack: item.id } : {}),
        ...(item.category === 'skateboard' ? { skateboard: item.id } : {}),
      },
    };
  } else if (item.category === 'coins') {
    throw badRequest('Coin packs are IAP-only. Use POST /iap/verify.');
  }

  store.upsertPlayer(next);
  return {
    purchased: true,
    itemId: item.id,
    player: toPublicPlayer(next),
  };
}

export function verifyIapStub(
  playerId: string,
  productId: string,
) {
  const player = requirePlayer(playerId);
  const coins = store.getIapProductCoins(productId);

  if (productId === 'com.cruzard.remove_ads') {
    const next = touchPlayer({ ...player, adsRemoved: true });
    store.upsertPlayer(next);
    return {
      verified: true,
      stub: true,
      productId,
      coinsGranted: 0,
      adsRemoved: true,
      player: toPublicPlayer(next),
    };
  }

  if (coins === undefined) {
    throw notFound(`Unknown IAP productId: ${productId}`);
  }

  const next = touchPlayer({
    ...player,
    coins: player.coins + coins,
  });
  store.upsertPlayer(next);

  return {
    verified: true,
    stub: true,
    productId,
    coinsGranted: coins,
    player: toPublicPlayer(next),
  };
}
