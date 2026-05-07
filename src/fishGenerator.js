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

// Генератор реалистичных цветов
function generateRealisticColors(seed, depth, rarity, bodyType) {
    const rng = new SeededRandom(seed + 1000);

    if (depth > 0.7) {
        // Глубоководные - тёмные, биолюминесцентные акценты
        const bodyColors = ['#0a0a0a', '#1a1a1a', '#0d0d1a', '#1a0d0d', '#0d1a0d'];
        const accentColors = ['#00ffff', '#00ff88', '#ff0066', '#8800ff', '#ffaa00'];

        return {
            body: rng.choice(bodyColors),
            belly: '#000000',
            fins: rng.choice(bodyColors),
            accent: rng.choice(accentColors),
            eye: rng.choice(accentColors),
            glow: rng.choice(accentColors)
        };
    } else if (depth > 0.5) {
        // Средняя глубина - приглушённые цвета
        const palettes = [
            { body: '#2d4a5a', belly: '#3d5a6a', fins: '#1d3a4a', accent: '#4d6a7a', eye: '#1a1a1a' },
            { body: '#3a4a2d', belly: '#4a5a3d', fins: '#2a3a1d', accent: '#5a6a4d', eye: '#1a1a1a' },
            { body: '#4a2d3a', belly: '#5a3d4a', fins: '#3a1d2a', accent: '#6a4d5a', eye: '#1a1a1a' },
        ];
        return rng.choice(palettes);
    } else {
        // Мелководные - яркие, естественные цвета
        const palettes = [
            // Серебристые
            { body: '#c0c8d0', belly: '#e8f0f8', fins: '#a0a8b0', accent: '#8090a0', eye: '#1a1a1a' },
            // Золотистые
            { body: '#d4a574', belly: '#f4c594', fins: '#b48554', accent: '#947044', eye: '#1a1a1a' },
            // Зеленоватые
            { body: '#6a8a5a', belly: '#8aaa7a', fins: '#4a6a3a', accent: '#3a5a2a', eye: '#1a1a1a' },
            // Синие
            { body: '#4a6a8a', belly: '#6a8aaa', fins: '#2a4a6a', accent: '#1a3a5a', eye: '#1a1a1a' },
            // Красноватые
            { body: '#aa5a4a', belly: '#ca7a6a', fins: '#8a4a3a', accent: '#6a3a2a', eye: '#1a1a1a' },
            // Полосатые (тигровые)
            { body: '#d4a574', belly: '#f4c594', fins: '#b48554', accent: '#3a3a3a', eye: '#1a1a1a', stripes: true },
            // Пятнистые
            { body: '#8aaa7a', belly: '#aacaa9a', fins: '#6a8a5a', accent: '#2a4a2a', eye: '#1a1a1a', spots: true },
        ];

        let palette = rng.choice(palettes);

        // Для редких рыб - добавляем металлический блеск
        if (rarity === 'Legendary' || rarity === 'Mythical') {
            palette.metallic = true;
        }

        return palette;
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

    // Определяем тип тела рыбы
    const bodyTypes = ['torpedo', 'flat', 'deep', 'eel', 'predator'];
    const bodyType = rng.choice(bodyTypes);

    // Параметры тела зависят от типа
    let bodyLength, bodyHeight, tailType, finCount;

    switch(bodyType) {
        case 'torpedo': // Торпедообразные (тунец, марлин)
            bodyLength = rng.range(80, 120);
            bodyHeight = rng.range(25, 35);
            tailType = 'forked'; // Раздвоенный
            finCount = 5;
            break;
        case 'flat': // Плоские (камбала, скат)
            bodyLength = rng.range(70, 100);
            bodyHeight = rng.range(50, 70);
            tailType = 'rounded';
            finCount = 2;
            break;
        case 'deep': // Высокотелые (лещ, дискус)
            bodyLength = rng.range(60, 80);
            bodyHeight = rng.range(50, 70);
            tailType = 'rounded';
            finCount = 4;
            break;
        case 'eel': // Угреобразные
            bodyLength = rng.range(100, 150);
            bodyHeight = rng.range(15, 25);
            tailType = 'pointed';
            finCount = 1;
            break;
        case 'predator': // Хищники (щука, барракуда)
            bodyLength = rng.range(90, 130);
            bodyHeight = rng.range(30, 40);
            tailType = 'forked';
            finCount = 5;
            break;
    }

    // Глубоководные модификации
    const isDeep = depth > 0.7;
    const isMidDeep = depth > 0.5 && depth <= 0.7;

    let specialFeatures = [];
    if (isDeep) {
        // Страшные глубоководные особенности
        const deepFeatures = ['anglerLight', 'hugeFangs', 'transparentBody', 'glowingSpots', 'asymmetricJaw'];
        specialFeatures.push(rng.choice(deepFeatures));
        if (rng.next() > 0.6) {
            specialFeatures.push(rng.choice(deepFeatures));
        }
    } else if (isMidDeep) {
        if (rng.next() > 0.7) {
            specialFeatures.push('spines');
        }
    }

    // Цвета - реалистичные
    const colors = generateRealisticColors(seed, depth, rarity, bodyType);

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
            bodyType,
            bodyLength,
            bodyHeight,
            tailType,
            finCount,
            specialFeatures,
            colors,
            isDeep,
            isMidDeep
        }
    };
}

