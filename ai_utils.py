"""
AI утилиты для генерации рыб
"""
import random
import requests
import os
import asyncio # Добавляем asyncio для асинхронных операций
from config import HF_API_TOKEN

class FishImageGenerator:
    """Генерирует изображения рыб через Hugging Face API"""
    
    @staticmethod
    async def generate_fish_image(fish_name: str, biome: str, rarity: str) -> str:
        """
        Генерирует изображение рыбы используя Stable Diffusion
        
        Args:
            fish_name: Название рыбы
            biome: Биом (river, lake, ocean, swamp, mountain, cave)
            rarity: Редкость (common, rare, epic, legendary, mythical)
        
        Returns:
            URL изображения или placeholder
        """
        if not HF_API_TOKEN:
            print("⚠️ HF_API_TOKEN не установлен, используем placeholder")
            return f"https://via.placeholder.com/400x300?text={fish_name.replace(' ', '+')}"
        
        try:
            # Создаём промпт для генерации
            biome_descriptions = {
                "river": "in a clear river with rocks and plants",
                "lake": "in a deep lake with aquatic vegetation",
                "ocean": "in the ocean with coral reefs",
                "swamp": "in a murky swamp with algae",
                "mountain": "in a mountain stream with clear water",
                "cave": "in an underwater cave with crystals"
            }
            
            rarity_styles = {
                "common": "realistic, natural colors",
                "rare": "vibrant colors, detailed scales",
                "epic": "glowing scales, magical aura",
                "legendary": "golden shimmer, divine appearance",
                "mythical": "cosmic colors, ethereal glow, mystical"
            }
            
            biome_desc = biome_descriptions.get(biome, "in water")
            style = rarity_styles.get(rarity, "realistic")
            
            prompt = f"A beautiful {fish_name} fish {biome_desc}, {style}, high quality, detailed, professional photography, 4k"
            
            # Hugging Face API
            headers = {"Authorization": f"Bearer {HF_API_TOKEN}"}
            api_url = "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1"
            
            # Асинхронный запрос
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None,
                lambda: requests.post(api_url, headers=headers, json={
                    "inputs": prompt,
                    "parameters": {
                        "negative_prompt": "blurry, low quality, distorted, ugly",
                        "num_inference_steps": 30,
                        "guidance_scale": 7.5
                    }
                }, timeout=60)
            )
            
            if response.status_code == 200:
                # Сохраняем изображение
                os.makedirs("output/images", exist_ok=True)
                image_path = f"output/images/fish_{random.randint(1000000, 9999999)}.png"
                
                with open(image_path, "wb") as f:
                    f.write(response.content)
                
                print(f"✅ Изображение сгенерировано: {image_path}")
                return f"/{image_path}"
            
            elif response.status_code == 503:
                print("⚠️ Модель загружается, используем placeholder")
                return f"https://via.placeholder.com/400x300?text={fish_name.replace(' ', '+')}"
            
            else:
                print(f"⚠️ Ошибка генерации: {response.status_code}. Ответ: {response.text}")
                return f"https://via.placeholder.com/400x300?text={fish_name.replace(' ', '+')}"
        
        except Exception as e:
            print(f"❌ Ошибка при генерации изображения: {e}")
            return f"https://via.placeholder.com/400x300?text={fish_name.replace(' ', '+')}"

async def generate_fish_image(fish_id: str, fish_name: str, db):
    """Обёртка для генерации изображения рыбы"""
    # Заглушка - в будущем можно добавить реальную генерацию
    pass

async def generate_fish_description(fish_id: str, fish_name: str, db):
    """Обёртка для генерации описания рыбы"""
    # Заглушка - в будущем можно добавить реальную генерацию
    pass

async def get_ai_response(user_id: int, message: str, db) -> str:
    """Получить ответ от AI"""
    # Заглушка для AI чата
    return "AI чат пока не реализован. Скоро будет доступен!"

def generate_fish_description_text(fish_name: str, biome: str, rarity: str, weight: float, size: float) -> str:
    """Генерирует описание рыбы"""
    
    biome_descriptions = {
        "river": "Обитает в чистых реках с быстрым течением",
        "lake": "Водится в глубоких озёрах",
        "ocean": "Живёт в океанских водах",
        "swamp": "Встречается в болотистых местах",
        "mountain": "Обитает в горных реках",
        "cave": "Редкий вид из подводных пещер"
    }
    
    rarity_descriptions = {
        "common": "Обычная рыба, часто встречается",
        "rare": "Редкая рыба с необычными характеристиками",
        "epic": "Эпическая рыба с особыми свойствами",
        "legendary": "Легендарная рыба, мечта любого рыбака",
        "mythical": "Мифическая рыба, существование которой под вопросом"
    }
    
    biome_desc = biome_descriptions.get(biome, "Обитает в водоёмах")
    rarity_desc = rarity_descriptions.get(rarity, "Интересная рыба")
    
    description = f"{fish_name} - {rarity_desc}. {biome_desc}. "
    description += f"Вес: {weight} кг, длина: {size} см. "
    
    # Добавляем интересные факты
    facts = [
        "Известна своей силой и выносливостью.",
        "Имеет уникальную окраску чешуи.",
        "Считается деликатесом среди рыбаков.",
        "Обладает отличными вкусовыми качествами.",
        "Ценится за свою редкость.",
    ]
    
    description += random.choice(facts)
    
    return description

def format_fish_display(fish: dict) -> str:
    """Форматирует рыбу для отображения в Telegram"""
    
    rarity_emoji = {
        "common": "⚪",
        "rare": "🔵",
        "epic": "🟠",
        "legendary": "🟡",
        "mythical": "🟣"
    }
    
    emoji = rarity_emoji.get(fish.get("rarity", "common"), "⚪")
    
    text = f"""
🐟 **{fish['name']}**
━━━━━━━━━━━━━━━━━━━━━
 
{emoji} Редкость: {fish['rarity'].upper()}
💰 Ценность: {fish['coin_value']} монет
⚖️ Вес: {fish['weight']} кг
📏 Размер: {fish['size']} см
🌊 Биом: {fish['biome']}
"""
    
    if fish.get('special_effects'):
        text += "\n✨ Особые эффекты:\n"
        for effect in fish['special_effects']:
            text += f"• {effect}\n"
    
    return text