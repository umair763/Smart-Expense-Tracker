import AvaiableBalanceCard from '../../components/Dashboard/AvaiableBalanceCard';
import Categories from '../../components/Dashboard/Catagories';
import MonthlyReportBarGraph from '../../components/Dashboard/MonthlyReportBarGraph';
import IncomeAndSpendings from '../../components/Dashboard/IncomeAndSpendings';
import IncomeGraphWithFilter from '../../components/Dashboard/IncomeGraphWithFilter';
import IncomeGraph from '../../components/income/IncomeGraph';
import TransactionGraph from '../../components/Trasactions/TransactionGraph';
import { useEffect } from 'react';

function MainDashBoard({ isTheme }) {
   // Temporary debug code - REMOVE AFTER USE
   useEffect(() => {
      const token = localStorage.getItem('token');
      if (token) {
         console.log('DEBUG - Auth Token:', token);
         console.log('DEBUG - Full Auth Header:', `Bearer ${token}`);
      }
   }, []);

   return (
      <div className="w-full max-w-8xl mx-auto">
         {/* Top Cards Section with max-width constraint */}
         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 mx-auto">
            <div className="w-full max-w-xl mx-auto sm:mx-0">
               <AvaiableBalanceCard />
            </div>
            <div className="w-full max-w-xl mx-auto sm:mx-0">
               <IncomeAndSpendings />
            </div>
         </div>

         {/* Section 1: Expenses Visualization */}
         <div className="mb-6">
            <h2 className="text-xl font-bold mb-4 dark:text-white">Expenses Visualization</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
               {/* Left: Day-to-Day Expenses Bar Graph (Larger space - 2/3) */}
               <div className="lg:col-span-2 card">
                  <MonthlyReportBarGraph isTheme={isTheme} />
               </div>

               {/* Right: Categories Pie Chart (Smaller space - 1/3) */}
               <div className="card">
                  <Categories />
               </div>
            </div>
         </div>

         {/* Section 2: Income Visualization */}
         <div className="mb-6">
            <h2 className="text-xl font-bold mb-4 dark:text-white">Income Visualization</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
               {/* Left: Income Graph with Filter (Larger space - 2/3) */}
               <div className="lg:col-span-2 card">
                  <IncomeGraphWithFilter isTheme={isTheme} />
               </div>

               {/* Right: Income Trend Chart (Smaller space - 1/3) */}
               <div className="card">
                  <IncomeGraph />
               </div>
            </div>
         </div>

         {/* Transaction Section: Full-width Transaction Bar Chart */}
         <div>
            <h2 className="text-xl font-bold mb-4 dark:text-white">Transaction Overview</h2>
            <div className="card">
               <TransactionGraph isTheme={isTheme} />
            </div>
         </div>
      </div>
   );
}

export default MainDashBoard;
