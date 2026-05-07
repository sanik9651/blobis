// Процедурный генератор рыб для Blobis
// Использует seed для детерминированной генерации

class SeededRandom {
    constructor(seed) {
        this.seed = seed;
    }

    next() {
        this.seed = (this.seed * 9301 + 49297) % 233280;
        return this.seed / 233280;
    }

    range(min, max) {
        return min + this.next() * (max - min);
    }

    choice(array) {
        return array[Math.floor(this.next() * array.length)];
    }
}

// Генератор имён рыб
const fishNameParts = {
    prefixes: [
        'Золото', 'Серебро', 'Мрачный', 'Неоновый', 'Глубинный', 'Призрачный',
        'Кристальный', 'Тёмный', 'Светящийся', 'Ледяной', 'Огненный', 'Теневой',
        'Радужный', 'Жемчужный', 'Алмазный', 'Изумрудный', 'Рубиновый', 'Сапфировый',
        'Янтарный', 'Коралловый', 'Лунный', 'Солнечный', 'Звёздный', 'Космический',
        'Древний', 'Королевский', 'Императорский', 'Благородный', 'Дикий', 'Свирепый'
    ],
    roots: [
        'чешуйчатый', 'плавник', 'хвост', 'пуз', 'глаз', 'зуб', 'игло', 'шип',
        'крыл', 'рог', 'усач', 'полос', 'пятн', 'блоб', 'морд', 'жабр',
        'чешуй', 'перо', 'клык', 'коготь', 'панцирь', 'щит', 'меч', 'копьё'
    ],
    suffixes: [
        'ец', 'ик', 'ун', 'яр', 'ыш', 'ач', 'ох', 'юн', 'ан', 'ор',
        '-Мутант', '-Завр', '-Дон', '-Монстр', '-Титан', '-Гигант', '-Карлик', '-Призрак'
    ],
    deepPrefixes: [
        'Бездонный', 'Проклятый', 'Кошмарный', 'Ужасный', 'Мёртвый', 'Гнилой',
        'Адский', 'Демонический', 'Зловещий', 'Жуткий', 'Страшный', 'Ядовитый'
    ]
};

function generateFishName(seed, depth) {
    const rng = new SeededRandom(seed);

    const prefixList = depth > 0.7 ? [...fishNameParts.prefixes, ...fishNameParts.deepPrefixes] : fishNameParts.prefixes;
    const prefix = rng.choice(prefixList);
    const root = rng.choice(fishNameParts.roots);
    const suffix = rng.choice(fishNameParts.suffixes);

    return `${prefix}${root}${suffix}`;
}

// Генератор цветов
function generateColors(seed, depth, rarity) {
    const rng = new SeededRandom(seed + 1000);

    if (depth > 0.7) {
        // Глубоководные рыбы
        const darkColors = [
            ['#1a1a2e', '#16213e', '#0f3460'],
            ['#000000', '#1c1c1c', '#2d2d2d'],
            ['#0a0e27', '#1b1b3a', '#2d2d5f']
        ];
        const accentColors = ['#00ff9f', '#ff006e', '#ffbe0b', '#fb5607', '#8338ec'];

        const base = rng.choice(darkColors);
        const accent = rng.choice(accentColors);

        return {
            body: base[0],
            belly: base[1],
            fins: base[2],
            accent: accent,
            eye: rng.next() > 0.5 ? '#ff0000' : accent
        };
    } else {
        // Обычные рыбы
        const normalPalettes = [
            { body: '#ff6b6b', belly: '#ffd93d', fins: '#ff8787', accent: '#ffe66d', eye: '#2d3436' },
            { body: '#4ecdc4', belly: '#95e1d3', fins: '#38ada9', accent: '#f8b500', eye: '#2d3436' },
            { body: '#a8e6cf', belly: '#dcedc1', fins: '#7fb3d5', accent: '#ffd3b6', eye: '#2d3436' },
            { body: '#ff9ff3', belly: '#feca57', fins: '#ff6b6b', accent: '#48dbfb', eye: '#2d3436' },
            { body: '#54a0ff', belly: '#48dbfb', fins: '#0abde3', accent: '#feca57', eye: '#2d3436' },
            { body: '#ee5a6f', belly: '#f79f1f', fins: '#c23616', accent: '#ffc312', eye: '#2d3436' }
        ];

        return rng.choice(normalPalettes);
    }
}

// Главная функция генерации рыбы
function generateFish(seed, depth = 0.3) {
    const rng = new SeededRandom(seed);

    // Определяем редкость
    const rarityRoll = rng.next();
    let rarity;
    if (rarityRoll > 0.99) rarity = 'Mythical';
    else if (rarityRoll > 0.95) rarity = 'Legendary';
    else if (rarityRoll > 0.85) rarity = 'Epic';
    else if (rarityRoll > 0.65) rarity = 'Rare';
    else rarity = 'Common';

    // Параметры тела
    const bodyLength = rng.range(60, 120);
    const bodyHeight = rng.range(30, 60);
    const tailWidth = rng.range(20, 40);
    const finSize = rng.range(15, 35);

    // Глубоководные модификации
    const isDeep = depth > 0.7;
    const spikes = isDeep ? Math.floor(rng.range(3, 8)) : 0;
    const asymmetricEyes = isDeep && rng.next() > 0.6;

    // Цвета
    const colors = generateColors(seed, depth, rarity);

    // Имя
    const name = generateFishName(seed, depth);

    // Характеристики
    const weight = (bodyLength * bodyHeight / 100) * rng.range(0.8, 1.2);
    const temperament = rng.choice(['Мирная', 'Агрессивная', 'Пугливая', 'Любопытная', 'Ленивая']);

    return {
        id: `fish_${seed}_${Date.now()}`,
        name,
        rarity,
        depth,
        weight: weight.toFixed(2),
        temperament,
        visualParams: {
            seed,
            bodyLength,
            bodyHeight,
            tailWidth,
            finSize,
            spikes,
            asymmetricEyes,
            colors,
            isDeep
        }
    };
}

