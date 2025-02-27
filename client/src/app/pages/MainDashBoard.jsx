import AvaiableBalanceCard from './../../components/Dashboard/AvaiableBalanceCard';
import TrackFinance from './../../components/Dashboard/TrackFinance';
import Categories from './../../components/Dashboard/Catagories';
import MonthlyReportBarGraph from './../../components/Dashboard/MonthlyReportBarGraph';
import WeeklyReportBarGraph from './../../components/Dashboard/WeeklyReportBarGraph';
import IncomeAndSpendings from './../../components/Dashboard/IncomeAndSpendings';

function MainDashBoard({ isTheme }) {
   return (
      <div className=" w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 p-2 mt-8">
         {/* First Column (Center Section) */}
         <div className="lg:col-span-2 space-y-4">
            {/* Top Row: Available Balance & Income and Spendings */}
            <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-3">
               <AvaiableBalanceCard />
               <IncomeAndSpendings />
            </div>

            {/* Middle Row: Monthly Report Graph */}
            <div className="overflow-hidden">
               <MonthlyReportBarGraph isTheme={isTheme} />
            </div>

            {/* Bottom Row: Weekly Report Graph */}
            <div className="overflow-hidden">
               <WeeklyReportBarGraph isTheme={isTheme} />
            </div>
         </div>

         {/* Third Column (Right Section) */}
         <div className="space-y-6">
            <div className="overflow-hidden">
               <TrackFinance />
            </div>
            <div className="overflow-hidden">
               <Categories />
            </div>
         </div>
      </div>
   );
}

export default MainDashBoard;
