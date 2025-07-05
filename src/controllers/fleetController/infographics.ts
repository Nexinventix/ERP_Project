import { Request, Response } from 'express';
import { Trip, Driver, Vehicle, Maintenance, FuelLog } from '../../models/fleet';
import { User } from '../../models/users';

interface AuthenticatedRequest extends Request {
  user: User;
}

class InfoGraphicsController {
    async overviewGraph(req: AuthenticatedRequest, res: Response){
       try{
        const AllVehicles = await Vehicle.countDocuments();
        const AllMaintenance = await Maintenance.countDocuments();
        const AllDrivers = await Driver.countDocuments();
        const AllTrips = await Trip.countDocuments();

        res.status(200).json({message: "overview info", data: [{ name: 'Total Fleets', value: AllVehicles, color: '#6366F1' }, { name: 'Drivers', value: AllDrivers, color: '#EF4444' },  { name: 'Trips', value: AllTrips, color: '#4ADE80' }, { name: 'Maintenance', value: AllMaintenance, color: '#FB923C' }]})
       }catch(error){
            res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
       }
    }

    async mileageTracking(req: AuthenticatedRequest, res: Response){
        try{
            const result = await Trip.aggregate([{ $group: {
                                _id: null,
                                totalDistance: { $sum: "$distance" }}}]);

            const total = result[0]?.totalDistance || 0;

            const monthlyResult = await Trip.aggregate([{
            $group: { _id: {month: { $month: "$startTime" }, year: { $year: "$startTime" }},value: { $sum: "$distance" }}},{$sort: { "_id.year": 1, "_id.month": 1 }}]);

    
            const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const monthlyBreakdown = monthlyResult.map(item => {
            const { month, year } = item._id;
            return {
                name: `${MONTH_NAMES[month - 1]} ${year}`,
                value: item.value
            };
            });

            res.status(200).json({ Mileage: total , monthly: monthlyBreakdown});
        }catch(error){
            res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
        }
    }

    async fuelExpenses(req: AuthenticatedRequest, res: Response){
        try{
            const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const totalResult = await FuelLog.aggregate([
                                    {
                                        $group: {
                                        _id: null,
                                        totalCost: { $sum: "$totalCost" }
                                        }
                                    }
                                    ]);
            const totalFuelCost = totalResult[0]?.totalCost || 0;

            const monthlyResult = await FuelLog.aggregate([
            {
                $group: {
                _id: {
                    year: { $year: "$date" },
                    month: { $month: "$date" }
                },
                value: { $sum: "$totalCost" }
                }
            },
            {
                $sort: { "_id.year": 1, "_id.month": 1 }
            }
            ]);


        const monthlyBreakdown = monthlyResult.map(item => {
        const { year, month } = item._id;
        return {
            name: `${MONTH_NAMES[month - 1]} ${year}`,
            value: item.value
        };
        });

        res.status(200).json({
        totalFuelCost,
        monthlyBreakdown
        });
        }catch(error){
            res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
        }
    }


    async getFuelUsageStats(req: AuthenticatedRequest, res: Response){
        try {
            const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const totalResult = await FuelLog.aggregate([
            {
                $group: {
                _id: null,
                totalQuantity: { $sum: "$quantity" }
                }
            }
            ]);
            const totalQuantity = totalResult[0]?.totalQuantity || 0;

            const monthlyResult = await FuelLog.aggregate([
            {
                $group: {
                _id: {
                    year: { $year: "$date" },
                    month: { $month: "$date" }
                },
                value: { $sum: "$quantity" }
                }
            },
            {
                $sort: { "_id.year": 1, "_id.month": 1 }
            }
            ]);

            const monthlyBreakdown = monthlyResult.map(item => {
            const { year, month } = item._id;
            return {
                name: `${MONTH_NAMES[month - 1]} ${year}`,
                value: item.value
            };
            });

            res.status(200).json({
            totalFuelUsed: totalQuantity,
            monthlyBreakdown
            });

        } catch (error) {
            res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
        }
};
}

export default new InfoGraphicsController()