// Генерация SVG рыбы (реалистичный стиль с разными типами тел)
function generateFishSVG(visualParams, size = 200) {
    const { bodyType, bodyLength, bodyHeight, tailType, finCount, specialFeatures, colors, isDeep, seed } = visualParams;

    const rng = new SeededRandom(seed + 5000);
    const scale = size / 150;
    const centerX = size / 2;
    const centerY = size / 2;

    const svgParts = [];
    const bodyGradId = `bodyGrad_${seed}_${size}`;
    const finGradId = `finGrad_${seed}_${size}`;

    // Градиенты
    svgParts.push(`
        <defs>
            <linearGradient id="${bodyGradId}" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:${colors.body};stop-opacity:1" />
                <stop offset="50%" style="stop-color:${colors.belly};stop-opacity:1" />
                <stop offset="100%" style="stop-color:${colors.body};stop-opacity:0.9" />
            </linearGradient>
            <linearGradient id="${finGradId}" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:${colors.fins};stop-opacity:0.8" />
                <stop offset="100%" style="stop-color:${colors.accent};stop-opacity:0.6" />
            </linearGradient>
        </defs>
    `);

    // Генерируем тело в зависимости от типа
    let bodyPath, tailPath, finPaths;

    switch(bodyType) {
        case 'torpedo':
            ({ bodyPath, tailPath, finPaths } = generateTorpedoBody(centerX, centerY, bodyLength, bodyHeight, scale, colors, bodyGradId, finGradId, rng));
            break;
        case 'flat':
            ({ bodyPath, tailPath, finPaths } = generateFlatBody(centerX, centerY, bodyLength, bodyHeight, scale, colors, bodyGradId, finGradId, rng));
            break;
        case 'deep':
            ({ bodyPath, tailPath, finPaths } = generateDeepBody(centerX, centerY, bodyLength, bodyHeight, scale, colors, bodyGradId, finGradId, rng));
            break;
        case 'eel':
            ({ bodyPath, tailPath, finPaths } = generateEelBody(centerX, centerY, bodyLength, bodyHeight, scale, colors, bodyGradId, finGradId, rng));
            break;
        case 'predator':
            ({ bodyPath, tailPath, finPaths } = generatePredatorBody(centerX, centerY, bodyLength, bodyHeight, scale, colors, bodyGradId, finGradId, rng));
            break;
    }

    // Собираем SVG
    svgParts.push('<g>');

    // Хвост (рисуем первым, чтобы был под телом)
    svgParts.push(tailPath);

    // Плавники (нижние)
    finPaths.bottom.forEach(fin => svgParts.push(fin));

    // Тело
    svgParts.push(bodyPath);

    // Плавники (верхние)
    finPaths.top.forEach(fin => svgParts.push(fin));

    // Детали (чешуя, полосы, пятна)
    if (colors.stripes) {
        svgParts.push(generateStripes(centerX, centerY, bodyLength, bodyHeight, scale, colors.accent, rng));
    }
    if (colors.spots) {
        svgParts.push(generateSpots(centerX, centerY, bodyLength, bodyHeight, scale, colors.accent, rng));
    }

    // Специальные глубоководные особенности
    if (specialFeatures.includes('anglerLight')) {
        svgParts.push(generateAnglerLight(centerX, centerY, bodyLength, bodyHeight, scale, colors.glow));
    }
    if (specialFeatures.includes('hugeFangs')) {
        svgParts.push(generateFangs(centerX, centerY, bodyLength, bodyHeight, scale, '#ffffff'));
    }
    if (specialFeatures.includes('glowingSpots')) {
        svgParts.push(generateGlowingSpots(centerX, centerY, bodyLength, bodyHeight, scale, colors.glow, rng));
    }

    svgParts.push('</g>');

    // Глаз (поверх всего)
    const eyeX = centerX + bodyLength * scale * 0.35;
    const eyeY = centerY - bodyHeight * scale * 0.15;
    const eyeSize = isDeep ? 12 * scale : 8 * scale;

    svgParts.push(`<circle cx="${eyeX}" cy="${eyeY}" r="${eyeSize}" fill="#ffffff" opacity="0.9"/>`);
    svgParts.push(`<circle cx="${eyeX}" cy="${eyeY}" r="${eyeSize * 0.6}" fill="${colors.eye}"/>`);
    if (!isDeep) {
        svgParts.push(`<circle cx="${eyeX + eyeSize * 0.25}" cy="${eyeY - eyeSize * 0.25}" r="${eyeSize * 0.25}" fill="#ffffff" opacity="0.8"/>`);
    }

    return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">${svgParts.join('')}</svg>`;
}

// Экспорт для использования в HTML
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { generateFish, generateFishSVG, generateFishName };
}
