const CandleSelector = {
    selectedIndices: [],
    
    selectCandle(index) {
        logDebug('Candle selected:', index);
        this.selectedIndices = [index];
        this.update();
    },

    selectCandles(startIndex, endIndex) {
        logDebug('Candle range selected:', startIndex, 'to', endIndex);
        this.selectedIndices = [];
        for (let i = startIndex; i <= endIndex; i++) {
            this.selectedIndices.push(i);
        }
        this.update();
    },

    selectSignalCandle(candleIndex) {
        logDebug('Signal candle selected:', candleIndex);
        this.selectCandle(candleIndex);
    },

    clearSelection() {
        logDebug('Selection cleared');
        this.selectedIndices = [];
        this.update();
    },

    getSelectedCandles() {
        return this.selectedIndices;
    },

    update() {
        if (window.ChartOverlay) {
            window.ChartOverlay.render();
        }
    }
};

window.CandleSelector = CandleSelector;