// Генерация SVG рыбы
function generateFishSVG(visualParams, size = 200) {
    const { bodyLength, bodyHeight, tailWidth, finSize, spikes, asymmetricEyes, colors, isDeep } = visualParams;

    const scale = size / 150;
    const centerX = size / 2;
    const centerY = size / 2;

    const svgParts = [];

    // Gooey фильтр
    const filterId = `gooey_${Math.random().toString(36).substr(2, 9)}`;
    svgParts.push(`
        <defs>
            <filter id="${filterId}">
                <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur"/>
                <feColorMatrix in="blur" mode="matrix" values="
                    1 0 0 0 0
                    0 1 0 0 0
                    0 0 1 0 0
                    0 0 0 18 -7" result="goo"/>
                <feComposite in="SourceGraphic" in2="goo" operator="atop"/>
            </filter>
        </defs>
    `);

    const group = [];

    // Хвост
    group.push(`<ellipse cx="${centerX - bodyLength * scale * 0.4}" cy="${centerY}" rx="${tailWidth * scale}" ry="${bodyHeight * scale * 0.6}" fill="${colors.fins}"/>`);

    // Тело
    group.push(`<ellipse cx="${centerX}" cy="${centerY}" rx="${bodyLength * scale * 0.5}" ry="${bodyHeight * scale * 0.5}" fill="${colors.body}"/>`);

    // Живот
    group.push(`<ellipse cx="${centerX + bodyLength * scale * 0.1}" cy="${centerY + bodyHeight * scale * 0.2}" rx="${bodyLength * scale * 0.3}" ry="${bodyHeight * scale * 0.3}" fill="${colors.belly}"/>`);

    // Голова
    group.push(`<ellipse cx="${centerX + bodyLength * scale * 0.4}" cy="${centerY}" rx="${bodyHeight * scale * 0.4}" ry="${bodyHeight * scale * 0.45}" fill="${colors.body}"/>`);

    // Плавники
    group.push(`<ellipse cx="${centerX}" cy="${centerY - bodyHeight * scale * 0.5}" rx="${finSize * scale * 0.5}" ry="${finSize * scale}" fill="${colors.fins}"/>`);
    group.push(`<ellipse cx="${centerX}" cy="${centerY + bodyHeight * scale * 0.5}" rx="${finSize * scale * 0.5}" ry="${finSize * scale}" fill="${colors.fins}"/>`);

    // Шипы для глубоководных
    if (isDeep && spikes > 0) {
        for (let i = 0; i < spikes; i++) {
            const angle = (i / spikes) * Math.PI * 2;
            const spikeX = centerX + Math.cos(angle) * bodyLength * scale * 0.5;
            const spikeY = centerY + Math.sin(angle) * bodyHeight * scale * 0.5;
            group.push(`<line x1="${centerX}" y1="${centerY}" x2="${spikeX}" y2="${spikeY}" stroke="${colors.accent}" stroke-width="2"/>`);
        }
    }

    svgParts.push(`<g filter="url(#${filterId})">${group.join('')}</g>`);

    // Глаза (поверх gooey эффекта)
    const eyeX = centerX + bodyLength * scale * 0.35;
    const eyeY = centerY - bodyHeight * scale * 0.15;
    const eyeSize = asymmetricEyes ? [8 * scale, 12 * scale] : [10 * scale, 10 * scale];

    svgParts.push(`<circle cx="${eyeX}" cy="${eyeY}" r="${eyeSize[0]}" fill="white"/>`);
    svgParts.push(`<circle cx="${eyeX}" cy="${eyeY}" r="${eyeSize[0] * 0.6}" fill="${colors.eye}"/>`);
    svgParts.push(`<circle cx="${eyeX + eyeSize[0] * 0.2}" cy="${eyeY - eyeSize[0] * 0.2}" r="${eyeSize[0] * 0.3}" fill="white"/>`);

    if (asymmetricEyes) {
        const eyeY2 = centerY + bodyHeight * scale * 0.1;
        svgParts.push(`<circle cx="${eyeX}" cy="${eyeY2}" r="${eyeSize[1]}" fill="white"/>`);
        svgParts.push(`<circle cx="${eyeX}" cy="${eyeY2}" r="${eyeSize[1] * 0.6}" fill="${colors.eye}"/>`);
    }

    return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">${svgParts.join('')}</svg>`;
}

// Экспорт для использования в HTML
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { generateFish, generateFishSVG, generateFishName };
}
