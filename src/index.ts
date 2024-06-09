import * as path from 'path';
import { StockAnalyzerImpl } from './analyzer/StockAnalyzerImpl';

const main = async () => {
    const stockAnalyzer = new StockAnalyzerImpl();

    const filePath = path.resolve(__dirname, 'data', 'stock_data.csv');
    const data = await stockAnalyzer.processCSV(filePath);

    const END_DATE = new Date('2017-12-28'); 

    const endDateData = data.find(d => {
        const endDateWithoutTime = new Date(END_DATE.getFullYear(), END_DATE.getMonth(), END_DATE.getDate());
        const currentDateWithoutTime = new Date(d.date.getFullYear(), d.date.getMonth(), d.date.getDate());
        return currentDateWithoutTime.getTime() === endDateWithoutTime.getTime();
    });

    if (endDateData) {
        const totalShares = stockAnalyzer.calculateInvestments(data);
        const finalCapital = StockAnalyzerImpl.roundToThreeDecimals(totalShares * endDateData.close);

        // Calcular las ganancias netas
        const INVEST_AMOUNT = 50;
        const BROKER_FEE = 0.02;
        const initialInvestment = INVEST_AMOUNT * data.filter(d => StockAnalyzerImpl.isLastThursdayOfMonth(d.date)).length;
        const netProfit = finalCapital - initialInvestment;

        // Calcular el IRPF basado en las ganancias netas
        let irpfRate = 0;
        let irpfCost = 0;
        if (netProfit <= 6000) {
            irpfRate = 0.19;
        } else if (netProfit > 6000 && netProfit <= 50000) {
            irpfRate = 0.21;
        } else {
            irpfRate = 0.23;
        }
        irpfCost = StockAnalyzerImpl.roundToThreeDecimals(netProfit * irpfRate);

        console.log(`Total capital on 28-Dec-2017: €${finalCapital}`);
        console.log(`Net profit: €${netProfit}`);
        console.log(`IRPF Cost: €${irpfCost}`);

        console.log(`Total shares: ${totalShares}`);
    } else {
        console.error('End date data not found');
    }
};

const INVEST_AMOUNT = 50;
const BROKER_FEE = 0.02;
const START_DATE = new Date('2001-05-23');

main().catch(console.error);

export { main };
