import { StockData } from "../interfaces/StockData";

export interface StockAnalyzer {
    processCSV(filePath: string): Promise<StockData[]>;
    calculateInvestments(data: StockData[]): number;
}