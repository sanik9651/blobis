// Функции генерации разных типов тел рыб

// Торпедообразное тело (тунец, марлин)
function generateTorpedoBody(cx, cy, length, height, scale, colors, bodyGradId, finGradId, rng) {
    const l = length * scale;
    const h = height * scale;

    // Тело - вытянутый эллипс с заострённым носом
    const bodyPath = `
        <path d="M ${cx - l * 0.45} ${cy}
                 C ${cx - l * 0.4} ${cy - h * 0.5}, ${cx - l * 0.1} ${cy - h * 0.48}, ${cx + l * 0.1} ${cy - h * 0.4}
                 C ${cx + l * 0.3} ${cy - h * 0.25}, ${cx + l * 0.45} ${cy - h * 0.1}, ${cx + l * 0.5} ${cy}
                 C ${cx + l * 0.45} ${cy + h * 0.1}, ${cx + l * 0.3} ${cy + h * 0.25}, ${cx + l * 0.1} ${cy + h * 0.4}
                 C ${cx - l * 0.1} ${cy + h * 0.48}, ${cx - l * 0.4} ${cy + h * 0.5}, ${cx - l * 0.45} ${cy}
                 Z"
              fill="url(#${bodyGradId})" stroke="${colors.body}" stroke-width="1"/>
    `;

    // Хвост - раздвоенный (V-образный)
    const tailX = cx - l * 0.45;
    const tailPath = `
        <path d="M ${tailX} ${cy}
                 L ${tailX - l * 0.25} ${cy - h * 0.6}
                 L ${tailX - l * 0.15} ${cy}
                 L ${tailX - l * 0.25} ${cy + h * 0.6}
                 Z"
              fill="url(#${finGradId})" stroke="${colors.fins}" stroke-width="1"/>
    `;

    // Плавники
    const finPaths = {
        top: [
            // Спинной плавник
            `<path d="M ${cx - l * 0.1} ${cy - h * 0.48}
                     L ${cx - l * 0.15} ${cy - h * 0.9}
                     L ${cx + l * 0.05} ${cy - h * 0.48}
                     Z"
                  fill="url(#${finGradId})" stroke="${colors.fins}" stroke-width="1"/>`,
            // Второй спинной (маленький)
            `<path d="M ${cx + l * 0.15} ${cy - h * 0.4}
                     L ${cx + l * 0.12} ${cy - h * 0.65}
                     L ${cx + l * 0.25} ${cy - h * 0.4}
                     Z"
                  fill="url(#${finGradId})" stroke="${colors.fins}" stroke-width="1"/>`
        ],
        bottom: [
            // Грудные плавники
            `<path d="M ${cx + l * 0.2} ${cy}
                     L ${cx + l * 0.15} ${cy + h * 0.55}
                     L ${cx + l * 0.3} ${cy + h * 0.2}
                     Z"
                  fill="url(#${finGradId})" opacity="0.8" stroke="${colors.fins}" stroke-width="0.8"/>`,
            // Анальный плавник
            `<path d="M ${cx} ${cy + h * 0.48}
                     L ${cx - l * 0.05} ${cy + h * 0.75}
                     L ${cx + l * 0.1} ${cy + h * 0.48}
                     Z"
                  fill="url(#${finGradId})" stroke="${colors.fins}" stroke-width="1"/>`
        ]
    };

    return { bodyPath, tailPath, finPaths };
}

// Плоское тело (камбала, скат)
function generateFlatBody(cx, cy, length, height, scale, colors, bodyGradId, finGradId, rng) {
    const l = length * scale;
    const h = height * scale;

    // Тело - широкий овал
    const bodyPath = `
        <ellipse cx="${cx}" cy="${cy}" rx="${l * 0.5}" ry="${h * 0.5}"
                 fill="url(#${bodyGradId})" stroke="${colors.body}" stroke-width="1.5"/>
    `;

    // Хвост - тонкий и короткий
    const tailPath = `
        <path d="M ${cx - l * 0.5} ${cy}
                 L ${cx - l * 0.7} ${cy - h * 0.15}
                 L ${cx - l * 0.65} ${cy}
                 L ${cx - l * 0.7} ${cy + h * 0.15}
                 Z"
              fill="url(#${finGradId})" stroke="${colors.fins}" stroke-width="1"/>
    `;

    // Плавники - волнистые края тела
    const finPaths = {
        top: [],
        bottom: [
            // Грудные плавники (часть тела)
            `<path d="M ${cx + l * 0.1} ${cy - h * 0.4}
                     Q ${cx + l * 0.3} ${cy - h * 0.55}, ${cx + l * 0.45} ${cy - h * 0.3}
                     L ${cx + l * 0.4} ${cy - h * 0.2}
                     Q ${cx + l * 0.25} ${cy - h * 0.45}, ${cx + l * 0.1} ${cy - h * 0.35}
                     Z"
                  fill="url(#${finGradId})" opacity="0.7" stroke="${colors.fins}" stroke-width="0.8"/>`,
            `<path d="M ${cx + l * 0.1} ${cy + h * 0.4}
                     Q ${cx + l * 0.3} ${cy + h * 0.55}, ${cx + l * 0.45} ${cy + h * 0.3}
                     L ${cx + l * 0.4} ${cy + h * 0.2}
                     Q ${cx + l * 0.25} ${cy + h * 0.45}, ${cx + l * 0.1} ${cy + h * 0.35}
                     Z"
                  fill="url(#${finGradId})" opacity="0.7" stroke="${colors.fins}" stroke-width="0.8"/>`
        ]
    };

    return { bodyPath, tailPath, finPaths };
}

