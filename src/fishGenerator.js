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

// Генератор имён рыб (реалистичные названия)
const fishNameParts = {
    // Реальные виды рыб как основа
    baseNames: [
        'Окунь', 'Карп', 'Сом', 'Щука', 'Судак', 'Лещ', 'Форель', 'Сазан',
        'Тунец', 'Марлин', 'Барракуда', 'Групер', 'Снэппер', 'Дорадо', 'Сибас',
        'Палтус', 'Треска', 'Скат', 'Угорь', 'Мурена', 'Рыба-меч', 'Рыба-парус'
    ],
    // Прилагательные (отдельно)
    adjectives: [
        'Золотой', 'Серебряный', 'Полосатый', 'Пятнистый', 'Тигровый', 'Королевский',
        'Императорский', 'Гигантский', 'Карликовый', 'Радужный', 'Огненный', 'Ледяной',
        'Призрачный', 'Кристальный', 'Жемчужный', 'Коралловый', 'Изумрудный', 'Сапфировый'
    ],
    // Для глубоководных
    deepAdjectives: [
        'Глубоководный', 'Бездонный', 'Адский', 'Проклятый', 'Древний', 'Зловещий',
        'Кошмарный', 'Теневой', 'Призрачный', 'Мёртвый', 'Ядовитый', 'Демонический'
    ],
    // Дополнительные характеристики
    traits: [
        'Хищник', 'Охотник', 'Титан', 'Левиафан', 'Страж', 'Властелин',
        'Разрушитель', 'Пожиратель', 'Ужас', 'Кошмар'
    ]
};

