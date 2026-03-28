"""
Card routes
"""
from fastapi import APIRouter, HTTPException
from database import cards_collection

router = APIRouter()


@router.get("/cards")
async def get_all_cards():
    cards = await cards_collection.find({}, {"_id": 0}).to_list(length=None)
    return cards


@router.get("/cards/rare")
async def get_rare_cards():
    cards = await cards_collection.find({"rarity": "rare"}, {"_id": 0}).to_list(length=None)
    return cards


@router.get("/cards/epic")
async def get_epic_cards():
    cards = await cards_collection.find({"rarity": "epic"}, {"_id": 0}).to_list(length=None)
    return cards


@router.get("/cards/{card_id}")
async def get_card(card_id: str):
    card = await cards_collection.find_one({"id": card_id}, {"_id": 0})
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    return card
