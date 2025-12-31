'use strict';

/**
 * AdaptiveEngine - AI-driven adaptive difficulty system
 * @module AdaptiveEngine
 */
export function createAdaptiveEngine(boardModule, shapeNames, storageKey) {
    const MIN_WEIGHT = 0.4;
    const MAX_WEIGHT = 8;
    const numShapes = shapeNames.length;
    const weights = Array(numShapes).fill(1);
    const holesByShape = Array(numShapes).fill(0);
    let sessionHolesByShape = Array(numShapes).fill(0);
    let totalTrackedMistakes = 0;
    let recentHighlights = [];
    let lastMetrics = null;

    function loadFromStorage() {
        try {
            const raw = localStorage.getItem(storageKey);
            if (!raw) {
                return;
            }
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed.weights) && parsed.weights.length === numShapes) {
                parsed.weights.forEach((value, index) => {
                    const numeric = Number(value);
                    if (Number.isFinite(numeric) && numeric > 0) {
                        weights[index] = Math.min(MAX_WEIGHT, Math.max(MIN_WEIGHT, numeric));
                    }
                });
            }
            if (Array.isArray(parsed.holesByShape) && parsed.holesByShape.length === numShapes) {
                parsed.holesByShape.forEach((value, index) => {
                    const numeric = Number(value);
                    holesByShape[index] = Number.isFinite(numeric) && numeric > 0 ? numeric : 0;
                });
            }
            if (typeof parsed.totalTrackedMistakes === 'number' && parsed.totalTrackedMistakes >= 0) {
                totalTrackedMistakes = parsed.totalTrackedMistakes;
            }
        } catch (err) {
            // Ignore corrupted state and fall back to defaults.
        }
    }

    function persistState() {
        try {
            const payload = JSON.stringify({
                weights,
                holesByShape,
                totalTrackedMistakes
            });
            localStorage.setItem(storageKey, payload);
        } catch (err) {
            // Persistence is optional; ignore storage errors.
        }
    }

    function resetForNewGame(boardState) {
        lastMetrics = boardModule.computeMetrics(boardState);
        recentHighlights = [];
        sessionHolesByShape = Array(numShapes).fill(0);
    }

    function selectShapeIndex() {
        const totalWeight = weights.reduce((sum, value) => sum + value, 0);
        if (totalWeight <= 0) {
            return Math.floor(Math.random() * numShapes);
        }
        let threshold = Math.random() * totalWeight;
        for (let i = 0; i < weights.length; i++) {
            threshold -= weights[i];
            if (threshold <= 0) {
                return i;
            }
        }
        return weights.length - 1;
    }

    function registerPlacement(shapeIndex, beforeMetrics, afterMetrics, linesCleared) {
        if (!beforeMetrics || !afterMetrics) {
            return;
        }

        const insightReasons = [];
        let positiveObservation = false;
        const holesDelta = afterMetrics.totalHoles - beforeMetrics.totalHoles;
        if (holesDelta > 0) {
            const boost = holesDelta * 0.6 + 0.4;
            weights[shapeIndex] = Math.min(MAX_WEIGHT, weights[shapeIndex] + boost);
            holesByShape[shapeIndex] += holesDelta;
            sessionHolesByShape[shapeIndex] += holesDelta;
            totalTrackedMistakes += holesDelta;
            insightReasons.push(`created ${holesDelta} new hole${holesDelta === 1 ? '' : 's'}`);
            positiveObservation = true;
        }

        const maxHeightDelta = afterMetrics.maxHeight - beforeMetrics.maxHeight;
        if (maxHeightDelta >= 3) {
            const heightBoost = maxHeightDelta * 0.3;
            weights[shapeIndex] = Math.min(MAX_WEIGHT, weights[shapeIndex] + heightBoost);
            const tallestColumn = afterMetrics.heights.indexOf(afterMetrics.maxHeight);
            if (tallestColumn >= 0) {
                insightReasons.push(`pushed column ${tallestColumn + 1} higher by ${maxHeightDelta}`);
                positiveObservation = true;
            }
        }

        if (linesCleared > 0) {
            const penalty = linesCleared > 1 ? linesCleared * 0.5 : 0.2;
            weights[shapeIndex] = Math.max(MIN_WEIGHT, weights[shapeIndex] - penalty);
        }

        if (positiveObservation) {
            recentHighlights.push({
                shapeIndex,
                reasons: insightReasons,
                afterMetrics: {
                    maxHeight: afterMetrics.maxHeight,
                    totalHoles: afterMetrics.totalHoles,
                    heights: afterMetrics.heights.slice()
                }
            });
            if (recentHighlights.length > 6) {
                recentHighlights.shift();
            }
        }

        lastMetrics = afterMetrics;
        persistState();
    }

    function getLiveHint() {
        const latest = recentHighlights[recentHighlights.length - 1];
        if (!latest) {
            return 'The adaptive engine is observing your moves.';
        }
        const reasonText = latest.reasons.join(' and ');
        return `Recent pressure: more ${shapeNames[latest.shapeIndex]} pieces because you ${reasonText}.`;
    }

    function getSummary(finalMetrics) {
        const sessionMistakes = sessionHolesByShape.reduce((sum, value) => sum + value, 0);
        const sentences = [];
        if (sessionMistakes === 0) {
            if (finalMetrics) {
                const columnIndex = finalMetrics.heights.indexOf(finalMetrics.maxHeight);
                const columnLabel = columnIndex >= 0 ? columnIndex + 1 : 'one column';
                sentences.push(`I could not exploit a repeating weakness, but your stack in column ${columnLabel} climbed to ${finalMetrics.maxHeight} blocks.`);
                if (finalMetrics.totalHoles > 0) {
                    sentences.push(`Keeping ${finalMetrics.totalHoles} hidden hole${finalMetrics.totalHoles === 1 ? '' : 's'} made recovery harder.`);
                }
            } else {
                sentences.push('I did not gather enough data to exploit a weakness this round.');
            }
            return sentences.join(' ');
        }

        const rankedShapes = sessionHolesByShape
            .map((value, index) => ({ index, value }))
            .filter((entry) => entry.value > 0)
            .sort((a, b) => b.value - a.value);

        if (rankedShapes.length > 0) {
            const primary = rankedShapes[0];
            sentences.push(`I boosted ${shapeNames[primary.index]} pieces after they trapped ${primary.value} extra hole${primary.value === 1 ? '' : 's'}.`);
            const secondary = rankedShapes[1];
            if (secondary) {
                sentences.push(`I also leaned on ${shapeNames[secondary.index]} pieces because they kept your board unstable.`);
            }
        }

        const highlight = recentHighlights[recentHighlights.length - 1];
        if (highlight) {
            const columnIndex = highlight.afterMetrics.heights.indexOf(highlight.afterMetrics.maxHeight);
            const columnLabel = columnIndex >= 0 ? columnIndex + 1 : 'a column';
            sentences.push(`Near the end, extra ${shapeNames[highlight.shapeIndex]} pieces ${highlight.reasons.join(' and ')} while column ${columnLabel} reached ${highlight.afterMetrics.maxHeight} blocks.`);
        }

        if (finalMetrics) {
            const columnIndex = finalMetrics.heights.indexOf(finalMetrics.maxHeight);
            const columnLabel = columnIndex >= 0 ? columnIndex + 1 : 'one column';
            sentences.push(`You topped out with ${finalMetrics.totalHoles} hole${finalMetrics.totalHoles === 1 ? '' : 's'} and a skyline difference of ${finalMetrics.bumpiness}. Column ${columnLabel} was the first to break the ceiling.`);
        }

        return sentences.join(' ');
    }

    return {
        loadFromStorage,
        resetForNewGame,
        selectShapeIndex,
        registerPlacement,
        getLiveHint,
        getSummary
    };
}