function generateFishName(seed, depth) {
    const rng = new SeededRandom(seed);

    const baseName = rng.choice(fishNameParts.baseNames);
    const useAdjective = rng.next() > 0.3; // 70% шанс на прилагательное
    const useTrait = depth > 0.5 && rng.next() > 0.7; // 30% для глубоких рыб

    let name = '';

    if (useAdjective) {
        const adjectiveList = depth > 0.7 ? fishNameParts.deepAdjectives : fishNameParts.adjectives;
        const adjective = rng.choice(adjectiveList);
        name = `${adjective} ${baseName}`;
    } else {
        name = baseName;
    }

    if (useTrait) {
        const trait = rng.choice(fishNameParts.traits);
        name = `${name}-${trait}`;
    }

    return name;
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

// Генерация SVG рыбы (реалистичный стиль)
function generateFishSVG(visualParams, size = 200) {
    const { bodyLength, bodyHeight, tailWidth, finSize, spikes, asymmetricEyes, colors, isDeep, seed } = visualParams;

    const rng = new SeededRandom(seed + 5000);
    const scale = size / 150;
    const centerX = size / 2;
    const centerY = size / 2;

    const svgParts = [];

    // Градиенты для объёма
    const bodyGradId = `bodyGrad_${seed}_${size}`;
    const finGradId = `finGrad_${seed}_${size}`;

    svgParts.push(`
        <defs>
            <linearGradient id="${bodyGradId}" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:${colors.body};stop-opacity:1" />
                <stop offset="50%" style="stop-color:${colors.belly};stop-opacity:1" />
                <stop offset="100%" style="stop-color:${colors.body};stop-opacity:0.8" />
            </linearGradient>
            <linearGradient id="${finGradId}" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style="stop-color:${colors.fins};stop-opacity:0.7" />
                <stop offset="100%" style="stop-color:${colors.accent};stop-opacity:0.9" />
            </linearGradient>
        </defs>
    `);

    const group = [];

    // Хвостовой плавник (треугольная форма)
    const tailX = centerX - bodyLength * scale * 0.5;
    const tailY = centerY;
    const tailHeight = bodyHeight * scale * 0.8;
    group.push(`
        <path d="M ${tailX} ${tailY}
                 L ${tailX - tailWidth * scale} ${tailY - tailHeight}
                 L ${tailX - tailWidth * scale * 0.7} ${tailY}
                 L ${tailX - tailWidth * scale} ${tailY + tailHeight}
                 Z"
              fill="url(#${finGradId})"
              stroke="${colors.fins}"
              stroke-width="1"/>
    `);

    // Тело (эллипс с заострённым носом)
    const bodyPath = `
        M ${centerX - bodyLength * scale * 0.4} ${centerY}
        Q ${centerX - bodyLength * scale * 0.3} ${centerY - bodyHeight * scale * 0.5},
          ${centerX} ${centerY - bodyHeight * scale * 0.45}
        Q ${centerX + bodyLength * scale * 0.4} ${centerY - bodyHeight * scale * 0.3},
          ${centerX + bodyLength * scale * 0.5} ${centerY}
        Q ${centerX + bodyLength * scale * 0.4} ${centerY + bodyHeight * scale * 0.3},
          ${centerX} ${centerY + bodyHeight * scale * 0.45}
        Q ${centerX - bodyLength * scale * 0.3} ${centerY + bodyHeight * scale * 0.5},
          ${centerX - bodyLength * scale * 0.4} ${centerY}
        Z
    `;
    group.push(`<path d="${bodyPath}" fill="url(#${bodyGradId})" stroke="${colors.body}" stroke-width="1.5"/>`);

    // Спинной плавник
    const dorsalX = centerX - bodyLength * scale * 0.1;
    const dorsalY = centerY - bodyHeight * scale * 0.45;
    group.push(`
        <path d="M ${dorsalX} ${dorsalY}
                 Q ${dorsalX - finSize * scale * 0.3} ${dorsalY - finSize * scale * 1.2},
                   ${dorsalX + finSize * scale * 0.4} ${dorsalY - finSize * scale * 0.8}
                 L ${dorsalX + finSize * scale * 0.6} ${dorsalY}
                 Z"
              fill="url(#${finGradId})"
              stroke="${colors.fins}"
              stroke-width="1"/>
    `);

    // Грудные плавники (пара)
    const pectoralX = centerX + bodyLength * scale * 0.2;
    const pectoralY = centerY;
    group.push(`
        <ellipse cx="${pectoralX}" cy="${pectoralY - bodyHeight * scale * 0.3}"
                 rx="${finSize * scale * 0.6}" ry="${finSize * scale * 0.4}"
                 fill="url(#${finGradId})"
                 opacity="0.8"
                 stroke="${colors.fins}"
                 stroke-width="0.5"/>
    `);
    group.push(`
        <ellipse cx="${pectoralX}" cy="${pectoralY + bodyHeight * scale * 0.3}"
                 rx="${finSize * scale * 0.6}" ry="${finSize * scale * 0.4}"
                 fill="url(#${finGradId})"
                 opacity="0.8"
                 stroke="${colors.fins}"
                 stroke-width="0.5"/>
    `);

    // Анальный плавник (нижний)
    const analX = centerX - bodyLength * scale * 0.15;
    const analY = centerY + bodyHeight * scale * 0.45;
    group.push(`
        <path d="M ${analX} ${analY}
                 Q ${analX - finSize * scale * 0.2} ${analY + finSize * scale * 0.6},
                   ${analX + finSize * scale * 0.3} ${analY + finSize * scale * 0.4}
                 L ${analX + finSize * scale * 0.4} ${analY}
                 Z"
              fill="url(#${finGradId})"
              stroke="${colors.fins}"
              stroke-width="1"/>
    `);

    // Шипы для глубоководных
    if (isDeep && spikes > 0) {
        for (let i = 0; i < spikes; i++) {
            const spikePos = 0.3 + (i / spikes) * 0.4;
            const spikeX = centerX - bodyLength * scale * 0.4 + bodyLength * scale * spikePos;
            const spikeY = centerY - bodyHeight * scale * 0.45;
            const spikeLength = (8 + (rng.next() * 7)) * scale;
            group.push(`
                <line x1="${spikeX}" y1="${spikeY}"
                      x2="${spikeX}" y2="${spikeY - spikeLength}"
                      stroke="${colors.accent}"
                      stroke-width="2"
                      stroke-linecap="round"/>
            `);
        }
    }

    // Чешуя (текстура)
    const scaleCount = Math.floor(bodyLength * 0.3);
    for (let i = 0; i < scaleCount; i++) {
        const scaleX = centerX - bodyLength * scale * 0.3 + (i * bodyLength * scale * 0.6 / scaleCount);
        const scaleY = centerY + (rng.next() - 0.5) * bodyHeight * scale * 0.4;
        group.push(`
            <circle cx="${scaleX}" cy="${scaleY}" r="${scale * 2}"
                    fill="none"
                    stroke="${colors.accent}"
                    stroke-width="0.5"
                    opacity="0.3"/>
        `);
    }

    svgParts.push(`<g>${group.join('')}</g>`);

    // Глаз (поверх всего)
    const eyeX = centerX + bodyLength * scale * 0.35;
    const eyeY = centerY - bodyHeight * scale * 0.15;
    const eyeSize = asymmetricEyes ? [8 * scale, 12 * scale] : [10 * scale, 10 * scale];

    svgParts.push(`<circle cx="${eyeX}" cy="${eyeY}" r="${eyeSize[0]}" fill="white" stroke="${colors.body}" stroke-width="1"/>`);
    svgParts.push(`<circle cx="${eyeX}" cy="${eyeY}" r="${eyeSize[0] * 0.6}" fill="${colors.eye}"/>`);
    svgParts.push(`<circle cx="${eyeX + eyeSize[0] * 0.2}" cy="${eyeY - eyeSize[0] * 0.2}" r="${eyeSize[0] * 0.3}" fill="white"/>`);

    if (asymmetricEyes) {
        const eyeY2 = centerY + bodyHeight * scale * 0.1;
        svgParts.push(`<circle cx="${eyeX}" cy="${eyeY2}" r="${eyeSize[1]}" fill="white" stroke="${colors.body}" stroke-width="1"/>`);
        svgParts.push(`<circle cx="${eyeX}" cy="${eyeY2}" r="${eyeSize[1] * 0.6}" fill="${colors.eye}"/>`);
    }

    return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">${svgParts.join('')}</svg>`;
}

// Экспорт для использования в HTML
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { generateFish, generateFishSVG, generateFishName };
}
