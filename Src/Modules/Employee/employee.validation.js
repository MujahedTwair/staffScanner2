import joi from 'joi';
import { DateTime } from 'luxon';

export const checkWithRejexSchema = {
    body: joi.object({
        deviceId: joi.string().regex(/^(?:[0-9A-Fa-f]{2}[:-]){5}(?:[0-9A-Fa-f]{2})$/).required(),
    }),

};

export const checkWithoutRejexSchema = {
    body: joi.object({
        deviceId: joi.string().required().max(16),
    }),
};

export const updatePasswordSchema = {
    body: joi.object({
        oldPassword: joi.string().min(6).max(20).required(),
        newPassword: joi.string().min(6).max(20).required(),
        cPassword: joi.valid(joi.ref('newPassword')).required(),
    }),
}

export const scanQRSchema = {
    body: joi.object({
        deviceId: joi.string().required().max(16),
        QrId: joi.string().required().max(36)
    })
}

export const reportsSchema = {
    query: joi.object({
        startDuration: joi.string(),
        endDuration: joi.string().when('startDuration', {
            is: joi.exist(),
            then: joi.required(),
            otherwise: joi.forbidden()
        })
    }).custom((value, helpers) => {
        if (value && value.startDuration && value.endDuration) {
            const startDuration = DateTime.fromFormat(value.startDuration, 'd/M/yyyy').setZone('Asia/Jerusalem').startOf('day').toMillis();
            const endDuration = DateTime.fromFormat(value.endDuration, 'd/M/yyyy').setZone('Asia/Jerusalem').startOf('day').toMillis();
            const now = DateTime.now().setZone('Asia/Jerusalem').startOf('day').toMillis();
            if (startDuration && endDuration && now >= endDuration && endDuration >= startDuration) {
                return value;
            } else {
                return helpers.error('End date must be a valid date and after the start date and not in the future');
            }
        }
    })
}