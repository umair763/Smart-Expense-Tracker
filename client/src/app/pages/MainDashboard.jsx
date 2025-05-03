import AvaiableBalanceCard from '../../components/Dashboard/AvaiableBalanceCard';
import TrackFinance from '../../components/Dashboard/TrackFinance';
import Categories from '../../components/Dashboard/Catagories';
import MonthlyReportBarGraph from '../../components/Dashboard/MonthlyReportBarGraph';
import WeeklyReportBarGraph from '../../components/Dashboard/WeeklyReportBarGraph';
import IncomeAndSpendings from '../../components/Dashboard/IncomeAndSpendings';

function MainDashBoard({ isTheme }) {
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

         {/* Middle and Bottom Sections */}
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left and Middle Column */}
            <div className="lg:col-span-2 space-y-6">
               {/* Monthly Report Graph */}
               <div className="card">
                  <MonthlyReportBarGraph isTheme={isTheme} />
               </div>

               {/* Weekly Report Graph */}
               <div className="card">
                  <WeeklyReportBarGraph isTheme={isTheme} />
               </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
               <div className="card">
                  <TrackFinance />
               </div>
               <div className="card">
                  <Categories />
               </div>
            </div>
         </div>
      </div>
   );
}

export default MainDashBoard;
