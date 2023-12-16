import holidayModel from "../../../../DB/Models/Hoilday.model.js";
import jwt from "jsonwebtoken";
import { getPagination } from "../../../Services/service.controller.js";


export const requestHoliday = async (req, res) => {
    const { startDate, endDate, type, paid, reason } = req.body;
    const holiday = await holidayModel.create({ employeeId: req.user._id, startDate, endDate, type, paid, reason });
    if (!holiday) {
        return res.status(400).json({ message: "Holiday not create" });
    }

    return res.status(200).json({ message: "Holiday created successfully" });
}

export const reviewHolidays = async (req, res) => {
    const { page, perPage } = req.query;
    const { limit, offset } = getPagination(page, perPage);
    const holidays = await holidayModel.paginate({ employeeId: req.user._id, isDeleted: false },
        {
            limit,
            offset,
            sort: { createdAt: -1 },
            select: '_id startDate endDate type paid reason companyNote status isDeleted isRead',
            populate: {
                path: 'employeeId',
                select: ' -_id userName'
            }
        })

    if (!holidays.totalDocs) {
        return res.status(404).json({ message: "No holiday requests found" });
    }
    const originalHolidays = JSON.parse(JSON.stringify(holidays.docs));

    for (const holiday of holidays.docs) {
        if (!holiday.isRead && holiday.status != 'Waiting for approval') {
            console.log(holiday);
            holiday.isRead = true;
            await holiday.save();
        }
    }

    return res.status(200).json({
        message: "success",
        originalHolidays,
        page: holidays.page,
        totalPages: holidays.totalPages,
        totalHolidays: holidays.totalDocs
    });
}

export const viewHoliday = async (req, res) => {
    const { page, perPage } = req.query;
    const { limit, offset } = getPagination(page, perPage);
    const holidays = await holidayModel.paginate({ status: 'Waiting for approval', isDeleted: false },
        {
            limit,
            offset,
            select: '_id startDate endDate type paid reason status',
            populate: {
                path: 'employeeId',
                select: '-_id userName fullName'
            }
        })

    if (!holidays.totalDocs) {
        return res.status(404).json({ message: 'No holiday found ' });
    }

    const allHolidays = holidays.docs.map((ele) => {
        const hashed_id = jwt.sign({ id: ele._id }, process.env.HOLIDAYID);
        return { ...ele.toObject(), _id: hashed_id };
    });
    return res.status(200).json({
        message: "success",
        allHolidays,
        page: holidays.page,
        totalPages: holidays.totalPages,
        totalHolidays: holidays.totalDocs
    });
}

export const viewArchiveHoliday = async (req, res) => {
    const { page, perPage } = req.query;
    const { limit, offset } = getPagination(page, perPage);
    const holidays = await holidayModel.paginate({ status: { $in: ['Accepted', 'Rejected'] } },
        {
            limit,
            offset,
            sort: { createdAt: -1 },
            select: '-_id startDate endDate type paid reason status',
            populate: {
                path: 'employeeId',
                select: '-_id userName fullName'
            }
        })
    if (!holidays.totalDocs) {
        return res.status(404).json({ message: 'No holiday found ' });
    }
    const allHolidays = holidays.docs.map((ele) => {
        const hashed_id = jwt.sign({ id: ele._id }, process.env.HOLIDAYID);
        return { ...ele.toObject(), _id: hashed_id };
    });
    return res.status(200).json({
        message: "success",
        allHolidays,
        page: holidays.page,
        totalPages: holidays.totalPages,
        totalHolidays: holidays.totalDocs
    });

}

export const approveHoliday = async (req, res) => {
    const { status, companyNote } = req.body;
    const { hashed_id } = req.params;
    const { id } = jwt.verify(hashed_id, process.env.HOLIDAYID);
    const holiday = await holidayModel.findByIdAndUpdate({ _id: id }, { status, companyNote }, { new: true })
        .select('-_id startDate endDate type paid reason status companyNote')
        .populate({
            path: 'employeeId',
            select: '-_id userName fullName'
        }
        )
    if (!holiday) {
        return res.status(404).json({ message: "No holiday found" });
    }
    return res.status(200).json({ message: "success the response is send" });
}

export const deleteHoliday = async (req, res) => {
    const { id } = req.params;

    const holiday = await holidayModel.findOneAndUpdate({ _id: id }, { isDeleted: true }, { new: true });
    if (!holiday) {
        return res.status(404).json({ message: "No holiday found" });
    }
    return res.status(200).json({ message: "Holiday is deleted", id });
}

export const getHolidayTypes = async (req, res) => {
    const types = ['Sick', 'Vacation', 'Travelling'];
    return res.status(201).json({ message: "success", types });
}