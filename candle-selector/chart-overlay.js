const ChartOverlay = {
    overlayElement: null,
    chartInfo: null,

    init() {
        this.chartInfo = window.ChartDetector.detect();
        if (!this.chartInfo) return;

        if (!this.overlayElement) {
            this.overlayElement = document.createElement('div');
            this.overlayElement.id = 'po-candle-selector-overlay';
            this.overlayElement.className = 'po-chart-overlay';
            this.chartInfo.chartElement.style.position = 'relative';
            this.chartInfo.chartElement.appendChild(this.overlayElement);
            logDebug('Overlay updated');
        }

        this.syncSize();
        this.setupObservers();
    },

    setupObservers() {
        const resizeObserver = new ResizeObserver(() => {
            this.syncSize();
            this.render();
        });
        resizeObserver.observe(this.chartInfo.chartElement);

        // Watch for mutations in the chart area
        const mutationObserver = new MutationObserver((mutations) => {
            if (mutations.some(m => m.addedNodes.length > 0)) {
                this.render();
            }
        });
        mutationObserver.observe(this.chartInfo.chartElement, { childList: true, subtree: true });
    },

    syncSize() {
        if (!this.overlayElement || !this.chartInfo) return;
        const rect = this.chartInfo.chartElement.getBoundingClientRect();
        this.overlayElement.style.width = rect.width + 'px';
        this.overlayElement.style.height = rect.height + 'px';
    },

    render() {
        if (!this.overlayElement) return;
        
        // Clear previous highlights
        this.overlayElement.innerHTML = '';

        const selectedIndices = window.CandleSelector.getSelectedIndices ? window.CandleSelector.getSelectedIndices() : window.CandleSelector.selectedIndices;
        if (!selectedIndices || selectedIndices.length === 0) return;

        // In a real implementation, we would map the indices to coordinates
        // For the simulation, we highlight the most recent N candles
        const candles = window.CandleDetector.detectCandles(this.chartInfo);
        
        selectedIndices.forEach(index => {
            const candle = candles[index];
            if (candle) {
                const coords = window.CandleMapper.mapToCoordinates(candle, this.chartInfo);
                if (coords) {
                    this.drawHighlight(coords);
                }
            } else {
                // Mock behavior if no candles detected: draw at the right side
                // This helps demonstrate the feature even if DOM detection fails on Canvas
                const chartWidth = this.chartInfo.width;
                const candleWidth = 10;
                const spacing = 4;
                const rightOffset = (candles.length - 1 - index) * (candleWidth + spacing);
                
                this.drawHighlight({
                    x: chartWidth - 100 - rightOffset,
                    y: 100,
                    width: candleWidth,
                    height: 100
                });
            }
        });
    },

    drawHighlight(coords) {
        const highlight = document.createElement('div');
        highlight.className = 'po-candle-highlight';
        highlight.style.left = coords.x + 'px';
        highlight.style.top = coords.y + 'px';
        highlight.style.width = coords.width + 'px';
        highlight.style.height = coords.height + 'px';
        
        // Add L-shape corners inside the highlight box
        highlight.innerHTML = `
            <div class="corner tl"></div>
            <div class="corner tr"></div>
            <div class="corner bl"></div>
            <div class="corner br"></div>
        `;
        
        this.overlayElement.appendChild(highlight);
    }
};

window.ChartOverlay = ChartOverlay;