// Высокотелое тело (лещ, дискус)
function generateDeepBody(cx, cy, length, height, scale, colors, bodyGradId, finGradId, rng) {
    const l = length * scale;
    const h = height * scale;

    // Тело - высокий овал
    const bodyPath = `
        <path d="M ${cx - l * 0.4} ${cy}
                 C ${cx - l * 0.35} ${cy - h * 0.55}, ${cx - l * 0.1} ${cy - h * 0.6}, ${cx + l * 0.2} ${cy - h * 0.5}
                 C ${cx + l * 0.4} ${cy - h * 0.3}, ${cx + l * 0.5} ${cy - h * 0.1}, ${cx + l * 0.5} ${cy}
                 C ${cx + l * 0.5} ${cy + h * 0.1}, ${cx + l * 0.4} ${cy + h * 0.3}, ${cx + l * 0.2} ${cy + h * 0.5}
                 C ${cx - l * 0.1} ${cy + h * 0.6}, ${cx - l * 0.35} ${cy + h * 0.55}, ${cx - l * 0.4} ${cy}
                 Z"
              fill="url(#${bodyGradId})" stroke="${colors.body}" stroke-width="1.5"/>
    `;

    // Хвост - округлый веер
    const tailPath = `
        <path d="M ${cx - l * 0.4} ${cy}
                 Q ${cx - l * 0.55} ${cy - h * 0.35}, ${cx - l * 0.5} ${cy - h * 0.45}
                 Q ${cx - l * 0.45} ${cy - h * 0.25}, ${cx - l * 0.42} ${cy}
                 Q ${cx - l * 0.45} ${cy + h * 0.25}, ${cx - l * 0.5} ${cy + h * 0.45}
                 Q ${cx - l * 0.55} ${cy + h * 0.35}, ${cx - l * 0.4} ${cy}
                 Z"
              fill="url(#${finGradId})" stroke="${colors.fins}" stroke-width="1"/>
    `;

    // Плавники
    const finPaths = {
        top: [
            // Высокий спинной плавник
            `<path d="M ${cx - l * 0.2} ${cy - h * 0.6}
                     L ${cx - l * 0.25} ${cy - h * 1.1}
                     L ${cx + l * 0.1} ${cy - h * 0.95}
                     L ${cx + l * 0.2} ${cy - h * 0.5}
                     Z"
                  fill="url(#${finGradId})" stroke="${colors.fins}" stroke-width="1"/>`
        ],
        bottom: [
            // Грудной плавник
            `<path d="M ${cx + l * 0.25} ${cy}
                     L ${cx + l * 0.2} ${cy + h * 0.4}
                     L ${cx + l * 0.35} ${cy + h * 0.15}
                     Z"
                  fill="url(#${finGradId})" opacity="0.8" stroke="${colors.fins}" stroke-width="0.8"/>`,
            // Анальный плавник
            `<path d="M ${cx - l * 0.1} ${cy + h * 0.6}
                     L ${cx - l * 0.15} ${cy + h * 0.95}
                     L ${cx + l * 0.15} ${cy + h * 0.5}
                     Z"
                  fill="url(#${finGradId})" stroke="${colors.fins}" stroke-width="1"/>`
        ]
    };

    return { bodyPath, tailPath, finPaths };
}

