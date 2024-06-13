import * as fs from 'fs';
import { parse } from 'csv-parse';
import { StockData } from '../interfaces/StockData';
import { StockAnalyzer } from '../interfaces/StockAnalyzer';

class StockAnalyzerImpl implements StockAnalyzer {
    public static roundToThreeDecimals(num: number): number {
        return Math.round(num * 1000) / 1000;
    }

    public static isLastThursdayOfMonth(date: Date): boolean {
        const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        const dayOfWeek = lastDayOfMonth.getDay();
        const offset = (dayOfWeek >= 4) ? dayOfWeek - 4 : 7 - (4 - dayOfWeek);
        const lastThursday = new Date(lastDayOfMonth);
        lastThursday.setDate(lastDayOfMonth.getDate() - offset);

        return date.getTime() === lastThursday.getTime();
    }

    public async processCSV(filePath: string): Promise<StockData[]> {
        interface Months {
            ene: number;
            feb: number;
            mar: number;
            abr: number;
            may: number;
            jun: number;
            jul: number;
            ago: number;
            sep: number;
            oct: number;
            nov: number;
            dic: number;
        }

        const months: Months = {
            ene: 0, feb: 1, mar: 2, abr: 3, may: 4, jun: 5,
            jul: 6, ago: 7, sep: 8, oct: 9, nov: 10, dic: 11
        };

        return new Promise((resolve, reject) => {
            const stockData: StockData[] = [];
            fs.createReadStream(filePath)
                .pipe(parse({ delimiter: ';', columns: true }))
                .on('data', (row: any) => {
                    const dateParts = row.Fecha.split('-');
                    const monthAbbreviation = dateParts[1].toLowerCase() as keyof Months;
                    const month = months[monthAbbreviation];
                    const year = parseInt(dateParts[2]);
                    const day = parseInt(dateParts[0]);
                    const date = new Date(year, month, day);

                    stockData.push({
                        date: date,
                        close: parseFloat(row.Cierre),
                        open: parseFloat(row.Apertura)
                    });
                })
                .on('end', () => resolve(stockData))
                .on('error', (error) => reject(error));
        });
    }

    public calculateInvestments(data: StockData[]): number {
        let totalShares = 0;
        for (let i = 0; i < data.length; i++) {
            const currentDate = data[i].date;
            if (StockAnalyzerImpl.isLastThursdayOfMonth(currentDate)) {
                let nextTradingDayIndex = i - 1; // Iniciar en el día anterior para fechas descendentes
                console.log(`Last Thursday of the month: ${currentDate.toLocaleDateString()}`);
               // console.log(`Initial nextTradingDayIndex: ${nextTradingDayIndex}`);

                while (nextTradingDayIndex >= 0) { // Asegurarse de no salir de los límites del array
                    const nextTradingDay = data[nextTradingDayIndex].date;
                   // console.log(`Checking next trading day: ${nextTradingDay.toLocaleDateString()}`);

                    if (StockAnalyzerImpl.isTradingDay(nextTradingDay)) {
                        const INVEST_AMOUNT = 50;
                        const BROKER_FEE = 0.02;
                        const investAmountAfterFee = StockAnalyzerImpl.roundToThreeDecimals(INVEST_AMOUNT * (1 - BROKER_FEE));
                        const sharesBought = StockAnalyzerImpl.roundToThreeDecimals(investAmountAfterFee / data[nextTradingDayIndex].open);
                        totalShares = StockAnalyzerImpl.roundToThreeDecimals(totalShares + sharesBought);

                        console.log(`Fecha de compra: ${nextTradingDay.toLocaleDateString()}`);
                        console.log("monto a invertir", investAmountAfterFee)
                        console.log("sharesboun", totalShares)
                        console.log(`Valor de la acción en la apertura: ${data[nextTradingDayIndex].open}`);
                        break;
                    }

                    nextTradingDayIndex--;
                }
            }
        }
        
        return totalShares;
    }

    public static isTradingDay(date: Date): boolean {
        const dayOfWeek = date.getDay();
        return dayOfWeek !== 0 && dayOfWeek !== 6; // 0 es domingo y 6 es sábado
    }
}

export { StockAnalyzerImpl };
