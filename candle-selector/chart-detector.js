const DEBUG_CANDLE_SELECTOR = true;

function logDebug(...args) {
    if (DEBUG_CANDLE_SELECTOR) {
        console.log('[CandleSelector]', ...args);
    }
}

const ChartDetector = {
    detect() {
        // Pocket Option chart containers
        const selectors = [
            '.chart-container',
            '.trading-chart',
            '#chart-container',
            '.chart-main-container',
            '.tv-lightweight-charts',
            '.chart-area',
            '.main-chart'
        ];

        let chartElement = null;
        for (const sel of selectors) {
            chartElement = document.querySelector(sel);
            if (chartElement) break;
        }

        if (!chartElement) {
            // Try to find by finding the largest canvas that looks like a chart
            const canvases = document.querySelectorAll('canvas');
            let maxArea = 0;
            for (const c of canvases) {
                const area = c.width * c.height;
                if (area > maxArea && area > 90000) { // at least 300x300
                    maxArea = area;
                    chartElement = c.parentElement;
                }
            }
        }

        if (!chartElement) return null;

        const canvasElement = chartElement.querySelector('canvas');
        const svgElement = chartElement.querySelector('svg');

        let type = 'unknown';
        if (canvasElement) {
            const gl = canvasElement.getContext('webgl') || canvasElement.getContext('webgl2');
            type = gl ? 'webgl' : 'canvas';
        } else if (svgElement) {
            type = 'svg';
        } else if (chartElement.querySelectorAll('.candle, .bar').length > 0) {
            type = 'html';
        }

        logDebug('Chart detected:', type);

        return {
            chartElement,
            canvasElement: canvasElement || svgElement || chartElement,
            width: chartElement.clientWidth,
            height: chartElement.clientHeight,
            type
        };
    }
};

window.ChartDetector = ChartDetector;