// Угреобразное тело
function generateEelBody(cx, cy, length, height, scale, colors, bodyGradId, finGradId, rng) {
    const l = length * scale;
    const h = height * scale;

    // Тело - длинная волнистая форма
    const wave1 = rng.range(-h * 0.1, h * 0.1);
    const wave2 = rng.range(-h * 0.15, h * 0.15);

    const bodyPath = `
        <path d="M ${cx - l * 0.5} ${cy}
                 C ${cx - l * 0.3} ${cy - h * 0.5 + wave1}, ${cx - l * 0.1} ${cy + h * 0.5 + wave2}, ${cx + l * 0.1} ${cy - h * 0.4}
                 C ${cx + l * 0.3} ${cy + h * 0.3}, ${cx + l * 0.45} ${cy - h * 0.2}, ${cx + l * 0.5} ${cy}
                 C ${cx + l * 0.45} ${cy + h * 0.2}, ${cx + l * 0.3} ${cy - h * 0.3}, ${cx + l * 0.1} ${cy + h * 0.4}
                 C ${cx - l * 0.1} ${cy - h * 0.5 + wave2}, ${cx - l * 0.3} ${cy + h * 0.5 + wave1}, ${cx - l * 0.5} ${cy}
                 Z"
              fill="url(#${bodyGradId})" stroke="${colors.body}" stroke-width="1.5"/>
    `;

    // Хвост - заострённый
    const tailPath = `
        <path d="M ${cx - l * 0.5} ${cy}
                 L ${cx - l * 0.65} ${cy - h * 0.25}
                 L ${cx - l * 0.7} ${cy}
                 L ${cx - l * 0.65} ${cy + h * 0.25}
                 Z"
              fill="url(#${finGradId})" stroke="${colors.fins}" stroke-width="1"/>
    `;

    // Плавники - один длинный спинной
    const finPaths = {
        top: [
            `<path d="M ${cx - l * 0.4} ${cy - h * 0.5}
                     Q ${cx - l * 0.2} ${cy - h * 0.7}, ${cx} ${cy - h * 0.6}
                     Q ${cx + l * 0.2} ${cy - h * 0.65}, ${cx + l * 0.4} ${cy - h * 0.5}
                     L ${cx + l * 0.35} ${cy - h * 0.4}
                     Q ${cx + l * 0.15} ${cy - h * 0.55}, ${cx - l * 0.05} ${cy - h * 0.5}
                     Q ${cx - l * 0.25} ${cy - h * 0.6}, ${cx - l * 0.35} ${cy - h * 0.45}
                     Z"
                  fill="url(#${finGradId})" opacity="0.7" stroke="${colors.fins}" stroke-width="0.8"/>`
        ],
        bottom: []
    };

    return { bodyPath, tailPath, finPaths };
}

// Хищное тело (щука, барракуда)
function generatePredatorBody(cx, cy, length, height, scale, colors, bodyGradId, finGradId, rng) {
    const l = length * scale;
    const h = height * scale;

    // Тело - вытянутое с большой головой
    const bodyPath = `
        <path d="M ${cx - l * 0.45} ${cy}
                 C ${cx - l * 0.4} ${cy - h * 0.45}, ${cx - l * 0.2} ${cy - h * 0.5}, ${cx} ${cy - h * 0.48}
                 C ${cx + l * 0.2} ${cy - h * 0.4}, ${cx + l * 0.4} ${cy - h * 0.25}, ${cx + l * 0.5} ${cy}
                 C ${cx + l * 0.4} ${cy + h * 0.25}, ${cx + l * 0.2} ${cy + h * 0.4}, ${cx} ${cy + h * 0.48}
                 C ${cx - l * 0.2} ${cy + h * 0.5}, ${cx - l * 0.4} ${cy + h * 0.45}, ${cx - l * 0.45} ${cy}
                 Z"
              fill="url(#${bodyGradId})" stroke="${colors.body}" stroke-width="1.5"/>
    `;

    // Хвост - мощный раздвоенный
    const tailPath = `
        <path d="M ${cx - l * 0.45} ${cy}
                 L ${cx - l * 0.65} ${cy - h * 0.55}
                 L ${cx - l * 0.55} ${cy}
                 L ${cx - l * 0.65} ${cy + h * 0.55}
                 Z"
              fill="url(#${finGradId})" stroke="${colors.fins}" stroke-width="1.2"/>
    `;

    // Плавники
    const finPaths = {
        top: [
            // Спинной плавник (далеко сзади)
            `<path d="M ${cx - l * 0.25} ${cy - h * 0.5}
                     L ${cx - l * 0.3} ${cy - h * 0.85}
                     L ${cx - l * 0.1} ${cy - h * 0.5}
                     Z"
                  fill="url(#${finGradId})" stroke="${colors.fins}" stroke-width="1"/>`
        ],
        bottom: [
            // Грудные плавники
            `<path d="M ${cx + l * 0.25} ${cy}
                     L ${cx + l * 0.2} ${cy + h * 0.5}
                     L ${cx + l * 0.35} ${cy + h * 0.15}
                     Z"
                  fill="url(#${finGradId})" opacity="0.8" stroke="${colors.fins}" stroke-width="0.8"/>`,
            // Брюшные плавники
            `<path d="M ${cx} ${cy + h * 0.48}
                     L ${cx - l * 0.05} ${cy + h * 0.7}
                     L ${cx + l * 0.05} ${cy + h * 0.48}
                     Z"
                  fill="url(#${finGradId})" opacity="0.8" stroke="${colors.fins}" stroke-width="0.8"/>`
        ]
    };

    return { bodyPath, tailPath, finPaths };
}

