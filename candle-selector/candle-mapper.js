const CandleMapper = {
    /**
     * Converts candle data into screen/chart coordinates.
     */
    mapToCoordinates(candle, chartInfo) {
        if (candle.rect) {
            // HTML-based coordinates
            const chartRect = chartInfo.chartElement.getBoundingClientRect();
            return {
                index: candle.index,
                x: candle.rect.left - chartRect.left,
                y: candle.rect.top - chartRect.top,
                width: candle.rect.width,
                height: candle.rect.height,
                openY: candle.rect.top - chartRect.top, // Simplification
                closeY: candle.rect.bottom - chartRect.top,
                highY: candle.rect.top - chartRect.top - 5,
                lowY: candle.rect.bottom - chartRect.top + 5
            };
        }

        // Logic for Canvas/WebGL coordinate mapping would go here
        // Usually: (price - minPrice) / (maxPrice - minPrice) * height
        
        return null;
    }
};

window.CandleMapper = CandleMapper;
