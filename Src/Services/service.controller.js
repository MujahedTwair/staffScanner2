import { DateTime, Duration } from "luxon";
import attendanceModel from "../../DB/Models/Attendance.model.js";

export const getShiftEndDateTime = (currentTime, endCheckingTime) => {
    const [currentHours, currentMinutes] = currentTime.split(':').map(ele => +ele);
    const [endHours, endMinutes] = endCheckingTime.split(':').map(ele => +ele);

    const shiftEnd = DateTime.now().plus({ hours: minusHour(endHours, currentHours), minutes: (endMinutes - currentMinutes) });

    return shiftEnd.startOf('minute');
}

export const getCheckOutDate = (shiftEndTime, shiftEndDateTime, checkOutTime) => {
    const [outHours, outMinutes] = checkOutTime.split(':').map(ele => +ele);
    const [endHours, endMinutes] = shiftEndTime.split(':').map(ele => +ele);
    const checkOutDate = DateTime.fromJSDate(shiftEndDateTime, { zone: process.env.TIME_ZONE })
        .minus({ hours: minusHour(endHours, outHours), minutes: (endMinutes - outMinutes) });
    return checkOutDate;
}

const minusHour = (timeOne, timeTwo) => {
    if (timeOne >= timeTwo) {
        return (timeOne - timeTwo);
    } else {
        return (timeOne - timeTwo + 24);
    }
}

export const addCheckIn = async (employee, currentTime, res) => {
    const shiftEndDateTime = getShiftEndDateTime(currentTime, employee.endChecking);
    const newCheckin = await attendanceModel.create({ isCheckIn: true, isCheckOut: false, enterTime: Date.now(), employeeId: employee._id, shiftEndDateTime });
    return res.status(201).json({ message: "success check in", newCheckin });
}

export const isWithinTimeRange = (start, end, current) => {
    if (start <= end) {
        return current >= start && current <= end;
    } else {
        return current >= start || current <= end;
    }
}

export const getPagination = (page, size) => {
    const limit = size > 0 ? +size : 3;
    const offset = page > 0 ? (page - 1) * limit : 0;

    return { limit, offset };
};

export const calculateHours = (milliseconds) => {
    const duration = Duration.fromObject({ milliseconds });
    const { hours } = duration.shiftTo('hours').toObject();
    return hours.toFixed(2);
}

export const defulatDuration = (startDuration, endDuration) => {
    if (startDuration && endDuration) {
        startDuration = DateTime.fromFormat(startDuration, 'd/M/yyyy').setZone(process.env.TIME_ZONE).startOf('day');
        endDuration = DateTime.fromFormat(endDuration, 'd/M/yyyy').setZone(process.env.TIME_ZONE).endOf('day');
    } else {
        startDuration = DateTime.now().setZone(process.env.TIME_ZONE).startOf('month');
        endDuration = DateTime.now().setZone(process.env.TIME_ZONE).endOf('day');
    }
    return { startDuration, endDuration };
}

export const convertToAMPM = (timeString) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes);

    const formattedTime = date.toLocaleString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
    });
    return formattedTime;
}