// Полосы
function generateStripes(cx, cy, length, height, scale, color, rng) {
    const l = length * scale;
    const h = height * scale;
    const stripeCount = Math.floor(rng.range(3, 6));
    let stripes = '';

    for (let i = 0; i < stripeCount; i++) {
        const x = cx - l * 0.3 + (i / stripeCount) * l * 0.6;
        const width = l * 0.08;
        stripes += `<ellipse cx="${x}" cy="${cy}" rx="${width}" ry="${h * 0.4}" fill="${color}" opacity="0.4"/>`;
    }

    return stripes;
}

// Пятна
function generateSpots(cx, cy, length, height, scale, color, rng) {
    const l = length * scale;
    const h = height * scale;
    const spotCount = Math.floor(rng.range(5, 12));
    let spots = '';

    for (let i = 0; i < spotCount; i++) {
        const x = cx + rng.range(-l * 0.3, l * 0.3);
        const y = cy + rng.range(-h * 0.3, h * 0.3);
        const r = rng.range(scale * 2, scale * 5);
        spots += `<circle cx="${x}" cy="${y}" r="${r}" fill="${color}" opacity="0.5"/>`;
    }

    return spots;
}

// Фонарик удильщика
function generateAnglerLight(cx, cy, length, height, scale, glowColor) {
    const l = length * scale;
    const h = height * scale;

    return `
        <line x1="${cx + l * 0.5}" y1="${cy - h * 0.1}" x2="${cx + l * 0.7}" y2="${cy - h * 0.5}" stroke="${glowColor}" stroke-width="2" opacity="0.6"/>
        <circle cx="${cx + l * 0.7}" cy="${cy - h * 0.5}" r="${scale * 6}" fill="${glowColor}" opacity="0.9">
            <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite"/>
        </circle>
        <circle cx="${cx + l * 0.7}" cy="${cy - h * 0.5}" r="${scale * 10}" fill="${glowColor}" opacity="0.3">
            <animate attributeName="opacity" values="0.1;0.4;0.1" dur="2s" repeatCount="indefinite"/>
        </circle>
    `;
}

// Огромные клыки
function generateFangs(cx, cy, length, height, scale, color) {
    const l = length * scale;
    const h = height * scale;

    return `
        <path d="M ${cx + l * 0.45} ${cy - h * 0.1}
                 L ${cx + l * 0.55} ${cy - h * 0.05}
                 L ${cx + l * 0.5} ${cy + h * 0.15}
                 Z"
              fill="${color}" opacity="0.9"/>
        <path d="M ${cx + l * 0.45} ${cy + h * 0.1}
                 L ${cx + l * 0.55} ${cy + h * 0.05}
                 L ${cx + l * 0.5} ${cy - h * 0.15}
                 Z"
              fill="${color}" opacity="0.9"/>
    `;
}

// Светящиеся пятна
function generateGlowingSpots(cx, cy, length, height, scale, glowColor, rng) {
    const l = length * scale;
    const h = height * scale;
    const spotCount = Math.floor(rng.range(3, 7));
    let spots = '';

    for (let i = 0; i < spotCount; i++) {
        const x = cx + rng.range(-l * 0.3, l * 0.2);
        const y = cy + rng.range(-h * 0.3, h * 0.3);
        const r = rng.range(scale * 2, scale * 4);
        spots += `
            <circle cx="${x}" cy="${y}" r="${r}" fill="${glowColor}" opacity="0.7">
                <animate attributeName="opacity" values="0.4;0.9;0.4" dur="${rng.range(1.5, 3)}s" repeatCount="indefinite"/>
            </circle>
        `;
    }

    return spots;
}
