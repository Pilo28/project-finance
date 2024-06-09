import { StockAnalyzerImpl } from '../src/analyzer/StockAnalyzerImpl';
import { main } from '../src';

describe('StockAnalyzerImpl', () => {
    let stockAnalyzer: StockAnalyzerImpl;

    beforeEach(() => {
        stockAnalyzer = new StockAnalyzerImpl();
    });

    describe('calculateInvestments', () => {
        it('should calculate total capital, net profit, IRPF cost, and total shares accurately', async () => {
            // Simular los valores esperados
            const expectedTotalCapital = 35543.557;
            const expectedNetProfit = 25843.557;
            const expectedIrpfCost = 5427.147;
            const expectedTotalShares = 1218.497;

            // Mockear la función main para evitar imprimir en la consola
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

            // Ejecutar la función principal para obtener los resultados
            await main();

            // Verificar si los resultados coinciden con los esperados
            expect(consoleSpy).toHaveBeenCalledWith(`Total capital on 28-Dec-2017: €${expectedTotalCapital}`);
            expect(consoleSpy).toHaveBeenCalledWith(`Net profit: €${expectedNetProfit}`);
            expect(consoleSpy).toHaveBeenCalledWith(`IRPF Cost: €${expectedIrpfCost}`);
            expect(consoleSpy).toHaveBeenCalledWith(`Total shares: ${expectedTotalShares}`);

            // Restaurar la implementación original de console.log después de las verificaciones
            consoleSpy.mockRestore();
        });
    });
});
