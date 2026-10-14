---
title: Rethinking How Cards Are Drawn
date: 2026-09-25
summary: We made a big change to how Lost Faith draws and discards cards, and it caused real disagreement on the team. Here's what changed and how we settled it.
tags: [design, team]
translation: reviewed
draft: false
---

At last, there's time to share some of the story behind development. And a happy Mid-Autumn Festival to everyone (yes, we're very late).

This week the game went through a major change of direction, one that caused a fair amount of disagreement and friction within the team. Here's what changed, and how we worked through it.

## How it used to work

Lost Faith's card draw was originally modeled on popular games like Slay the Spire: at the end of each turn you draw up to your hand limit, cards go to the discard pile when played or when the turn ends, and once the draw pile runs out the discard pile is shuffled back in, over and over.

Once we prototyped it, we hit a big problem.

The main resource you manage in a run is the balance between the two meters, and not knowing what you'll draw made real planning very hard. On top of that, our enemy AI was built on weighted, fixed skill sets, a more RPG-like approach, so the logic behind the player and the enemies kept fighting each other.

## What we decided

After a lot of heated back-and-forth, the team landed on this:

- Build the game fully in an RPG direction, so the fun comes mainly from enemies' special mechanics and the satisfaction of planning out a run.
- Cards are no longer discarded when you play them. They stay in your hand, and discarding only happens at the end of the turn. You can also spend durability to pin a card in your hand, giving up draw space in exchange for a card you know you'll have.

## The pushback

Early on, a lot of the team doubted or opposed the change. It felt like it wouldn't be a card game anymore, just an RPG wearing a card game's skin.

It would also cut the randomness a lot, and some worried about strategies that just repeat the same card over and over in a turn, making play monotonous.

## What it opened up

But the change also led to some interesting chemistry:

- Players started building small core combos in their hand, and once a card's durability drops low enough it unpins itself and goes back into the cycle.
- Players have noticeably more control during a run. Cards with extra effects reach their thresholds more often, and play leans toward ordering your cards to keep yourself in the best range on the meters.

The team tried a lot of things and playtested to settle the direction. In the end we felt the new approach makes for a more distinctive game and gives us more freedom in development, so for now we're going with what our internal playtests showed.
